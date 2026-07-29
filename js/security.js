// ================================================================
// SmartLab Security Module - v2.1
// ================================================================
// Comprehensive security: input sanitization, access control,
// Firestore write validation, CSRF protection, rate limiting,
// audit logging, and session management.
//
// v2.1 — Added _FIRESTORE_AVAILABLE flag with localStorage fallback
// for environments where Firestore rules deny write access.
// ================================================================

// ================================================================
// SANITIZATION ENGINE
// ================================================================

// Firestore availability flag — set false on first permission error
var _FIRESTORE_AVAILABLE = true;
var _LOCAL_LOG_QUEUE = [];

/**
 * Check if a Firestore error is a permission-denied error.
 */
function _isFirestorePermissionError(err) {
    return err && (
        err.code === 'permission-denied' ||
        (err.message && err.message.indexOf('Missing or insufficient permissions') !== -1) ||
        (err.message && err.message.indexOf('PERMISSION_DENIED') !== -1)
    );
}

/**
 * Persist a data entry to localStorage when Firestore is unavailable.
 * @param {string} collection - Logical collection name
 * @param {Object} data - Data to persist
 */
function _saveToLocalStore(collection, data) {
    try {
        var key = 'smartlap_' + collection;
        var existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        // Keep last 500 entries to avoid localStorage quota issues
        if (existing.length > 500) existing = existing.slice(-500);
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
        console.warn('localStorage write failed for', collection, ':', e.message);
    }
}

// HTML entity encoding map
var _ENTITY_MAP = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#x27;',
    '/': '&#x2F;',
    '=': '&#x3D;',
    '`': '&#x60;'
};

// Regex for dangerous patterns
var _DANGEROUS_TAGS = /<\s*(script|iframe|object|embed|form|input|textarea|select|button|style|link|meta|base|applet|frame|frameset|ilayer|layer|svg|math|img|video|audio|source|track|canvas|marquee|isindex)\b[^>]*>/gi;
var _DANGEROUS_ATTRS = /\s+(on\w+|style|href|xlink:href|formaction|action|data)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
var _JAVASCRIPT_PROTO = /javascript\s*:/gi;
var _DATA_PROTO = /data\s*:/gi;
var _VBSCRIPT_PROTO = /vbscript\s*:/gi;

/**
 * Deep sanitize a string for safe HTML insertion.
 * @param {*} input - Value to sanitize
 * @returns {string} Sanitized safe string
 */
function sanitizeInput(input) {
    if (input === null || input === undefined) return '';
    // Convert to string
    var str = String(input);
    
    // Remove dangerous tags
    str = str.replace(_DANGEROUS_TAGS, '');
    
    // Remove dangerous attributes (event handlers, etc.)
    str = str.replace(_DANGEROUS_ATTRS, '');
    
    // Remove dangerous protocols
    str = str.replace(_JAVASCRIPT_PROTO, '');
    str = str.replace(_DATA_PROTO, '');
    str = str.replace(_VBSCRIPT_PROTO, '');
    
    // Encode special HTML characters
    return str.replace(/[&<>"'\/=`]/g, function(m) {
        return _ENTITY_MAP[m] || m;
    });
}

/**
 * Sanitize a value for Firestore writes - validates types and strips dangerous content.
 * @param {*} value - Value to sanitize for Firestore
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {*} Sanitized safe value or throws error
 */
function sanitizeFirestoreValue(value, fieldName) {
    if (value === null || value === undefined) return value;
    
    if (typeof value === 'string') {
        // Strip control characters except common whitespace
        var cleaned = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Limit string length to prevent DoS
        if (cleaned.length > 10000) {
            throw new Error('Field ' + fieldName + ' exceeds maximum length (10000)');
        }
        return cleaned;
    }
    
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error('Field ' + fieldName + ' must be a finite number');
        }
        return value;
    }
    
    if (typeof value === 'boolean') return value;
    
    if (Array.isArray(value)) {
        var sanitized = [];
        for (var i = 0; i < value.length; i++) {
            sanitized.push(sanitizeFirestoreValue(value[i], fieldName + '[' + i + ']'));
        }
        return sanitized;
    }
    
    if (typeof value === 'object') {
        var obj = {};
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                var safeKey = sanitizeInput(key);
                obj[safeKey] = sanitizeFirestoreValue(value[key], fieldName + '.' + safeKey);
            }
        }
        return obj;
    }
    
    return value;
}

