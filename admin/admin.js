/* smartLAB — Admin Panel Pro */
(function(){
'use strict';

/* ===== AUTH CHECK ===== */
var session = null;
try { session = JSON.parse(sessionStorage.getItem('smartlab_admin_session')); } catch(e){}
if (!session || Date.now() > session.expires) {
    sessionStorage.removeItem('smartlab_admin_session');
    window.location.href = 'login.html';
    return;
}
var adminEmailEl = document.getElementById('adminEmail');
if (adminEmailEl) adminEmailEl.textContent = session.email;

/* ===== STATE ===== */
var STRUCT_KEY = 'smartlab_site_structure';
var CONTENT_KEY = 'smartlab_content';
var REPORTS_KEY = 'smartlab_reports';
var SETTINGS_KEY = 'smartlab_settings';
var USERS_KEY = 'smartlab_users';
var DESIGNS_KEY = 'smartlab_page_designs';
var ZONES_KEY = 'smartlab_test_zones';

/* ===== DEFAULT CONTENT ===== */
var DEFAULT_CONTENT = {
    hero: {
        icon: '\uD83C\uDFE0', label: 'Hero Section', title: 'Hero Section',
        fields: [
            { key: 'hero_title', label: 'Main Title', type: 'text', 'default': 'Smart Laboratory Testing' },
            { key: 'hero_subtitle', label: 'Subtitle', type: 'text', 'default': 'Professional civil engineering lab services' },
            { key: 'hero_cta', label: 'CTA Button Text', type: 'text', 'default': 'Explore Tests' },
            { key: 'hero_bg', label: 'Background Image URL', type: 'text', 'default': '' }
        ]
    },
    about: {
        icon: '\u2139\uFE0F', label: 'About Section', title: 'About Section',
        fields: [
            { key: 'about_title', label: 'Section Title', type: 'text', 'default': 'About smartLAB' },
            { key: 'about_text', label: 'Description', type: 'textarea', 'default': 'We provide comprehensive civil engineering testing services.' },
            { key: 'about_image', label: 'Image URL', type: 'text', 'default': '' }
        ]
    },
    services: {
        icon: '\u2699\uFE0F', label: 'Services Section', title: 'Services Section',
        fields: [
            { key: 'services_title', label: 'Section Title', type: 'text', 'default': 'Our Services' },
            { key: 'services_text', label: 'Description', type: 'textarea', 'default': 'Full range of material testing services.' }
        ]
    },
    contact: {
        icon: '\uD83D\uDCDE', label: 'Contact Section', title: 'Contact Section',
        fields: [
            { key: 'contact_title', label: 'Section Title', type: 'text', 'default': 'Get In Touch' },
            { key: 'contact_email', label: 'Email', type: 'text', 'default': '' },
            { key: 'contact_phone', label: 'Phone', type: 'text', 'default': '' },
            { key: 'contact_address', label: 'Address', type: 'textarea', 'default': '' }
        ]
    },
    footer: {
        icon: '\uD83D\uDCCC', label: 'Footer', title: 'Footer',
        fields: [
            { key: 'footer_text', label: 'Footer Text', type: 'text', 'default': '\u00A9 2026 smartLAB. All rights reserved.' },
            { key: 'footer_links', label: 'Footer Links (JSON)', type: 'textarea', 'default': '[]' }
        ]
    },
    header: {
        icon: '\uD83D\uDCCB', label: 'Header / Nav', title: 'Header / Nav',
        fields: [
            { key: 'header_logo', label: 'Logo URL', type: 'text', 'default': '../assets/logo.png' },
            { key: 'header_cta', label: 'CTA Button Text', type: 'text', 'default': 'Contact Us' }
        ]
    }
};

/* ===== DEFAULT SETTINGS ===== */
var DEFAULT_SETTINGS = {
    siteName: 'smartLAB',
    siteNameAr: 'سمارت لاب',
    logo: '../assets/logo.png',
    favicon: '../favicon.ico',
    email: 'info@smartlab.com',
    phone_eg: '+20 100 000 0000',
    phone_ksa: '+966 50 000 0000',
    address: 'Cairo, Egypt',
    copyright: '© 2026 smartLAB. All rights reserved.'
};

/* ===== DEFAULT USERS ===== */
var DEFAULT_USERS = [
    { id: 'usr_admin', name: 'Admin', email: 'eng.ahmedabdoualyan@gmail.com', role: 'admin', lastLogin: Date.now(), avatar: '' }
];

/* ===== EMOJI & COLORS ===== */
var EMOJIS = [
    '\uD83E\uDDEA','\uD83D\uDD2C','\uD83D\uDCAA','\uD83D\uDD28','\u2696\uFE0F','\uD83C\uDF21\uFE0F',
    '\uD83D\uDCE1','\uD83E\uDDF1','\uD83C\uDFD7\uFE0F','\uD83D\uDCA8','\uD83D\uDCA7','\uD83D\uDCCA',
    '\uD83D\uDCC8','\uD83D\uDCCB','\uD83D\uDCC4','\uD83D\uDC65','\uD83D\uDD27','\uD83D\uDCC5',
    '\uD83D\uDD0D','\uD83D\uDEE1\uFE0F','\uD83D\uDEE3\uFE0F','\uD83D\uDCF1','\uD83C\uDFAF',
    '\u26A1','\uD83D\uDD25','\uD83C\uDF0A','\uD83D\uDCD0','\uD83C\uDBDC','\uD83E\uDDEC',
    '\uD83E\uDDEB','\uD83E\uDEA8','\u26CF\uFE0F','\u2699\uFE0F','\uD83D\uDE9B','\uD83D\uDCE6',
    '\u2705','\u274C','\u26A0\uFE0F','\uD83D\uDCA1','\uD83C\uDF93','\uD83D\uDCC9',
    '\uD83D\uDCC9','\uD83D\uDD04','\u23F1\uFE0F','\uD83C\uDFC6','\uD83C\uDFBD','\uD83D\uDCC2',
    '\uD83D\uDCDD','\uD83C\uDFAE','\uD83D\uDCBB','\uD83E\uDDED','\uD83D\uDCB0','\uD83D\uDCB3',
    '\uD83D\uDCB8','\uD83D\uDCB5','\uD83D\uDCB4','\uD83D\uDCB7','\uD83D\uDCB6','\uD83D\uDCB9',
    '\u2764\uFE0F','\uD83E\uDDE1','\uD83D\uDC94','\uD83D\uDC95','\uD83D\uDC9E','\uD83D\uDC9D',
    '\uD83D\uDC9C','\uD83D\uDC99','\uD83D\uDC9A','\uD83D\uDDA4','\uD83D\uDD34','\uD83D\uDFE1',
    '\uD83D\uDFE2','\uD83D\uDD35','\uD83D\uDFE3','\uD83D\uDFE0','\u26AA','\u26AB',
    '\u2B55','\uD83D\uDD18','\u2B50','\u2728','\uD83C\uDF1F','\uD83C\uDF08',
    '\uD83C\uDF0B','\uD83C\uDF05','\uD83C\uDF07','\uD83C\uDF06','\uD83C\uDF09'
];

var ICON_COLORS = [
    '#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef',
    '#ec4899','#f43f5e','#ef4444','#f97316','#f59e0b',
    '#eab308','#84cc16','#22c55e','#10b981','#14b8a6',
    '#06b6d4','#0ea5e9','#64748b','#78716c','#737373'
];

var COLOR_SWATCHES = [
    '#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899',
    '#ef4444','#f97316','#f59e0b','#eab308','#84cc16',
    '#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9',
    '#fb923c','#f87171','#fbbf24','#34d399','#60a5fa'
];

/* ===== STATE ===== */
var structure = null;
try { structure = JSON.parse(localStorage.getItem(STRUCT_KEY)); } catch(e){}
if (!structure || !structure.sections) {
    structure = JSON.parse(JSON.stringify(SITE_STRUCTURE));
}

var content = null;
try { content = JSON.parse(localStorage.getItem(CONTENT_KEY)); } catch(e){}
if (!content) {
    content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
}

var settings = null;
try { settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch(e){}
if (!settings) {
    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

var users = null;
try { users = JSON.parse(localStorage.getItem(USERS_KEY)); } catch(e){}
if (!users) {
    users = JSON.parse(JSON.stringify(DEFAULT_USERS));
}

var reports = null;
try { reports = JSON.parse(localStorage.getItem(REPORTS_KEY)); } catch(e){}
if (!reports) { reports = []; }

var pageDesigns = null;
try { pageDesigns = JSON.parse(localStorage.getItem(DESIGNS_KEY)); } catch(e){}
if (!pageDesigns) { pageDesigns = {}; }

var view = 'dashboard';
var sectionId = null;
var tab = 'tests';
var searchQ = '';
var contentTab = 'hero';

function saveStructure() { localStorage.setItem(STRUCT_KEY, JSON.stringify(structure)); }
function saveContent() { localStorage.setItem(CONTENT_KEY, JSON.stringify(content)); }
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
function saveUsers() { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function saveReports() { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); }
function saveDesigns() { localStorage.setItem(DESIGNS_KEY, JSON.stringify(pageDesigns)); }

var testZones = null;
try { testZones = JSON.parse(localStorage.getItem(ZONES_KEY)); } catch(e){}
if (!testZones) { testZones = {}; }

function saveTestZones() { localStorage.setItem(ZONES_KEY, JSON.stringify(testZones)); }

/* ===== UTILITIES ===== */
var mainContent = document.getElementById('mainContent');
function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}
var escapeHtml = esc;

function $(id) {
    return document.getElementById(id);
}

function formatDate(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var hour = d.getHours();
    var min = d.getMinutes();
    return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' ' + (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0' : '') + min;
}

function fileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0;
    var size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return size.toFixed(1) + ' ' + units[i];
}

function uid() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/* ===== TOAST ===== */
function toast(msg, type) {
    var c = $('toastContainer');
    var icons = { success: '\u2705', error: '\u274C', info: '\u2139\uFE0F', warning: '\u26A0\uFE0F' };
    var t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    t.innerHTML = (icons[type] || '\u2139\uFE0F') + ' ' + esc(msg);
    c.appendChild(t);
    setTimeout(function() {
        t.style.opacity = '0';
        t.style.transition = 'opacity 0.3s';
        setTimeout(function() { t.remove(); }, 300);
    }, 3000);
}
var showToast = toast;

/* ===== MODAL ===== */
function openModal(title, bodyHtml, onSave, wide) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = bodyHtml;
    $('modalFoot').innerHTML = '<button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="modalSaveBtn">Save</button>';
    var modal = $('modalOverlay');
    modal.classList.add('open');
    if (wide) {
        modal.querySelector('.modal').style.maxWidth = '720px';
    } else {
        modal.querySelector('.modal').style.maxWidth = '560px';
    }
    $('modalSaveBtn').onclick = onSave;
}

function closeModal() {
    $('modalOverlay').classList.remove('open');
}

/* ===== ICON PICKER ===== */
function buildIconPicker(selectedEmoji, selectedUrl) {
    var html = '<div class="emoji-picker" id="f-icon-picker">';
    EMOJIS.forEach(function(e) {
        var cls = 'emoji-opt';
        if (e === selectedEmoji && !selectedUrl) cls += ' selected';
        html += '<button type="button" class="' + cls + '" data-emoji="' + e + '" onclick="App.pickEmoji(this)">' + e + '</button>';
    });
    html += '<label class="icon-upload-btn" title="Upload custom icon">';
    html += '<input type="file" accept="image/*" onchange="App.uploadIcon(this)">';
    html += '+</label>';
    html += '</div>';
    html += '<div class="icon-preview-placeholder" id="f-icon-preview-area">';
    if (selectedUrl) {
        html += '<div class="icon-preview"><img src="' + esc(selectedUrl) + '" alt="icon"></div>';
        html += '<button type="button" class="btn btn-xs btn-ghost" onclick="App.removeIcon()">Remove</button>';
    }
    html += '</div>';
    html += '<input type="hidden" id="f-icon-emoji" value="' + esc(selectedEmoji || '') + '">';
    html += '<input type="hidden" id="f-icon-url" value="' + esc(selectedUrl || '') + '">';
    return html;
}

function pickEmoji(el) {
    var picker = $('f-icon-picker');
    if (!picker) return;
    picker.querySelectorAll('.emoji-opt').forEach(function(b) { b.classList.remove('selected'); });
    el.classList.add('selected');
    $('f-icon-emoji').value = el.getAttribute('data-emoji');
    $('f-icon-url').value = '';
    var area = $('f-icon-preview-area');
    if (area) {
        area.innerHTML = '<div class="icon-preview" style="border-color:var(--accent-emerald);">' + el.getAttribute('data-emoji') + '</div>';
    }
}

function uploadIcon(input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        var dataUrl = e.target.result;
        $('f-icon-url').value = dataUrl;
        $('f-icon-emoji').value = '';
        var picker = $('f-icon-picker');
        if (picker) {
            picker.querySelectorAll('.emoji-opt').forEach(function(b) { b.classList.remove('selected'); });
        }
        var area = $('f-icon-preview-area');
        if (area) {
            area.innerHTML = '<div class="icon-preview" style="border-color:var(--accent-emerald);"><img src="' + dataUrl + '" alt="icon"></div>' +
                '<button type="button" class="btn btn-xs btn-ghost" onclick="App.removeIcon()">Remove</button>';
        }
    };
    reader.readAsDataURL(input.files[0]);
}

function removeIcon() {
    $('f-icon-url').value = '';
    $('f-icon-emoji').value = '';
    var area = $('f-icon-preview-area');
    if (area) { area.innerHTML = ''; }
    var picker = $('f-icon-picker');
    if (picker) {
        picker.querySelectorAll('.emoji-opt').forEach(function(b) { b.classList.remove('selected'); });
    }
}

function getIconHtml(item, size) {
    var s = size || 36;
    if (item && item.iconUrl) {
        return '<img src="' + esc(item.iconUrl) + '" alt="icon" style="width:' + s + 'px;height:' + s + 'px;object-fit:cover;border-radius:6px;">';
    }
    return '<span style="font-size:' + Math.round(s * 0.6) + 'px;">' + (item ? (item.icon || '\uD83D\uDCC4') : '\uD83D\uDCC4') + '</span>';
}

function getSectionIconHtml(section, size) {
    var s = size || 48;
    if (section.iconUrl) {
        return '<img src="' + esc(section.iconUrl) + '" alt="icon" style="width:100%;height:100%;object-fit:cover;">';
    }
    return '<span style="font-size:' + Math.round(s * 0.5) + 'px;">' + (section.icon || '\uD83D\uDCC2') + '</span>';
}

/* ===== COLOR PICKER BUILDER ===== */
function buildColorPicker(selectedColor) {
    var current = selectedColor || '#3b82f6';
    var html = '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<input type="color" id="f-color" value="' + esc(current) + '" style="height:36px;width:48px;padding:2px;cursor:pointer;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-input);">';
    html += '<span id="f-color-label" style="font-size:12px;color:var(--text-muted);font-family:SF Mono,monospace;">' + esc(current) + '</span>';
    html += '</div>';
    html += '<div class="color-swatches" id="f-color-swatches">';
    COLOR_SWATCHES.forEach(function(c) {
        var sel = c === current ? ' selected' : '';
        html += '<div class="color-swatch' + sel + '" style="background:' + c + ';" data-color="' + c + '" onclick="App.pickColor(this)"></div>';
    });
    html += '</div>';
    return html;
}

function pickColor(el) {
    var c = el.getAttribute('data-color');
    $('f-color').value = c;
    $('f-color-label').textContent = c;
    $('f-color-swatches').querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('selected'); });
    el.classList.add('selected');
}

