// ================================================================
// SmartLAP Test Module Structure
// ================================================================

// This file defines the common structure and helper functions
// for all SmartLAP test modules (compaction.js, cbr.js, slump.js, etc.)

// ================== STATE MANAGEMENT ==================

// Global test state management
// Each test has its own set of variables to avoid conflicts
const TestState = {
    currentDomain: null,
    currentTest: null,
    currentSessionId: null,
    sessions: [],
    users: [],
    CSRF_TOKENS: new Map(),
    
    // Initialize test state
    init(domain, test) {
        this.currentDomain = domain;
        this.currentTest = test;
        this.currentSessionId = null;
        this.CSRF_TOKENS.clear();
    },
    
    // Generate CSRF token for session
    generateCSRFToken(sessionId) {
        const token = this.generateSecureToken();
        this.CSRF_TOKENS.set(sessionId, token);
        return token;
    },
    
    // Validate CSRF token
    validateCSRFToken(sessionId, token) {
        const expectedToken = this.CSRF_TOKENS.get(sessionId);
        return expectedToken !== undefined && this.compareStrings(expectedToken, token);
    },
    
    // Generate secure random token
    generateSecureToken() {
        return crypto.getRandomValues(new Uint32Array(4)).reduce((acc, val) => acc + val.toString(16), '');
    },
    
    // Constant-time string comparison for security
    compareStrings(a, b) {
        if (a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    },
    
    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') return input;
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
};

// ================== API INTEGRATION ==================

// API client for server communication
const APIClient = {
    baseUrl: '/api',
    
    async makeRequest(endpoint, method = 'GET', data = null, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        let config = {
            method: method,
            headers: headers,
            credentials: 'same-origin'
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    },
    
    async get(endpoint, token = null) {
        return this.makeRequest(endpoint, 'GET', null, token);
    },
    
    async post(endpoint, data, token = null) {
        return this.makeRequest(endpoint, 'POST', data, token);
    },
    
    async put(endpoint, data, token = null) {
        return this.makeRequest(endpoint, 'PUT', data, token);
    }
};

// ================== NOTIFICATION SYSTEM ==================

// Toast notification system
const NotificationSystem = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 5000) {
        this.init();
        
        const icons = {
            error: '❌',
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span>${TestState.sanitizeInput(message)}</span>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
};

// ================== UI HELPER FUNCTIONS ==================

// Helper functions for UI interaction
const UIHelpers = {
    // Safe DOM manipulation
    setTextContent(element, content) {
        if (element && content !== undefined) {
            element.textContent = TestState.sanitizeInput(content);
        }
    },
    
    setHTMLContent(element, html) {
        if (element && html !== undefined) {
            element.innerHTML = TestState.sanitizeInput(html);
        }
    },
    
    // Show/hide element with transition
    show(element, display = 'flex') {
        if (element) {
            element.style.display = display;
        }
    },
    
    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    },
    
    // Add animation class
    addAnimation(element, animationClass) {
        if (element) {
            element.classList.add(animationClass);
        }
    },
    
    // Remove animation class
    removeAnimation(element, animationClass) {
        if (element) {
            element.classList.remove(animationClass);
        }
    }
};

// ================== EXPORTS ==================

// Export all test utilities (inlined for non-module script context)
// TestState, APIClient, NotificationSystem, and UIHelpers are available globally
// through their definitions above.