/**
 * Sanitize a complete object for Firestore safe writing.
 * @param {Object} data - Data object to sanitize
 * @returns {Object} Sanitized data safe for Firestore
 */
function sanitizeFirestoreData(data) {
    if (!data || typeof data !== 'object') return data;
    return sanitizeFirestoreValue(data, 'root');
}

/**
 * Validate sensor data values within acceptable engineering ranges.
 * @param {string} fieldName - Name of the sensor field
 * @param {number} value - Sensor reading value
 * @param {Object} options - Optional range overrides {min, max}
 * @returns {number} Validated and clamped value
 */
function validateSensorData(fieldName, value, options) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Invalid sensor data for ' + fieldName + ': not a finite number');
    }
    
    // Default ranges for common sensor fields
    var ranges = {
        moisture: { min: 0, max: 100 },
        force: { min: 0, max: 100000 },
        penetration: { min: 0, max: 50 },
        load: { min: 0, max: 50000 },
        pressure: { min: 0, max: 1000 },
        temperature: { min: -50, max: 200 },
        flow: { min: 0, max: 500 },
        irregularity: { min: -100, max: 100 },
        inclination: { min: -90, max: 90 },
        light_intensity: { min: 0, max: 5000 },
        transmission: { min: 0, max: 100 },
        purity: { min: 0, max: 100 },
        slump: { min: 0, max: 300 },
        stability: { min: 0, max: 50000 },
        flowValue: { min: 0, max: 50 },
        strength: { min: 0, max: 200 },
        maturity: { min: 0, max: 100000 },
        ductility: { min: 0, max: 200 },
        air_content: { min: 0, max: 100 },
        unit_weight: { min: 0, max: 5000 },
        viscosity: { min: 0, max: 10000 },
        specific_gravity: { min: 0, max: 10 },
        absorption: { min: 0, max: 100 }
    };
    
    var range = options || ranges[fieldName] || { min: -Infinity, max: Infinity };
    
    if (value < range.min) {
        console.warn('Sensor ' + fieldName + ' clamped: ' + value + ' → ' + range.min);
        return range.min;
    }
    if (value > range.max) {
        console.warn('Sensor ' + fieldName + ' clamped: ' + value + ' → ' + range.max);
        return range.max;
    }
    
    return value;
}

// ================================================================
// FIRESTORE WRITE GUARD
// ================================================================

/**
 * Prepare test session data for Firestore with ownership and validation.
 * @param {Object} sessionData - Raw session data to write
 * @returns {Object} Validated and sanitized session data
 */
function prepareSessionWrite(sessionData) {
    // Ensure userId is set
    if (!sessionData.userId && currentUser) {
        sessionData.userId = currentUser.uid;
    }
    if (!sessionData.userId) {
        sessionData.userId = 'anonymous';
    }
    
    // Validate required fields
    if (!sessionData.testId && currentTest) {
        sessionData.testId = currentTest.id;
    }
    
    // Sanitize all string fields
    var sanitized = sanitizeFirestoreData(sessionData);
    
    // Validate sensor readings if present
    if (sanitized.strikes && Array.isArray(sanitized.strikes)) {
        for (var i = 0; i < sanitized.strikes.length; i++) {
            var s = sanitized.strikes[i];
            if (s.moisture !== undefined) s.moisture = validateSensorData('moisture', s.moisture);
            if (s.force !== undefined) s.force = validateSensorData('force', s.force);
        }
    }
    
    if (sanitized.readings && Array.isArray(sanitized.readings)) {
        for (var j = 0; j < sanitized.readings.length; j++) {
            var r = sanitized.readings[j];
            if (r.pressure !== undefined) r.pressure = validateSensorData('pressure', r.pressure);
            if (r.temperature !== undefined) r.temperature = validateSensorData('temperature', r.temperature);
            if (r.load !== undefined) r.load = validateSensorData('load', r.load);
            if (r.penetration !== undefined) r.penetration = validateSensorData('penetration', r.penetration);
        }
    }
    
    // Sanitize results object
    if (sanitized.results && typeof sanitized.results === 'object') {
        // Convert status to safe format
        if (sanitized.results.status) {
            sanitized.results.status = ['PASS', 'FAIL', 'CURING', 'N/A'].indexOf(sanitized.results.status) !== -1 
                ? sanitized.results.status 
                : 'N/A';
        }
    }
    
    return sanitized;
}

/**
 * Safe wrapper for Firestore collection add with validation and local fallback.
 * @param {string} collection - Firestore collection name
 * @param {Object} data - Data to write
 * @returns {Promise} Firestore write promise (or local store resolved promise)
 */