function bindColorSync() {
    var colorInput = $('f-color');
    if (colorInput) {
        colorInput.addEventListener('input', function() {
            var label = $('f-color-label');
            if (label) label.textContent = this.value;
            var swatches = $('f-color-swatches');
            if (swatches) {
                swatches.querySelectorAll('.color-swatch').forEach(function(s) {
                    s.classList.toggle('selected', s.getAttribute('data-color') === colorInput.value);
                });
            }
        });
    }
}

/* ===== NAVIGATION ===== */
function navigate(v, sid) {
    if (v && v.indexOf('section:') === 0) {
        view = 'section';
        sectionId = v.substring(8);
    } else {
        view = v || 'dashboard';
        sectionId = sid || null;
    }
    tab = 'tests';
    searchQ = '';
    renderSidebar();
    renderMain();
}

function setTab(t) {
    tab = t;
    renderSection();
}

function search(q) {
    searchQ = q;
    renderSection();
}

function setContentTab(t) {
    contentTab = t;
    renderContentManager();
}

/* ===== SIDEBAR ===== */
function navBtn(id, icon, label, active, badge) {
    var cls = 'nav-item';
    if (active) cls += ' active';
    var html = '<button class="' + cls + '" onclick="App.navigate(\'' + esc(id) + '\')">';
    html += '<span class="nav-icon">' + icon + '</span>';
    html += '<span class="nav-label">' + esc(label) + '</span>';
    if (badge !== undefined && badge !== null && badge !== '') {
        html += '<span class="nav-badge">' + badge + '</span>';
    }
    html += '</button>';
    return html;
}

function renderSidebar() {
    var nav = $('sidebarNav');
    var html = '';

    html += '<div class="nav-section">';
    html += '<div class="nav-section-title">Overview</div>';
    html += navBtn('dashboard', '\uD83D\uDCCA', 'Dashboard', view === 'dashboard');
    html += '</div>';

    html += '<div class="nav-section">';
    html += '<div class="nav-section-title">Lab Sections</div>';
    structure.sections.forEach(function(s) {
        var count = (s.tests || []).length + (s.designs || []).length + (s.clients || []).length;
        var isActive = (view === 'section' && sectionId === s.id);
        html += navBtn('section:' + s.id, s.icon, s.name, isActive, count);
    });
    html += '</div>';

    html += '<div class="nav-section">';
    html += '<div class="nav-section-title">Management</div>';
    html += navBtn('content', '\uD83D\uDCC4', 'Content', view === 'content');
    html += navBtn('zones', '\uD83D\uDCCF', 'Zone Manager', view === 'zones');
    html += navBtn('designer', '\uD83C\uDFA8', 'Page Designer', view === 'designer');
    html += navBtn('reports', '\uD83D\uDCCA', 'Reports', view === 'reports');
    html += navBtn('users', '\uD83D\uDC65', 'Users', view === 'users');
    html += navBtn('settings', '\u2699\uFE0F', 'Settings', view === 'settings');
    html += '</div>';

    html += '<div class="nav-section">';
    html += '<div class="nav-section-title">Actions</div>';
    html += '<button class="nav-item" onclick="App.addSection()"><span class="nav-icon">\u2795</span><span class="nav-label">Add Section</span></button>';
    html += '<button class="nav-item" onclick="App.resetData()"><span class="nav-icon">\uD83D\uDD04</span><span class="nav-label">Reset to Default</span></button>';
    html += '</div>';

    nav.innerHTML = html;
}

/* ===== MAIN RENDER ===== */
function renderMain() {
    switch (view) {
        case 'dashboard': renderDashboard(); break;
        case 'section': renderSection(); break;
        case 'content': renderContentManager(); break;
        case 'zones': renderZoneManager(); break;
        case 'designer': renderDesigner(); break;
        case 'reports': renderReports(); break;
        case 'users': renderUsers(); break;
        case 'settings': renderSettings(); break;
        default: renderDashboard(); break;
    }
}

/* ===== DASHBOARD ===== */
function statCard(icon, val, label) {
    return '<div class="stat-card">' +
        '<div class="stat-icon">' + icon + '</div>' +
        '<div class="stat-value">' + val + '</div>' +
        '<div class="stat-label">' + label + '</div>' +
        '</div>';
}

function renderDashboard() {
    var totalTests = 0, totalDesigns = 0, totalClients = 0;
    structure.sections.forEach(function(s) {
        totalTests += (s.tests || []).length;
        totalDesigns += (s.designs || []).length;
        totalClients += (s.clients || []).length;
    });
    var totalItems = totalTests + totalDesigns + totalClients;

    var html = '';
    html += '<div class="page-header">';
    html += '<h1>Admin <span>Dashboard</span></h1>';
    html += '<div class="header-actions">';
    html += '<button class="btn btn-primary" onclick="App.addSection()">\u2795 Add Section</button>';
    html += '</div></div>';

    html += '<div class="stats-row">';
    html += statCard('\uD83D\uDCC1', structure.sections.length, 'Sections');
    html += statCard('\uD83E\uDDEA', totalTests, 'Tests');
    html += statCard('\uD83D\uDCD0', totalDesigns, 'Designs');
    html += statCard('\uD83D\uDC65', totalClients, 'Client Pages');
    html += statCard('\uD83C\uDFAF', totalItems, 'Total Items');
    html += statCard('\uD83D\uDC64', users.length, 'Users');
    html += '</div>';

    html += '<h2 style="font-size:16px;margin-bottom:16px;">Quick Actions</h2>';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px;">';
    html += '<button class="btn btn-primary" onclick="App.navigate(\'content\')">\uD83D\uDCC4 Edit Content</button>';
    html += '<button class="btn btn-success" onclick="App.navigate(\'designer\')">\uD83C\uDFA8 Page Designer</button>';
    html += '<button class="btn btn-warning" onclick="App.navigate(\'reports\')">\uD83D\uDCCA Reports</button>';
    html += '<button class="btn btn-ghost" onclick="App.navigate(\'settings\')">\u2699\uFE0F Settings</button>';
    html += '</div>';

    html += '<h2 style="font-size:16px;margin-bottom:16px;">Site Sections</h2>';
    html += '<div class="sections-grid">';

    structure.sections.forEach(function(s) {
        var tc = (s.tests || []).length;
        var dc = (s.designs || []).length;
        var cc = (s.clients || []).length;

        html += '<div class="section-card">';
        html += '<div class="section-card-header">';
        html += '<div class="section-card-icon" style="background:' + (s.color || '#3b82f6') + '20;border:1px solid ' + (s.color || '#3b82f6') + '40;">';
        html += getSectionIconHtml(s, 48);
        html += '</div>';
        html += '<div class="section-card-info">';
        html += '<h3>' + esc(s.name) + '</h3>';
        html += '<p>' + esc(s.nameAr || '') + '</p>';
        html += '</div></div>';

        html += '<div class="section-card-stats">';
        html += '<span>\uD83E\uDDEA ' + tc + ' tests</span>';
        html += '<span>\uD83D\uDCD0 ' + dc + ' designs</span>';
        html += '<span>\uD83D\uDC65 ' + cc + ' clients</span>';
        html += '</div>';

        html += '<div class="section-card-actions">';
        html += '<button class="btn btn-primary btn-sm" onclick="App.navigate(\'section:' + s.id + '\')">View</button>';
        html += '<button class="btn btn-ghost btn-sm" onclick="App.editSection(\'' + s.id + '\')">Edit</button>';
        html += '<button class="btn btn-danger btn-sm" onclick="App.deleteSection(\'' + s.id + '\')">Delete</button>';
        html += '</div></div>';
    });

    html += '</div>';
    $('mainContent').innerHTML = html;
}

/* ===== SECTION VIEW ===== */
function renderSection() {
    var section = structure.sections.find(function(s) { return s.id === sectionId; });
    if (!section) {
        view = 'dashboard';
        renderMain();
        return;
    }

    var html = '';

    html += '<div class="breadcrumb">';
    html += '<a href="javascript:void(0)" onclick="App.navigate(\'dashboard\')">Dashboard</a>';
    html += '<span class="sep">/</span>';
    html += '<span>' + esc(section.name) + '</span>';
    html += '</div>';

    html += '<div class="page-header">';
    html += '<h1>' + getSectionIconHtml(section, 32) + ' ' + esc(section.name) + ' <span style="color:var(--text-muted);font-size:14px;font-weight:400;">' + esc(section.nameAr || '') + '</span></h1>';
    html += '<div class="header-actions">';
    html += '<button class="btn btn-ghost" onclick="App.navigate(\'dashboard\')">\u2190 Back</button>';
    html += '<button class="btn btn-ghost" onclick="App.editSection(\'' + section.id + '\')">\u270F\uFE0F Edit</button>';
    html += '<button class="btn btn-danger" onclick="App.deleteSection(\'' + section.id + '\')">\uD83D\uDDD1\uFE0F Delete</button>';
    html += '</div></div>';

    html += '<div class="search-box" style="margin-bottom:20px;max-width:360px;">';
    html += '<span class="search-icon">\uD83D\uDD0D</span>';
    html += '<input type="text" placeholder="Search tests, designs, clients..." value="' + esc(searchQ) + '" oninput="App.search(this.value)">';
    html += '</div>';

    html += '<div class="tab-bar">';
    var tabs = ['tests', 'designs', 'clients'];
    tabs.forEach(function(t) {
        var count = (section[t] || []).length;
        var active = tab === t ? ' active' : '';
        html += '<button class="tab-btn' + active + '" onclick="App.setTab(\'' + t + '\')">';
        html += t.charAt(0).toUpperCase() + t.slice(1);
        html += ' <span style="opacity:0.5">(' + count + ')</span>';
        html += '</button>';
    });
    html += '</div>';

    tabs.forEach(function(t) {
        var items = filterItems(section[t] || []);
        var active = tab === t ? ' active' : '';
        html += '<div class="tab-panel' + active + '" id="tab-' + t + '">';
        html += '<div class="content-panel">';

        html += '<div class="panel-header">';
        html += '<h2>' + t.charAt(0).toUpperCase() + t.slice(1) + ' <span class="count">' + items.length + '</span></h2>';
        html += '<button class="btn btn-primary btn-sm" onclick="App.addItem(\'' + section.id + '\',\'' + t + '\')">+ Add ' + t.slice(0, -1) + '</button>';
        html += '</div>';

        if (items.length === 0) {
            html += '<div class="empty-state">';
            html += '<div class="empty-icon">\uD83D\uDCE9</div>';
            html += '<h3>No ' + t + ' yet</h3>';
            html += '<p>Click the add button to create your first item.</p>';
            html += '</div>';
        } else {
            html += '<ul class="item-list" id="list-' + t + '">';
            items.forEach(function(item, idx) {
                html += renderItemRow(section.id, t, item, idx);
            });
            html += '</ul>';
        }

        html += '</div></div>';
    });

    $('mainContent').innerHTML = html;
    initDragDrop();
}

/* ===== ITEMS ===== */
function renderItems(sec, tabName) {
    var section = structure.sections.find(function(s) { return s.id === sec; });
    if (!section) return '';
    var items = filterItems(section[tabName] || []);
    var html = '';

    html += '<div class="content-panel">';
    html += '<div class="panel-header">';
    html += '<h2>' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + ' <span class="count">' + items.length + '</span></h2>';
    html += '<button class="btn btn-primary btn-sm" onclick="App.addItem(\'' + sec + '\',\'' + tabName + '\')">+ Add ' + tabName.slice(0, -1) + '</button>';
    html += '</div>';

    if (items.length === 0) {
        html += '<div class="empty-state">';
        html += '<div class="empty-icon">\uD83D\uDCE9</div>';
        html += '<h3>No ' + tabName + ' yet</h3>';
        html += '<p>Click the add button to create your first item.</p>';
        html += '</div>';
    } else {
        html += '<ul class="item-list" id="list-' + tabName + '">';
        items.forEach(function(item, idx) {
            html += renderItemRow(sec, tabName, item, idx);
        });
        html += '</ul>';
    }

    html += '</div>';
    return html;
}

