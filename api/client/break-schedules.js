/* smartLAB — Break Schedules API (Vercel Serverless Function)
 * GET  /api/client/break-schedules   — list schedules (own specimens / all for staff)
 * POST /api/client/break-schedules   — create a break/set schedule (staff)
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
        if (isStaff) {
            const rows = await SB.pgSelect(c, 'break_schedules',
                { 'order': 'schedule_date.asc', 'select': '*,specimen:specimens(*)' });
            SB.json(res, 200, { ok: true, schedules: rows || [] });
        } else {
            // Client: fetch schedules only for their own specimens.
            const mine = await SB.pgSelect(c, 'specimens', { 'client_id=eq': userId, 'select': 'id' });
            const ids = (mine || []).map(function(s){ return s.id; });
            if (!ids.length) { SB.json(res, 200, { ok: true, schedules: [] }); return; }
            const rows = await SB.pgSelect(c, 'break_schedules',
                { 'order': 'schedule_date.asc', 'select': '*,specimen:specimens(*)', 'specimen_id=in': '(' + ids.join(',') + ')' });
            SB.json(res, 200, { ok: true, schedules: rows || [] });
        }
        return;
    }

    if (req.method === 'POST') {
        if (!isStaff) { SB.json(res, 403, { ok: false, error: 'Only lab staff can schedule breaks' }); return; }
        const specimenId = String(body.specimen_id || '').trim();
        const scheduleDate = String(body.schedule_date || '').trim();
        if (!specimenId || !scheduleDate) {
            SB.json(res, 400, { ok: false, error: 'specimen_id and schedule_date are required' }); return;
        }
        const sched = await SB.pgInsert(c, 'break_schedules', {
            specimen_id: specimenId,
            schedule_date: new Date(scheduleDate).toISOString(),
            status: 'scheduled',
            scheduled_by: userId,
            notes: String(body.notes || '').trim()
        });
        if (!sched) { SB.json(res, 500, { ok: false, error: 'Failed to create schedule' }); return; }
        SB.json(res, 201, { ok: true, schedule: sched });
    }
};
