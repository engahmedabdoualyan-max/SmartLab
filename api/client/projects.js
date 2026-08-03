/* smartLAB — Projects API (Vercel Serverless Function)
 * GET    /api/client/projects           — list projects (client: own; staff: all or ?client_id=)
 * POST   /api/client/projects           — create { name, client_id? }
 * PATCH  /api/client/projects           — { id, name?, is_active? }
 * DELETE /api/client/projects           — { id }
 *
 * Feeds the Register Sample PROJECT dropdown from the logged-in client's
 * active project list (supabase migration 0003).
 */

const SB = require('../_supabase');

module.exports = async function handler(req, res) {
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
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
        const clientId = isStaff ? String((req.query && req.query.client_id) || '').trim() : '';
        const filter = {};
        if (!isStaff) filter['client_id=eq'] = userId;
        else if (clientId) filter['client_id=eq'] = clientId;
        const rows = await SB.pgSelect(c, 'projects',
            Object.assign({ 'order': 'is_active.desc,name.asc' }, filter));
        SB.json(res, 200, { ok: true, projects: rows || [] });
        return;
    }

    if (req.method === 'POST') {
        const name = String(body.name || '').trim();
        if (!name) { SB.json(res, 400, { ok: false, error: 'Project name is required' }); return; }
        const clientId = isStaff ? String(body.client_id || '').trim() : userId;
        if (isStaff && !clientId) {
            SB.json(res, 400, { ok: false, error: 'client_id is required for staff-created projects' }); return;
        }
        const project = await SB.pgInsert(c, 'projects', { client_id: clientId, name: name });
        if (!project) {
            SB.json(res, 500, { ok: false, error: 'Failed to create project (name may already exist)' }); return;
        }
        SB.json(res, 201, { ok: true, project: project });
        return;
    }

    if (req.method === 'PATCH') {
        const id = String(body.id || '').trim();
        if (!id) { SB.json(res, 400, { ok: false, error: 'Project id is required' }); return; }
        const rows = await SB.pgSelect(c, 'projects', { 'id=eq': id });
        const project = rows && rows.length ? rows[0] : null;
        if (!project) { SB.json(res, 404, { ok: false, error: 'Project not found' }); return; }
        if (!isStaff && project.client_id !== userId) {
            SB.json(res, 403, { ok: false, error: 'You can only update your own projects' }); return;
        }
        const patch = {};
        if (body.name !== undefined) patch.name = String(body.name || '').trim();
        if (body.is_active !== undefined) patch.is_active = !!body.is_active;
        if (!Object.keys(patch).length) { SB.json(res, 400, { ok: false, error: 'Nothing to update' }); return; }
        const updated = await SB.pgUpdate(c, 'projects', patch, { 'id=eq': id });
        if (!updated) { SB.json(res, 500, { ok: false, error: 'Failed to update project' }); return; }
        SB.json(res, 200, { ok: true, project: updated });
        return;
    }

    if (req.method === 'DELETE') {
        const id = String(body.id || '').trim();
        if (!id) { SB.json(res, 400, { ok: false, error: 'Project id is required' }); return; }
        const rows = await SB.pgSelect(c, 'projects', { 'id=eq': id });
        const project = rows && rows.length ? rows[0] : null;
        if (!project) { SB.json(res, 404, { ok: false, error: 'Project not found' }); return; }
        if (!isStaff && project.client_id !== userId) {
            SB.json(res, 403, { ok: false, error: 'You can only delete your own projects' }); return;
        }
        const ok = await SB.pgDelete(c, 'projects', { 'id=eq': id });
        if (!ok) { SB.json(res, 500, { ok: false, error: 'Failed to delete project' }); return; }
        SB.json(res, 200, { ok: true, deleted: id });
    }
};