function renderItemRow(secId, tabName, item, idx) {
    var html = '<li class="item-row" draggable="true" data-id="' + esc(item.id) + '" data-tab="' + esc(tabName) + '" data-sec="' + esc(secId) + '">';

    html += '<span class="drag-handle">\u2801\u2801</span>';

    html += '<div class="item-icon">';
    if (item.iconUrl) {
        html += '<img src="' + esc(item.iconUrl) + '" alt="icon">';
    } else {
        html += '<span style="font-size:20px;">' + (item.icon || '\uD83D\uDCC4') + '</span>';
    }
    html += '</div>';

    html += '<div class="item-info">';
    html += '<h4>' + esc(item.name || 'Untitled') + '</h4>';
    var sub = item.nameAr || item.standard || '';
    if (sub) {
        html += '<p>' + esc(sub) + '</p>';
    }
    if (item.description) {
        var shortDesc = item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description;
        html += '<p style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + esc(shortDesc) + '</p>';
    }
    html += '</div>';

    if (item.path) {
        html += '<span class="item-path" title="' + esc(item.path) + '">' + esc(item.path) + '</span>';
    }

    if (item.status) {
        html += '<span class="item-status status-' + esc(item.status) + '">' + esc(item.status) + '</span>';
    }

    html += '<div class="item-actions">';
    html += '<button class="btn-icon-only" onclick="App.editItem(\'' + esc(secId) + '\',\'' + esc(tabName) + '\',\'' + esc(item.id) + '\')" title="Edit Info">\u270F\uFE0F</button>';
    if (tabName === 'tests') {
        html += '<button class="btn-icon-only" onclick="App.openHtmlEditor(\'' + esc(secId) + '\',\'' + esc(tabName) + '\',\'' + esc(item.id) + '\')" title="Edit HTML" style="color:#3b82f6;">\uD83D\uDCDD</button>';
    }
    html += '<button class="btn-icon-only" onclick="App.duplicateItem(\'' + esc(secId) + '\',\'' + esc(tabName) + '\',\'' + esc(item.id) + '\')" title="Duplicate">\uD83D\uDCCB</button>';
    html += '<button class="btn-icon-only danger" onclick="App.deleteItem(\'' + esc(secId) + '\',\'' + esc(tabName) + '\',\'' + esc(item.id) + '\')" title="Delete">\uD83D\uDDD1\uFE0F</button>';
    html += '</div>';

    html += '</li>';
    return html;
}

function filterItems(items) {
    if (!searchQ) return items;
    var q = searchQ.toLowerCase();
    return items.filter(function(i) {
        return (i.name || '').toLowerCase().indexOf(q) > -1 ||
            (i.nameAr || '').toLowerCase().indexOf(q) > -1 ||
            (i.path || '').toLowerCase().indexOf(q) > -1 ||
            (i.standard || '').toLowerCase().indexOf(q) > -1;
    });
}

/* ===== ADD ITEM ===== */
function addItem(secId, tabName) {
    var item = {
        id: uid(),
        name: '',
        nameAr: '',
        icon: '\uD83D\uDCC4',
        iconUrl: '',
        path: '',
        standard: '',
        status: 'active'
    };

    var formHtml = buildItemForm(item, tabName);

    openModal('Add ' + tabName.slice(0, -1), formHtml, function() {
        var data = collectItemData(item.id, tabName);
        if (!data.name) return toast('Name is required', 'error');

        var section = structure.sections.find(function(s) { return s.id === secId; });
        if (!section) return;
        if (!section[tabName]) section[tabName] = [];

        section[tabName].push(data);
        saveStructure();
        closeModal();
        renderSection();
        toast('"' + data.name + '" added!', 'success');
    });
}

/* ===== EDIT ITEM ===== */
function editItem(secId, tabName, itemId) {
    var section = structure.sections.find(function(s) { return s.id === secId; });
    if (!section) return;
    var item = (section[tabName] || []).find(function(i) { return i.id === itemId; });
    if (!item) return;

    var formHtml = buildItemForm(item, tabName);

    openModal('Edit ' + (item.name || 'Item'), formHtml, function() {
        var data = collectItemData(item.id, tabName);
        if (!data.name) return toast('Name is required', 'error');

        Object.assign(item, data);
        saveStructure();
        closeModal();
        renderSection();
        toast('Item updated!', 'success');
    });
}

function buildItemForm(item, tabName) {
    var html = '';
    html += '<div class="modal-field">';
    html += '<label>Name</label>';
    html += '<input type="text" id="f-name" value="' + esc(item.name || '') + '" placeholder="e.g. Compressive Strength">';
    html += '</div>';

    html += '<div class="modal-field">';
    html += '<label>Arabic Name</label>';
    html += '<input type="text" id="f-nameAr" value="' + esc(item.nameAr || '') + '" placeholder="\u0627\u0644\u0642\u0648\u0649 \u0627\u0644\u0627\u0646\u0636\u063A\u0637\u064A\u0629">';
    html += '</div>';

    html += '<div class="modal-field">';
    html += '<label>Icon</label>';
    html += buildIconPicker(item.icon || '\uD83D\uDCC4', item.iconUrl || '');
    html += '</div>';

    html += '<div class="modal-field">';
    html += '<label>Path</label>';
    html += '<input type="text" id="f-path" value="' + esc(item.path || '') + '" placeholder="/section/tests/test-name.html">';
    html += '<div class="field-hint">Full path from site root</div>';
    html += '</div>';

    if (tabName === 'tests') {
        html += '<div class="modal-field">';
        html += '<label>Standard</label>';
        html += '<input type="text" id="f-standard" value="' + esc(item.standard || '') + '" placeholder="ASTM C39">';
        html += '</div>';

        html += '<div class="modal-field">';
        html += '<label>Status</label>';
        html += '<select id="f-status">';
        html += '<option value="active"' + (item.status === 'active' ? ' selected' : '') + '>Active</option>';
        html += '<option value="inactive"' + (item.status === 'inactive' ? ' selected' : '') + '>Inactive</option>';
        html += '</select>';
        html += '</div>';

        html += '<div class="modal-field">';
        html += '<label>Description (English)</label>';
        html += '<textarea id="f-description" rows="3" style="width:100%;padding:8px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:13px;resize:vertical;" placeholder="Describe what this test measures, procedure, standards...">' + esc(item.description || '') + '</textarea>';
        html += '</div>';

        html += '<div class="modal-field">';
        html += '<label>Description (Arabic)</label>';
        html += '<textarea id="f-descriptionAr" rows="3" style="width:100%;padding:8px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:13px;resize:vertical;" placeholder="\u0635\u0641 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631...">' + esc(item.descriptionAr || '') + '</textarea>';
        html += '</div>';
    }

    return html;
}

function collectItemData(itemId, tabName) {
    var data = {};
    data.id = itemId;

    var nameEl = $('f-name');
    var nameArEl = $('f-nameAr');
    var iconEmojiEl = $('f-icon-emoji');
    var iconUrlEl = $('f-icon-url');
    var pathEl = $('f-path');

    if (nameEl) data.name = nameEl.value.trim();
    if (nameArEl) data.nameAr = nameArEl.value.trim();
    if (iconUrlEl && iconUrlEl.value) {
        data.iconUrl = iconUrlEl.value;
        data.icon = '';
    } else if (iconEmojiEl && iconEmojiEl.value) {
        data.icon = iconEmojiEl.value;
        data.iconUrl = '';
    } else {
        data.icon = '\uD83D\uDCC4';
        data.iconUrl = '';
    }
    if (pathEl) data.path = pathEl.value.trim();

    if (tabName === 'tests') {
        var stdEl = $('f-standard');
        var statusEl = $('f-status');
        var descEl = $('f-description');
        var descArEl = $('f-descriptionAr');
        if (stdEl) data.standard = stdEl.value.trim();
        if (statusEl) data.status = statusEl.value;
        if (descEl) data.description = descEl.value.trim();
        if (descArEl) data.descriptionAr = descArEl.value.trim();
    }

    return data;
}

/* ===== DELETE ITEM ===== */
function deleteItem(secId, tabName, itemId) {
    var section = structure.sections.find(function(s) { return s.id === secId; });
    if (!section) return;
    var item = (section[tabName] || []).find(function(i) { return i.id === itemId; });
    if (!item) return;

    if (!confirm('Delete "' + (item.name || 'this item') + '"?')) return;

    section[tabName] = (section[tabName] || []).filter(function(i) { return i.id !== itemId; });
    saveStructure();
    renderSection();
    toast('Item deleted', 'info');
}

/* ===== DUPLICATE ITEM ===== */
function duplicateItem(secId, tabName, itemId) {
    var section = structure.sections.find(function(s) { return s.id === secId; });
    if (!section) return;
    var item = (section[tabName] || []).find(function(i) { return i.id === itemId; });
    if (!item) return;

    var copy = deepClone(item);
    copy.id = uid();
    copy.name = (item.name || 'Item') + ' (Copy)';
    section[tabName].push(copy);
    saveStructure();
    renderSection();
    toast('Item duplicated!', 'success');
}

/* ===== ADD / EDIT / DELETE SECTION ===== */
function addSection() {
    var id = 'sec_' + Date.now().toString(36);
    var newSection = {
        id: id,
        name: '',
        nameAr: '',
        icon: '\uD83D\uDCC1',
        iconUrl: '',
        color: '#3b82f6',
        path: '/',
        tests: [],
        designs: [],
        clients: []
    };

    var formHtml = buildSectionForm(newSection, true);

    openModal('Add New Section', formHtml, function() {
        var data = collectSectionData(newSection);
        if (!data.name) return toast('Section name is required', 'error');

        data.tests = [];
        data.designs = [];
        data.clients = [];
        structure.sections.push(data);
        saveStructure();
        closeModal();
        navigate('section:' + data.id);
        toast('Section "' + data.name + '" created!', 'success');
    });
}

function editSection(secId) {
    var s = structure.sections.find(function(x) { return x.id === secId; });
    if (!s) return;

    var formHtml = buildSectionForm(s, false);

    openModal('Edit Section', formHtml, function() {
        var data = collectSectionData(s);
        if (!data.name) return toast('Section name is required', 'error');

        s.name = data.name;
        s.nameAr = data.nameAr;
        s.icon = data.icon;
        s.iconUrl = data.iconUrl;
        s.color = data.color;
        saveStructure();
        closeModal();
        renderSidebar();
        renderMain();
        toast('Section updated!', 'success');
    });
}

function deleteSection(secId) {
    var s = structure.sections.find(function(x) { return x.id === secId; });
    if (!s) return;
    if (!confirm('Delete section "' + s.name + '" and ALL its items?')) return;

    structure.sections = structure.sections.filter(function(x) { return x.id !== secId; });
    saveStructure();
    navigate('dashboard');
    toast('Section deleted', 'info');
}

function buildSectionForm(s, isNew) {
    var html = '';

    html += '<div class="modal-field">';
    html += '<label>Section Name</label>';
    html += '<input type="text" id="f-name" value="' + esc(s.name || '') + '" placeholder="e.g. Concrete Testing">';
    html += '</div>';

    html += '<div class="modal-field">';
    html += '<label>Arabic Name</label>';
    html += '<input type="text" id="f-nameAr" value="' + esc(s.nameAr || '') + '" placeholder="\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0631\u0633\u0627\u0646\u0629">';
    html += '</div>';

    html += '<div class="modal-field">';
    html += '<label>Color</label>';
    html += buildColorPicker(s.color || '#3b82f6');
    html += '</div>';

    html += '<div class="modal-field">';
    html += '<label>Icon</label>';
    html += buildIconPicker(s.icon || '\uD83D\uDCC1', s.iconUrl || '');
    html += '</div>';

    return html;
}

function collectSectionData(s) {
    var data = {};
    data.id = s.id;

    var nameEl = $('f-name');
    var nameArEl = $('f-nameAr');
    var colorEl = $('f-color');
    var iconEmojiEl = $('f-icon-emoji');
    var iconUrlEl = $('f-icon-url');

    if (nameEl) data.name = nameEl.value.trim();
    if (nameArEl) data.nameAr = nameArEl.value.trim();
    if (colorEl) data.color = colorEl.value;
    if (iconUrlEl && iconUrlEl.value) {
        data.iconUrl = iconUrlEl.value;
        data.icon = '';
    } else if (iconEmojiEl && iconEmojiEl.value) {
        data.icon = iconEmojiEl.value;
        data.iconUrl = '';
    } else {
        data.icon = '\uD83D\uDCC1';
        data.iconUrl = '';
    }

    return data;
}

/* ===== DRAG & DROP ===== */
function initDragDrop() {
    var lists = document.querySelectorAll('.item-list');
    lists.forEach(function(list) {
        var dragItem = null;
        var rows = list.querySelectorAll('.item-row');

        rows.forEach(function(row) {
            row.addEventListener('dragstart', function(e) {
                dragItem = this;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', this.dataset.id);
            });

            row.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                dragItem = null;
            });

            row.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            row.addEventListener('drop', function(e) {
                e.preventDefault();
                if (!dragItem || dragItem === this) return;

                var dropTab = this.dataset.tab;
                var dropSec = this.dataset.sec;
                var section = structure.sections.find(function(s) { return s.id === dropSec; });
                if (!section) return;

                var items = section[dropTab];
                if (!items) return;

                var fromIdx = -1;
                var toIdx = -1;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id === dragItem.dataset.id) fromIdx = i;
                    if (items[i].id === this.dataset.id) toIdx = i;
                }

                if (fromIdx < 0 || toIdx < 0) return;

                var moved = items.splice(fromIdx, 1)[0];
                items.splice(toIdx, 0, moved);
                saveStructure();
                renderSection();
                toast('Items reordered', 'success');
            });
        });
    });
}

/* ===== RESET ===== */
function resetData() {
    if (!confirm('Reset all site structure to default? This cannot be undone.')) return;
    structure = deepClone(SITE_STRUCTURE);
    saveStructure();
    navigate('dashboard');
    toast('Data reset to defaults', 'info');
}


/* ===== ZONE MANAGER ===== */
var ZONE_TYPES_DEF = {
    video: { icon: '\uD83C\uDFAC', label: 'Video', labelAr: '\u0641\u064A\u062F\u064A\u0648' },
    pdf: { icon: '\uD83D\uDCC4', label: 'PDF Document', labelAr: '\u0645\u0644\u0641 PDF' },
    presentation: { icon: '\uD83D\uDCCA', label: 'Presentation', labelAr: '\u0639\u0631\u0636 \u062A\u0642\u062F\u064A\u0645\u064A' },
    text: { icon: '\uD83D\uDCDD', label: 'Text / Explanation', labelAr: '\u0646\u0635 / \u0634\u0631\u062D' },
    hardware: { icon: '\uD83D\uDD27', label: 'Hardware Info', labelAr: '\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u062A\u0627\u062F' },
    firmware: { icon: '\uD83D\uDCBE', label: 'Firmware Upload', labelAr: '\u0631\u0641\u0639 \u0627\u0644\u0641\u064A\u0631\u0645\u0648\u064A\u0631' },
    image: { icon: '\uD83D\uDDBC\uFE0F', label: 'Image', labelAr: '\u0635\u0648\u0631\u0629' },
    button: { icon: '\uD83D\uDD18', label: 'Button / Link', labelAr: '\u0632\u0631 / \u0631\u0627\u0628\u0637' },
    custom: { icon: '\u2699\uFE0F', label: 'Custom HTML', labelAr: 'HTML \u0645\u062E\u0635\u0635' }
};

