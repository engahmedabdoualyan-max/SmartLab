/* smartLAB — Admin Logout (Vercel Serverless Function)
 * POST /api/logout  — clears the HttpOnly session cookie.
 */
const COOKIE_NAME = 'smartlab_admin';

function json(res, status, data) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(data));
}

module.exports = function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') { json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    res.setHeader('Set-Cookie', COOKIE_NAME + '=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
    json(res, 200, { ok: true });
};
