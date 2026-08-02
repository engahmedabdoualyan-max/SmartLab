/* smartLAB — Admin Session Check (Vercel Serverless Function)
 * GET /api/session — verifies the HttpOnly session cookie and returns the
 * authenticated admin (or { authed:false }). Also warns when production
 * environment variables are not configured.
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

function json(res, status, data) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(data));
}

module.exports = function handler(req, res) {
    if (req.method !== 'GET') { json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    const cfg = config();
    const payload = verifyToken(getToken(req), cfg);
    const envConfigured = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);
    if (!payload) { json(res, 200, { authed: false, envConfigured: envConfigured }); return; }
    json(res, 200, { authed: true, email: payload.email, envConfigured: envConfigured });
};
