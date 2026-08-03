/* smartLAB — Pavement Design API (Vercel Serverless Function)
 * GET  /api/client/pavement-designs   — list saved designs (staff: all, client: own)
 * POST /api/client/pavement-designs   — save design params/results/thicknesses
 *      (the saved values feed the LandXML / Revit Shared Parameters exports)
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (!['GET', 'POST'].includes(req.method)) {
        SB.json(res, 405, { ok: false, error: 'Method not allowed' }); return;
    }
    if (!SB.configured()) { SB.notConfigured(res); return; }

    const c = SB.cfg();
    const session = await SB.loadSession(req, res, c);
    if (!session) { SB.json(res, 401, { ok: false, error: 'Not authenticated' }); return; }

    const userId = session.user.id;
    const isStaff = !!(session.profile && session.profile.role === 'staff');
    const body = await SB.readBody(req);

    if (req.method === 'GET') {
        // Single design by id — used to reload saved params back into the
        // interactive calculator (?design=<id> from the portal Saved Designs).
        const id = String((req.query && req.query.id) || '').trim();
        if (id) {
            const filter = { 'id=eq': id };
            if (!isStaff) filter['client_id=eq'] = userId;
            const rows = await SB.pgSelect(c, 'pavement_designs', filter);
            SB.json(res, 200, { ok: true, design: rows && rows.length ? rows[0] : null });
            return;
        }

        const filter = isStaff ? null : { 'client_id=eq': userId };
        const rows = await SB.pgSelect(c, 'pavement_designs',
            Object.assign({ 'order': 'created_at.desc' }, filter ? filter : {}));
        SB.json(res, 200, { ok: true, designs: rows || [] });
        return;
    }

    if (req.method === 'POST') {
        const clientId = isStaff && body.client_id ? String(body.client_id) : userId;
        const design = await SB.pgInsert(c, 'pavement_designs', {
            client_id: clientId,
            project_name: String(body.project_name || '').trim(),
            route_name: String(body.route_name || '').trim(),
            location: String(body.location || '').trim(),
            designer: String(body.designer || '').trim(),
            agency: String(body.agency || '').trim(),
            design_type: String(body.design_type || 'flexible').trim(),
            params: (body.params && typeof body.params === 'object') ? body.params : {},
            results: (body.results && typeof body.results === 'object') ? body.results : {},
            thicknesses: (body.thicknesses && typeof body.thicknesses === 'object') ? body.thicknesses : {}
        });
        if (!design) { SB.json(res, 500, { ok: false, error: 'Failed to save design' }); return; }
        SB.json(res, 201, { ok: true, design: design });
    }
};
