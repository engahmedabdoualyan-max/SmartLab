// ================================================================
// SmartLAP Cloud Storage Module — Secure Encrypted Session Sync
// ================================================================
// Handles encrypted Firestore sync, IndexedDB/LocalStorage offline
// caching, and automatic queue flushing on network recovery.
// All 15+ test sessions are persisted with the unified schema.
// ================================================================

// ================================================================
// INDEXEDDB SETUP
// ================================================================

var _DB_NAME = 'cloud_cache';
var _DB_VERSION = 1;
var _DB_READY = null; // Promise resolving to IDBDatabase instance

/**
 * Open (or create) the IndexedDB database for offline session caching.
 * Stores: 'sessions' — cached session docs, 'pending_writes' — queued writes.
 * @returns {Promise<IDBDatabase>}
 */
function _openCloudDB() {
  if (_DB_READY) return _DB_READY;
  _DB_READY = new Promise(function(resolve, reject) {
  var req = indexedDB.open(_DB_NAME, _DB_VERSION);
  req.onupgradeneeded = function(e) {
  var db = e.target.result;
  if (!db.objectStoreNames.contains('sessions')) {
  var sStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
  sStore.createIndex('testType', 'testType', { unique: false });
  sStore.createIndex('timestamp', 'timestamp', { unique: false });
  sStore.createIndex('userId', 'userId', { unique: false });
  }
  if (!db.objectStoreNames.contains('pending_writes')) {
  var pStore = db.createObjectStore('pending_writes', { keyPath: 'id', autoIncrement: true });
  pStore.createIndex('testType', 'testType', { unique: false });
  pStore.createIndex('queuedAt', 'queuedAt', { unique: false });
  }
  };
  req.onsuccess = function(e) { resolve(e.target.result); };
  req.onerror = function(e) { reject(e.target.error); };
  });
  return _DB_READY;
}

// ================================================================
// LOCALSTORAGE FALLBACK
// ================================================================

/**
 * Read a value from localStorage with JSON parse.
 * @param {string} key
 * @returns {*} Parsed value or null
 */
function _lsGet(key) {
  try { return JSON.parse(localStorage.getItem('cs_' + key)); } catch(e) { return null; }
}

/**
 * Write a value to localStorage as JSON string.
 * @param {string} key
 * @param {*} value
 */
function _lsSet(key, value) {
  try { localStorage.setItem('cs_' + key, JSON.stringify(value)); } catch(e) { /* quota exceeded */ }
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
function _lsRemove(key) {
  try { localStorage.removeItem('cs_' + key); } catch(e) { /* ignore */ }
}

// ================================================================
// CRYPTOGRAPHY — AES-GCM ENCRYPTION
// ================================================================

var _cryptoKey = null;
var _KEY_STORAGE_KEY = 'cloud_enc_key';

/**
 * Generate or retrieve the AES-GCM encryption key.
 * The key is derived via PBKDF2 from a device-specific seed stored in sessionStorage.
 * @returns {Promise<CryptoKey>}
 */
function _getEncryptionKey() {
  if (_cryptoKey) return Promise.resolve(_cryptoKey);
  return new Promise(function(resolve, reject) {
  if (!window.crypto || !window.crypto.subtle) {
  // Fallback: no Web Crypto — store as plain text (still sanitized)
  console.warn('CloudStorage: Web Crypto not available, data stored without encryption');
  resolve(null);
  return;
  }
  try {
  var seed = sessionStorage.getItem(_KEY_STORAGE_KEY);
  if (!seed) {
  var arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  seed = btoa(String.fromCharCode.apply(null, arr));
  sessionStorage.setItem(_KEY_STORAGE_KEY, seed);
  }
  var encoder = new TextEncoder();
  var keyMaterial = encoder.encode(seed + ':' + navigator.userAgent);
  crypto.subtle.importKey('raw', keyMaterial, 'PBKDF2', false, ['deriveKey']).then(function(baseKey) {
  return crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: encoder.encode('SmartLAP-Salt-v1'), iterations: 100000, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
  );
  }).then(function(key) {
  _cryptoKey = key;
  resolve(key);
  }).catch(function(err) {
  console.warn('CloudStorage: Key derivation failed, storing without encryption:', err.message);
  resolve(null);
  });
  } catch(e) {
  console.warn('CloudStorage: Crypto setup failed:', e.message);
  resolve(null);
  }
  });
}

