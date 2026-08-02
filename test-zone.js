/* smartLAB — Test Zone System
   Modular zone-based layout for test pages
   Version: 1.0.0 */

var TestZones = (function() {
    'use strict';

    /* ===== CONFIGURATION ===== */
    var STORAGE_KEY = 'smartlab_test_zones';
    var ZONE_VERSION = '1.0.0';

    var ZONE_TYPES = {
        video: { icon: '🎬', label: 'Video', labelAr: 'فيديو' },
        pdf: { icon: '📄', label: 'PDF Document', labelAr: 'ملف PDF' },
        presentation: { icon: '📊', label: 'Presentation', labelAr: 'عرض تقديمي' },
        text: { icon: '📝', label: 'Text / Explanation', labelAr: 'نص / شرح' },
        hardware: { icon: '🔧', label: 'Hardware Info', labelAr: 'معلومات العتاد' },
        firmware: { icon: '💾', label: 'Firmware Upload', labelAr: 'رفع الفيرموير' },
        image: { icon: '🖼️', label: 'Image', labelAr: 'صورة' },
        button: { icon: '🔘', label: 'Button / Link', labelAr: 'زر / رابط' },
        custom: { icon: '⚙️', label: 'Custom HTML', labelAr: 'HTML مخصص' }
    };

    var ZONE_POSITIONS = {
        'full': { icon: '⬛', label: 'Full Width', labelAr: 'عرض كامل' },
        'top': { icon: '⬆️', label: 'Top', labelAr: 'أعلى' },
        'bottom': { icon: '⬇️', label: 'Bottom', labelAr: 'أسفل' },
        'left': { icon: '⬅️', label: 'Left', labelAr: 'يسار' },
        'right': { icon: '➡️', label: 'Right', labelAr: 'يمين' },
        'center': { icon: '⬛', label: 'Center', labelAr: 'وسط' },
        'top-left': { icon: '↖️', label: 'Top Left', labelAr: 'أعلى يسار' },
        'top-center': { icon: '⬆️', label: 'Top Center', labelAr: 'أعلى وسط' },
        'top-right': { icon: '↗️', label: 'Top Right', labelAr: 'أعلى يمين' },
        'bottom-left': { icon: '↙️', label: 'Bottom Left', labelAr: 'أسفل يسار' },
        'bottom-center': { icon: '⬇️', label: 'Bottom Center', labelAr: 'أسفل وسط' },
        'bottom-right': { icon: '↘️', label: 'Bottom Right', labelAr: 'أسفل يمين' }
    };

    var LAYOUT_PRESETS = {
        '1-col': { label: '1 Column', cols: 1 },
        '2-col-equal': { label: '2 Columns Equal', cols: 2, class: 'col-2' },
        '2-col-1-2': { label: '2 Columns (1:2)', cols: 2, class: 'col-1-2' },
        '2-col-2-1': { label: '2 Columns (2:1)', cols: 2, class: 'col-2-1' },
        '3-col': { label: '3 Columns', cols: 3, class: 'col-3' },
        '2-row': { label: '2 Rows', cols: 1, rows: 2 }
    };

    var DEFAULT_ZONES = {
        'test-compressive': {
            layout: '2-col-equal',
            zones: [
                { id: 'z1', type: 'text', title: 'Test Explanation', titleAr: 'شرح الاختبار', content: '<h3>Compressive Strength Test</h3><p>This test determines the ultimate compressive load capacity of concrete specimens (cylinders or cubes) per ASTM C39 / BS 1881-116.</p><ul><li>Load rate: 0.25 ± 0.05 MPa/s</li><li>Reporting: strength to nearest 0.1 MPa</li><li>Aspect ratio correction for h/d ≠ 2.0</li></ul>', width: '100%', height: 'auto' },
                { id: 'z2', type: 'hardware', title: 'Required Equipment', titleAr: 'المعدات المطلوبة', hardware: [{ icon: '🏗️', name: 'Compression Machine', detail: '2000 kN capacity', status: 'online' }, { icon: '📏', name: 'Vernier Caliper', detail: '0.01mm precision', status: 'online' }, { icon: '⚖️', name: 'Balance', detail: '0.1g accuracy', status: 'offline' }], width: '100%', height: 'auto' },
                { id: 'z3', type: 'firmware', title: 'Device Firmware', titleAr: 'فيرموير الجهاز', width: '100%', height: 'auto' },
                { id: 'z4', type: 'video', title: 'Test Procedure Video', titleAr: 'فيديو إجراء الاختبار', videoSrc: '', width: '100%', height: 'auto' }
            ],
            showHeader: true,
            showFooter: true
        }
    };

    /* ===== STATE ===== */
    var pageZones = {};
    var currentPageId = null;
    var isEditorMode = false;
    var dragState = { dragging: null, over: null };

    /* ===== INITIALIZATION ===== */
    function init(pageId) {
        currentPageId = pageId;
        loadZones();
        renderFloatBar();
        applyLayout();
        refreshAdmin();
    }

    function loadZones() {
        var stored = null;
        try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e) {}
        pageZones = stored || {};
        var raw = pageZones[currentPageId];
        if (!raw || typeof raw !== 'object') {
            pageZones[currentPageId] = DEFAULT_ZONES[currentPageId] || createDefaultConfig();
        } else if (Array.isArray(raw)) {
            pageZones[currentPageId] = { layout: '1-col', zones: raw, showHeader: true, showFooter: true };
        } else if (raw.zones === undefined) {
            raw.zones = [];
            if (raw.layout === undefined) raw.layout = '1-col';
            if (raw.showHeader === undefined) raw.showHeader = true;
            if (raw.showFooter === undefined) raw.showFooter = true;
        }
    }

    function createDefaultConfig() {
        return {
            layout: '1-col',
            zones: [],
            showHeader: true,
            showFooter: true
        };
    }

    function saveZones() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pageZones));
    }

    function getConfig() {
        return pageZones[currentPageId] || createDefaultConfig();
    }

    /* ===== FLOATING CONTROLS BAR ===== */
    var adminKnown = false;
    var adminAuthed = false;
    function isAdmin() {
        return adminKnown && adminAuthed;
    }
    function refreshAdmin() {
        fetch('/api/auth?route=session', { credentials: 'same-origin' })
            .then(function(r){ return r.json(); })
            .then(function(d){
                var was = adminAuthed;
                adminKnown = true;
                adminAuthed = !!(d && d.authed);
                if (adminAuthed !== was) {
                    renderFloatBar();
                    applyLayout();
                }
            })
            .catch(function(){ adminKnown = true; adminAuthed = false; });
    }
    function renderFloatBar() {
        var existing = document.getElementById('zoneFloatBar');
        if (existing) existing.remove();

        if (!isAdmin()) return;

        var bar = document.createElement('div');
        bar.id = 'zoneFloatBar';
        bar.className = 'zone-float-bar';

        var config = getConfig();

        bar.innerHTML =
            createFloatBtn('toggle-header', config.showHeader ? '👁️' : '🙈', config.showHeader ? 'Hide Header' : 'Show Header', 'toggleHeader') +
            createFloatBtn('toggle-footer', config.showFooter ? '👁️' : '🙈', config.showFooter ? 'Hide Footer' : 'Show Footer', 'toggleFooter') +
            '<div style="width:1px;background:var(--zone-border);margin:4px 0;"></div>' +
            createFloatBtn('add-zone', '➕', 'Add Zone', 'openAddZone') +
            createFloatBtn('edit-zones', '✏️', 'Edit Layout', 'toggleEditor') +
            createFloatBtn('reset-zones', '🔄', 'Reset Layout', 'resetLayout');

        document.body.appendChild(bar);

        bar.querySelector('[data-action="toggleHeader"]').addEventListener('click', toggleHeader);
        bar.querySelector('[data-action="toggleFooter"]').addEventListener('click', toggleFooter);
        bar.querySelector('[data-action="openAddZone"]').addEventListener('click', openAddZone);
        bar.querySelector('[data-action="toggleEditor"]').addEventListener('click', toggleEditorMode);
        bar.querySelector('[data-action="resetLayout"]').addEventListener('click', resetLayout);
    }

    function createFloatBtn(id, icon, label, action) {
        return '<button class="zone-float-btn" id="zf-' + id + '" data-action="' + action + '">' +
            '<span>' + icon + '</span>' +
            '<span class="tooltip">' + label + '</span>' +
            '</button>';
    }

    /* ===== HEADER/FOOTER TOGGLE ===== */
    function toggleHeader() {
        var config = getConfig();
        config.showHeader = !config.showHeader;
        saveZones();
        document.body.classList.toggle('header-hidden', !config.showHeader);
        updateFloatBtn('toggle-header', config.showHeader ? '👁️' : '🙈', config.showHeader ? 'Hide Header' : 'Show Header');
    }

    function toggleFooter() {
        var config = getConfig();
        config.showFooter = !config.showFooter;
        saveZones();
        document.body.classList.toggle('footer-hidden', !config.showFooter);
        updateFloatBtn('toggle-footer', config.showFooter ? '👁️' : '🙈', config.showFooter ? 'Hide Footer' : 'Show Footer');
    }

    function updateFloatBtn(id, icon, label) {
        var btn = document.getElementById('zf-' + id);
        if (btn) {
            btn.querySelector('span:first-child').textContent = icon;
            btn.querySelector('.tooltip').textContent = label;
        }
    }

    /* ===== ZONE RENDERING ===== */
    function applyLayout() {
        var config = getConfig();
        var container = document.getElementById('zoneContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'zoneContainer';
            container.className = 'zone-container';
            var page = document.querySelector('.page');
            if (page) {
                var notesSection = page.querySelector('.notes-section');
                if (notesSection) {
                    page.insertBefore(container, notesSection);
                } else {
                    page.appendChild(container);
                }
            }
        }

        document.body.classList.toggle('header-hidden', !config.showHeader);
        document.body.classList.toggle('footer-hidden', !config.showFooter);

        container.innerHTML = '';

        if (config.zones.length === 0) {
            if (!isAdmin()) { container.style.display = 'none'; return; }
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:40px;margin-bottom:12px;">📦</div><div style="font-size:14px;">No zones configured. Click <strong>➕ Add Zone</strong> to start.</div></div>';
            return;
        }
        container.style.display = '';

        var layoutType = config.layout || '1-col';
        var preset = LAYOUT_PRESETS[layoutType];

        if (layoutType === '2-row') {
            var row1 = document.createElement('div');
            row1.className = 'zone-row';
            var row2 = document.createElement('div');
            row2.className = 'zone-row';
            var mid = Math.ceil(config.zones.length / 2);
            config.zones.forEach(function(zone, i) {
                var el = renderZone(zone, i);
                if (i < mid) row1.appendChild(el);
                else row2.appendChild(el);
            });
            container.appendChild(row1);
            container.appendChild(row2);
        } else if (preset && preset.cols > 1) {
            var row = document.createElement('div');
            row.className = 'zone-row ' + (preset.class || '');
            config.zones.forEach(function(zone, i) {
                row.appendChild(renderZone(zone, i));
            });
            container.appendChild(row);
        } else {
            config.zones.forEach(function(zone, i) {
                container.appendChild(renderZone(zone, i));
            });
        }
    }

    function renderZone(zone, index) {
        var el = document.createElement('div');
        el.className = 'zone zone-' + zone.type;
        el.setAttribute('data-zone-id', zone.id);
        el.setAttribute('data-zone-index', index);
        el.setAttribute('draggable', isEditorMode ? 'true' : 'false');

        if (zone.width && zone.width !== '100%') el.style.width = zone.width;

        var typeInfo = ZONE_TYPES[zone.type] || ZONE_TYPES.custom;
        var posInfo = ZONE_POSITIONS[zone.position] || ZONE_POSITIONS.full;

        /* Position badge */
        var posBadge = zone.position && zone.position !== 'full' ?
            '<span class="zone-pos-badge" title="' + posInfo.label + '">' + posInfo.icon + '</span>' : '';

        el.innerHTML =
            '<div class="zone-header">' +
                '<div class="zone-title">' +
                    '<span class="zone-title-icon">' + typeInfo.icon + '</span>' +
                    posBadge +
                    '<span>' + esc(zone.title || typeInfo.label) + '</span>' +
                '</div>' +
                '<div class="zone-controls">' +
                    (isEditorMode ? '<button class="zone-ctrl-btn" data-action="edit" title="Edit Zone">✏️</button>' : '') +
                    (isEditorMode ? '<button class="zone-ctrl-btn" data-action="moveUp" title="Move Up">⬆️</button>' : '') +
                    (isEditorMode ? '<button class="zone-ctrl-btn" data-action="moveDown" title="Move Down">⬇️</button>' : '') +
                    (isEditorMode ? '<button class="zone-ctrl-btn" data-action="delete" title="Delete Zone" style="color:var(--accent-red);">🗑️</button>' : '') +
                    '<button class="zone-ctrl-btn" data-action="collapse" title="Collapse">➖</button>' +
                '</div>' +
            '</div>' +
            '<div class="zone-body">' + renderZoneContent(zone) + '</div>';

        el.querySelector('[data-action="collapse"]').addEventListener('click', function() {
            var body = el.querySelector('.zone-body');
            body.style.display = body.style.display === 'none' ? '' : 'none';
            this.textContent = body.style.display === 'none' ? '➕' : '➖';
        });

        if (isEditorMode) {
            var editBtn = el.querySelector('[data-action="edit"]');
            if (editBtn) editBtn.addEventListener('click', function() { openEditZone(zone); });

            var moveUpBtn = el.querySelector('[data-action="moveUp"]');
            if (moveUpBtn) moveUpBtn.addEventListener('click', function() { moveZone(index, -1); });

            var moveDownBtn = el.querySelector('[data-action="moveDown"]');
            if (moveDownBtn) moveDownBtn.addEventListener('click', function() { moveZone(index, 1); });

            var deleteBtn = el.querySelector('[data-action="delete"]');
            if (deleteBtn) deleteBtn.addEventListener('click', function() { deleteZone(index); });

            el.addEventListener('dragstart', function(e) {
                dragState.dragging = index;
                el.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            el.addEventListener('dragend', function() {
                el.classList.remove('dragging');
                dragState.dragging = null;
            });

            el.addEventListener('dragover', function(e) {
                e.preventDefault();
                el.classList.add('drag-over');
            });

            el.addEventListener('dragleave', function() {
                el.classList.remove('drag-over');
            });

            el.addEventListener('drop', function(e) {
                e.preventDefault();
                el.classList.remove('drag-over');
                if (dragState.dragging !== null && dragState.dragging !== index) {
                    var config = getConfig();
                    var moved = config.zones.splice(dragState.dragging, 1)[0];
                    config.zones.splice(index, 0, moved);
                    saveZones();
                    applyLayout();
                }
            });
        }

        return el;
    }

    function renderZoneContent(zone) {
        switch(zone.type) {
            case 'video': return renderVideoZone(zone);
            case 'pdf': return renderPdfZone(zone);
            case 'presentation': return renderPresentationZone(zone);
            case 'text': return renderTextZone(zone);
            case 'hardware': return renderHardwareZone(zone);
            case 'firmware': return renderFirmwareZone(zone);
            case 'image': return renderImageZone(zone);
            case 'button': return renderButtonZone(zone);
            case 'custom': return renderCustomZone(zone);
            default: return '<div style="color:var(--text-muted);text-align:center;padding:20px;">Unknown zone type</div>';
        }
    }

    function renderVideoZone(zone) {
        var src = zone.videoSrc || '';
        var poster = zone.posterSrc || '';
        var videoHtml = src ?
            '<video controls preload="metadata" style="width:100%;height:100%;object-fit:contain;"' + (poster ? ' poster="' + esc(poster) + '"' : '') + '><source src="' + esc(src) + '">Your browser does not support video.</video>' :
            '<div class="video-overlay">' +
                '<div class="video-overlay-icon">🎬</div>' +
                '<div class="video-overlay-text">No video loaded</div>' +
                '<button class="video-overlay-btn" onclick="TestZones.uploadVideo(\'' + zone.id + '\')">Upload Video</button>' +
            '</div>';
        return '<div style="position:relative;border-radius:8px;overflow:hidden;background:#000;aspect-ratio:16/9;">' + videoHtml + '</div>';
    }

    function renderPdfZone(zone) {
        var src = zone.pdfSrc || '';
        if (src) {
            return '<iframe class="pdf-viewer" src="' + esc(src) + '" style="width:100%;min-height:400px;border:none;border-radius:8px;"></iframe>';
        }
        return '<div class="pdf-upload" onclick="TestZones.uploadPdf(\'' + zone.id + '\')">' +
            '<div class="pdf-upload-icon">📄</div>' +
            '<div class="pdf-upload-text">Drop PDF here or click to upload</div>' +
            '<div class="pdf-upload-hint">Supports PDF files up to 50MB</div>' +
        '</div>';
    }

    function renderPresentationZone(zone) {
        var slides = zone.slides || [];
        if (slides.length === 0) {
            return '<div class="pdf-upload" onclick="TestZones.uploadPresentation(\'' + zone.id + '\')">' +
                '<div class="pdf-upload-icon">📊</div>' +
                '<div class="pdf-upload-text">Add presentation slides</div>' +
                '<div class="pdf-upload-hint">Upload images or create text slides</div>' +
            '</div>';
        }

        var slidesHtml = slides.map(function(slide, i) {
            return '<div class="slide' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '">' +
                '<div class="slide-content">' +
                (slide.image ? '<img class="slide-image" src="' + esc(slide.image) + '">' : '') +
                (slide.title ? '<div class="slide-title">' + esc(slide.title) + '</div>' : '') +
                (slide.text ? '<div class="slide-text">' + esc(slide.text) + '</div>' : '') +
                '</div></div>';
        }).join('');

        return '<div class="slides-container" data-zone="' + zone.id + '">' + slidesHtml + '</div>' +
            '<div class="slide-nav">' +
                '<button onclick="TestZones.prevSlide(\'' + zone.id + '\')">◀</button>' +
                '<span class="slide-counter" data-counter="' + zone.id + '">1 / ' + slides.length + '</span>' +
                '<button onclick="TestZones.nextSlide(\'' + zone.id + '\')">▶</button>' +
            '</div>';
    }

    function renderTextZone(zone) {
        var content = zone.content || '<p style="color:var(--text-muted);">Click edit to add content...</p>';
        return '<div class="zone-text-content">' + content + '</div>';
    }

    function renderHardwareZone(zone) {
        var items = zone.hardware || [];
        if (items.length === 0) {
            return '<div style="text-align:center;padding:20px;color:var(--text-muted);">No hardware configured</div>';
        }

        var gridHtml = items.map(function(item) {
            var statusClass = item.status || 'offline';
            return '<div class="hw-item">' +
                '<div class="hw-icon">' + (item.icon || '🔧') + '</div>' +
                '<div class="hw-info">' +
                    '<div class="hw-name">' + esc(item.name || 'Unknown') + '</div>' +
                    '<div class="hw-detail">' + esc(item.detail || '') + '</div>' +
                '</div>' +
                '<div class="hw-status ' + statusClass + '"></div>' +
            '</div>';
        }).join('');

        return '<div class="hw-grid">' + gridHtml + '</div>';
    }

    function renderFirmwareZone(zone) {
        return '<div class="fw-layout">' +
            '<div class="fw-upload-area">' +
                '<div class="fw-dropzone" id="fwDropzone-' + zone.id + '">' +
                    '<div class="fw-dropzone-icon">💾</div>' +
                    '<div class="fw-dropzone-text">Drop firmware file here</div>' +
                    '<div class="fw-dropzone-hint">Supports .bin, .hex, .elf files</div>' +
                '</div>' +
                '<div class="fw-file-info" id="fwFileInfo-' + zone.id + '">' +
                    '<span class="fw-file-icon">📦</span>' +
                    '<span class="fw-file-name" id="fwFileName-' + zone.id + '"></span>' +
                    '<span class="fw-file-size" id="fwFileSize-' + zone.id + '"></span>' +
                    '<button class="fw-file-remove" onclick="TestZones.removeFirmware(\'' + zone.id + '\')">✕</button>' +
                '</div>' +
                '<div class="fw-progress" id="fwProgress-' + zone.id + '" style="display:none;">' +
                    '<div class="fw-progress-bar" id="fwProgressBar-' + zone.id + '"></div>' +
                '</div>' +
            '</div>' +
            '<div class="fw-status-panel">' +
                '<div class="fw-status-box">' +
                    '<div class="fw-status-title">Firmware Status</div>' +
                    '<div class="fw-status-row"><span class="fw-status-label">Version</span><span class="fw-status-value" id="fwVersion-' + zone.id + '">--</span></div>' +
                    '<div class="fw-status-row"><span class="fw-status-label">Size</span><span class="fw-status-value" id="fwSizeStatus-' + zone.id + '">--</span></div>' +
                    '<div class="fw-status-row"><span class="fw-status-label">Status</span><span class="fw-status-value" id="fwStatus-' + zone.id + '" style="color:var(--accent-red);">Not loaded</span></div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function renderImageZone(zone) {
        var src = zone.imageSrc || '';
        if (src) {
            return '<div style="text-align:center;"><img src="' + esc(src) + '" alt="' + esc(zone.title || 'Image') + '" style="max-width:100%;max-height:400px;border-radius:8px;object-fit:contain;"></div>';
        }
        return '<div class="pdf-upload" onclick="TestZones.uploadImage(\'' + zone.id + '\')">' +
            '<div class="pdf-upload-icon">🖼️</div>' +
            '<div class="pdf-upload-text">Drop image here or click to upload</div>' +
            '<div class="pdf-upload-hint">Supports JPG, PNG, GIF, WebP</div>' +
        '</div>';
    }

    function renderButtonZone(zone) {
        var buttons = zone.buttons || [];
        if (buttons.length === 0) {
            return '<div style="text-align:center;padding:20px;color:var(--text-muted);">No buttons configured. Click edit to add buttons.</div>';
        }
        var html = '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:8px 0;">';
        buttons.forEach(function(btn) {
            var style = 'padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;';
            var color = btn.color || '#3b82f6';
            style += 'background:' + color + ';color:#fff;border:none;';
            html += '<a href="' + esc(btn.url || '#') + '" style="' + style + '" target="' + (btn.target || '_self') + '">';
            html += (btn.icon || '') + ' ' + esc(btn.label || 'Button');
            html += '</a>';
        });
        html += '</div>';
        return html;
    }

    function renderCustomZone(zone) {
        return '<div style="min-height:80px;">' + (zone.content || '<div style="text-align:center;padding:20px;color:var(--text-muted);">Custom zone content</div>') + '</div>';
    }

    /* ===== ZONE OPERATIONS ===== */
    function moveZone(index, direction) {
        var config = getConfig();
        var newIndex = index + direction;
        if (newIndex < 0 || newIndex >= config.zones.length) return;
        var temp = config.zones[index];
        config.zones[index] = config.zones[newIndex];
        config.zones[newIndex] = temp;
        saveZones();
        applyLayout();
    }

    function deleteZone(index) {
        if (!confirm('Delete this zone?')) return;
        var config = getConfig();
        config.zones.splice(index, 1);
        saveZones();
        applyLayout();
    }

    function resetLayout() {
        if (!confirm('Reset all zones to default? This cannot be undone.')) return;
        delete pageZones[currentPageId];
        saveZones();
        applyLayout();
        renderFloatBar();
    }

    /* ===== ADD/EDIT ZONE ===== */
    function openAddZone() {
        var overlay = document.createElement('div');
        overlay.className = 'zone-editor-overlay';
        overlay.id = 'zoneEditorOverlay';

        var typesHtml = Object.keys(ZONE_TYPES).map(function(key) {
            var t = ZONE_TYPES[key];
            return '<option value="' + key + '">' + t.icon + ' ' + t.label + '</option>';
        }).join('');

        var layoutHtml = Object.keys(LAYOUT_PRESETS).map(function(key) {
            var l = LAYOUT_PRESETS[key];
            return '<option value="' + key + '">' + l.label + '</option>';
        }).join('');

        var config = getConfig();

        overlay.innerHTML =
            '<div class="zone-editor">' +
                '<div class="zone-editor-header">' +
                    '<div class="zone-editor-title">Add New Zone</div>' +
                    '<button class="zone-editor-close" onclick="TestZones.closeEditor()">✕</button>' +
                '</div>' +
                '<div class="zone-editor-body">' +
                    '<div class="zone-editor-field">' +
                        '<label class="zone-editor-label">Zone Type</label>' +
                        '<select class="zone-editor-select" id="zoneTypeSelect">' + typesHtml + '</select>' +
                    '</div>' +
                    '<div class="zone-editor-field">' +
                        '<label class="zone-editor-label">Title (English)</label>' +
                        '<input class="zone-editor-input" id="zoneTitleInput" placeholder="Zone title...">' +
                    '</div>' +
                    '<div class="zone-editor-field">' +
                        '<label class="zone-editor-label">Title (Arabic)</label>' +
                        '<input class="zone-editor-input" id="zoneTitleArInput" placeholder="عنوان المنطقة...">' +
                    '</div>' +
                    '<div class="zone-editor-field">' +
                        '<label class="zone-editor-label">Layout</label>' +
                        '<select class="zone-editor-select" id="zoneLayoutSelect">' + layoutHtml + '</select>' +
                    '</div>' +
                    '<div class="zone-editor-row">' +
                        '<div class="zone-editor-field">' +
                            '<label class="zone-editor-label">Width</label>' +
                            '<select class="zone-editor-select" id="zoneWidthSelect">' +
                                '<option value="100%">Full Width</option>' +
                                '<option value="75%">75%</option>' +
                                '<option value="50%">50%</option>' +
                                '<option value="33%">33%</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="zone-editor-field">' +
                            '<label class="zone-editor-label">Height</label>' +
                            '<select class="zone-editor-select" id="zoneHeightSelect">' +
                                '<option value="auto">Auto</option>' +
                                '<option value="200px">200px</option>' +
                                '<option value="300px">300px</option>' +
                                '<option value="400px">400px</option>' +
                                '<option value="500px">500px</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div id="zoneTypeFields"></div>' +
                '</div>' +
                '<div class="zone-editor-footer">' +
                    '<button class="zone-editor-btn zone-editor-btn-cancel" onclick="TestZones.closeEditor()">Cancel</button>' +
                    '<button class="zone-editor-btn zone-editor-btn-save" onclick="TestZones.saveNewZone()">Add Zone</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        setTimeout(function() { overlay.classList.add('visible'); }, 10);

        document.getElementById('zoneLayoutSelect').value = config.layout || '1-col';
        document.getElementById('zoneTypeSelect').addEventListener('change', updateTypeFields);
        updateTypeFields();
    }

    function updateTypeFields() {
        var type = document.getElementById('zoneTypeSelect').value;
        var container = document.getElementById('zoneTypeFields');
        var html = '';

        if (type === 'text') {
            html = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">Content (HTML)</label>' +
                '<textarea class="zone-editor-input" id="zoneContentInput" rows="6" placeholder="Enter HTML content..."></textarea>' +
            '</div>';
        } else if (type === 'video') {
            html = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">Video URL</label>' +
                '<input class="zone-editor-input" id="zoneVideoSrcInput" placeholder="https://...">' +
            '</div>';
        } else if (type === 'pdf') {
            html = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">PDF URL</label>' +
                '<input class="zone-editor-input" id="zonePdfSrcInput" placeholder="https://...">' +
            '</div>';
        } else if (type === 'hardware') {
            html = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">Hardware Items (one per line: icon|name|detail|status)</label>' +
                '<textarea class="zone-editor-input" id="zoneHardwareInput" rows="4" placeholder="🏗️|Compression Machine|2000 kN|online\n📏|Vernier Caliper|0.01mm|online"></textarea>' +
            '</div>';
        } else if (type === 'custom') {
            html = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">Custom Content (HTML)</label>' +
                '<textarea class="zone-editor-input" id="zoneCustomContentInput" rows="6" placeholder="Custom HTML content..."></textarea>' +
            '</div>';
        }

        container.innerHTML = html;
    }

    function saveNewZone() {
        var type = document.getElementById('zoneTypeSelect').value;
        var title = document.getElementById('zoneTitleInput').value || ZONE_TYPES[type].label;
        var titleAr = document.getElementById('zoneTitleArInput').value || ZONE_TYPES[type].labelAr;
        var width = document.getElementById('zoneWidthSelect').value;
        var height = document.getElementById('zoneHeightSelect').value;
        var layout = document.getElementById('zoneLayoutSelect').value;

        var zone = {
            id: 'z' + Date.now(),
            type: type,
            title: title,
            titleAr: titleAr,
            width: width,
            height: height
        };

        if (type === 'text') {
            zone.content = document.getElementById('zoneContentInput') ? document.getElementById('zoneContentInput').value : '';
        } else if (type === 'video') {
            zone.videoSrc = document.getElementById('zoneVideoSrcInput') ? document.getElementById('zoneVideoSrcInput').value : '';
        } else if (type === 'pdf') {
            zone.pdfSrc = document.getElementById('zonePdfSrcInput') ? document.getElementById('zonePdfSrcInput').value : '';
        } else if (type === 'hardware') {
            var hwText = document.getElementById('zoneHardwareInput') ? document.getElementById('zoneHardwareInput').value : '';
            zone.hardware = hwText.split('\n').filter(function(l) { return l.trim(); }).map(function(line) {
                var parts = line.split('|');
                return { icon: (parts[0] || '🔧').trim(), name: (parts[1] || 'Unknown').trim(), detail: (parts[2] || '').trim(), status: (parts[3] || 'offline').trim() };
            });
        } else if (type === 'custom') {
            zone.content = document.getElementById('zoneCustomContentInput') ? document.getElementById('zoneCustomContentInput').value : '';
        }

        var config = getConfig();
        config.layout = layout;
        config.zones.push(zone);
        saveZones();
        closeEditor();
        applyLayout();
    }

    function openEditZone(zone) {
        var overlay = document.createElement('div');
        overlay.className = 'zone-editor-overlay';
        overlay.id = 'zoneEditorOverlay';

        var typesHtml = Object.keys(ZONE_TYPES).map(function(key) {
            var t = ZONE_TYPES[key];
            return '<option value="' + key + '"' + (key === zone.type ? ' selected' : '') + '>' + t.icon + ' ' + t.label + '</option>';
        }).join('');

        overlay.innerHTML =
            '<div class="zone-editor">' +
                '<div class="zone-editor-header">' +
                    '<div class="zone-editor-title">Edit Zone</div>' +
                    '<button class="zone-editor-close" onclick="TestZones.closeEditor()">✕</button>' +
                '</div>' +
                '<div class="zone-editor-body">' +
                    '<div class="zone-editor-field">' +
                        '<label class="zone-editor-label">Title (English)</label>' +
                        '<input class="zone-editor-input" id="editZoneTitleInput" value="' + esc(zone.title || '') + '">' +
                    '</div>' +
                    '<div class="zone-editor-field">' +
                        '<label class="zone-editor-label">Title (Arabic)</label>' +
                        '<input class="zone-editor-input" id="editZoneTitleArInput" value="' + esc(zone.titleAr || '') + '">' +
                    '</div>' +
                    '<div class="zone-editor-row">' +
                        '<div class="zone-editor-field">' +
                            '<label class="zone-editor-label">Width</label>' +
                            '<select class="zone-editor-select" id="editZoneWidthSelect">' +
                                '<option value="100%"' + (zone.width === '100%' ? ' selected' : '') + '>Full Width</option>' +
                                '<option value="75%"' + (zone.width === '75%' ? ' selected' : '') + '>75%</option>' +
                                '<option value="50%"' + (zone.width === '50%' ? ' selected' : '') + '>50%</option>' +
                                '<option value="33%"' + (zone.width === '33%' ? ' selected' : '') + '>33%</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div id="editZoneTypeFields"></div>' +
                '</div>' +
                '<div class="zone-editor-footer">' +
                    '<button class="zone-editor-btn zone-editor-btn-cancel" onclick="TestZones.closeEditor()">Cancel</button>' +
                    '<button class="zone-editor-btn zone-editor-btn-save" onclick="TestZones.saveEditZone(\'' + zone.id + '\')">Save Changes</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        setTimeout(function() { overlay.classList.add('visible'); }, 10);

        var fieldsContainer = document.getElementById('editZoneTypeFields');
        if (zone.type === 'text' || zone.type === 'custom') {
            fieldsContainer.innerHTML = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">Content (HTML)</label>' +
                '<textarea class="zone-editor-input" id="editZoneContentInput" rows="6">' + esc(zone.content || '') + '</textarea>' +
            '</div>';
        } else if (zone.type === 'video') {
            fieldsContainer.innerHTML = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">Video URL</label>' +
                '<input class="zone-editor-input" id="editZoneVideoSrcInput" value="' + esc(zone.videoSrc || '') + '">' +
            '</div>';
        } else if (zone.type === 'pdf') {
            fieldsContainer.innerHTML = '<div class="zone-editor-field">' +
                '<label class="zone-editor-label">PDF URL</label>' +
                '<input class="zone-editor-input" id="editZonePdfSrcInput" value="' + esc(zone.pdfSrc || '') + '">' +
            '</div>';
        }
    }

    function saveEditZone(zoneId) {
        var config = getConfig();
        var zone = config.zones.find(function(z) { return z.id === zoneId; });
        if (!zone) return;

        zone.title = document.getElementById('editZoneTitleInput').value;
        zone.titleAr = document.getElementById('editZoneTitleArInput').value;
        zone.width = document.getElementById('editZoneWidthSelect').value;

        if (zone.type === 'text' || zone.type === 'custom') {
            var contentEl = document.getElementById('editZoneContentInput');
            if (contentEl) zone.content = contentEl.value;
        } else if (zone.type === 'video') {
            var videoEl = document.getElementById('editZoneVideoSrcInput');
            if (videoEl) zone.videoSrc = videoEl.value;
        } else if (zone.type === 'pdf') {
            var pdfEl = document.getElementById('editZonePdfSrcInput');
            if (pdfEl) zone.pdfSrc = pdfEl.value;
        }

        saveZones();
        closeEditor();
        applyLayout();
    }

    function closeEditor() {
        var overlay = document.getElementById('zoneEditorOverlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(function() { overlay.remove(); }, 300);
        }
    }

    /* ===== EDITOR MODE ===== */
    function toggleEditorMode() {
        isEditorMode = !isEditorMode;
        var btn = document.getElementById('zf-edit-zones');
        if (btn) btn.classList.toggle('active', isEditorMode);
        applyLayout();
    }

    /* ===== FILE UPLOADS ===== */
    function uploadVideo(zoneId) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var url = URL.createObjectURL(file);
            var config = getConfig();
            var zone = config.zones.find(function(z) { return z.id === zoneId; });
            if (zone) {
                zone.videoSrc = url;
                zone.videoFileName = file.name;
                saveZones();
                applyLayout();
            }
        };
        input.click();
    }

    function uploadPdf(zoneId) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var url = URL.createObjectURL(file);
            var config = getConfig();
            var zone = config.zones.find(function(z) { return z.id === zoneId; });
            if (zone) {
                zone.pdfSrc = url;
                zone.pdfFileName = file.name;
                saveZones();
                applyLayout();
            }
        };
        input.click();
    }

    function uploadImage(zoneId) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var url = URL.createObjectURL(file);
            var config = getConfig();
            var zone = config.zones.find(function(z) { return z.id === zoneId; });
            if (zone) {
                zone.imageSrc = url;
                zone.imageFileName = file.name;
                saveZones();
                applyLayout();
            }
        };
        input.click();
    }

    function uploadPresentation(zoneId) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = function(e) {
            var files = Array.from(e.target.files);
            if (files.length === 0) return;
            var slides = files.map(function(file) {
                return { image: URL.createObjectURL(file), title: file.name.replace(/\.[^.]+$/, ''), text: '' };
            });
            var config = getConfig();
            var zone = config.zones.find(function(z) { return z.id === zoneId; });
            if (zone) {
                zone.slides = slides;
                saveZones();
                applyLayout();
            }
        };
        input.click();
    }

    /* ===== SLIDESHOW ===== */
    function nextSlide(zoneId) {
        var container = document.querySelector('.slides-container[data-zone="' + zoneId + '"]');
        if (!container) return;
        var slides = container.querySelectorAll('.slide');
        var current = container.querySelector('.slide.active');
        var idx = Array.from(slides).indexOf(current);
        var next = (idx + 1) % slides.length;
        current.classList.remove('active');
        slides[next].classList.add('active');
        updateSlideCounter(zoneId, next + 1, slides.length);
    }

    function prevSlide(zoneId) {
        var container = document.querySelector('.slides-container[data-zone="' + zoneId + '"]');
        if (!container) return;
        var slides = container.querySelectorAll('.slide');
        var current = container.querySelector('.slide.active');
        var idx = Array.from(slides).indexOf(current);
        var prev = (idx - 1 + slides.length) % slides.length;
        current.classList.remove('active');
        slides[prev].classList.add('active');
        updateSlideCounter(zoneId, prev + 1, slides.length);
    }

    function updateSlideCounter(zoneId, current, total) {
        var counter = document.querySelector('[data-counter="' + zoneId + '"]');
        if (counter) counter.textContent = current + ' / ' + total;
    }

    /* ===== FIRMWARE ===== */
    function removeFirmware(zoneId) {
        var config = getConfig();
        var zone = config.zones.find(function(z) { return z.id === zoneId; });
        if (zone) {
            zone.firmwareFile = null;
            saveZones();
            applyLayout();
        }
    }

    /* ===== PUBLIC API ===== */
    return {
        init: init,
        getConfig: getConfig,
        toggleHeader: toggleHeader,
        toggleFooter: toggleFooter,
        openAddZone: openAddZone,
        openEditZone: openEditZone,
        saveNewZone: saveNewZone,
        saveEditZone: saveEditZone,
        closeEditor: closeEditor,
        toggleEditorMode: toggleEditorMode,
        moveZone: moveZone,
        deleteZone: deleteZone,
        resetLayout: resetLayout,
        applyLayout: applyLayout,
        uploadVideo: uploadVideo,
        uploadPdf: uploadPdf,
        uploadImage: uploadImage,
        uploadPresentation: uploadPresentation,
        nextSlide: nextSlide,
        prevSlide: prevSlide,
        removeFirmware: removeFirmware,
        ZONE_TYPES: ZONE_TYPES,
        ZONE_POSITIONS: ZONE_POSITIONS,
        LAYOUT_PRESETS: LAYOUT_PRESETS
    };
})();

/* eslint-disable no-unused-vars */
function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}
