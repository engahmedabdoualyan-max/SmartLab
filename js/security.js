// ================================================================
// RBAC — Role-Based Access Control & Audit Trail
// ================================================================

var currentUserRole = 'viewer';
var currentUserData = null;

var ROLE_PERMISSIONS = {
    admin: [
        'run_test', 'view_sessions', 'view_all_sessions', 'export_data',
        'create_session', 'delete_session', 'manage_users', 'manage_equipment',
        'manage_settings', 'view_audit_log', 'assign_roles'
    ],
    manager: [
        'run_test', 'view_sessions', 'view_all_sessions', 'export_data',
        'create_session', 'delete_session', 'manage_equipment', 'view_audit_log'
    ],
    engineer: [
        'run_test', 'view_sessions', 'create_session', 'export_data'
    ],
    viewer: [
        'view_sessions'
    ]
};

var TEST_ROLE_ACCESS = {
    admin:    ['compaction','cbr','straightedge','slump','maturity','marshall','bitumen','penetration','atterberg','sieve','compressive','ductility','air'],
    manager:  ['compaction','cbr','straightedge','slump','maturity','marshall','bitumen','penetration','atterberg','sieve','compressive','ductility','air'],
    engineer: ['compaction','cbr','straightedge','slump','maturity','marshall','bitumen','penetration','atterberg','sieve','compressive','ductility','air'],
    viewer:   []
};

function hasPermission(action) {
    var perms = ROLE_PERMISSIONS[currentUserRole] || ROLE_PERMISSIONS.viewer;
    return perms.indexOf(action) !== -1;
}

function canRunTest(testType) {
    var allowed = TEST_ROLE_ACCESS[currentUserRole] || [];
    return allowed.indexOf(testType) !== -1;
}

function canExportData() { return hasPermission('export_data'); }
function canManageUsers() { return hasPermission('manage_users'); }
function canDeleteSession() { return hasPermission('delete_session'); }
function canViewAllSessions() { return hasPermission('view_all_sessions'); }
function canManageEquipment() { return hasPermission('manage_equipment'); }
function canViewAuditLog() { return hasPermission('view_audit_log'); }

async function assignRole(uid, role) {
    if (!hasPermission('assign_roles')) {
        showToast('Permission denied: admin only', 'error');
        return false;
    }
    if (ROLE_PERMISSIONS[role] === undefined) {
        showToast('Invalid role: ' + role, 'error');
        return false;
    }
    try {
        await db.collection('users').doc(uid).update({ role: role });
        logAudit('role_changed', uid, { newRole: role });
        showToast('Role updated to ' + role, 'success');
        return true;
    } catch (e) {
        showToast('Failed to assign role: ' + e.message, 'error');
        return false;
    }
}

async function createUserDoc(user, role, department) {
    role = role || 'engineer';
    department = department || '';
    try {
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email || 'User',
            role: role,
            department: department,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true
        }, { merge: true });
    } catch (e) {
        console.error('createUserDoc error:', e);
    }
}

async function fetchUserRole(user) {
    if (!user) { currentUserRole = 'viewer'; currentUserData = null; return; }
    try {
        var doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            currentUserData = doc.data();
            currentUserRole = currentUserData.role || 'engineer';
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await createUserDoc(user, 'engineer');
            currentUserRole = 'engineer';
            currentUserData = { uid: user.uid, email: user.email, displayName: user.displayName, role: 'engineer' };
        }
    } catch (e) {
        console.error('fetchUserRole error:', e);
        currentUserRole = 'engineer';
    }
    applyRoleToUI();
}

function applyRoleToUI() {
    var deleteBtns = document.querySelectorAll('.btn-delete-session, .btn-danger[onclick*="delete"]');
    deleteBtns.forEach(function(el) {
        el.style.display = canDeleteSession() ? '' : 'none';
    });
    var exportBtns = document.querySelectorAll('.btn-export, [onclick*="export"], [onclick*="PDF"]');
    exportBtns.forEach(function(el) {
        el.style.display = canExportData() ? '' : 'none';
    });
}

// ================================================================
// AUDIT TRAIL
// ================================================================

function logAudit(action, target, details) {
    details = details || {};
    if (!currentUser) return;
    try {
        var entry = {
            userId: currentUser.uid,
            userEmail: currentUser.email || '',
            userRole: currentUserRole,
            action: action,
            target: target || '',
            details: details,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ipAddress: ''
        };
        db.collection('audit_log').add(entry).catch(function(e) {
            console.error('logAudit error:', e);
        });
    } catch (e) {
        console.error('logAudit error:', e);
    }
}

function logTestStarted(testType, testId) {
    logAudit('test_started', testId || '', { testType: testType });
}

function logTestStopped(testType, testId, results) {
    logAudit('test_stopped', testId || '', { testType: testType, results: results || {} });
}

function logSessionCreated(sessionId, testType) {
    logAudit('session_created', sessionId || '', { testType: testType });
}

function logSessionDeleted(sessionId) {
    logAudit('session_deleted', sessionId || '', {});
}

function logExport(format, sessionId) {
    logAudit('report_exported', sessionId || '', { format: format });
}

function logLogin() {
    logAudit('login', '', {});
}

function logLogout() {
    logAudit('logout', '', {});
}

function logEquipmentCalibrated(equipment) {
    logAudit('equipment_calibrated', equipment || '', {});
}

async function loadAuditLog(limit) {
    if (!hasPermission('view_audit_log')) {
        showToast('Permission denied', 'error');
        return;
    }
    limit = limit || 50;
    try {
        var snap = await db.collection('audit_log')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        var entries = [];
        snap.forEach(function(doc) {
            var d = doc.data();
            d.id = doc.id;
            entries.push(d);
        });
        return entries;
    } catch (e) {
        console.error('loadAuditLog error:', e);
        showToast('Failed to load audit log', 'error');
        return [];
    }
}

function renderAuditLog(containerId, entries) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!entries || entries.length === 0) {
        el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">No audit entries found</div>';
        return;
    }
    var actionIcons = {
        test_started: '▶️', test_stopped: '⏹️', session_created: '📁',
        session_deleted: '🗑️', report_exported: '📄', role_changed: '🔑',
        equipment_calibrated: '🔧', login: '🔓', logout: '🔒'
    };
    var html = '<table class="stats-table"><thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>';
    entries.forEach(function(e) {
        var ts = e.timestamp ? (e.timestamp.toDate ? e.timestamp.toDate() : new Date(e.timestamp)).toLocaleString() : '--';
        var icon = actionIcons[e.action] || '📝';
        var detailStr = e.details ? JSON.stringify(e.details) : '';
        html += '<tr><td style="font-size:10px;white-space:nowrap;">' + ts + '</td>';
        html += '<td style="font-size:11px;">' + (e.userEmail || '--') + '</td>';
        html += '<td><span style="font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(59,130,246,0.1);color:var(--accent);">' + (e.userRole || '--') + '</span></td>';
        html += '<td style="font-size:11px;">' + icon + ' ' + (e.action || '--') + '</td>';
        html += '<td style="font-size:11px;">' + (e.target || '--') + '</td>';
        html += '<td style="font-size:10px;max-width:200px;overflow:hidden;text-overflow:ellipsis;">' + detailStr + '</td></tr>';
    });
    html += '</tbody></table>';
    el.innerHTML = html;
}