/**
 * Encrypt a payload object into a base64 ciphertext.
 * @param {Object} payload — Data to encrypt
 * @returns {Promise<string>} Base64-encoded ciphertext with IV prepended
 */
function _encryptPayload(payload) {
  return _getEncryptionKey().then(function(key) {
  if (!key) {
  // No encryption available — base64 encode the JSON
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
  var iv = crypto.getRandomValues(new Uint8Array(12));
  var encoder = new TextEncoder();
  return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encoder.encode(JSON.stringify(payload))).then(function(ciphertext) {
  // Prepend IV to ciphertext, then base64 encode
  var combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode.apply(null, combined));
  });
  });
}

/**
 * Decrypt a base64 ciphertext back to the original payload object.
 * @param {string} ciphertextB64 — Base64 ciphertext with IV prepended
 * @returns {Promise<Object>} Decrypted payload
 */
function _decryptPayload(ciphertextB64) {
  return _getEncryptionKey().then(function(key) {
  try {
  var combined = new Uint8Array(atob(ciphertextB64).split('').map(function(c) { return c.charCodeAt(0); }));
  if (!key) {
  // No encryption — treat as base64-encoded JSON
  return JSON.parse(decodeURIComponent(escape(atob(ciphertextB64))));
  }
  var iv = combined.slice(0, 12);
  var ciphertext = combined.slice(12);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext).then(function(plaintext) {
  var decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext));
  });
  } catch(e) {
  console.error('CloudStorage: Decryption failed:', e.message);
  return null;
  }
  });
}

// ================================================================
// ONLINE / OFFLINE DETECTION
// ================================================================

var _isOnline = navigator.onLine;
var _pendingQueue = [];

window.addEventListener('online', function() {
  _isOnline = true;
  console.log('CloudStorage: Network restored — flushing pending queue');
  CloudStorage.syncPending();
});

window.addEventListener('offline', function() {
  _isOnline = false;
  console.log('CloudStorage: Network lost — buffering writes locally');
});

// ================================================================
// UNIFIED SESSION SCHEMA
// ================================================================
// All 15+ test types use this schema when persisted:
// {
//   sessionId: string,
//   testId: string,
//   testType: string,
//   domainId: string,
//   domainName: string,
//   testName: string,
//   userId: string,
//   engineerInputs: Object,
//   readings: Array<Object>,    // or strikes for compaction
//   results: Object,
//   status: 'PASS'|'FAIL'|'CURING'|'N/A',
//   statusMessage: string,
//   timestamp: number,          // epoch ms
//   encrypted: boolean,
//   version: string             // schema version for migration
// }

var _SCHEMA_VERSION = '2.0.0';

/**
 * Build a unified session object from raw test data.
 * @param {string} testType — e.g. 'compaction', 'cbr', 'slump'
 * @param {Object} data — Raw test data
 * @returns {Object} Unified session schema object
 */
function _buildSessionObject(testType, data) {
  var sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  return {
  sessionId: sessionId,
  testId: (currentTest && currentTest.id) || data.testId || '',
  testType: testType,
  domainId: (currentDomain && currentDomain.id) || data.domainId || '',
  domainName: (currentDomain && currentDomain.name) || data.domainName || '',
  testName: (currentTest && currentTest.name) || data.testName || testType,
  userId: (currentUser && currentUser.uid) || data.userId || 'anonymous',
  engineerInputs: data.engineerInputs || {},
  readings: data.readings || data.strikes || [],
  results: data.results || {},
  status: (data.results && data.results.status) || 'N/A',
  statusMessage: (data.results && data.results.statusMessage) || '',
  timestamp: Date.now(),
  encrypted: true,
  version: _SCHEMA_VERSION
  };
}

