/* smartLAB — Client Login (Vercel Serverless Function)
 * POST /api/client/login  { email, password }
 * Exchanges credentials with Supabase Auth and stores the session in
 * HttpOnly cookies (smartlab_ca / smartlab_cr) with automatic refresh.
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') { SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const body = await SB.readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
        SB.json(res, 400, { ok: false, error: 'Email and password are required' }); return;
    }

    const r = await SB.signInPassword(c, email, password);

    if (!r.ok || !r.data.access_token) {
        SB.json(res, 401, { ok: false, error: 'Invalid email or password' }); return;
    }

    SB.setSessionCookies(res, { access_token: r.data.access_token, refresh_token: r.data.refresh_token }, SB.isSecure(req));

    const profile = await SB.getProfile(c, r.data.user.id);
    SB.json(res, 200, {
        ok: true,
        user: r.data.user,
        profile: profile,
        requiresConfirmation: false
    });
};