var ZONE_POSITIONS_DEF = {
    'full': '\u2B1C Full Width',
    'top': '\u2B06 Top',
    'bottom': '\u2B07 Bottom',
    'left': '\u2B05 Left',
    'right': '\u27A1 Right',
    'center': '\u23F8 Center',
    'top-left': '\u2196 Top Left',
    'top-center': '\u2B06 Top Center',
    'top-right': '\u2197 Top Right',
    'bottom-left': '\u2199 Bottom Left',
    'bottom-center': '\u2B07 Bottom Center',
    'bottom-right': '\u2198 Bottom Right'
};

var ZONE_LAYOUTS = {
    '1-col': '1 Column',
    '2-col-equal': '2 Columns Equal',
    '2-col-1-2': '2 Columns (1:2)',
    '2-col-2-1': '2 Columns (2:1)',
    '3-col': '3 Columns',
    '2-row': '2 Rows'
};

var zonesSelectedTest = null;
var zonesSelectedSection = null;

function getAllTestPages() {
    var pages = [];
    structure.sections.forEach(function(sec) {
        (sec.tests || []).forEach(function(test) {
            pages.push({ section: sec, test: test });
        });
    });
    return pages;
}

function renderZoneManager() {
    var allPages = getAllTestPages();

    var html = '';
    html += '<div class="page-header">';
    html += '<h1>\uD83D\uDCCF Zone <span>Manager</span></h1>';
    html += '<p style="color:var(--text-secondary);margin-top:4px;font-size:13px;">Configure test page zones: video, PDF, presentation, text, hardware, firmware, custom areas</p>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:320px 1fr;gap:20px;margin-top:20px;">';

    /* LEFT: test page list */
    html += '<div class="zone-pages-list" style="background:var(--card-bg);border:1px solid var(--border-glass);border-radius:12px;overflow:hidden;">';
    html += '<div style="padding:14px 18px;border-bottom:1px solid var(--border-glass);font-weight:600;font-size:14px;color:var(--text-primary);">Test Pages <span style="color:var(--text-muted);font-weight:400;">(' + allPages.length + ')</span></div>';
    html += '<div style="max-height:calc(100vh - 240px);overflow-y:auto;">';

    structure.sections.forEach(function(sec) {
        var secTests = (sec.tests || []);
        if (secTests.length === 0) return;
        html += '<div style="padding:10px 18px 4px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">' + sec.icon + ' ' + esc(sec.name) + '</div>';
        secTests.forEach(function(test) {
            var testId = test.id;
            var zoneCount = (testZones[testId] && testZones[testId].zones) ? testZones[testId].zones.length : 0;
            var isActive = (zonesSelectedTest === testId);
            html += '<button class="zone-page-btn' + (isActive ? ' active' : '') + '" onclick="App.selectZoneTest(\'' + esc(sec.id) + '\',\'' + esc(testId) + '\')" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 18px;border:none;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;text-align:left;border-left:3px solid transparent;transition:all 0.2s;">';
            html += '<span style="font-size:18px;">' + test.icon + '</span>';
            html += '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(test.name) + '</span>';
            if (zoneCount > 0) {
                html += '<span style="background:rgba(59,130,246,0.2);color:#3b82f6;font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;">' + zoneCount + '</span>';
            }
            html += '</button>';
        });
    });

    html += '</div></div>';

    /* RIGHT: zone editor */
    html += '<div class="zone-editor-area" style="background:var(--card-bg);border:1px solid var(--border-glass);border-radius:12px;overflow:hidden;">';

    if (zonesSelectedTest) {
        html += renderZoneEditorForTest(zonesSelectedTest);
    } else {
        html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:400px;color:var(--text-muted);">';
        html += '<div style="font-size:48px;margin-bottom:16px;opacity:0.4;">\uD83D\uDCCF</div>';
        html += '<div style="font-size:15px;font-weight:600;margin-bottom:6px;">Select a Test Page</div>';
        html += '<div style="font-size:13px;">Choose a test page from the list to manage its zones</div>';
        html += '</div>';
    }

    html += '</div>';
    html += '</div>';

    $('mainContent').innerHTML = html;

    /* Style active page button */
    document.querySelectorAll('.zone-page-btn').forEach(function(btn) {
        btn.addEventListener('mouseenter', function() { if (!btn.classList.contains('active')) btn.style.background = 'rgba(255,255,255,0.03)'; });
        btn.addEventListener('mouseleave', function() { if (!btn.classList.contains('active')) btn.style.background = 'transparent'; });
    });
}

function renderZoneEditorForTest(testId) {
    var config = testZones[testId] || { layout: '1-col', zones: [], showHeader: true, showFooter: true };

    var html = '';

    /* Header */
    html += '<div style="padding:16px 20px;border-bottom:1px solid var(--border-glass);display:flex;align-items:center;justify-content:space-between;">';
    html += '<div>';
    html += '<div style="font-weight:600;font-size:15px;color:var(--text-primary);">Zone Configuration</div>';
    html += '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Page: <code style="background:rgba(59,130,246,0.15);padding:2px 6px;border-radius:4px;color:#3b82f6;">' + esc(testId) + '</code></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;">';
    html += '<button class="btn btn-ghost" onclick="App.resetTestZones(\'' + esc(testId) + '\')" style="font-size:12px;">\uD83D\uDD04 Reset</button>';
    html += '<button class="btn btn-primary" onclick="App.addZoneToTest(\'' + esc(testId) + '\')" style="font-size:12px;">\u2795 Add Zone</button>';
    html += '</div>';
    html += '</div>';

    /* Settings row */
    html += '<div style="padding:14px 20px;border-bottom:1px solid var(--border-glass);display:flex;align-items:center;gap:16px;flex-wrap:wrap;">';
    html += '<label style="font-size:12px;color:var(--text-muted);font-weight:600;">Layout:</label>';
    html += '<select onchange="App.setZoneLayout(\'' + esc(testId) + '\',this.value)" style="padding:6px 12px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:12px;">';
    Object.keys(ZONE_LAYOUTS).forEach(function(key) {
        html += '<option value="' + key + '"' + (config.layout === key ? ' selected' : '') + '>' + ZONE_LAYOUTS[key] + '</option>';
    });
    html += '</select>';

    html += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);cursor:pointer;">';
    html += '<input type="checkbox"' + (config.showHeader !== false ? ' checked' : '') + ' onchange="App.toggleZoneHeader(\'' + esc(testId) + '\',this.checked)"> Show Header';
    html += '</label>';

    html += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);cursor:pointer;">';
    html += '<input type="checkbox"' + (config.showFooter !== false ? ' checked' : '') + ' onchange="App.toggleZoneFooter(\'' + esc(testId) + '\',this.checked)"> Show Footer';
    html += '</label>';
    html += '</div>';

    /* Zones list */
    html += '<div style="padding:16px 20px;">';
    var zones = config.zones || [];
    if (zones.length === 0) {
        html += '<div style="text-align:center;padding:40px 20px;color:var(--text-muted);">';
        html += '<div style="font-size:36px;margin-bottom:12px;opacity:0.4;">\uD83D\uDCE6</div>';
        html += '<div style="font-size:14px;font-weight:600;margin-bottom:6px;">No Zones Configured</div>';
        html += '<div style="font-size:12px;">Click "Add Zone" to create video, PDF, text, hardware, firmware, or custom zones</div>';
        html += '</div>';
    } else {
        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        zones.forEach(function(zone, idx) {
            var typeDef = ZONE_TYPES_DEF[zone.type] || ZONE_TYPES_DEF.custom;
            var posLabel = zone.position && zone.position !== 'full' ? ' \u00B7 ' + (ZONE_POSITIONS_DEF[zone.position] || zone.position) : '';
            html += '<div class="zone-config-item" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(30,41,59,0.4);border:1px solid var(--border-glass);border-radius:8px;">';

            html += '<span style="font-size:8px;color:var(--text-muted);cursor:grab;user-select:none;">\u2801\u2801</span>';
            html += '<span style="font-size:22px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,0.1);border-radius:8px;">' + typeDef.icon + '</span>';
            html += '<div style="flex:1;min-width:0;">';
            html += '<div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + esc(zone.title || typeDef.label) + '</div>';
            html += '<div style="font-size:11px;color:var(--text-muted);">' + typeDef.label + ' &middot; ' + (zone.width || '100%') + posLabel + '</div>';
            html += '</div>';

            html += '<button onclick="App.moveZone(\'' + esc(testId) + '\',' + idx + ',-1)" title="Move Up" style="width:28px;height:28px;border:none;background:rgba(255,255,255,0.05);border-radius:6px;color:var(--text-muted);cursor:pointer;font-size:12px;">\u2B06</button>';
            html += '<button onclick="App.moveZone(\'' + esc(testId) + '\',' + idx + ',1)" title="Move Down" style="width:28px;height:28px;border:none;background:rgba(255,255,255,0.05);border-radius:6px;color:var(--text-muted);cursor:pointer;font-size:12px;">\u2B07</button>';
            html += '<button onclick="App.editZone(\'' + esc(testId) + '\',' + idx + ')" title="Edit" style="width:28px;height:28px;border:none;background:rgba(59,130,246,0.15);border-radius:6px;color:#3b82f6;cursor:pointer;font-size:12px;">\u270F</button>';
            html += '<button onclick="App.deleteZone(\'' + esc(testId) + '\',' + idx + ')" title="Delete" style="width:28px;height:28px;border:none;background:rgba(239,68,68,0.1);border-radius:6px;color:#ef4444;cursor:pointer;font-size:12px;">\u2716</button>';

            html += '</div>';
        });
        html += '</div>';
    }
    html += '</div>';

    return html;
}

function selectZoneTest(secId, testId) {
    zonesSelectedTest = testId;
    zonesSelectedSection = secId;
    renderZoneManager();
}

function addZoneToTest(testId) {
    if (!testZones[testId]) {
        testZones[testId] = { layout: '1-col', zones: [], showHeader: true, showFooter: true };
    }

    var typesHtml = '';
    Object.keys(ZONE_TYPES_DEF).forEach(function(key) {
        var t = ZONE_TYPES_DEF[key];
        typesHtml += '<option value="' + key + '">' + t.icon + ' ' + t.label + '</option>';
    });

    var layoutHtml = '';
    Object.keys(ZONE_LAYOUTS).forEach(function(key) {
        layoutHtml += '<option value="' + key + '">' + ZONE_LAYOUTS[key] + '</option>';
    });

    var posHtml = '';
    Object.keys(ZONE_POSITIONS_DEF).forEach(function(key) {
        posHtml += '<option value="' + key + '">' + ZONE_POSITIONS_DEF[key] + '</option>';
    });

    var body = '';
    body += '<div style="display:flex;flex-direction:column;gap:14px;">';
    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Zone Type</label>';
    body += '<select id="zone-type" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;">' + typesHtml + '</select></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Title (English)</label>';
    body += '<input id="zone-title" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;" placeholder="Zone title..."></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Title (Arabic)</label>';
    body += '<input id="zone-titleAr" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;" placeholder="\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0637\u0642\u0629..."></div>';

    body += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">';
    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Width</label>';
    body += '<select id="zone-width" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;"><option value="100%">Full Width</option><option value="75%">75%</option><option value="50%">50%</option><option value="33%">33%</option></select></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Position</label>';
    body += '<select id="zone-position" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;">' + posHtml + '</select></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Layout</label>';
    body += '<select id="zone-layout" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;">' + layoutHtml + '</select></div>';
    body += '</div>';

    body += '<div id="zone-type-fields"></div>';
    body += '</div>';

    openModal('Add Zone', body, function() {
        var type = $('zone-type').value;
        var zone = {
            id: 'z' + Date.now(),
            type: type,
            title: $('zone-title').value || ZONE_TYPES_DEF[type].label,
            titleAr: $('zone-titleAr').value || ZONE_TYPES_DEF[type].labelAr,
            width: $('zone-width').value,
            position: $('zone-position').value || 'full',
            height: 'auto'
        };

        var contentEl = document.getElementById('zone-content');
        if (contentEl) zone.content = contentEl.value;
        var videoEl = document.getElementById('zone-videoSrc');
        if (videoEl) zone.videoSrc = videoEl.value;
        var pdfEl = document.getElementById('zone-pdfSrc');
        if (pdfEl) zone.pdfSrc = pdfEl.value;
        var imgEl = document.getElementById('zone-imageSrc');
        if (imgEl) zone.imageSrc = imgEl.value;
        var hwEl = document.getElementById('zone-hardware');
        if (hwEl) {
            zone.hardware = hwEl.value.split('\n').filter(function(l) { return l.trim(); }).map(function(line) {
                var p = line.split('|');
                return { icon: (p[0] || '\uD83D\uDD27').trim(), name: (p[1] || '').trim(), detail: (p[2] || '').trim(), status: (p[3] || 'offline').trim() };
            });
        }
        var btnEl = document.getElementById('zone-buttons');
        if (btnEl && btnEl.value.trim()) {
            zone.buttons = btnEl.value.split('\n').filter(function(l) { return l.trim(); }).map(function(line) {
                var p = line.split('|');
                return { label: (p[0] || 'Button').trim(), url: (p[1] || '#').trim(), color: (p[2] || '#3b82f6').trim(), icon: (p[3] || '').trim(), target: (p[4] || '_self').trim() };
            });
        }

        testZones[testId].zones.push(zone);
        saveTestZones();
        toast('Zone added', 'success');
        closeModal();
        renderZoneManager();
    }, true);

    /* Update type-specific fields */
    setTimeout(function() {
        var typeSelect = $('zone-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', function() { updateZoneTypeFields(this.value); });
            updateZoneTypeFields(typeSelect.value);
        }
    }, 50);
}

