/* smartLAB — Supabase shared helper (Vercel Serverless Function)
 * Zero-dependency REST client for Supabase Auth + PostgREST using global
 * fetch (Node 18+). Server-side code uses the service role key so it bypasses
 * RLS, while client-side portal code goes through these functions only.
 *
 * Required env vars (set in Vercel + .env.local):
 *   SUPABASE_URL                 e.g. https://xyzcompany.supabase.co
 *   SUPABASE_ANON_KEY            publishable key (auth endpoints)
 *   SUPABASE_SERVICE_ROLE_KEY    secret key (PostgREST / server-side only)
 */

const ACCESS_COOKIE = 'smartlab_ca';
const REFRESH_COOKIE = 'smartlab_cr';
const SESSION_DAYS = 30;

function cfg() {
    return {
        url: process.env.SUPABASE_URL || '',
        anon: process.env.SUPABASE_ANON_KEY || '',
        service: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    };
}

function configured() {
    const c = cfg();
    return !!(c.url && c.anon && c.service);
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
            const s = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
            if (s) { try { resolve(JSON.parse(s)); } catch (e) { resolve({}); } return; }
        }
        const chunks = [];
        req.on('data', function(c){ chunks.push(c); });
        req.on('end', function(){
            const raw = Buffer.concat(chunks).toString('utf8');
            try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { resolve({}); }
        });
        req.on('error', function(){ resolve({}); });
    });
}

function isSecure(req) {
    return req.headers['x-forwarded-proto'] === 'https';
}

function getCookie(req, name) {
    const header = req.headers.cookie || '';
    const parts = header.split(';');
    for (let i = 0; i < parts.length; i++) {
        const kv = parts[i].trim().split('=');
        if (kv[0] === name) {
            try { return decodeURIComponent(kv.slice(1).join('=')); } catch (e) { return kv.slice(1).join('='); }
        }
    }
    return null;
}

function setCookie(res, name, value, maxAgeSeconds, secure) {
    const h = name + '=' + value +
        '; HttpOnly; Path=/; SameSite=Lax; Max-Age=' + maxAgeSeconds +
        (secure ? '; Secure' : '');
    // Two session cookies are set back-to-back; use appendHeader so the second
    // one does not overwrite the first.
    if (res.appendHeader) res.appendHeader('Set-Cookie', h);
    else res.setHeader('Set-Cookie', h);
}

function clearCookie(res, name) {
    const h = name + '=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0';
    if (res.appendHeader) res.appendHeader('Set-Cookie', h);
    else res.setHeader('Set-Cookie', h);
}

function setSessionCookies(res, session, secure) {
    const maxAge = SESSION_DAYS * 86400;
    setCookie(res, ACCESS_COOKIE, session.access_token, maxAge, secure);
    setCookie(res, REFRESH_COOKIE, session.refresh_token, maxAge, secure);
}

function clearSessionCookies(res) {
    clearCookie(res, ACCESS_COOKIE);
    clearCookie(res, REFRESH_COOKIE);
}

async function request(c, path, opts) {
    opts = opts || {};
    const headers = Object.assign({
        'Content-Type': 'application/json',
        'apikey': c.anon
    }, opts.headers || {});
    if (opts.auth) headers['Authorization'] = 'Bearer ' + opts.auth;
    const resp = await fetch(c.url + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
    });
    let data = {};
    try { data = await resp.json(); } catch (e) { /* non-JSON response */ }
    return { status: resp.status, ok: resp.ok, data: data };
}

/* ---------------- Auth (Supabase GoTrue REST) ---------------- */

async function signUp(c, email, password, meta) {
    return request(c, '/auth/v1/signup', { method: 'POST', body: {
        email: email, password: password,
        data: meta || {}
    }});
}

async function signInPassword(c, email, password) {
    return request(c, '/auth/v1/token?grant_type=password', { method: 'POST', body: {
        email: email, password: password
    }});
}

async function refreshSession(c, refreshToken) {
    return request(c, '/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: {
        refresh_token: refreshToken
    }});
}

async function getUser(c, accessToken) {
    const r = await request(c, '/auth/v1/user', { auth: accessToken });
    return r.ok ? r.data : null;
}

/* ---------------- PostgREST (service role, bypasses RLS) ---------------- */

function pgHeaders(c) {
    return {
        'apikey': c.service,
        'Authorization': 'Bearer ' + c.service,
        'Content-Type': 'application/json'
    };
}

