/* smartLAB — Manual Notification Trigger (Vercel Serverless Function)
 * POST /api/client/notify  { id, event? }  — staff only.
 * Fires the webhook dispatch for a specimen without changing its status
 * (useful for testing WhatsApp/SMS delivery end to end).
 */

const SB = require('../_supabase');
const Webhook = require('../_webhook');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') { SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return; }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const session = await SB.loadSession(req, res, c);
    if (!session) { SB.json(res, 401, { ok: false, error: 'Not authenticated' }); return; }
    if (!(session.profile && session.profile.role === 'staff')) {
        SB.json(res, 403, { ok: false, error: 'Staff only' }); return;
    }

    const body = await SB.readBody(req);
    const id = String(body.id || '').trim();
    if (!id) { SB.json(res, 400, { ok: false, error: 'Specimen id is required' }); return; }

    const rows = await SB.pgSelect(c, 'specimens', { 'id=eq': id });
    const specimen = rows && rows.length ? rows[0] : null;
    if (!specimen) { SB.json(res, 404, { ok: false, error: 'Specimen not found' }); return; }

    const clientProfile = await SB.getProfile(c, specimen.client_id);
    const out = await Webhook.dispatchNotification(c, {
        event: String(body.event || 'specimen.update'),
        specimen: specimen,
        profile: clientProfile
    });

    SB.json(res, 200, { ok: true, dispatch: out.result, log: out.log });
};
