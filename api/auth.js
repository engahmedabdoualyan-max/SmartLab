/* smartLAB — Admin Auth (Vercel Serverless Function)
 * Consolidates /api/login, /api/logout and /api/session into one function so
 * the project stays within the Vercel Hobby plan limit of 12 functions.
 *   GET  /api/auth?route=session  → verify HttpOnly cookie, return admin
 *   POST /api/auth?route=login    → { email, password } → set session cookie
 *   POST /api/auth?route=logout   → clear session cookie
 */
const crypto = require('crypto');

const FALLBACK_EMAIL = 'eng.ahmedabdoualyan@gmail.com';
const FALLBACK_PASSWORD = 'fimto@ata';
const FALLBACK_SECRET = 'smartlab_demo_secret_6f2c9a14b7d8e3f1';
const FALLBACK_SESSION_HOURS = 12;
const COOKIE_NAME = 'smartlab_admin';

function config() {
    return {
        email: process.env.ADMIN_EMAIL || FALLBACK_EMAIL,
        password: process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD,
        secret: process.env.AUTH_SECRET || FALLBACK_SECRET,
        sessionHours: parseInt(process.env.ADMIN_SESSION_HOURS || String(FALLBACK_SESSION_HOURS), 10) || FALLBACK_SESSION_HOURS
    };
}

function b64url(buf) { return Buffer.from(buf).toString('base64url'); }

function sign(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

function createToken(email, cfg) {
    const payload = { email: email, iat: Date.now(), exp: Date.now() + cfg.sessionHours * 3600 * 1000 };
    const body = b64url(JSON.stringify(payload));
    return body + '.' + sign(body, cfg.secret);
}

function verifyToken(token, cfg) {
    try {
        if (!token || typeof token !== 'string' || token.indexOf('.') < 0) return null;
        const parts = token.split('.');
        const body = parts[0], sig = parts[1];
        if (!body || !sig) return null;
        const expected = sign(body, cfg.secret);
        const a = Buffer.from(expected), b = Buffer.from(sig);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (!payload.exp || Date.now() > payload.exp) return null;
        return payload;
    } catch (e) { return null; }
}

function getToken(req) {
    const header = req.headers.cookie || '';
    const parts = header.split(';');
    for (let i = 0; i < parts.length; i++) {
        const kv = parts[i].trim().split('=');
        if (kv[0] === COOKIE_NAME) {
            try { return decodeURIComponent(kv.slice(1).join('=')); } catch (e) { return kv.slice(1).join('='); }
        }
    }
    return null;
}

function isSecure(req) {
    return req.headers['x-forwarded-proto'] === 'https';
}

function setSessionCookie(res, token, maxAgeSeconds, secure) {
    res.setHeader('Set-Cookie',
        COOKIE_NAME + '=' + token +
        '; HttpOnly; Path=/; SameSite=Lax; Max-Age=' + maxAgeSeconds +
        (secure ? '; Secure' : ''));
}

function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', COOKIE_NAME + '=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}

function json(res, status, data) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise(function(resolve) {
        if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && !Array.isArray(req.body)) {
            resolve(req.body); return;
        }
        if (req.body !== undefined && req.body !== null) {
            var s = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
            if (s) { try { resolve(JSON.parse(s)); } catch (e) { resolve({}); } return; }
        }
        var chunks = [];
        req.on('data', function(c){ chunks.push(c); });
        req.on('end', function(){
            var raw = Buffer.concat(chunks).toString('utf8');
            try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { resolve({}); }
        });
        req.on('error', function(){ resolve({}); });
    });
}

function handleSession(req, res) {
    const cfg = config();
    const payload = verifyToken(getToken(req), cfg);
    const envConfigured = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);
    if (!payload) { json(res, 200, { authed: false, envConfigured: envConfigured }); return; }
    json(res, 200, { authed: true, email: payload.email, envConfigured: envConfigured });
}

function handleLogin(req, res) {
    readBody(req).then(function(body) {
        const cfg = config();
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        if (email === cfg.email.toLowerCase() && password === cfg.password) {
            const token = createToken(email, cfg);
            setSessionCookie(res, token, cfg.sessionHours * 3600, isSecure(req));
            json(res, 200, { ok: true, email: email });
        } else {
            json(res, 401, { ok: false, error: 'Invalid email or password' });
        }
    });
}

function handleLogout(req, res) {
    clearSessionCookie(res);
    json(res, 200, { ok: true });
}

module.exports = function handler(req, res) {
    const url = req.url || '/api/auth';
    const qIndex = url.indexOf('?');
    const path = (qIndex >= 0 ? url.slice(0, qIndex) : url).replace(/\/+$/, '');
    const query = qIndex >= 0 ? url.slice(qIndex + 1) : '';
    const route = (query.match(/route=([^&]+)/) || [])[1] || null;

    // Also tolerate direct paths (login/logout/session) for compatibility.
    const seg = path.split('/').filter(Boolean).pop();

    if (route === 'login' || seg === 'login') {
        if (req.method !== 'POST') { json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
        handleLogin(req, res); return;
    }
    if (route === 'logout' || seg === 'logout') {
        if (req.method !== 'POST' && req.method !== 'GET') { json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
        handleLogout(req, res); return;
    }
    if (route === 'session' || seg === 'session' || seg === 'auth') {
        if (req.method !== 'GET') { json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
        handleSession(req, res); return;
    }
    json(res, 400, { ok: false, error: 'Unknown auth route' });
};