function safeFirestoreAdd(collection, data) {
    return new Promise(function(resolve, reject) {
        try {
            // Verify collection is allowed
            var allowedCollections = ['sessions', 'audit_log', 'anomalies', 'domains', 'tests', 'users'];
            if (allowedCollections.indexOf(collection) === -1) {
                throw new Error('Unauthorized collection: ' + collection);
            }
            
            // Prepare data with security checks
            var safeData = prepareSessionWrite(data);
            
            // Add server timestamp
            safeData.createdAt = new Date().toISOString();
            
            // If Firestore is unavailable, use localStorage
            if (!_FIRESTORE_AVAILABLE) {
                safeData._localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
                _saveToLocalStore(collection, safeData);
                console.warn('safeFirestoreAdd: wrote to localStorage (' + collection + ')');
                logAuditTrail(currentUser ? currentUser.uid : 'anonymous', 'local_store_write', {
                    collection: collection,
                    size: JSON.stringify(safeData).length
                });
                if (typeof showToast === 'function') showToast('⚠️ ' + (typeof I18N !== 'undefined' && I18N[currentLang] ? (I18N[currentLang].cloud_save_failed || 'Cloud save unavailable. Saved locally only.') : 'Cloud save unavailable. Saved locally only.'), 'warning', 6000);
                resolve({ id: safeData._localId });
                return;
            }
            
            // Execute the write
            db.collection(collection).add(safeData).then(function(docRef) {
                logAuditTrail(currentUser ? currentUser.uid : 'anonymous', 'firestore_write', {
                    collection: collection,
                    docId: docRef.id,
                    size: JSON.stringify(safeData).length
                });
                resolve(docRef);
            }).catch(function(err) {
                if (_isFirestorePermissionError(err)) {
                    _FIRESTORE_AVAILABLE = false;
                    safeData._localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
                    _saveToLocalStore(collection, safeData);
                    console.warn('safeFirestoreAdd: permission denied, fell back to localStorage (' + collection + ')');
                    if (typeof showToast === 'function') showToast('⚠️ ' + (typeof I18N !== 'undefined' && I18N[currentLang] ? (I18N[currentLang].cloud_permission_denied || 'Firebase permission denied. Data saved locally only.') : 'Firebase permission denied. Data saved locally only.'), 'error', 8000);
                    resolve({ id: safeData._localId });
                } else {
                    console.error('Firestore write failed:', err);
                    reject(err);
                }
            });
        } catch (err) {
            console.error('Firestore write preparation failed:', err);
            reject(err);
        }
    });
}

// ================================================================
// RATE LIMITING
// ================================================================

var _rateLimitStore = {};

/**
 * Rate limit a function by key.
 * @param {string} key - Unique key for the action being rate limited
 * @param {number} maxAttempts - Maximum attempts within the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} Whether the action is allowed
 */
function checkRateLimit(key, maxAttempts, windowMs) {
    var now = Date.now();
    maxAttempts = maxAttempts || 10;
    windowMs = windowMs || 60000;
    
    if (!_rateLimitStore[key]) {
        _rateLimitStore[key] = [];
    }
    
    // Remove expired entries
    _rateLimitStore[key] = _rateLimitStore[key].filter(function(t) {
        return (now - t) < windowMs;
    });
    
    if (_rateLimitStore[key].length >= maxAttempts) {
        return false;
    }
    
    _rateLimitStore[key].push(now);
    return true;
}

/**
 * Rate-limited Firestore write.
 * @param {string} collection - Firestore collection
 * @param {Object} data - Data to write
 * @returns {Promise} Firestore write promise
 */
function rateLimitedFirestoreWrite(collection, data) {
    var key = 'firestore_write_' + (currentUser ? currentUser.uid : 'anonymous') + '_' + collection;
    
    if (!checkRateLimit(key, 30, 60000)) {
        logAuditTrail(currentUser ? currentUser.uid : 'anonymous', 'rate_limit_exceeded', {
            collection: collection
        });
        return Promise.reject(new Error('Rate limit exceeded. Please wait before performing more operations.'));
    }
    
    return safeFirestoreAdd(collection, data);
}

// ================================================================
// SESSION MANAGEMENT
// ================================================================

var _sessionStartTime = null;
var _lastActivityTime = null;
var _SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
var _SESSION_CHECK_INTERVAL = 60000; // Check every minute

/**
 * Start a user session timer.
 */
