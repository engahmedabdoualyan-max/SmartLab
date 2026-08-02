/* smartLAB — Webhook Log API (Vercel Serverless Function)
 * GET /api/client/webhooks — list notification dispatch history (staff only).
 * Reads from the v_webhook_logs view (joins specimen context).
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

    const rows = await SB.pgSelect(c, 'v_webhook_logs', { 'order': 'created_at.desc', 'limit': 100 });
    SB.json(res, 200, { ok: true, logs: rows || [] });
};