/* Builds a PostgREST query string. Regular params (select/order/limit/offset)
 * are emitted as key=value; filters are emitted as a BARE param named
 * "column=operator.value" (e.g. id=eq.<uuid>). The '=' inside a filter name
 * MUST stay literal: PostgREST does not decode %3D in param names, and an
 * empty "=value" suffix is rejected with PGRST100. */
function buildQuery(f) {
    const parts = [];
    Object.keys(f).forEach(function(k) {
        if (k === 'select' || k === 'order' || k === 'limit' || k === 'offset') {
            parts.push(k + '=' + encodeURIComponent(f[k]));
        } else {
            parts.push(k + '.' + f[k]);
        }
    });
    return parts.join('&');
}

async function pgSelect(c, table, filter, select) {
    const f = filter || {};
    if (select) f.select = select;
    const resp = await fetch(c.url + '/rest/v1/' + table + '?' + buildQuery(f), {
        headers: pgHeaders(c)
    });
    const data = await resp.json().catch(function(){ return []; });
    return resp.ok ? data : null;
}

async function pgInsert(c, table, row) {
    const resp = await fetch(c.url + '/rest/v1/' + table, {
        method: 'POST',
        headers: Object.assign(pgHeaders(c), { 'Prefer': 'return=representation' }),
        body: JSON.stringify(row)
    });
    const data = await resp.json().catch(function(){ return null; });
    return resp.ok ? (Array.isArray(data) ? data[0] : data) : null;
}

async function pgUpdate(c, table, row, filter) {
    const qs = buildQuery(filter || {});
    const resp = await fetch(c.url + '/rest/v1/' + table + (qs ? '?' + qs : ''), {
        method: 'PATCH',
        headers: Object.assign(pgHeaders(c), { 'Prefer': 'return=representation' }),
        body: JSON.stringify(row)
    });
    const data = await resp.json().catch(function(){ return null; });
    return resp.ok ? (Array.isArray(data) ? data[0] : data) : null;
}

/* ---------------- Session + identity helpers ---------------- */

async function getProfile(c, userId) {
    if (!userId) return null;
    const rows = await pgSelect(c, 'profiles', { 'id=eq': userId });
    return rows && rows.length ? rows[0] : null;
}

async function getStaffProfiles(c) {
    const rows = await pgSelect(c, 'profiles', { 'role=eq': 'staff' });
    return rows || [];
}

async function isStaffUser(c, userId) {
    const p = await getProfile(c, userId);
    return !!(p && p.role === 'staff');
}

/* Loads the session from cookies, refreshing it if expired.
 * Returns { user, profile, refreshed } or null. Rotates cookies on refresh. */
async function loadSession(req, res, c) {
    let access = getCookie(req, ACCESS_COOKIE);
    const refresh = getCookie(req, REFRESH_COOKIE);
    if (!access) return null;

    let user = await getUser(c, access);
    if (!user && refresh) {
        const r = await refreshSession(c, refresh);
        const rr = r.data && (r.data.session || r.data);
        if (r.ok && rr && rr.access_token) {
            access = rr.access_token;
            setSessionCookies(res, rr, isSecure(req));
            user = await getUser(c, access);
        }
    }
    if (!user) return null;
    const profile = await getProfile(c, user.id);
    return { user: user, profile: profile, refreshed: false };
}

/* Convenience: the standard auth guard used by every /api/client/* handler. */
function notConfigured(res) {
    json(res, 503, { ok: false, configured: false, error: 'Supabase is not configured yet. Add SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.' });
}

module.exports = {
    ACCESS_COOKIE: ACCESS_COOKIE,
    REFRESH_COOKIE: REFRESH_COOKIE,
    SESSION_DAYS: SESSION_DAYS,
    cfg: cfg,
    configured: configured,
    json: json,
    readBody: readBody,
    isSecure: isSecure,
    getCookie: getCookie,
    setCookie: setCookie,
    clearCookie: clearCookie,
    setSessionCookies: setSessionCookies,
    clearSessionCookies: clearSessionCookies,
    signUp: signUp,
    signInPassword: signInPassword,
    refreshSession: refreshSession,
    getUser: getUser,
    pgSelect: pgSelect,
    pgInsert: pgInsert,
    pgUpdate: pgUpdate,
    getProfile: getProfile,
    getStaffProfiles: getStaffProfiles,
    isStaffUser: isStaffUser,
    loadSession: loadSession,
    notConfigured: notConfigured
};