function startSessionTimer() {
    _sessionStartTime = Date.now();
    _lastActivityTime = Date.now();
    
    // Listen for user activity
    document.addEventListener('click', function() { _lastActivityTime = Date.now(); });
    document.addEventListener('keydown', function() { _lastActivityTime = Date.now(); });
    document.addEventListener('mousemove', function() { _lastActivityTime = Date.now(); });
    
    // Periodic session check
    if (window._sessionInterval) clearInterval(window._sessionInterval);
    window._sessionInterval = setInterval(function() {
        if (currentUser && !currentUser.isAnonymous) {
            var inactiveTime = Date.now() - _lastActivityTime;
            if (inactiveTime > _SESSION_TIMEOUT_MS) {
                // Session timed out - log and sign out
                logAuditTrail(currentUser.uid, 'session_timeout', {
                    inactiveMinutes: Math.round(inactiveTime / 60000)
                });
                showToast('Session expired due to inactivity. Please sign in again.', 'warning');
                doSignOut();
            }
        }
    }, _SESSION_CHECK_INTERVAL);
}

/**
 * Stop the session timer.
 */
function stopSessionTimer() {
    if (window._sessionInterval) {
        clearInterval(window._sessionInterval);
        window._sessionInterval = null;
    }
}

// ================================================================
// ROLE-BASED ACCESS CONTROL
// ================================================================

var ROLES = {
    MANAGER: 'manager',
    ENGINEER: 'engineer',
    VIEWER: 'viewer'
};

var ROLE_PERMISSIONS = {
    manager: ['run_tests', 'view_results', 'manage_users', 'export_data', 'delete_sessions', 'configure_system', 'manage_system'],
    engineer: ['run_tests', 'view_results', 'export_data'],
    viewer: ['view_results']
};

/**
 * Check if the current user has permission for an action.
 * @param {string} action - Action to check
 * @returns {boolean} Whether permitted
 */
function hasPermission(action) {
    var role = currentUserRole || 'viewer';
    var permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
    return permissions.indexOf(action) !== -1;
}

/**
 * Check if user can run a specific test.
 * @param {string} testType - Type of test
 * @returns {boolean} Whether test can be run
 */
function canRunTest(testType) {
    // Anonymous users cannot run tests
    if (currentUser && currentUser.isAnonymous) {
        showToast('Guest users cannot run tests. Please sign in.', 'warning');
        return false;
    }
    return hasPermission('run_tests');
}

// ================================================================
// AUDIT TRAIL
// ================================================================

var auditLog = [];
var _auditLoggingEnabled = true;

/**
 * Log an action to the audit trail with proper rate limiting.
 * @param {string} user - User identifier
 * @param {string} action - Action performed
 * @param {Object} details - Additional details
 */
function logAuditTrail(user, action, details) {
    if (!_auditLoggingEnabled) return;
    
    // Rate limit audit logging to prevent abuse
    if (!checkRateLimit('audit_log_' + user, 100, 10000)) {
        // Silently drop excess audit logs to prevent flooding
        return;
    }
    
    var entry = {
        timestamp: new Date().toISOString(),
        user: user || 'anonymous',
        action: sanitizeInput(action),
        details: details || {}
    };
    
    auditLog.push(entry);
    
    // Persist to Firestore with rate limiting (skip if unavailable)
    if (typeof db !== 'undefined' && db && _FIRESTORE_AVAILABLE) {
        try {
            var safeEntry = sanitizeFirestoreData(entry);
            db.collection('audit_log').add(safeEntry).catch(function(err) {
                if (_isFirestorePermissionError(err)) {
                    _FIRESTORE_AVAILABLE = false;
                    _saveToLocalStore('audit_log', safeEntry);
                } else {
                    console.warn('Audit log write failed (non-critical):', err.message);
                }
            });
        } catch(e) {
            // Silently fail - audit logging is best-effort
        }
    } else if (typeof db !== 'undefined' && db && !_FIRESTORE_AVAILABLE) {
        // Firestore known unavailable — write locally
        try {
            _saveToLocalStore('audit_log', entry);
        } catch(e) {}
    }
    
    // Keep memory log bounded (last 1000 entries)
    if (auditLog.length > 1000) {
        auditLog = auditLog.slice(-500);
    }
}

/**
 * Get recent audit log entries.
 * @param {number} limit - Max entries to return
 * @returns {Array} Recent audit entries
 */
function getRecentAuditLog(limit) {
    return auditLog.slice(-(limit || 50));
}

/**
 * Log a successful login event to the audit trail.
 */