function updateZoneTypeFields(type) {
    var container = $('zone-type-fields');
    if (!container) return;
    var html = '';
    if (type === 'text' || type === 'custom') {
        html = '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Content (HTML)</label>';
        html += '<textarea id="zone-content" rows="5" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;resize:vertical;" placeholder="Enter HTML content..."></textarea></div>';
    } else if (type === 'video') {
        html = '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Video URL</label>';
        html += '<input id="zone-videoSrc" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;" placeholder="https://..."></div>';
    } else if (type === 'pdf') {
        html = '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">PDF URL</label>';
        html += '<input id="zone-pdfSrc" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;" placeholder="https://..."></div>';
    } else if (type === 'image') {
        html = '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Image URL</label>';
        html += '<input id="zone-imageSrc" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;" placeholder="https://... or upload path"></div>';
    } else if (type === 'button') {
        html = '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Buttons (one per line: label|url|color|icon|target)</label>';
        html += '<textarea id="zone-buttons" rows="4" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;resize:vertical;" placeholder="Download PDF|https://example.com/file.pdf|#3b82f6|📄|_blank\nWatch Video|https://youtube.com/...|#ef4444|🎬|_blank"></textarea>';
        html += '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Format: label|url|color|icon|target (_blank or _self)</div></div>';
    } else if (type === 'hardware') {
        html = '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Hardware Items (one per line: icon|name|detail|status)</label>';
        html += '<textarea id="zone-hardware" rows="4" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;resize:vertical;" placeholder="\uD83C\uDFD7\uFE0F|Compression Machine|2000 kN|online\n\uD83D\uDCCF|Vernier Caliper|0.01mm|online"></textarea></div>';
    }
    container.innerHTML = html;
}

function editZone(testId, zoneIdx) {
    var config = testZones[testId];
    if (!config || !config.zones[zoneIdx]) return;
    var zone = config.zones[zoneIdx];

    var body = '';
    body += '<div style="display:flex;flex-direction:column;gap:14px;">';
    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Title (English)</label>';
    body += '<input id="zone-edit-title" value="' + esc(zone.title || '') + '" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;"></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Title (Arabic)</label>';
    body += '<input id="zone-edit-titleAr" value="' + esc(zone.titleAr || '') + '" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;"></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Width</label>';
    body += '<select id="zone-edit-width" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;">';
    ['100%', '75%', '50%', '33%'].forEach(function(w) {
        body += '<option value="' + w + '"' + (zone.width === w ? ' selected' : '') + '>' + (w === '100%' ? 'Full Width' : w) + '</option>';
    });
    body += '</select></div>';

    if (zone.type === 'text' || zone.type === 'custom') {
        body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Content (HTML)</label>';
        body += '<textarea id="zone-edit-content" rows="5" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;resize:vertical;">' + esc(zone.content || '') + '</textarea></div>';
    } else if (zone.type === 'video') {
        body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Video URL</label>';
        body += '<input id="zone-edit-videoSrc" value="' + esc(zone.videoSrc || '') + '" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;"></div>';
    } else if (zone.type === 'pdf') {
        body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">PDF URL</label>';
        body += '<input id="zone-edit-pdfSrc" value="' + esc(zone.pdfSrc || '') + '" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;"></div>';
    } else if (zone.type === 'hardware') {
        var hwText = (zone.hardware || []).map(function(h) { return h.icon + '|' + h.name + '|' + h.detail + '|' + h.status; }).join('\n');
        body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Hardware Items</label>';
        body += '<textarea id="zone-edit-hardware" rows="4" style="width:100%;padding:10px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:13px;resize:vertical;">' + esc(hwText) + '</textarea></div>';
    }

    body += '</div>';

    openModal('Edit Zone', body, function() {
        zone.title = $('zone-edit-title').value;
        zone.titleAr = $('zone-edit-titleAr').value;
        zone.width = $('zone-edit-width').value;

        var c = document.getElementById('zone-edit-content');
        if (c) zone.content = c.value;
        var v = document.getElementById('zone-edit-videoSrc');
        if (v) zone.videoSrc = v.value;
        var p = document.getElementById('zone-edit-pdfSrc');
        if (p) zone.pdfSrc = p.value;
        var h = document.getElementById('zone-edit-hardware');
        if (h) {
            zone.hardware = h.value.split('\n').filter(function(l) { return l.trim(); }).map(function(line) {
                var pp = line.split('|');
                return { icon: (pp[0] || '\uD83D\uDD27').trim(), name: (pp[1] || '').trim(), detail: (pp[2] || '').trim(), status: (pp[3] || 'offline').trim() };
            });
        }

        saveTestZones();
        toast('Zone updated', 'success');
        closeModal();
        renderZoneManager();
    }, true);
}

function deleteZone(testId, zoneIdx) {
    if (!confirm('Delete this zone?')) return;
    var config = testZones[testId];
    if (!config) return;
    config.zones.splice(zoneIdx, 1);
    saveTestZones();
    toast('Zone deleted', 'success');
    renderZoneManager();
}

function moveZone(testId, zoneIdx, direction) {
    var config = testZones[testId];
    if (!config) return;
    var newIdx = zoneIdx + direction;
    if (newIdx < 0 || newIdx >= config.zones.length) return;
    var temp = config.zones[zoneIdx];
    config.zones[zoneIdx] = config.zones[newIdx];
    config.zones[newIdx] = temp;
    saveTestZones();
    renderZoneManager();
}

function setZoneLayout(testId, layout) {
    if (!testZones[testId]) {
        testZones[testId] = { layout: '1-col', zones: [], showHeader: true, showFooter: true };
    }
    testZones[testId].layout = layout;
    saveTestZones();
}

function toggleZoneHeader(testId, show) {
    if (!testZones[testId]) {
        testZones[testId] = { layout: '1-col', zones: [], showHeader: true, showFooter: true };
    }
    testZones[testId].showHeader = show;
    saveTestZones();
}

function toggleZoneFooter(testId, show) {
    if (!testZones[testId]) {
        testZones[testId] = { layout: '1-col', zones: [], showHeader: true, showFooter: true };
    }
    testZones[testId].showFooter = show;
    saveTestZones();
}

function resetTestZones(testId) {
    if (!confirm('Reset all zones for this test page?')) return;
    delete testZones[testId];
    saveTestZones();
    toast('Zones reset', 'info');
    renderZoneManager();
}


/* ===== CONTENT MANAGER ===== */
function renderContentManager() {
    var contentHtml = '<div class="content-manager">' +
        '<div class="content-left">' +
        '<div class="content-nav">';

    var keys = Object.keys(DEFAULT_CONTENT);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var sec = DEFAULT_CONTENT[k];
        var activeClass = contentTab === k ? ' active' : '';
        contentHtml += '<button class="content-nav-btn' + activeClass + '" onclick="App.navigateContent(\'' + k + '\')">' +
            '<span class="content-nav-icon">' + sec.icon + '</span>' +
            '<span>' + sec.label + '</span>' +
            '</button>';
    }

    contentHtml += '</div></div>' +
        '<div class="content-right" id="contentFormArea"></div>' +
        '</div>';

    mainContent.innerHTML = contentHtml;
    renderContentSection(contentTab);
}

function renderContentSection(sectionKey) {
    var area = document.getElementById('contentFormArea');
    if (!area) return;

    var section = DEFAULT_CONTENT[sectionKey];
    if (!section) return;

    var formData = content[sectionKey] || {};

    var html = '<div class="content-form">' +
        '<h2 class="content-form-title">' + section.icon + ' ' + section.label + '</h2>' +
        '<div class="content-fields">';

    for (var i = 0; i < section.fields.length; i++) {
        var field = section.fields[i];
        var val = formData[field.key] || '';

        html += '<div class="content-field-group">' +
            '<label class="content-field-label">' + field.label + '</label>';

        if (field.type === 'textarea') {
            html += '<textarea class="content-field-input" id="cf-' + field.key + '" rows="3" oninput="App.saveContentField(\'' + sectionKey + '\',\'' + field.key + '\',this.value)">' + escapeHtml(val) + '</textarea>';
        } else {
            html += '<input type="text" class="content-field-input" id="cf-' + field.key + '" value="' + escapeHtml(val) + '" oninput="App.saveContentField(\'' + sectionKey + '\',\'' + field.key + '\',this.value)">';
        }

        html += '</div>';
    }

    html += '</div>' +
        '<div class="content-form-actions">' +
        '<button class="btn-primary" onclick="App.saveContentField(\'' + sectionKey + '\',\'__save\',\'\')">Save ' + section.label + '</button>' +
        '</div></div>';

    area.innerHTML = html;
}

function saveContentField(sectionKey, fieldKey, value) {
    if (!content[sectionKey]) {
        content[sectionKey] = {};
    }
    if (fieldKey === '__save') {
        localStorage.setItem('smartlab_content', JSON.stringify(content));
        showToast('Content saved successfully');
        return;
    }
    content[sectionKey][fieldKey] = value;
    localStorage.setItem('smartlab_content', JSON.stringify(content));
}

/* ===== PAGE DESIGNER ===== */
function renderDesigner() {
    var sections = structure || [];

    var html = '<div class="designer-panel">' +
        '<div class="designer-section-select">' +
        '<h3>Select Section</h3>' +
        '<div class="designer-section-list">';

    if (sections.length === 0) {
        html += '<p class="empty-state">No sections available. Add a section first.</p>';
    }

    for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        html += '<button class="designer-section-card" onclick="App.addDesignerItem(\'' + sec.id + '\')">' +
            '<span class="dsc-icon" style="background:' + (sec.color || '#3b82f6') + '">' + (sec.icon || '📁') + '</span>' +
            '<span class="dsc-name">' + escapeHtml(sec.name) + '</span>' +
            '<span class="dsc-count">' + (sec.items ? sec.items.length : 0) + ' tests</span>' +
            '</button>';
    }

    html += '</div></div>' +
        '<div class="designer-items-area" id="designerItemsArea">' +
        '<p class="empty-state">Select a section above to configure test page layouts.</p>' +
        '</div></div>';

    mainContent.innerHTML = html;
}

function renderDesignerForItem(secId, itemId) {
    var area = document.getElementById('designerItemsArea');
    if (!area) return;

    var sec = findSection(secId);
    if (!sec) return;

    var item = null;
    if (sec.items) {
        for (var i = 0; i < sec.items.length; i++) {
            if (sec.items[i].id === itemId) {
                item = sec.items[i];
                break;
            }
        }
    }
    if (!item) return;

    var designKey = secId + '_' + itemId;
    if (!pageDesigns[secId]) pageDesigns[secId] = {};
    if (!pageDesigns[secId][itemId]) {
        pageDesigns[secId][itemId] = {
            sidebarFields: [],
            accentColor: '#3b82f6'
        };
    }
    var design = pageDesigns[secId][itemId];

    var html = '<div class="designer-editor">' +
        '<div class="designer-editor-header">' +
        '<button class="btn-back" onclick="App.addDesignerItem(\'' + secId + '\')">&larr; Back</button>' +
        '<h3>Configure: ' + escapeHtml(item.name || item.nameAr || 'Test') + '</h3>' +
        '</div>' +
        '<div class="designer-accent-color">' +
        '<label>Accent Color:</label>' +
        '<input type="color" value="' + (design.accentColor || '#3b82f6') + '" onchange="pageDesigns[\'' + secId + '\'][\'' + itemId + '\'].accentColor=this.value;localStorage.setItem(\'smartlab_pageDesigns\',JSON.stringify(pageDesigns))">' +
        '</div>' +
        '<div class="designer-fields-header">' +
        '<h4>Sidebar Fields</h4>' +
        '<button class="btn-primary btn-sm" onclick="App.saveDesignerField(\'' + secId + '\',\'' + itemId + '\',\'add\')">+ Add Field</button>' +
        '</div>' +
        '<div class="designer-fields-list" id="designerFieldsList">';

    if (design.sidebarFields.length === 0) {
        html += '<p class="empty-state-sm">No fields configured. Add a field to get started.</p>';
    }

    for (var j = 0; j < design.sidebarFields.length; j++) {
        var field = design.sidebarFields[j];
        html += '<div class="designer-field-item" draggable="true" data-idx="' + j + '">' +
            '<span class="field-drag-handle">⋮⋮</span>' +
            '<div class="designer-field-info">' +
            '<strong>' + escapeHtml(field.label) + '</strong>' +
            '<span class="field-meta">' + (field.unit || 'no unit') + (field.required ? ' • Required' : '') + '</span>' +
            '</div>' +
            '<div class="designer-field-actions">' +
            '<button class="btn-icon" onclick="App.saveDesignerField(\'' + secId + '\',\'' + itemId + '\',\'edit\',' + j + ')">✎</button>' +
            '<button class="btn-icon btn-danger-icon" onclick="App.removeDesignerField(\'' + secId + '\',\'' + itemId + '\',' + j + ')">✕</button>' +
            '</div>' +
            '</div>';
    }

    html += '</div>' +
        '<div class="designer-field-form" id="designerFieldForm"></div>' +
        '</div>';

    area.innerHTML = html;
    initDragDrop();
}

function addDesignerItem(secId) {
    var area = document.getElementById('designerItemsArea');
    if (!area) return;

    var sec = findSection(secId);
    if (!sec) return;

    var html = '<div class="designer-items-header">' +
        '<button class="btn-back" onclick="App.navigate(\'designer\')">&larr; Back to sections</button>' +
        '<h3>' + escapeHtml(sec.name) + ' - Tests</h3>' +
        '</div>' +
        '<div class="designer-items-grid">';

    if (!sec.items || sec.items.length === 0) {
        html += '<p class="empty-state">No tests in this section.</p>';
    }

    if (sec.items) {
        for (var i = 0; i < sec.items.length; i++) {
            var item = sec.items[i];
            html += '<button class="designer-item-card" onclick="App.openDesignerItem(\'' + secId + '\',\'' + item.id + '\')">' +
                '<span class="dic-icon">' + (item.icon || '🔬') + '</span>' +
                '<span class="dic-name">' + escapeHtml(item.name || item.nameAr || 'Test') + '</span>' +
                '</button>';
        }
    }

    html += '</div>';
    area.innerHTML = html;
}

