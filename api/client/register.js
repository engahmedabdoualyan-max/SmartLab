/* smartLAB — Client Registration (Vercel Serverless Function)
 * POST /api/client/register  { email, password, full_name, phone, company }
 * Creates a Supabase Auth user (role 'client'), inserts a public.profiles
 * row, and — unless email confirmation is required — establishes the session.
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') { SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const body = await SB.readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || '').trim();
    const phone = String(body.phone || '').trim();
    const company = String(body.company || '').trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        SB.json(res, 400, { ok: false, error: 'A valid email address is required' }); return;
    }
    if (password.length < 8) {
        SB.json(res, 400, { ok: false, error: 'Password must be at least 8 characters' }); return;
    }

    const r = await SB.signUp(c, email, password, { full_name: fullName, phone: phone, company: company });

    if (!r.ok) {
        const msg = (r.data && r.data.msg) || (r.data && r.data.error_description) || 'Registration failed';
        SB.json(res, r.status, { ok: false, error: msg }); return;
    }

    const userId = (r.data.user && r.data.user.id) || (r.data.id) || null;

    // Create the profile row (service role) so the account is fully ready even
    // if email confirmation is required before first sign-in.
    if (userId) {
        await SB.pgInsert(c, 'profiles', {
            id: userId,
            role: 'client',
            full_name: fullName,
            phone: phone,
            company: company
        });
    }

    // Newer GoTrue responses nest tokens under `session`; older ones at the top.
    const session = r.data.session || r.data;
    if (session && session.access_token && session.refresh_token) {
        SB.setSessionCookies(res, { access_token: session.access_token, refresh_token: session.refresh_token }, SB.isSecure(req));
        SB.json(res, 200, {
            ok: true,
            requiresConfirmation: false,
            user: r.data.user || session.user
        });
    } else {
        SB.json(res, 200, { ok: true, requiresConfirmation: true });
    }
};
