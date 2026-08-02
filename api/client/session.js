/* smartLAB — Client Session (Vercel Serverless Function)
 * GET /api/client/session — verifies the HttpOnly session cookie against
 * Supabase Auth and returns the user + profile (with role), or
 * { authed:false, configured:true } when logged out.
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') { SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const session = await SB.loadSession(req, res, c);

    if (!session) {
        SB.json(res, 200, { ok: false, authed: false, configured: true }); return;
    }

    SB.json(res, 200, {
        ok: true,
        authed: true,
        configured: true,
        user: session.user,
        profile: session.profile
    });
};
