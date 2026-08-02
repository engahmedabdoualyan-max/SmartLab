/* smartLAB — Specimens API (Vercel Serverless Function)
 * GET  /api/client/specimens          — list specimens (staff: all, client: own)
 * POST /api/client/specimens          — register a new specimen
 * PATCH /api/client/specimens         — update status/details
 *      body: { id, status?, assigned_engineer?, notes?, results?, ... }
 *      When status → "approved", dispatches the WhatsApp/SMS webhook and
 *      writes the audit row via the DB trigger (status_history).
 */

const SB = require('../_supabase');
const Webhook = require('../_webhook');

const VALID_STATUS = ['registered', 'received', 'in_progress', 'awaiting_break', 'tested', 'approved', 'rejected'];
const VALID_MATERIAL = ['concrete', 'asphalt', 'soil', 'steel', 'other'];

module.exports = async function handler(req, res) {
    if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
        SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return;
    }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const session = await SB.loadSession(req, res, c);
    if (!session) { SB.json(res, 401, { ok: false, error: 'Not authenticated' }); return; }

    const userId = session.user.id;
    const isStaff = !!(session.profile && session.profile.role === 'staff');
    const body = await SB.readBody(req);

    /* ---------------- GET: list ---------------- */
    if (req.method === 'GET') {
        const filter = isStaff ? null : { 'client_id=eq': userId };
        const rows = await SB.pgSelect(c, 'specimens',
            Object.assign({ 'order': 'created_at.desc', 'select': '*,history:specimen_status_history(order:created_at.desc)' },
                filter ? filter : {}));
        SB.json(res, 200, { ok: true, specimens: rows || [], role: session.profile ? session.profile.role : 'client' });
        return;
    }

    /* ---------------- POST: register ---------------- */
    if (req.method === 'POST') {
        const sampleNo = String(body.sample_no || '').trim();
        if (!sampleNo) { SB.json(res, 400, { ok: false, error: 'Sample number is required' }); return; }

        let clientId = isStaff ? String(body.client_id || '').trim() : userId;
        if (isStaff && !clientId) {
            SB.json(res, 400, { ok: false, error: 'client_id is required for staff-created specimens' }); return;
        }

        const materialType = VALID_MATERIAL.includes(body.material_type) ? body.material_type : 'concrete';

        const created = await SB.pgInsert(c, 'specimens', {
            sample_no: sampleNo,
            client_id: clientId,
            project: String(body.project || '').trim(),
            location: String(body.location || '').trim(),
            material_type: materialType,
            test_type: String(body.test_type || '').trim(),
            notes: String(body.notes || '').trim(),
            status: 'registered'
        });
        if (!created) { SB.json(res, 500, { ok: false, error: 'Failed to register specimen' }); return; }
        SB.json(res, 201, { ok: true, specimen: created });
        return;
    }

    /* ---------------- PATCH: update ---------------- */
    if (req.method === 'PATCH') {
        const id = String(body.id || '').trim();
        if (!id) { SB.json(res, 400, { ok: false, error: 'Specimen id is required' }); return; }

        const rows = await SB.pgSelect(c, 'specimens', { 'id=eq': id });
        const specimen = rows && rows.length ? rows[0] : null;
        if (!specimen) { SB.json(res, 404, { ok: false, error: 'Specimen not found' }); return; }

        // Permission: staff may update any specimen; clients only their own and
        // only while it is still in 'registered' (not yet accepted by the lab).
        if (!isStaff) {
            if (specimen.client_id !== userId) {
                SB.json(res, 403, { ok: false, error: 'You can only update your own specimens' }); return;
            }
            if (specimen.status !== 'registered') {
                SB.json(res, 403, { ok: false, error: 'Lab staff has taken over this specimen' }); return;
            }
        }

        const patch = {};
        if (body.status !== undefined) {
            if (!VALID_STATUS.includes(body.status)) {
                SB.json(res, 400, { ok: false, error: 'Invalid status: ' + body.status }); return;
            }
            patch.status = body.status;
        }
        if (body.assigned_engineer !== undefined) patch.assigned_engineer = String(body.assigned_engineer || '').trim();
        if (body.notes !== undefined) patch.notes = String(body.notes || '').trim();
        if (body.project !== undefined) patch.project = String(body.project || '').trim();
        if (body.location !== undefined) patch.location = String(body.location || '').trim();
        if (body.test_type !== undefined) patch.test_type = String(body.test_type || '').trim();
        if (body.results !== undefined && typeof body.results === 'object') patch.results = body.results;

        if (!Object.keys(patch).length) {
            SB.json(res, 400, { ok: false, error: 'Nothing to update' }); return;
        }

        const updated = await SB.pgUpdate(c, 'specimens', patch, { 'id=eq': id });
        if (!updated) { SB.json(res, 500, { ok: false, error: 'Failed to update specimen' }); return; }

        // Trigger webhook when an engineer approves the specimen.
        if (patch.status === 'approved') {
            const clientProfile = await SB.getProfile(c, specimen.client_id);
            await Webhook.dispatchNotification(c, {
                event: 'specimen.approved',
                specimen: Object.assign(specimen, updated),
                profile: clientProfile
            });
        }

        SB.json(res, 200, { ok: true, specimen: updated });
    }
};
