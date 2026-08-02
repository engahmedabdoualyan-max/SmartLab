/* smartLAB — Client Logout (Vercel Serverless Function)
 * POST /api/client/logout — revokes the Supabase session (best effort) and
 * clears the HttpOnly cookies.
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') { SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return; }

    if (SB.configured()) {
        const c = SB.cfg();
        const access = SB.getCookie(req, SB.ACCESS_COOKIE);
        if (access) {
            try {
                await fetch(c.url + '/auth/v1/logout', {
                    method: 'POST',
                    headers: {
                        'apikey': c.anon,
                        'Authorization': 'Bearer ' + access
                    }
                });
            } catch (e) { /* best effort */ }
        }
    }

    SB.clearSessionCookies(res);
    SB.json(res, 200, { ok: true });
};
