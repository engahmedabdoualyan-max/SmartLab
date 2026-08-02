/* smartLAB — Client Portal controller.
 * Talks only to the serverless functions under /api/client/ which keep the
 * Supabase tokens server-side (HttpOnly cookies, RLS-respecting service role).
 */
(function () {
    'use strict';

    const $ = function (id) { return document.getElementById(id); };
    const API = '/api/client';
    let STATE = { user: null, role: 'client', customers: [] };

    const STATUS_ORDER = ['registered', 'received', 'in_progress', 'awaiting_break', 'tested', 'approved', 'rejected'];
    const STATUS_LABEL = {
        registered: 'Registered', received: 'Received', in_progress: 'In Progress',
        awaiting_break: 'Awaiting Break', tested: 'Tested', approved: 'Approved', rejected: 'Rejected'
    };
    const fmt = function (v) { return v || '—'; };
    const iso = function (v) {
        if (!v) return '—';
        try { return new Date(v).toLocaleString(); } catch (e) { return v; }
    };
    const escapeHtml = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };

    async function api(path, opts) {
        opts = opts || {};
        const r = await fetch(API + path, {
            method: opts.method || 'GET',
            headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
            body: opts.body ? JSON.stringify(opts.body) : undefined
        });
        const d = await r.json().catch(function () { return {}; });
        if (r.status === 401 || r.status === 403) { location.href = 'login.html'; }
        return d;
    }

    function flash(text, type) {
        const el = $('msg');
        el.className = 'msg ' + (type || 'error');
        el.textContent = text;
        setTimeout(function () { el.className = 'msg'; }, 4000);
    }

    /* ---------------- modal ---------------- */
    function openModal(title, html, okLabel, onOk) {
        $('modalTitle').textContent = title;
        $('modalBody').innerHTML = html;
        const ok = $('modalOk');
        ok.style.display = onOk ? 'inline-flex' : 'none';
        ok.textContent = okLabel || 'Save';
        ok.onclick = onOk ? function () { onOk(); } : null;
        $('modalBg').classList.add('open');
    }
    function closeModal() { $('modalBg').classList.remove('open'); }
    $('modalBg').addEventListener('click', function (e) { if (e.target.id === 'modalBg') closeModal(); });
    $('modalCancel').addEventListener('click', closeModal);

    /* ---------------- tabs ---------------- */
    document.querySelectorAll('.tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
            document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
            tab.classList.add('active');
            $(tab.dataset.panel).classList.add('active');
        });
    });

    /* ---------------- boot ---------------- */
    async function boot() {
        const s = await api('/session');
        if (!s.ok) { location.href = 'login.html'; return; }
        STATE.user = s.user;
        STATE.role = s.profile && s.profile.role === 'staff' ? 'staff' : 'client';

        $('userName').textContent = (STATE.user.full_name || s.user.email || 'User');
        const roleEl = $('userRole');
        roleEl.textContent = STATE.role;
        roleEl.className = 'role-badge ' + STATE.role;

        // Staff-only affordances.
        if (STATE.role === 'staff') {
            $('tabNotify').style.display = '';
            $('newSchedBtn').style.display = '';
            const customers = await api('/customers');
            STATE.customers = (customers.customers) || [];
        }

        await loadSpecimens();
        await loadSchedules();
        await loadDesigns();
        if (STATE.role === 'staff') await loadLogs();
    }

    $('logoutBtn').addEventListener('click', async function () {
        await api('/logout', { method: 'POST' });
        location.href = 'login.html';
    });

    /* ---------------- specimens ---------------- */
    async function loadSpecimens() {
        const d = await api('/specimens');
        const list = d.specimens || [];
        $('specCount').textContent = '(' + list.length + ')';
        const body = $('specBody');
        body.innerHTML = list.map(specRow).join('');
        $('specEmpty').style.display = list.length ? 'none' : 'block';
    }

    function statusBadge(st) { return '<span class="status st-' + st + '">' + STATUS_LABEL[st] || st + '</span>'; }

    function specRow(s) {
        const staff = STATE.role === 'staff';
        const actions = [];
        actions.push('<button class="btn btn-outline btn-sm" data-act="view" data-id="' + s.id + '">View</button>');
        if (staff) {
            actions.push('<button class="btn btn-sm" data-act="advance" data-id="' + s.id + '">Advance</button>');
            actions.push('<button class="btn btn-outline btn-sm" data-act="assign" data-id="' + s.id + '">Assign</button>');
            actions.push('<button class="btn btn-amber btn-sm" data-act="notify" data-id="' + s.id + '">Notify</button>');
        } else if (s.status === 'registered') {
            actions.push('<button class="btn btn-outline btn-sm" data-act="edit" data-id="' + s.id + '">Edit</button>');
        }
        return '<tr>' +
            '<td class="mono">' + escapeHtml(s.sample_no) + '</td>' +
            '<td>' + escapeHtml(s.project) + '</td>' +
            '<td>' + escapeHtml(s.material_type) + '</td>' +
            '<td>' + statusBadge(s.status) + '</td>' +
            '<td>' + escapeHtml(s.assigned_engineer) + '</td>' +
            '<td>' + iso(s.updated_at) + '</td>' +
            '<td>' + actions.join(' ') + '</td>' +
            '</tr>';
    }

    $('specBody').addEventListener('click', async function (e) {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === 'view') {
            const d = await api('/specimens');
            const s = (d.specimens || []).find(function (x) { return x.id === id; });
            if (s) renderDetail(s);
        } else if (act === 'advance') {
            renderAdvance(id);
        } else if (act === 'assign') {
            renderAssign(id);
        } else if (act === 'edit') {
            renderEdit(id);
        } else if (act === 'notify') {
            const out = await api('/notify', { method: 'POST', body: { id: id } });
            flash(out.dispatch ? 'Notification → ' + out.dispatch : (out.error || 'Sent'), 'info');
        }
    });

    function renderDetail(s) {
        const hist = (s.history || []).map(function (h) {
            return '<li class="' + (h.status === s.status ? 'today' : 'done') + '">' +
                '<span class="tl-date">' + iso(h.changed_at) + '</span>' +
                STATUS_LABEL[h.status] || h.status + ' <span class="tl-note">' + escapeHtml(h.note || '') + '</span>' +
                '</li>';
        }).join('');
        openModal('Specimen ' + s.sample_no,
            '<div class="detail-grid">' +
            '<div><div class="f">Project</div><div class="v">' + escapeHtml(s.project) + '</div></div>' +
            '<div><div class="f">Location</div><div class="v">' + escapeHtml(s.location) + '</div></div>' +
            '<div><div class="f">Material</div><div class="v">' + escapeHtml(s.material_type) + '</div></div>' +
            '<div><div class="f">Test</div><div class="v">' + escapeHtml(s.test_type) + '</div></div>' +
            '<div><div class="f">Engineer</div><div class="v">' + escapeHtml(s.assigned_engineer) + '</div></div>' +
            '<div><div class="f">Status</div><div class="v">' + statusBadge(s.status) + '</div></div>' +
            '<div class="v" style="grid-column:1/-1"><div class="f">Notes</div><div class="v">' + escapeHtml(s.notes) + '</div></div>' +
            '</div>' +
            (hist ? '<ul class="timeline">' + hist + '</ul>' : ''),
            null, null);
    }

    function renderAdvance(id) {
        const opts = STATUS_ORDER.map(function (st) {
            return '<option value="' + st + '">' + STATUS_LABEL[st] + '</option>';
        }).join('');
        openModal('Advance Status',
            '<div class="form-group"><label>New Status</label><select id="advStatus">' + opts + '</select></div>' +
            '<div class="form-group"><label>Note (optional)</label><textarea id="advNote" rows="2"></textarea></div>',
            'Update',
            async function () {
                const out = await api('/specimens', {
                    method: 'PATCH',
                    body: { id: id, status: $('advStatus').value, notes: $('advNote').value }
                });
                if (out.ok) { closeModal(); await loadSpecimens(); flash('Status updated', 'ok'); }
                else flash(out.error || 'Update failed');
            });
    }

    function renderAssign(id) {
        openModal('Assign Engineer',
            '<div class="form-group"><label>Engineer Name</label><input id="assignEng" placeholder="Eng. name"></div>',
            'Assign',
            async function () {
                const out = await api('/specimens', {
                    method: 'PATCH',
                    body: { id: id, assigned_engineer: $('assignEng').value }
                });
                if (out.ok) { closeModal(); await loadSpecimens(); flash('Engineer assigned', 'ok'); }
                else flash(out.error || 'Update failed');
            });
    }

    function renderEdit(id) {
        const d = STATE.editingSpec;
        openModal('Edit Details',
            '<div class="form-group"><label>Project</label><input id="edProject" value="' + escapeHtml(d && d.project || '') + '"></div>' +
            '<div class="form-group"><label>Location</label><input id="edLocation" value="' + escapeHtml(d && d.location || '') + '"></div>' +
            '<div class="form-group"><label>Test Type</label><input id="edTest" value="' + escapeHtml(d && d.test_type || '') + '"></div>' +
            '<div class="form-group"><label>Notes</label><textarea id="edNotes" rows="2">' + escapeHtml(d && d.notes || '') + '</textarea></div>',
            'Save',
            async function () {
                const out = await api('/specimens', {
                    method: 'PATCH',
                    body: { id: id, project: $('edProject').value, location: $('edLocation').value, test_type: $('edTest').value, notes: $('edNotes').value }
                });
                if (out.ok) { closeModal(); await loadSpecimens(); flash('Saved', 'ok'); }
                else flash(out.error || 'Update failed');
            });
    }

    /* ---------------- new specimen ---------------- */
    $('newSpecBtn').addEventListener('click', function () {
        const customerOpts = STATE.customers.map(function (c) {
            return '<option value="' + c.id + '">' + escapeHtml(c.full_name) + (c.company ? ' — ' + escapeHtml(c.company) : '') + '</option>';
        }).join('');
        openModal('Register Sample',
            '<div class="form-group"><label>Sample No</label><input id="nsSample" placeholder="e.g. CON-2026-001"></div>' +
            (STATE.role === 'staff' ?
                '<div class="form-group"><label>Client</label><select id="nsClient">' + customerOpts + '</select></div>' : '') +
            '<div class="form-group"><label>Project</label><input id="nsProject" placeholder="Project name"></div>' +
            '<div class="form-row"><div class="form-group"><label>Location</label><input id="nsLoc" placeholder="Site"></div>' +
            '<div class="form-group"><label>Material</label><select id="nsMat">' +
            ['concrete', 'asphalt', 'soil', 'steel', 'other'].map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join('') +
            '</select></div></div>' +
            '<div class="form-group"><label>Test Type</label><input id="nsTest" placeholder="e.g. Compressive Strength 7d"></div>' +
            '<div class="form-group"><label>Notes</label><textarea id="nsNotes" rows="2"></textarea></div>',
            'Register',
            async function () {
                const body = {
                    sample_no: $('nsSample').value, project: $('nsProject').value,
                    location: $('nsLoc').value, material_type: $('nsMat').value,
                    test_type: $('nsTest').value, notes: $('nsNotes').value
                };
                if (STATE.role === 'staff') body.client_id = $('nsClient').value;
                const out = await api('/specimens', { method: 'POST', body: body });
                if (out.ok) { closeModal(); await loadSpecimens(); flash('Sample registered', 'ok'); }
                else flash(out.error || 'Registration failed');
            });
    });

    /* ---------------- break schedules ---------------- */
    async function loadSchedules() {
        const d = await api('/break-schedules');
        const list = d.schedules || [];
        const body = $('schedBody');
        body.innerHTML = list.map(function (s) {
            const spec = s.specimen || {};
            return '<tr>' +
                '<td>' + iso(s.schedule_date) + '</td>' +
                '<td class="mono">' + escapeHtml(spec.sample_no || s.specimen_id) + '</td>' +
                '<td>' + escapeHtml(spec.project) + '</td>' +
                '<td>' + statusBadge(s.status === 'scheduled' ? 'registered' : s.status) + '</td>' +
                '<td>' + escapeHtml(s.notes) + '</td>' +
                '</tr>';
        }).join('');
        $('schedEmpty').style.display = list.length ? 'none' : 'block';
    }

    $('newSchedBtn').addEventListener('click', function () {
        const d = STATE.specimens || [];
        const opts = d.map(function (s) {
            return '<option value="' + s.id + '">' + escapeHtml(s.sample_no) + ' — ' + escapeHtml(s.project) + '</option>';
        }).join('');
        openModal('Schedule a Break',
            '<div class="form-group"><label>Specimen</label><select id="schSpec">' + opts + '</select></div>' +
            '<div class="form-group"><label>Date &amp; Time</label><input type="datetime-local" id="schDate" required></div>' +
            '<div class="form-group"><label>Notes</label><textarea id="schNotes" rows="2"></textarea></div>',
            'Schedule',
            async function () {
                const out = await api('/break-schedules', {
                    method: 'POST',
                    body: { specimen_id: $('schSpec').value, schedule_date: $('schDate').value, notes: $('schNotes').value }
                });
                if (out.ok) { closeModal(); await loadSchedules(); flash('Schedule created', 'ok'); }
                else flash(out.error || 'Failed to schedule');
            });
    });

    /* ---------------- pavement designs ---------------- */
    async function loadDesigns() {
        const d = await api('/pavement-designs');
        const list = d.designs || [];
        STATE.designs = list;
        $('pdCount').textContent = '(' + list.length + ')';
        const body = $('pdBody');
        body.innerHTML = list.map(function (pd) {
            const params = pd.params || {}, results = pd.results || {}, th = pd.thicknesses || {};
            return '<tr>' +
                '<td>' + escapeHtml(pd.project_name) + '</td>' +
                '<td>' + escapeHtml(pd.route_name) + '</td>' +
                '<td>' + escapeHtml(pd.design_type) + '</td>' +
                '<td>' + fmt(results.SN) + '</td>' +
                '<td>' + fmt(results.W18) + '</td>' +
                '<td>' + fmt(th.total) + '</td>' +
                '<td>' + iso(pd.created_at) + '</td>' +
                '<td><button class="btn btn-outline btn-sm" data-pd="' + pd.id + '">Load</button></td>' +
                '</tr>';
        }).join('');
        $('pdEmpty').style.display = list.length ? 'none' : 'block';
    }

    $('pdBody').addEventListener('click', function (e) {
        const btn = e.target.closest('[data-pd]');
        if (!btn) return;
        const pd = (STATE.designs || []).find(function (x) { return x.id === btn.dataset.pd; });
        if (!pd) return;
        const p = pd.params || {}, r = pd.results || {}, t = pd.thicknesses || {};
        $('pdProject').value = pd.project_name || '';
        $('pdRoute').value = pd.route_name || '';
        $('pdLocation').value = pd.location || '';
        $('pdDesigner').value = pd.designer || '';
        $('pdAgency').value = pd.agency || '';
        $('pdType').value = pd.design_type || 'flexible';
        $('pdLife').value = p.designLife || '';
        $('pdRel').value = p.reliability || '';
        $('pdStd').value = p.stdDev || '';
        $('pdPo').value = p.po || '';
        $('pdPt').value = p.pt || '';
        $('pdMr').value = p.mr || '';
        $('pdCd').value = p.drainCoeff || '';
        $('pdTh').value = t.total || '';
        flash('Design loaded into the form', 'ok');
    });

    $('pdSaveBtn').addEventListener('click', async function () {
        const params = {
            designLife: $('pdLife').value, reliability: $('pdRel').value, stdDev: $('pdStd').value,
            po: $('pdPo').value, pt: $('pdPt').value, mr: $('pdMr').value, drainCoeff: $('pdCd').value
        };
        const results = { SN: '', W18: '', totalThickness: $('pdTh').value };
        const out = await api('/pavement-designs', {
            method: 'POST',
            body: {
                project_name: $('pdProject').value, route_name: $('pdRoute').value,
                location: $('pdLocation').value, designer: $('pdDesigner').value,
                agency: $('pdAgency').value, design_type: $('pdType').value,
                params: params, results: results,
                thicknesses: { total: $('pdTh').value }
            }
        });
        if (out.ok) { await loadDesigns(); flash('Design saved', 'ok'); }
        else flash(out.error || 'Save failed');
    });

    /* ---------------- notification log (staff) ---------------- */
    async function loadLogs() {
        const d = await api('/webhooks');
        const list = d.logs || [];
        $('logBody').innerHTML = list.map(function (w) {
            const res = (w.dispatch_status === 'ok') ? '✓ sent' : (w.dispatch_status || w.status);
            return '<tr>' +
                '<td>' + iso(w.created_at) + '</td>' +
                '<td>' + escapeHtml(w.event) + '</td>' +
                '<td class="mono">' + escapeHtml(w.sample_no || '') + '</td>' +
                '<td>' + escapeHtml(w.provider) + '</td>' +
                '<td>' + escapeHtml(w.destination) + '</td>' +
                '<td><span class="status ' + (w.dispatch_status === 'ok' ? 'st-approved' : 'st-rejected') + '">' + escapeHtml(res) + '</span></td>' +
                '</tr>';
        }).join('');
        $('logEmpty').style.display = list.length ? 'none' : 'block';
    }

    boot();
})();