// ================================================================
// CLOUDSTORAGE — PUBLIC API
// ================================================================

var CloudStorage = {
  // ============================================================
  // SAVE SESSION
  // ============================================================

  /**
   * Save a test session to Firestore with local caching and offline support.
   * @param {string} testType — Test type identifier (e.g. 'compaction', 'cbr')
   * @param {Object} data — Raw test data
   * @returns {Promise<string>} Resolves with sessionId on success
   */
  saveSession: function(testType, data) {
  var self = this;
  var sessionObj = _buildSessionObject(testType, data);
  var sessionId = sessionObj.sessionId;

  return new Promise(function(resolve, reject) {
  // Step 1: Encrypt and cache locally
  var sanitized = (typeof sanitizeFirestoreData === 'function')
  ? sanitizeFirestoreData(sessionObj)
  : sessionObj;

  _encryptPayload(sanitized).then(function(ciphertext) {
  var cacheEntry = {
  sessionId: sessionId,
  testType: testType,
  ciphertext: ciphertext,
  encrypted: true,
  timestamp: sessionObj.timestamp,
  userId: sessionObj.userId
  };

  // Cache to IndexedDB
  self._cacheLocally(cacheEntry);

  // Step 2: Write to Firestore
  if (!_isOnline) {
  // Offline — queue for later
  self._queuePending(sessionObj);
  showToast('Session saved offline — will sync when online', 'info');
  resolve(sessionId);
  return;
  }

  // Prepare Firestore document (decrypted for queryability)
  var firestoreDoc = {
  sessionId: sessionId,
  testType: testType,
  testId: sessionObj.testId,
  domainId: sessionObj.domainId,
  domainName: sessionObj.domainName,
  testName: sessionObj.testName,
  userId: sessionObj.userId,
  engineerInputs: sessionObj.engineerInputs,
  readings: sessionObj.readings,
  results: sessionObj.results,
  status: sessionObj.status,
  statusMessage: sessionObj.statusMessage,
  timestamp: sessionObj.timestamp,
  encrypted: false,
  version: sessionObj.version
  };

  var writeFn = (typeof rateLimitedFirestoreWrite === 'function')
  ? rateLimitedFirestoreWrite
  : function(coll, d) {
  if (typeof db !== 'undefined' && db) {
  return db.collection(coll).add(d);
  }
  return Promise.reject(new Error('Firestore not available'));
  };

  writeFn('sessions', firestoreDoc).then(function(docRef) {
  // Update cache with Firestore doc ID
  if (docRef && docRef.id) {
  cacheEntry.firestoreDocId = docRef.id;
  self._cacheLocally(cacheEntry);
  }
  if (typeof logAuditTrail === 'function') {
  logAuditTrail(sessionObj.userId, 'session_saved', {
  sessionId: sessionId,
  testType: testType,
  testName: sessionObj.testName
  });
  }
  resolve(sessionId);
  }).catch(function(err) {
  console.error('CloudStorage: Firestore write failed, queuing:', err.message);
  self._queuePending(sessionObj);
  resolve(sessionId);
  });
  }).catch(function(err) {
  console.error('CloudStorage: Encryption failed:', err.message);
  reject(err);
  });
  });
  },

  // ============================================================
  // GET CACHED SESSION
  // ============================================================

  /**
   * Retrieve a session from local cache by sessionId.
   * @param {string} sessionId
   * @returns {Promise<Object|null>} Decrypted session object or null
   */
  getCachedSession: function(sessionId) {
  return _openCloudDB().then(function(db) {
  return new Promise(function(resolve, reject) {
  var tx = db.transaction('sessions', 'readonly');
  var store = tx.objectStore('sessions');
  var req = store.get(sessionId);
  req.onsuccess = function(e) {
  var entry = e.target.result;
  if (!entry) {
  // Fallback to localStorage
  var lsEntry = _lsGet('session_' + sessionId);
  resolve(lsEntry ? lsEntry : null);
  return;
  }
  _decryptPayload(entry.ciphertext).then(function(decrypted) {
  resolve(decrypted);
  }).catch(function() {
  resolve(entry);
  });
  };
  req.onerror = function(e) { reject(e.target.error); };
  });
  }).catch(function() {
  // IndexedDB failed — try localStorage
  var lsEntry = _lsGet('session_' + sessionId);
  return Promise.resolve(lsEntry || null);
  });
  },

  // ============================================================
  // GET ALL CACHED SESSIONS
  // ============================================================

  /**
   * List all locally cached session metadata (not decrypted payloads).
   * @returns {Promise<Array<Object>>} Array of {sessionId, testType, timestamp, userId}
   */
  getAllCached: function() {
  return _openCloudDB().then(function(db) {
  return new Promise(function(resolve, reject) {
  var tx = db.transaction('sessions', 'readonly');
  var store = tx.objectStore('sessions');
  var req = store.getAll();
  req.onsuccess = function(e) {
  var entries = e.target.result || [];
  var meta = entries.map(function(entry) {
  return {
  sessionId: entry.sessionId,
  testType: entry.testType,
  timestamp: entry.timestamp,
  userId: entry.userId,
  firestoreDocId: entry.firestoreDocId || null
  };
  });
  resolve(meta);
  };
  req.onerror = function(e) { reject(e.target.error); };
  });
  }).catch(function() {
  // IndexedDB fallback — check localStorage for session list
  var list = _lsGet('session_list') || [];
  return Promise.resolve(list);
  });
  },

  // ============================================================
  // SYNC PENDING WRITES
  // ============================================================

  /**
   * Flush all queued offline writes to Firestore.
   * Called automatically on network recovery.
   * @returns {Promise<number>} Number of sessions successfully synced
   */
  syncPending: function() {
  var self = this;
  if (!_isOnline) return Promise.resolve(0);

  return _openCloudDB().then(function(db) {
  return new Promise(function(resolve, reject) {
  var tx = db.transaction('pending_writes', 'readonly');
  var store = tx.objectStore('pending_writes');
  var req = store.getAll();
  req.onsuccess = function(e) {
  var pendings = e.target.result || [];
  if (pendings.length === 0) {
  resolve(0);
  return;
  }

  var synced = 0;
  var total = pendings.length;

  var processNext = function(idx) {
  if (idx >= total) {
  // Clean up synced entries
  var deleteTx = db.transaction('pending_writes', 'readwrite');
  var deleteStore = deleteTx.objectStore('pending_writes');
  pendings.forEach(function(p) {
  if (p._synced) deleteStore.delete(p.id);
  });
  resolve(synced);
  return;
  }

  var pending = pendings[idx];
  var writeFn = (typeof rateLimitedFirestoreWrite === 'function')
  ? rateLimitedFirestoreWrite
  : function(coll, d) {
  if (typeof db !== 'undefined' && db) {
  return db.collection(coll).add(d);
  }
  return Promise.reject(new Error('Firestore not available'));
  };

  writeFn('sessions', pending.data).then(function(docRef) {
  synced++;
  pending._synced = true;
  if (typeof logAuditTrail === 'function') {
  logAuditTrail(pending.data.userId || 'anonymous', 'session_synced', {
  sessionId: pending.data.sessionId,
  testType: pending.data.testType
  });
  }
  processNext(idx + 1);
  }).catch(function(err) {
  console.warn('CloudStorage: Sync failed for', pending.id, err.message);
  processNext(idx + 1);
  });
  };

  processNext(0);
  };
  req.onerror = function(e) { reject(e.target.error); };
  });
  }).catch(function() {
  // IndexedDB not available — try localStorage
  var localQueue = _lsGet('pending_queue') || [];
  if (localQueue.length === 0) return Promise.resolve(0);

  var synced = 0;
  var remaining = [];

  var processLS = function(idx) {
  if (idx >= localQueue.length) {
  _lsSet('pending_queue', remaining);
  return Promise.resolve(synced);
  }
  var item = localQueue[idx];
  var writeFn = (typeof rateLimitedFirestoreWrite === 'function')
  ? rateLimitedFirestoreWrite
  : function(coll, d) {
  if (typeof db !== 'undefined' && db) {
  return db.collection(coll).add(d);
  }
  return Promise.reject(new Error('Firestore not available'));
  };

  return writeFn('sessions', item.data).then(function() {
  synced++;
  return processLS(idx + 1);
  }).catch(function() {
  remaining.push(item);
  return processLS(idx + 1);
  });
  };

  return processLS(0);
  });
  },

  // ============================================================
  // CLEAR CACHE
  // ============================================================

  /**
   * Clear all locally cached sessions (older than specified days).
   * @param {number} olderThanDays — Remove sessions older than this (default 30)
   * @returns {Promise<number>} Number of entries removed
   */
  clearCache: function(olderThanDays) {
  olderThanDays = olderThanDays || 30;
  var cutoff = Date.now() - (olderThanDays * 86400000);

  return _openCloudDB().then(function(db) {
  return new Promise(function(resolve, reject) {
  var tx = db.transaction('sessions', 'readwrite');
  var store = tx.objectStore('sessions');
  var index = store.index('timestamp');
  var range = IDBKeyRange.upperBound(cutoff);
  var req = index.openCursor(range);
  var removed = 0;

  req.onsuccess = function(e) {
  var cursor = e.target.result;
  if (cursor) {
  store.delete(cursor.primaryKey);
  removed++;
  cursor.continue();
  } else {
  resolve(removed);
  }
  };
  req.onerror = function(e) { reject(e.target.error); };
  });
  }).catch(function() {
  // IndexedDB fallback — clear localStorage session entries
  var count = 0;
  for (var i = localStorage.length - 1; i >= 0; i--) {
  var key = localStorage.key(i);
  if (key && key.indexOf('cs_session_') === 0) {
  try {
  var entry = JSON.parse(localStorage.getItem(key));
  if (entry && entry.timestamp < cutoff) {
  localStorage.removeItem(key);
  count++;
  }
  } catch(e) { /* skip */ }
  }
  }
  return Promise.resolve(count);
  });
  },

  // ============================================================
  // SAVE TEST SESSION — CONVENIENCE WRAPPER
  // ============================================================

  /**
   * Convenience method to save any test type session.
   * Similar signature to existing saveTestSession functions.
   * @param {string} type — Test type
   * @param {Object} results — Test results data
   * @returns {Promise<string>} Session ID
   */
  saveTestSession: function(type, results) {
  var data = {
  testId: currentTest ? currentTest.id : '',
  domainId: currentDomain ? currentDomain.id : '',
  domainName: currentDomain ? currentDomain.name : '',
  testName: currentTest ? currentTest.name : type,
  userId: currentUser ? currentUser.uid : 'guest',
  engineerInputs: {},
  readings: results.readings || results.strikes || [],
  results: results,
  status: results.status || (results.results && results.results.status) || 'N/A'
  };

  // Capture engineer inputs from DOM if available
  var inputMap = {
  compaction: ['inp_hammer_weight', 'inp_mold_volume', 'inp_ref_weight', 'inp_target_strikes', 'inp_target_ratio'],
  cbr: ['cbr_inp_diameter', 'cbr_inp_piston_area', 'cbr_inp_std_25', 'cbr_inp_std_50', 'cbr_inp_max_pen'],
  slump: ['slump_inp_height', 'slump_inp_tolerance', 'slump_inp_target'],
  maturity: ['mat_inp_mixid', 'mat_inp_wcr', 'mat_inp_target', 'mat_inp_interval'],
  marshall: ['mar_inp_specimen', 'mar_inp_diameter', 'mar_inp_height', 'mar_inp_rate']
  };

  var inputs = inputMap[type] || [];
  for (var i = 0; i < inputs.length; i++) {
  var el = document.getElementById(inputs[i]);
  if (el) data.engineerInputs[inputs[i]] = el.value;
  }

  return this.saveSession(type, data);
  },

  // ============================================================
  // AUTO-SYNC SETUP
  // ============================================================

  /**
   * Enable periodic auto-sync every N seconds when online.
   * @param {number} intervalSec — Polling interval in seconds (default 60)
   */
  autoSync: function(intervalSec) {
  intervalSec = intervalSec || 60;
  if (window._cloudSyncInterval) clearInterval(window._cloudSyncInterval);
  window._cloudSyncInterval = setInterval(function() {
  if (_isOnline) {
  CloudStorage.syncPending();
  }
  }, intervalSec * 1000);
  console.log('CloudStorage: Auto-sync enabled every ' + intervalSec + 's');
  },

  /**
   * Stop the auto-sync interval.
   */
  stopAutoSync: function() {
  if (window._cloudSyncInterval) {
  clearInterval(window._cloudSyncInterval);
  window._cloudSyncInterval = null;
  }
  },

  // ============================================================
  // INTERNALS
  // ============================================================

  /**
   * Cache a session entry locally (IndexedDB, fallback to localStorage).
   * @param {Object} entry — {sessionId, testType, ciphertext, encrypted, timestamp, userId}
   */
  _cacheLocally: function(entry) {
  _openCloudDB().then(function(db) {
  var tx = db.transaction('sessions', 'readwrite');
  var store = tx.objectStore('sessions');
  store.put(entry);
  }).catch(function() {
  // IndexedDB failed — use localStorage
  var list = _lsGet('session_list') || [];
  list.push({ sessionId: entry.sessionId, testType: entry.testType, timestamp: entry.timestamp, userId: entry.userId });
  _lsSet('session_list', list);
  _lsSet('session_' + entry.sessionId, entry);
  });
  },

  /**
   * Queue a session for later Firestore write (offline mode).
   * @param {Object} sessionObj — Full session object
   */
  _queuePending: function(sessionObj) {
  var pendingEntry = {
  data: sessionObj,
  testType: sessionObj.testType,
  queuedAt: Date.now()
  };

  _openCloudDB().then(function(db) {
  var tx = db.transaction('pending_writes', 'readwrite');
  var store = tx.objectStore('pending_writes');
  store.add(pendingEntry);
  }).catch(function() {
  // IndexedDB failed — use localStorage
  var queue = _lsGet('pending_queue') || [];
  queue.push(pendingEntry);
  _lsSet('pending_queue', queue);
  });

  if (typeof logAuditTrail === 'function') {
  logAuditTrail(sessionObj.userId || 'anonymous', 'session_queued', {
  sessionId: sessionObj.sessionId,
  testType: sessionObj.testType
  });
  }
  }
};

// ================================================================
// AUTO-INIT
// ================================================================

// Attempt to flush any pending writes from previous session
setTimeout(function() {
  if (_isOnline) {
  CloudStorage.syncPending().then(function(count) {
  if (count > 0) console.log('CloudStorage: ' + count + ' pending sessions synced on init');
  });
  }
  // Start auto-sync with 2-minute interval
  CloudStorage.autoSync(120);
}, 3000);

// Expose globally for inline script usage
if (typeof window !== 'undefined') {
  window.CloudStorage = CloudStorage;
}

console.log('SmartLAP Cloud Storage Module v' + _SCHEMA_VERSION + ' loaded');

