// ================================================================
// SmartLAP API Module - v2.0 (Security Hardened)
// ================================================================

const API_ENDPOINTS = {
  lims: 'https://lims.example.com/api',
  export: '/export'
};

/**
 * Get CSRF token securely from sessionStorage (not cookies).
 * @returns {string} CSRF token
 */
function getAPICSRFToken() {
  var meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) return meta.getAttribute('content');
  
  var stored = sessionStorage.getItem('api_csrf_token');
  if (stored) return stored;
  
  var arr = new Uint32Array(8);
  window.crypto.getRandomValues(arr);
  var token = Array.from(arr, function(v) { return v.toString(16); }).join('');
  sessionStorage.setItem('api_csrf_token', token);
  return token;
}

/**
 * Sanitize a value for API transmission.
 * @param {*} value - Value to sanitize
 * @returns {*} Sanitized value
 */
function sanitizeAPIData(value) {
  if (value === null || value === undefined) return value;
  
  if (typeof value === 'string') {
    return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                .substring(0, 10000);
  }
  
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 0;
    return value;
  }
  
  if (typeof value === 'boolean') return value;
  
  if (Array.isArray(value)) {
    return value.map(sanitizeAPIData);
  }
  
  if (typeof value === 'object') {
    var obj = {};
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        obj[String(key)] = sanitizeAPIData(value[key]);
      }
    }
    return obj;
  }
  
  return String(value);
}

/**
 * Securely call the LIMS API with CSRF protection.
 * @param {string} endpoint - API endpoint path
 * @param {Object} body - Request body
 * @returns {Promise} Response data
 */
async function callLIMS(endpoint, body = {}) {
  // Sanitize and validate input
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid endpoint');
  }
  
  // Validate endpoint is a known safe path
  var safeEndpoints = ['/upload', '/sync', '/status', '/results', '/samples'];
  var isValidEndpoint = safeEndpoints.some(function(e) { 
    return endpoint.startsWith(e); 
  });
  if (!isValidEndpoint) {
    console.warn('Untrusted LIMS endpoint:', endpoint);
  }
  
  var sanitizedBody = sanitizeAPIData(body);
  
  var response = await fetch(API_ENDPOINTS.lims + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getAPICSRFToken(),
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'omit', // Don't send cookies cross-origin
    body: JSON.stringify(sanitizedBody)
  });
  
  if (!response.ok) {
    var errMsg = 'LIMS API error: ' + response.status;
    try {
      var errData = await response.json();
      if (errData && errData.error) errMsg = errData.error;
    } catch(e) {}
    throw new Error(errMsg);
  }
  
  return await response.json();
}

/**
 * Securely export data to CSV with safe filename.
 * @param {Array<Array>} data - Data rows
 * @param {string} filename - Output filename (sanitized)
 */
function exportToCSV(data, filename) {
  // Validate data
  if (!Array.isArray(data) || data.length === 0) {
    console.error('exportToCSV: Invalid data');
    return;
  }
  
  // Sanitize filename - only allow safe characters
  filename = String(filename || 'export')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
  
  // Ensure .csv extension
  if (filename.indexOf('.csv') === -1) {
    filename += '.csv';
  }
  
  // Sanitize data values
  var safeData = data.map(function(row) {
    if (!Array.isArray(row)) return [];
    return row.map(function(cell) {
      if (cell === null || cell === undefined) return '';
      var str = String(cell);
      // Escape CSV injection: if cell starts with =, +, -, @, prepend '
      if (/^[=+\-@]/.test(str)) {
        str = "'" + str;
      }
      // Escape quotes in CSV
      return str.replace(/"/g, '""');
    });
  });
  
  var csv = safeData.map(function(row) {
    return row.map(function(cell) {
      // Wrap in quotes if contains comma, quote, or newline
      if (/[,"\n\r]/.test(cell)) {
        return '"' + cell + '"';
      }
      return cell;
    }).join(',');
  }).join('\n');
  
  // Add UTF-8 BOM for Excel compatibility
  var bom = '\uFEFF';
  var blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  
  // Use download attribute with sanitized filename
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(function() {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