function logLogin() {
    logAuditTrail(currentUser ? currentUser.uid : 'anonymous', 'login', {
        method: currentUser && currentUser.isAnonymous ? 'anonymous' : 'email',
        timestamp: new Date().toISOString()
    });
}

/**
 * Log a logout event to the audit trail.
 */
function logLogout() {
    logAuditTrail(currentUser ? currentUser.uid : 'anonymous', 'logout', {
        timestamp: new Date().toISOString()
    });
}

/**
 * Enable or disable audit logging.
 * @param {boolean} enabled - Whether logging is enabled
 */
function setAuditLoggingEnabled(enabled) {
    _auditLoggingEnabled = enabled;
}

// ================================================================
// CSRF PROTECTION
// ================================================================

/**
 * Get CSRF token from meta tag or generate one.
 * @returns {string} CSRF token
 */
function getCSRFToken() {
    // First try meta tag
    var meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');
    
    // Try session storage
    var stored = sessionStorage.getItem('csrf_token');
    if (stored) return stored;
    
    // Generate new token
    var arr = new Uint32Array(8);
    window.crypto.getRandomValues(arr);
    var token = Array.from(arr, function(v) { return v.toString(16); }).join('');
    
    // Store in session storage (not cookie)
    sessionStorage.setItem('csrf_token', token);
    return token;
}

/**
 * Validate a CSRF token against the stored token.
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid
 */
function validateCSRFToken(token) {
    if (!token || typeof token !== 'string') return false;
    
    var expected = getCSRFToken();
    
    // Constant-time comparison to prevent timing attacks
    if (expected.length !== token.length) return false;
    
    var result = 0;
    for (var i = 0; i < expected.length; i++) {
        result |= expected.charCodeAt(i) ^ token.charCodeAt(i);
    }
    return result === 0;
}

// ================================================================
// SECURE API HELPERS
// ================================================================

/**
 * Make a secure API call with CSRF protection.
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
function secureAPICall(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    
    // Add CSRF token
    options.headers['X-CSRF-TOKEN'] = getCSRFToken();
    
    // Add credentials for cookies
    options.credentials = 'same-origin';
    
    // Rate limit API calls
    var key = 'api_call_' + url;
    if (!checkRateLimit(key, 60, 60000)) {
        return Promise.reject(new Error('API rate limit exceeded'));
    }
    
    return fetch(url, options).then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) {
                throw new Error(err.error || 'API request failed: ' + response.status);
            });
        }
        return response.json();
    });
}

// ================================================================
// SAFE HTML RENDERERS
// ================================================================

/**
 * Safely set text content of an element (prevents XSS).
 * @param {string|Element} elementOrId - Element or element ID
 * @param {*} content - Content to set
 */
function safeSetText(elementOrId, content) {
    var el = (typeof elementOrId === 'string') 
        ? document.getElementById(elementOrId) 
        : elementOrId;
    if (el) {
        el.textContent = (content !== null && content !== undefined) ? String(content) : '';
    }
}

/**
 * Safely set innerHTML of an element with sanitization.
 * Only use for content that requires HTML formatting (e.g., structured results).
 * @param {string|Element} elementOrId - Element or element ID
 * @param {string} html - HTML content to set (will be sanitized)
 */
function safeSetHTML(elementOrId, html) {
    var el = (typeof elementOrId === 'string') 
        ? document.getElementById(elementOrId) 
        : elementOrId;
    if (el) {
        el.innerHTML = sanitizeInput(html || '');
    }
}

/**
 * Create a safe result row HTML string.
 * @param {string} label - Result label
 * @param {string} value - Result value
 * @returns {string} Safe HTML
 */
function safeResultRow(label, value) {
    return '<div class="result-row"><span class="result-label">' + 
        sanitizeInput(label) + '</span><span class="result-value">' + 
        sanitizeInput(value) + '</span></div>';
}

/**
 * Create a safe result status HTML.
 * @param {boolean} passed - Whether test passed
 * @param {string} message - Status message
 * @returns {string} Safe HTML
 */
function safeResultStatus(passed, message) {
    var icon = passed ? '✅' : '❌';
    var cls = passed ? 'pass' : 'fail';
    return '<div class="result-status ' + cls + '">' + icon + ' ' + sanitizeInput(message) + '</div>';
}

// ================================================================
// INITIALIZATION
// ================================================================

// Start session monitoring when auth state changes
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            startSessionTimer();
        } else {
            stopSessionTimer();
        }
    });
}

console.log('SmartLab Security Module v2.0 loaded');