function saveDesignerField(secId, itemId, action, idx) {
    var design = pageDesigns[secId] && pageDesigns[secId][itemId];
    if (!design) return;

    if (action === 'add') {
        var formArea = document.getElementById('designerFieldForm');
        if (!formArea) return;

        var html = '<div class="field-config-form">' +
            '<h4>Add New Field</h4>' +
            '<div class="form-group">' +
            '<label>Label</label>' +
            '<input type="text" id="df-label" placeholder="e.g. Temperature">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Unit</label>' +
            '<input type="text" id="df-unit" placeholder="e.g. °C">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Placeholder</label>' +
            '<input type="text" id="df-placeholder" placeholder="Enter value...">' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group">' +
            '<label>Min</label>' +
            '<input type="number" id="df-min">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Max</label>' +
            '<input type="number" id="df-max">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Default</label>' +
            '<input type="text" id="df-default">' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label><input type="checkbox" id="df-required"> Required</label>' +
            '</div>' +
            '<div class="form-actions">' +
            '<button class="btn-secondary" onclick="document.getElementById(\'designerFieldForm\').innerHTML=\'\'">Cancel</button>' +
            '<button class="btn-primary" onclick="App.saveDesignerField(\'' + secId + '\',\'' + itemId + '\',\'confirm-add\')">Save Field</button>' +
            '</div></div>';

        formArea.innerHTML = html;
        return;
    }

    if (action === 'confirm-add') {
        var labelEl = document.getElementById('df-label');
        var unitEl = document.getElementById('df-unit');
        var phEl = document.getElementById('df-placeholder');
        var minEl = document.getElementById('df-min');
        var maxEl = document.getElementById('df-max');
        var defEl = document.getElementById('df-default');
        var reqEl = document.getElementById('df-required');

        if (!labelEl || !labelEl.value.trim()) {
            showToast('Field label is required');
            return;
        }

        var newField = {
            id: 'field_' + Date.now(),
            label: labelEl.value.trim(),
            unit: unitEl ? unitEl.value.trim() : '',
            placeholder: phEl ? phEl.value.trim() : '',
            required: reqEl ? reqEl.checked : false,
            defaultValue: defEl ? defEl.value.trim() : '',
            min: minEl ? minEl.value : '',
            max: maxEl ? maxEl.value : ''
        };

        design.sidebarFields.push(newField);
        localStorage.setItem('smartlab_pageDesigns', JSON.stringify(pageDesigns));
        renderDesignerForItem(secId, itemId);
        showToast('Field added');
        return;
    }

    if (action === 'edit' && typeof idx === 'number') {
        var field = design.sidebarFields[idx];
        if (!field) return;

        var editArea = document.getElementById('designerFieldForm');
        if (!editArea) return;

        var editHtml = '<div class="field-config-form">' +
            '<h4>Edit Field</h4>' +
            '<div class="form-group">' +
            '<label>Label</label>' +
            '<input type="text" id="df-label" value="' + escapeHtml(field.label) + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Unit</label>' +
            '<input type="text" id="df-unit" value="' + escapeHtml(field.unit || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Placeholder</label>' +
            '<input type="text" id="df-placeholder" value="' + escapeHtml(field.placeholder || '') + '">' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group">' +
            '<label>Min</label>' +
            '<input type="number" id="df-min" value="' + escapeHtml(String(field.min || '')) + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Max</label>' +
            '<input type="number" id="df-max" value="' + escapeHtml(String(field.max || '')) + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Default</label>' +
            '<input type="text" id="df-default" value="' + escapeHtml(field.defaultValue || '') + '">' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label><input type="checkbox" id="df-required"' + (field.required ? ' checked' : '') + '> Required</label>' +
            '</div>' +
            '<div class="form-actions">' +
            '<button class="btn-secondary" onclick="document.getElementById(\'designerFieldForm\').innerHTML=\'\'">Cancel</button>' +
            '<button class="btn-primary" onclick="App.saveDesignerField(\'' + secId + '\',\'' + itemId + '\',\'confirm-edit\',' + idx + ')">Update Field</button>' +
            '</div></div>';

        editArea.innerHTML = editHtml;
        return;
    }

    if (action === 'confirm-edit' && typeof idx === 'number') {
        var lblEl = document.getElementById('df-label');
        var untEl = document.getElementById('df-unit');
        var plcEl = document.getElementById('df-placeholder');
        var mnEl = document.getElementById('df-min');
        var mxEl = document.getElementById('df-max');
        var dftEl = document.getElementById('df-default');
        var reqChk = document.getElementById('df-required');

        if (!lblEl || !lblEl.value.trim()) {
            showToast('Field label is required');
            return;
        }

        design.sidebarFields[idx].label = lblEl.value.trim();
        design.sidebarFields[idx].unit = untEl ? untEl.value.trim() : '';
        design.sidebarFields[idx].placeholder = plcEl ? plcEl.value.trim() : '';
        design.sidebarFields[idx].required = reqChk ? reqChk.checked : false;
        design.sidebarFields[idx].defaultValue = dftEl ? dftEl.value.trim() : '';
        design.sidebarFields[idx].min = mnEl ? mnEl.value : '';
        design.sidebarFields[idx].max = mxEl ? mxEl.value : '';

        localStorage.setItem('smartlab_pageDesigns', JSON.stringify(pageDesigns));
        renderDesignerForItem(secId, itemId);
        showToast('Field updated');
        return;
    }
}

function removeDesignerField(secId, itemId, idx) {
    var design = pageDesigns[secId] && pageDesigns[secId][itemId];
    if (!design) return;
    if (!confirm('Remove this field?')) return;

    design.sidebarFields.splice(idx, 1);
    localStorage.setItem('smartlab_pageDesigns', JSON.stringify(pageDesigns));
    renderDesignerForItem(secId, itemId);
    showToast('Field removed');
}

/* ===== REPORTS ===== */
function renderReports() {
    var html = '<div class="reports-panel">' +
        '<div class="reports-header">' +
        '<h2>Reports & Documents</h2>' +
        '</div>' +
        '<div class="report-upload-zone" id="reportUploadZone">' +
        '<div class="upload-zone-inner">' +
        '<span class="upload-icon">📄</span>' +
        '<p class="upload-text">Drag & drop files here or <label for="reportFileInput" class="upload-link">browse</label></p>' +
        '<p class="upload-hint">PDF, DOC, XLSX, JPG, PNG (max 10MB)</p>' +
        '</div>' +
        '<input type="file" id="reportFileInput" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" style="display:none" onchange="App.addReport(this)">' +
        '</div>' +
        '<div class="reports-grid" id="reportsGrid">';

    if (reports.length === 0) {
        html += '<div class="empty-state"><span class="empty-icon">📂</span><p>No reports uploaded yet.</p></div>';
    }

    for (var i = 0; i < reports.length; i++) {
        var report = reports[i];
        var icon = getFileIcon(report.type);
        var sizeStr = formatFileSize(report.size);
        var dateStr = new Date(report.uploadDate).toLocaleDateString();

        html += '<div class="report-card">' +
            '<div class="report-card-icon">' + icon + '</div>' +
            '<div class="report-card-info">' +
            '<p class="report-card-name" title="' + escapeHtml(report.name) + '">' + escapeHtml(report.name) + '</p>' +
            '<p class="report-card-meta">' + sizeStr + ' &bull; ' + dateStr + '</p>' +
            '</div>' +
            '<div class="report-card-actions">' +
            '<button class="btn-icon" title="Download" onclick="App.downloadReport(\'' + report.id + '\')">⬇</button>' +
            '<button class="btn-icon btn-danger-icon" title="Delete" onclick="App.deleteReport(\'' + report.id + '\')">✕</button>' +
            '</div>' +
            '</div>';
    }

    html += '</div></div>';
    mainContent.innerHTML = html;

    var zone = document.getElementById('reportUploadZone');
    if (zone) {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', function() {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            zone.classList.remove('drag-over');
            var files = e.dataTransfer.files;
            if (files.length > 0) {
                handleReportFiles(files);
            }
        });
    }
}

function addReport(input) {
    var files = input.files;
    if (files && files.length > 0) {
        handleReportFiles(files);
    }
    input.value = '';
}

function handleReportFiles(files) {
    var pending = files.length;
    var maxSize = 10 * 1024 * 1024;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.size > maxSize) {
            showToast('File "' + file.name + '" exceeds 10MB limit');
            pending--;
            continue;
        }

        (function(f) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var report = {
                    id: 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    name: f.name,
                    type: f.type,
                    size: f.size,
                    dataUrl: e.target.result,
                    uploadDate: new Date().toISOString()
                };
                reports.push(report);
                localStorage.setItem('smartlab_reports', JSON.stringify(reports));
                pending--;
                if (pending <= 0) {
                    renderReports();
                    showToast('File(s) uploaded successfully');
                }
            };
            reader.readAsDataURL(f);
        })(file);
    }
}

function deleteReport(reportId) {
    if (!confirm('Delete this report?')) return;
    for (var i = reports.length - 1; i >= 0; i--) {
        if (reports[i].id === reportId) {
            reports.splice(i, 1);
            break;
        }
    }
    localStorage.setItem('smartlab_reports', JSON.stringify(reports));
    renderReports();
    showToast('Report deleted');
}

function downloadReport(reportId) {
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === reportId) {
            var report = reports[i];
            var a = document.createElement('a');
            a.href = report.dataUrl;
            a.download = report.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }
    }
}

function getFileIcon(mimeType) {
    if (!mimeType) return '📄';
    if (mimeType.indexOf('pdf') !== -1) return '📕';
    if (mimeType.indexOf('word') !== -1 || mimeType.indexOf('doc') !== -1) return '📘';
    if (mimeType.indexOf('excel') !== -1 || mimeType.indexOf('sheet') !== -1 || mimeType.indexOf('xlsx') !== -1) return '📗';
    if (mimeType.indexOf('image') !== -1) return '🖼️';
    return '📄';
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var idx = 0;
    var size = bytes;
    while (size >= 1024 && idx < units.length - 1) {
        size /= 1024;
        idx++;
    }
    return size.toFixed(idx === 0 ? 0 : 1) + ' ' + units[idx];
}

/* ===== USERS ===== */
function renderUsers() {
    var html = '<div class="users-panel">' +
        '<div class="users-header">' +
        '<h2>User Management</h2>' +
        '<button class="btn-primary" onclick="App.addUser()">+ Add User</button>' +
        '</div>' +
        '<div class="users-table-wrapper">' +
        '<table class="users-table">' +
        '<thead><tr>' +
        '<th>User</th>' +
        '<th>Email</th>' +
        '<th>Role</th>' +
        '<th>Last Login</th>' +
        '<th>Actions</th>' +
        '</tr></thead><tbody>';

    if (users.length === 0) {
        html += '<tr><td colspan="5" class="empty-state">No users found.</td></tr>';
    }

    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        var initials = getInitials(user.name);
        var avatarColor = stringToColor(user.name);
        var roleBadgeClass = user.role === 'admin' ? 'role-admin' : 'role-editor';
        var lastLoginStr = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

        html += '<tr>' +
            '<td class="user-cell">' +
            '<div class="user-avatar" style="background:' + avatarColor + '">' + initials + '</div>' +
            '<span class="user-name">' + escapeHtml(user.name) + '</span>' +
            '</td>' +
            '<td>' + escapeHtml(user.email) + '</td>' +
            '<td><span class="role-badge ' + roleBadgeClass + '">' + capitalizeFirst(user.role) + '</span></td>' +
            '<td>' + lastLoginStr + '</td>' +
            '<td class="user-actions">' +
            '<button class="btn-icon" title="Edit" onclick="App.editUser(\'' + user.id + '\')">✎</button>' +
            '<button class="btn-icon btn-danger-icon" title="Delete" onclick="App.deleteUser(\'' + user.id + '\')">✕</button>' +
            '</td>' +
            '</tr>';
    }

    html += '</tbody></table></div></div>';
    mainContent.innerHTML = html;
}

function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

function stringToColor(str) {
    var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function addUser() {
    var modalContent = '<div class="modal-form">' +
        '<h3>Add New User</h3>' +
        '<div class="form-group">' +
        '<label>Full Name</label>' +
        '<input type="text" id="modal-user-name" placeholder="John Doe">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Email</label>' +
        '<input type="email" id="modal-user-email" placeholder="user@example.com">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Role</label>' +
        '<select id="modal-user-role">' +
        '<option value="admin">Admin</option>' +
        '<option value="editor">Editor</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button class="btn-secondary" onclick="App.closeModal()">Cancel</button>' +
        '<button class="btn-primary" onclick="App.confirmAddUser()">Add User</button>' +
        '</div></div>';

    showModal(modalContent);
}

function confirmAddUser() {
    var nameEl = document.getElementById('modal-user-name');
    var emailEl = document.getElementById('modal-user-email');
    var roleEl = document.getElementById('modal-user-role');

    if (!nameEl || !nameEl.value.trim()) {
        showToast('Name is required');
        return;
    }
    if (!emailEl || !emailEl.value.trim()) {
        showToast('Email is required');
        return;
    }

    var newUser = {
        id: 'user_' + Date.now(),
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        role: roleEl ? roleEl.value : 'editor',
        lastLogin: null
    };

    users.push(newUser);
    localStorage.setItem('smartlab_users', JSON.stringify(users));
    closeModal();
    renderUsers();
    showToast('User added successfully');
}

function editUser(userId) {
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            user = users[i];
            break;
        }
    }
    if (!user) return;

    var modalContent = '<div class="modal-form">' +
        '<h3>Edit User</h3>' +
        '<div class="form-group">' +
        '<label>Full Name</label>' +
        '<input type="text" id="modal-user-name" value="' + escapeHtml(user.name) + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Email</label>' +
        '<input type="email" id="modal-user-email" value="' + escapeHtml(user.email) + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Role</label>' +
        '<select id="modal-user-role">' +
        '<option value="admin"' + (user.role === 'admin' ? ' selected' : '') + '>Admin</option>' +
        '<option value="editor"' + (user.role === 'editor' ? ' selected' : '') + '>Editor</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button class="btn-secondary" onclick="App.closeModal()">Cancel</button>' +
        '<button class="btn-primary" onclick="App.confirmEditUser(\'' + userId + '\')">Save Changes</button>' +
        '</div></div>';

    showModal(modalContent);
}

function confirmEditUser(userId) {
    var nameEl = document.getElementById('modal-user-name');
    var emailEl = document.getElementById('modal-user-email');
    var roleEl = document.getElementById('modal-user-role');

    if (!nameEl || !nameEl.value.trim()) {
        showToast('Name is required');
        return;
    }

    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            users[i].name = nameEl.value.trim();
            users[i].email = emailEl ? emailEl.value.trim() : users[i].email;
            users[i].role = roleEl ? roleEl.value : users[i].role;
            break;
        }
    }

    localStorage.setItem('smartlab_users', JSON.stringify(users));
    closeModal();
    renderUsers();
    showToast('User updated successfully');
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    for (var i = users.length - 1; i >= 0; i--) {
        if (users[i].id === userId) {
            users.splice(i, 1);
            break;
        }
    }
    localStorage.setItem('smartlab_users', JSON.stringify(users));
    renderUsers();
    showToast('User deleted');
}

