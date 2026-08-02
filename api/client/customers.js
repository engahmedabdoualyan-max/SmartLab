/* smartLAB — Customers API (Vercel Serverless Function)
 * GET /api/client/customers — list client accounts (staff only).
 * Used by the lab staff UI to register specimens on behalf of a client.
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') { SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const session = await SB.loadSession(req, res, c);
    if (!session) { SB.json(res, 401, { ok: false, error: 'Not authenticated' }); return; }
    if (!(session.profile && session.profile.role === 'staff')) {
        SB.json(res, 403, { ok: false, error: 'Staff only' }); return;
    }

    const rows = await SB.pgSelect(c, 'profiles', { 'role=eq': 'client', 'order': 'full_name.asc' });
    SB.json(res, 200, { ok: true, customers: rows || [] });
};
