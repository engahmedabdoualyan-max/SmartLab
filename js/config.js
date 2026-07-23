// ================================================================
// SmartLAP Configuration Module
// ================================================================
// WARNING: This file exposes Firebase and API credentials needed
// for client-side operations. In production, these should be
// restricted via Firebase Security Rules and App Check.
// ================================================================

const SmartLab_CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "AIzaSyDDr7EQ95hLdecc1BDIZIFhmmmVMLArBsU",
        authDomain: "smartlab-5e4e7.firebaseapp.com",
        projectId: "smartlab-5e4e7",
        storageBucket: "smartlab-5e4e7.firebasestorage.app",
        messagingSenderId: "1051839900093",
        appId: "1:1051839900093:web:fde212b37711cd6ff70ad4"
    },

    // Gemini API — proxied through server/api.js to protect key
    gemini: {
        apiKey: "",
        model: "gemini-2.0-flash",
        baseUrl: "/api/gemini"
    },

    // API Configuration
    api: {
        limsEndpoint: "https://lims.example.com/api",
        baseUrl: "/api"
    },

    // CSRF Token Name
    csrf: {
        cookieName: "csrf_token",
        headerName: "X-CSRF-TOKEN"
    },

    // Test Defaults
    defaults: {
        gravity: 9.81,
        standardLoad25: 13240,
        standardLoad50: 19960,
        pistonArea: 1963.5,
        datumTemp: -10
    }
};

// Prevent accidental modification
Object.freeze(SmartLab_CONFIG);

// Backward compatibility alias (legacy code may reference SmartLAP_CONFIG)
if (typeof window !== 'undefined') { window.SmartLAP_CONFIG = SmartLab_CONFIG; }