/* ===== SETTINGS ===== */
function renderSettings() {
    var s = settings || {};

    var logoPreviewHtml = '';
    if (s.logo && s.logo.indexOf('data:') === 0) {
        logoPreviewHtml = '<img src="' + s.logo + '" alt="logo">';
    } else {
        var initial = (s.siteName || 'SL');
        logoPreviewHtml = '<span>' + initial.charAt(0).toUpperCase() + '</span>';
    }

    var faviconPreviewHtml = '';
    if (s.favicon && s.favicon.indexOf('data:') === 0) {
        faviconPreviewHtml = '<img src="' + s.favicon + '" alt="favicon">';
    } else {
        var initial = (s.siteName || 'SL');
        faviconPreviewHtml = '<span>' + initial.charAt(0).toUpperCase() + '</span>';
    }

    var html = '<div class="settings-panel">' +
        '<div class="settings-header">' +
        '<h2>Settings</h2>' +
        '</div>' +
        '<div class="settings-grid">';

    html += '<div class="settings-card">' +
        '<div class="settings-card-header">' +
        '<span class="sc-icon">⚙️</span>' +
        '<h3>General</h3>' +
        '</div>' +
        '<div class="settings-card-body">' +
        '<div class="form-group">' +
        '<label>Site Name (EN)</label>' +
        '<input type="text" id="set-siteName" value="' + escapeHtml(s.siteName || '') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Site Name (AR)</label>' +
        '<input type="text" id="set-siteNameAr" value="' + escapeHtml(s.siteNameAr || '') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Logo URL (أو تحميل صورة)</label>' +
        '<div class="logo-upload-row">' +
        '<div class="logo-preview" id="logo-preview">' + logoPreviewHtml + '</div>' +
        '<div class="logo-upload-actions">' +
        '<label class="btn btn-sm btn-outline logo-upload-label">📁 تحميل<input type="file" accept="image/*" class="logo-upload-input" id="set-logo-file" onchange="App.uploadLogo(this)"></label>' +
        (s.logo && s.logo.indexOf('data:') === 0 ? '<button class="btn btn-sm btn-danger" onclick="App.removeLogo()">✕ حذف</button>' : '') +
        '</div>' +
        '</div>' +
        '<div style="margin-top:8px;font-size:12px;color:#94a3b8;">رابط الشعار أو قم بتحميل ملف صورة</div>' +
        '<input type="hidden" id="set-logo" value="' + escapeHtml(s.logo || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Favicon URL (أو تحميل صورة)</label>' +
        '<div class="logo-upload-row">' +
        '<div class="logo-preview fav-preview" id="fav-preview">' + faviconPreviewHtml + '</div>' +
        '<div class="logo-upload-actions">' +
        '<label class="btn btn-sm btn-outline logo-upload-label">📁 تحميل<input type="file" accept="image/*" class="logo-upload-input" id="set-favicon-file" onchange="App.uploadFavicon(this)"></label>' +
        (s.favicon && s.favicon.indexOf('data:') === 0 ? '<button class="btn btn-sm btn-danger" onclick="App.removeFavicon()">✕ حذف</button>' : '') +
        '</div>' +
        '</div>' +
        '<div style="margin-top:8px;font-size:12px;color:#94a3b8;">رابط الأيقونة أو قم بتحميل ملف صورة</div>' +
        '<input type="hidden" id="set-favicon" value="' + escapeHtml(s.favicon || '') + '">' +
        '</div>' +
        '</div></div>';

    html += '<div class="settings-card">' +
        '<div class="settings-card-header">' +
        '<span class="sc-icon">📞</span>' +
        '<h3>Contact</h3>' +
        '</div>' +
        '<div class="settings-card-body">' +
        '<div class="form-group">' +
        '<label>Email</label>' +
        '<input type="email" id="set-email" value="' + escapeHtml(s.email || '') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Phone (Egypt)</label>' +
        '<input type="text" id="set-phone_eg" value="' + escapeHtml(s.phone_eg || '') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Phone (KSA)</label>' +
        '<input type="text" id="set-phone_ksa" value="' + escapeHtml(s.phone_ksa || '') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Address</label>' +
        '<textarea id="set-address" rows="2" onchange="App.saveSettings()">' + escapeHtml(s.address || '') + '</textarea>' +
        '</div>' +
        '</div></div>';

    html += '<div class="settings-card">' +
        '<div class="settings-card-header">' +
        '<span class="sc-icon">🔗</span>' +
        '<h3>Social</h3>' +
        '</div>' +
        '<div class="settings-card-body">' +
        '<div class="form-group">' +
        '<label>Facebook URL</label>' +
        '<input type="text" id="set-facebook" value="' + escapeHtml(s.facebook || '') + '" placeholder="https://facebook.com/..." onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Twitter URL</label>' +
        '<input type="text" id="set-twitter" value="' + escapeHtml(s.twitter || '') + '" placeholder="https://twitter.com/..." onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>LinkedIn URL</label>' +
        '<input type="text" id="set-linkedin" value="' + escapeHtml(s.linkedin || '') + '" placeholder="https://linkedin.com/..." onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Instagram URL</label>' +
        '<input type="text" id="set-instagram" value="' + escapeHtml(s.instagram || '') + '" placeholder="https://instagram.com/..." onchange="App.saveSettings()">' +
        '</div>' +
        '</div></div>';

    html += '<div class="settings-card">' +
        '<div class="settings-card-header">' +
        '<span class="sc-icon">🎨</span>' +
        '<h3>Branding</h3>' +
        '</div>' +
        '<div class="settings-card-body">' +
        '<div class="form-group">' +
        '<label>Primary Color</label>' +
        '<input type="color" id="set-primaryColor" value="' + (s.primaryColor || '#3b82f6') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Secondary Color</label>' +
        '<input type="color" id="set-secondaryColor" value="' + (s.secondaryColor || '#10b981') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Copyright Text</label>' +
        '<input type="text" id="set-copyright" value="' + escapeHtml(s.copyright || '') + '" onchange="App.saveSettings()">' +
        '</div>' +
        '</div></div>';

    html += '</div></div>';
    mainContent.innerHTML = html;
}

function uploadLogo(input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file must be under 2MB', 'error');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var dataUrl = e.target.result;
        document.getElementById('set-logo').value = dataUrl;
        var preview = document.getElementById('logo-preview');
        if (preview) {
            preview.innerHTML = '<img src="' + dataUrl + '" alt="logo">';
            preview.classList.add('has-logo');
        }
        showToast('Logo uploaded', 'success');
        App.saveSettings();
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    document.getElementById('set-logo').value = '/assets/logo.png';
    var preview = document.getElementById('logo-preview');
    if (preview) {
        preview.innerHTML = '<span>' + (settings.siteName || 'SL').charAt(0).toUpperCase() + '</span>';
        preview.classList.remove('has-logo');
    }
    showToast('Logo reverted to default', 'info');
    App.saveSettings();
}

function uploadFavicon(input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
        showToast('Favicon file must be under 2MB', 'error');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var dataUrl = e.target.result;
        document.getElementById('set-favicon').value = dataUrl;
        var preview = document.getElementById('fav-preview');
        if (preview) {
            preview.innerHTML = '<img src="' + dataUrl + '" alt="favicon">';
            preview.classList.add('has-favicon');
        }
        showToast('Favicon uploaded', 'success');
        App.saveSettings();
    };
    reader.readAsDataURL(file);
}

function removeFavicon() {
    document.getElementById('set-favicon').value = '/favicon.ico';
    var preview = document.getElementById('fav-preview');
    if (preview) {
        preview.innerHTML = '<span>F</span>';
        preview.classList.remove('has-favicon');
    }
    showToast('Favicon reverted to default', 'info');
    App.saveSettings();
}

function saveSettings() {
    settings.siteName = (document.getElementById('set-siteName') || {}).value || '';
    settings.siteNameAr = (document.getElementById('set-siteNameAr') || {}).value || '';
    settings.logo = (document.getElementById('set-logo') || {}).value || '';
    settings.favicon = (document.getElementById('set-favicon') || {}).value || '';
    settings.email = (document.getElementById('set-email') || {}).value || '';
    settings.phone_eg = (document.getElementById('set-phone_eg') || {}).value || '';
    settings.phone_ksa = (document.getElementById('set-phone_ksa') || {}).value || '';
    settings.address = (document.getElementById('set-address') || {}).value || '';
    settings.facebook = (document.getElementById('set-facebook') || {}).value || '';
    settings.twitter = (document.getElementById('set-twitter') || {}).value || '';
    settings.linkedin = (document.getElementById('set-linkedin') || {}).value || '';
    settings.instagram = (document.getElementById('set-instagram') || {}).value || '';
    settings.primaryColor = (document.getElementById('set-primaryColor') || {}).value || '#3b82f6';
    settings.secondaryColor = (document.getElementById('set-secondaryColor') || {}).value || '#10b981';
    settings.copyright = (document.getElementById('set-copyright') || {}).value || '';

    localStorage.setItem('smartlab_settings', JSON.stringify(settings));
    showToast('Settings saved');
}

/* ===== SECTION CRUD (fixed - uses structure.sections) ===== */
function findSection(secId) {
    if (!structure || !structure.sections) return null;
    return structure.sections.find(function(s) { return s.id === secId; }) || null;
}

function confirmAddSection() {
    var nameEl = document.getElementById('modal-sec-name');
    var nameArEl = document.getElementById('modal-sec-nameAr');
    var colorEl = document.getElementById('modal-sec-color');
    var iconEl = document.getElementById('modal-sec-icon');
    var iconUrlEl = document.getElementById('modal-sec-iconUrl');

    if (!nameEl || !nameEl.value.trim()) {
        toast('Section name is required', 'error');
        return;
    }

    var newSection = {
        id: 'sec_' + Date.now(),
        name: nameEl.value.trim(),
        nameAr: nameArEl ? nameArEl.value.trim() : '',
        color: colorEl ? colorEl.value : '#3b82f6',
        icon: iconEl ? iconEl.value : '📁',
        iconUrl: iconUrlEl ? iconUrlEl.value : '',
        path: '/',
        tests: [],
        designs: [],
        clients: []
    };

    structure.sections.push(newSection);
    saveStructure();
    closeModal();
    navigate('section:' + newSection.id);
    toast('Section "' + newSection.name + '" created!', 'success');
}

function confirmEditSection(secId) {
    var section = structure.sections.find(function(s) { return s.id === secId; });
    if (!section) return;

    var nameEl = document.getElementById('modal-sec-name');
    var nameArEl = document.getElementById('modal-sec-nameAr');
    var colorEl = document.getElementById('modal-sec-color');
    var iconEl = document.getElementById('modal-sec-icon');
    var iconUrlEl = document.getElementById('modal-sec-iconUrl');

    if (nameEl) section.name = nameEl.value.trim();
    if (nameArEl) section.nameAr = nameArEl.value.trim();
    if (colorEl) section.color = colorEl.value;
    if (iconEl) section.icon = iconEl.value;
    if (iconUrlEl) section.iconUrl = iconUrlEl.value;

    saveStructure();
    closeModal();
    renderMain();
    toast('Section updated', 'success');
}

/* ===== HTML EDITOR ===== */
function openHtmlEditor(secId, tabName, itemId) {
    var section = structure.sections.find(function(s) { return s.id === secId; });
    if (!section) return;
    var items = section[tabName] || [];
    var item = items.find(function(i) { return i.id === itemId; });
    if (!item) return;

    var filePath = item.path || '';
    var isExisting = item.fileType === 'existing';
    var htmlContent = item.htmlContent || getTemplateHtml(item, section);

    var body = '';
    body += '<div style="display:flex;flex-direction:column;gap:12px;">';

    body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">File Type</label>';
    body += '<select id="html-file-type" style="width:100%;padding:8px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:13px;" onchange="App.toggleHtmlPathType()">';
    body += '<option value="existing"' + (isExisting ? ' selected' : '') + '>Existing File</option>';
    body += '<option value="new"' + (!isExisting ? ' selected' : '') + '>New File (Template)</option>';
    body += '</select></div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Path</label>';
    body += '<input id="html-file-path" value="' + esc(filePath) + '" style="width:100%;padding:8px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:13px;" placeholder="/concrete/tests/test-new.html"></div>';
    body += '</div>';

    body += '<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">HTML Code</label>';
    body += '<textarea id="html-editor-content" rows="20" style="width:100%;padding:12px;background:#0d1117;border:1px solid var(--border-glass);border-radius:8px;color:#c9d1d9;font-family:\'SF Mono\',Monaco,Consolas,monospace;font-size:12px;line-height:1.5;resize:vertical;tab-size:2;">' + esc(htmlContent) + '</textarea>';
    body += '</div>';

    body += '<div style="display:flex;gap:8px;justify-content:space-between;">';
    body += '<div>';
    body += '<button class="btn btn-ghost" onclick="App.formatHtml()" style="font-size:12px;">Format HTML</button>';
    body += '<button class="btn btn-ghost" onclick="App.previewHtml()" style="font-size:12px;margin-left:6px;">Preview</button>';
    body += '</div>';
    body += '<div style="font-size:11px;color:var(--text-muted);line-height:1.5;">';
    body += 'Edit the HTML code directly. Changes are saved to localStorage.<br>';
    body += 'For new files, use the template and download the HTML file.';
    body += '</div>';
    body += '</div>';

    body += '</div>';

    openModal('HTML Editor - ' + (item.name || 'Test'), body, function() {
        var type = document.getElementById('html-file-type').value;
        var path = document.getElementById('html-file-path').value;
        var content = document.getElementById('html-editor-content').value;

        item.fileType = type;
        item.path = path;
        item.htmlContent = content;

        saveStructure();
        toast('HTML saved for "' + item.name + '"', 'success');
        closeModal();
    }, true);
}

function getTemplateHtml(item, section) {
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>smartLAB \u2014 ' + esc(item.name || 'Test') + '</title>\n    <link rel="icon" href="../../favicon.ico">\n    <link rel="stylesheet" href="test-common.css">\n    <link rel="stylesheet" href="../../test-zones.css">\n</head>\n<body>\n    <div id="header-placeholder"></div>\n    <div class="page">\n        <a href="../' + (section.id || '') + '.html" class="back-link">\n            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>\n            Back to ' + esc(section.name || 'Tests') + '\n        </a>\n\n        <h1 class="page-title">' + esc(item.name || 'Test').replace(/ /g, ' <span>') + '</h1>\n        <p class="page-sub">' + esc(item.description || item.standard || '') + '</p>\n\n        <div class="level-top">\n            <span class="lt-label">Test Level</span>\n            <div class="lt-btns">\n                <button class="lt-btn active" data-level="quick">&#9889; Quick</button>\n                <button class="lt-btn" data-level="unofficial">&#127981; Unofficial</button>\n                <button class="lt-btn" data-level="certified">&#128274; Certified</button>\n            </div>\n        </div>\n\n        <div class="billboard">\n            <div class="bb-inner">\n                <div class="bb-icon">' + (item.icon || '\uD83D\uDCCA') + '</div>\n                <div class="bb-body">\n                    <div class="bb-step-label">STEP 1 / 1</div>\n                    <div class="bb-title">' + esc(item.name || 'Test') + '</div>\n                    <div class="bb-desc">' + esc(item.description || 'Complete the test procedure') + '</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="two-col">\n            <div class="sidebar">\n                <div class="sidebar-title">&#9881; Test Parameters</div>\n                <!-- Add your input fields here -->\n                <button class="btn btn-primary" onclick="runTest()">Calculate</button>\n            </div>\n            <div>\n                <div id="testResults" style="display:none;">\n                    <!-- Results will appear here -->\n                </div>\n                <div id="testPlaceholder" style="text-align:center;padding:60px 20px;color:var(--text-muted);">\n                    <div style="font-size:48px;margin-bottom:16px;">' + (item.icon || '\uD83D\uDCCA') + '</div>\n                    <div style="font-size:16px;font-weight:600;margin-bottom:8px;">Enter Parameters</div>\n                    <div style="font-size:13px;">Fill in the test parameters to see results.</div>\n                </div>\n            </div>\n        </div>\n\n        <div class="notes-section">\n            <div class="notes-title">&#128221; Standards</div>\n            <ul class="notes-list">\n                <li>' + esc(item.standard || 'Add applicable standards here') + '</li>\n            </ul>\n        </div>\n    </div>\n    <div id="footer-placeholder"></div>\n    <script src="../../components.js"><\/script>\n    <script src="../../test-zone.js"><\/script>\n    <script>\n        if (document.readyState === \'loading\') {\n            document.addEventListener(\'DOMContentLoaded\', function() { TestZones.init(\'' + (item.id || '') + '\'); });\n        } else {\n            TestZones.init(\'' + (item.id || '') + '\');\n        }\n\n        function runTest() {\n            // Add your test logic here\n            document.getElementById(\'testPlaceholder\').style.display = \'none\';\n            document.getElementById(\'testResults\').style.display = \'block\';\n        }\n    <\/script>\n</body>\n</html>';
}

function formatHtml() {
    var textarea = document.getElementById('html-editor-content');
    if (!textarea) return;
    var code = textarea.value;
    /* Simple HTML formatting */
    code = code.replace(/>\s*</g, '>\n<');
    code = code.replace(/\n\s*\n/g, '\n');
    textarea.value = code;
    toast('HTML formatted', 'info');
}

function previewHtml() {
    var textarea = document.getElementById('html-editor-content');
    if (!textarea) return;
    var win = window.open('', '_blank');
    win.document.write(textarea.value);
    win.document.close();
}

function toggleHtmlPathType() {
    var type = document.getElementById('html-file-type').value;
    var pathInput = document.getElementById('html-file-path');
    if (type === 'new') {
        pathInput.placeholder = '/concrete/tests/test-new.html';
        pathInput.style.borderColor = 'rgba(251,191,36,0.5)';
    } else {
        pathInput.style.borderColor = '';
    }
}

/* ===== ICON PICKER ===== */
function iconPicker(selected, type, targetId) {
    var emojis = [
        '🔬', '🧪', '⚗️', '🧫', '🧬', '💉', '🌡️', '🔍',
        '📊', '📋', '📈', '📉', '🏗️', '🏭', '⚙️', '🔧',
        '🏠', '🏢', '🏥', '🎓', '💼', '📁', '📂', '🗂️',
        '🌍', '🌏', '🌐', '📡', '💻', '🖥️', '📱', '🔌',
        '⚡', '🔋', '💧', '🌊', '🔥', '❄️', '☀️', '🌙',
        '⭐', '🌟', '💎', '🎯', '✅', '❌', '⚠️', '🔔',
        '📝', '📄', '📑', '🗃️', '🏷️', '🔖', '📎', '🔗'
    ];

    var html = '<div class="icon-picker-grid">';
    for (var i = 0; i < emojis.length; i++) {
        var isSelected = emojis[i] === selected;
        var selClass = isSelected ? ' emoji-opt-selected' : '';
        html += '<button type="button" class="emoji-opt' + selClass + '" onclick="App.pickEmoji(this,\'' + emojis[i] + '\')">' + emojis[i] + '</button>';
    }

    var currentIconUrl = '';
    if (type === 'section' && targetId) {
        var sec = findSection(targetId);
        if (sec) currentIconUrl = sec.iconUrl || '';
    }

    html += '<label class="icon-upload-btn" title="Upload custom icon">' +
        '<input type="file" accept="image/*" style="display:none" onchange="App.uploadIcon(this,\'' + (type || 'icon') + '\',\'' + (targetId || '') + '\')">+' +
        '</label>';

    if (currentIconUrl) {
        html += '<div class="icon-preview current-icon-preview">' +
            '<img src="' + currentIconUrl + '" alt="Current icon" style="width:32px;height:32px;object-fit:contain">' +
            '</div>';
    }

    html += '</div>';
    return html;
}

function uploadIcon(input, targetType, targetId) {
    if (!input.files || !input.files[0]) return;

    var file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
        showToast('Icon file must be under 2MB');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var dataUrl = e.target.result;

        var iconUrlField = document.getElementById('modal-sec-iconUrl');
        if (iconUrlField) {
            iconUrlField.value = dataUrl;
        }

        var iconField = document.getElementById('modal-sec-icon');
        if (iconField) {
            iconField.value = '';
        }

        var pickerContainer = document.getElementById('modal-icon-picker');
        if (pickerContainer) {
            var previewDiv = pickerContainer.querySelector('.icon-preview');
            if (previewDiv) {
                previewDiv.innerHTML = '<img src="' + dataUrl + '" alt="Uploaded icon" style="width:32px;height:32px;object-fit:contain">';
            } else {
                var preview = document.createElement('div');
                preview.className = 'icon-preview';
                preview.innerHTML = '<img src="' + dataUrl + '" alt="Uploaded icon" style="width:32px;height:32px;object-fit:contain">';
                pickerContainer.appendChild(preview);
            }
        }

        var allOpts = pickerContainer ? pickerContainer.querySelectorAll('.emoji-opt') : [];
        for (var i = 0; i < allOpts.length; i++) {
            allOpts[i].classList.remove('emoji-opt-selected');
        }

        showToast('Icon uploaded');
    };
    reader.readAsDataURL(file);
}

function pickEmoji(el, emoji) {
    var allOpts = document.querySelectorAll('.emoji-opt');
    for (var i = 0; i < allOpts.length; i++) {
        allOpts[i].classList.remove('emoji-opt-selected');
    }

    if (el) {
        el.classList.add('emoji-opt-selected');
    }

    var iconField = document.getElementById('modal-sec-icon');
    if (iconField) {
        iconField.value = emoji;
    }

    var iconUrlField = document.getElementById('modal-sec-iconUrl');
    if (iconUrlField) {
        iconUrlField.value = '';
    }
}

/* ===== DRAG & DROP ===== */
function initDragDrop() {
    var rows = document.querySelectorAll('.designer-field-item[draggable="true"]');
    for (var i = 0; i < rows.length; i++) {
        (function(row) {
            row.addEventListener('dragstart', function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', row.getAttribute('data-idx'));
                row.classList.add('dragging');
            });

            row.addEventListener('dragend', function() {
                row.classList.remove('dragging');
                var allRows = document.querySelectorAll('.designer-field-item');
                for (var j = 0; j < allRows.length; j++) {
                    allRows[j].classList.remove('drag-over');
                }
            });

            row.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                row.classList.add('drag-over');
            });

            row.addEventListener('dragleave', function() {
                row.classList.remove('drag-over');
            });

            row.addEventListener('drop', function(e) {
                e.preventDefault();
                row.classList.remove('drag-over');
                var fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                var toIdx = parseInt(row.getAttribute('data-idx'), 10);

                if (isNaN(fromIdx) || isNaN(toIdx) || fromIdx === toIdx) return;

                var secId = null;
                var itemId = null;

                var backBtn = document.querySelector('.btn-back[onclick*="addDesignerItem"]');
                if (backBtn) {
                    var match = backBtn.getAttribute('onclick').match(/addDesignerItem\('([^']+)'\)/);
                    if (match) secId = match[1];
                }

                var titleEl = document.querySelector('.designer-editor-header h3');
                if (titleEl && secId) {
                    var sec = findSection(secId);
                    if (sec && sec.items) {
                        for (var k = 0; k < sec.items.length; k++) {
                            var possibleItemId = sec.items[k].id;
                            if (pageDesigns[secId] && pageDesigns[secId][possibleItemId]) {
                                itemId = possibleItemId;
                            }
                        }
                    }
                }

                if (secId && itemId && pageDesigns[secId] && pageDesigns[secId][itemId]) {
                    var fields = pageDesigns[secId][itemId].sidebarFields;
                    var moved = fields.splice(fromIdx, 1)[0];
                    if (moved) {
                        fields.splice(toIdx, 0, moved);
                        localStorage.setItem('smartlab_pageDesigns', JSON.stringify(pageDesigns));
                        renderDesignerForItem(secId, itemId);
                    }
                }
            });
        })(rows[i]);
    }
}

/* ===== RESET ===== */
function resetData() {
    if (!confirm('This will reset ALL data to defaults. Are you sure?')) return;
    if (!confirm('This action cannot be undone. Continue?')) return;

    localStorage.removeItem('smartlab_structure');
    localStorage.removeItem('smartlab_content');
    localStorage.removeItem('smartlab_pageDesigns');
    localStorage.removeItem('smartlab_reports');
    localStorage.removeItem('smartlab_users');
    localStorage.removeItem('smartlab_settings');

    structure = JSON.parse(JSON.stringify(SITE_STRUCTURE));
    content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    pageDesigns = {};
    reports = [];
    users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

    localStorage.setItem('smartlab_structure', JSON.stringify(structure));
    localStorage.setItem('smartlab_content', JSON.stringify(content));
    localStorage.setItem('smartlab_pageDesigns', JSON.stringify(pageDesigns));
    localStorage.setItem('smartlab_reports', JSON.stringify(reports));
    localStorage.setItem('smartlab_users', JSON.stringify(users));
    localStorage.setItem('smartlab_settings', JSON.stringify(settings));

    renderMain();
    showToast('All data has been reset to defaults');
}

/* ===== LOGOUT ===== */
function logout() {
    sessionStorage.removeItem('smartlab_admin_session');
    window.location.href = 'login.html';
}


/* ===== GLOBAL API ===== */
window.App = {
    navigate: navigate,
    setTab: function(t) { tab = t; renderSection(); },
    search: function(q) { searchQ = q; renderSection(); },
    setContentTab: function(k) { contentTab = k; renderContentManager(); },
    addSection: addSection,
    editSection: editSection,
    deleteSection: deleteSection,
    addItem: addItem,
    editItem: editItem,
    deleteItem: deleteItem,
    duplicateItem: duplicateItem,
    pickEmoji: pickEmoji,
    uploadIcon: uploadIcon,
    removeIcon: removeIcon,
    closeModal: closeModal,
    resetData: resetData,
    navigateContent: function(k) { contentTab = k; renderContentManager(); },
    saveContentField: saveContentField,
    addDesignerItem: addDesignerItem,
    removeDesignerField: removeDesignerField,
    saveDesignerField: saveDesignerField,
    selectDesignerItem: renderDesignerForItem,
    openDesignerItem: renderDesignerForItem,
    addReport: addReport,
    deleteReport: deleteReport,
    downloadReport: downloadReport,
    addUser: addUser,
    editUser: editUser,
    deleteUser: deleteUser,
    saveSettings: saveSettings,
    logout: logout,
    confirmAddSection: confirmAddSection,
    confirmEditSection: confirmEditSection,
    confirmAddUser: confirmAddUser,
    confirmEditUser: confirmEditUser,
    selectZoneTest: selectZoneTest,
    addZoneToTest: addZoneToTest,
    editZone: editZone,
    deleteZone: deleteZone,
    moveZone: moveZone,
    setZoneLayout: setZoneLayout,
    toggleZoneHeader: toggleZoneHeader,
    toggleZoneFooter: toggleZoneFooter,
    resetTestZones: resetTestZones,
    openHtmlEditor: openHtmlEditor,
    formatHtml: formatHtml,
    previewHtml: previewHtml,
    toggleHtmlPathType: toggleHtmlPathType,
    uploadLogo: uploadLogo,
    removeLogo: removeLogo,
    uploadFavicon: uploadFavicon,
    removeFavicon: removeFavicon
};

/* ===== APPLY ADMIN CONFIG ===== */
function applyAdminConfig() {
    try {
        var logo = settings.logo || '';
        var logoImg = document.querySelector('.sidebar-header img');
        if (logoImg) {
            if (logo && logo.indexOf('data:') === 0) {
                logoImg.src = logo;
            } else {
                logoImg.src = logo || '../assets/logo.png';
            }
        }
        var fav = settings.favicon || '';
        if (fav && fav.indexOf('data:') === 0) {
            var link = document.querySelector('link[rel="icon"]');
            if (link) link.href = fav;
        }
    } catch(e) {}
}

/* ===== INIT ===== */
try {
    renderSidebar();
    renderMain();
    applyAdminConfig();
} catch(e) {
    console.error('[smartLAB Admin] Init error:', e);
    var mc = document.getElementById('mainContent');
    if (mc) mc.innerHTML = '<div style="padding:40px;color:#f87171;"><h2>Admin Panel Error</h2><pre style="background:#1e293b;padding:16px;border-radius:8px;margin-top:12px;overflow-x:auto;font-size:12px;">' + e.message + '\n\n' + (e.stack || '') + '</pre></div>';
}

})();
