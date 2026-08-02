/* smartLAB — Shared Manual Test Mode (tab switching + report export) */
(function() {
    var currentMode = null;

    function isAr() {
        try { return (localStorage.getItem('smartlab_lang') || 'en') === 'ar'; } catch(e) { return false; }
    }

    function initTestTabs() {
        var tabs = document.querySelectorAll('#testTabBar .test-tab');
        var normalMode = document.getElementById('normalTestMode');
        var smartlabContent = document.getElementById('smartlabContent');
        if (!tabs.length || !normalMode || !smartlabContent) return;

        function switchTestMode(mode) {
            currentMode = mode;
            tabs.forEach(function(t) { t.classList.remove('active'); });
            var sel = document.querySelector('.test-tab[data-mode="' + mode + '"]');
            if (sel) sel.classList.add('active');
            normalMode.style.display = (mode === 'normal') ? 'block' : 'none';
            smartlabContent.style.display = (mode === 'normal') ? 'none' : 'block';
            var zc = document.getElementById('zoneContainer');
            if (zc) zc.style.display = (mode === 'normal') ? 'none' : '';
            try { localStorage.setItem('smartlab_test_mode', mode); } catch(e) {}
        }

        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                switchTestMode(this.getAttribute('data-mode'));
            });
        });

        var saved = 'normal';
        try { saved = localStorage.getItem('smartlab_test_mode') || 'normal'; } catch(e) {}
        switchTestMode(saved);

        var subTabs = document.querySelectorAll('.sl-sub-tab');
        var stagesEl = document.getElementById('slStagesContent');
        var hwEl = document.getElementById('slHardwareContent');
        if (subTabs.length && stagesEl && hwEl) {
            subTabs.forEach(function(st) {
                st.addEventListener('click', function() {
                    subTabs.forEach(function(s) { s.classList.remove('active'); });
                    this.classList.add('active');
                    if (this.getAttribute('data-sub') === 'stages') {
                        stagesEl.style.display = 'block';
                        hwEl.style.display = 'none';
                    } else {
                        stagesEl.style.display = 'none';
                        hwEl.style.display = 'block';
                    }
                });
            });
        }
    }

    function manualAlert(type, msg) {
        var el = document.getElementById('manualAlert');
        if (!el) return;
        el.className = 'manual-alert ' + type;
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(function() { el.style.display = 'none'; }, 5000);
    }

    var manualLocation = null;
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                manualLocation = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) };
            });
        }
    } catch(e) {}

    function manualReportFields() {
        function val(id) {
            var el = document.getElementById(id);
            return el ? (el.value || '').trim() : '';
        }
        return {
            lab: val('m-labName') || 'smartLAB Testing Lab',
            sample: val('m-sampleNo') || '--',
            specs: val('m-specs') || '--',
            tech: val('m-tech') || '--',
            eng: val('m-eng') || '--'
        };
    }

    function manualTestTitle() {
        return (typeof manualTestTitleStr !== 'undefined') ? manualTestTitleStr : 'Manual Test';
    }

    function safeTitle() {
        return manualTestTitle().replace(/[^a-z0-9]+/gi, '_');
    }

    function manualExportExcel() {
        if (typeof XLSX === 'undefined') { manualAlert('error', 'Excel library not loaded'); return; }
        var wb = XLSX.utils.book_new();
        var f = manualReportFields();
        var title = manualTestTitle();
        var data = [
            [f.lab],
            [title + ' (Manual)'],
            [],
            ['Sample #', f.sample],
            ['Specs', f.specs],
            ['Date', new Date().toLocaleString()],
            ['Location', manualLocation ? (manualLocation.lat + ', ' + manualLocation.lng) : '--'],
            ['Technician', f.tech],
            ['Engineer', f.eng],
            [],
            ['Parameter', 'Value', 'Unit', 'Status']
        ];
        (window.manualResults || []).forEach(function(r) {
            data.push([r.label, r.value, r.unit || '', r.status || '--']);
        });
        data.push(['', '', '', '']);
        data.push(['Generated: ' + new Date().toLocaleString(), '', '', '']);
        var ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 34 }, { wch: 18 }, { wch: 12 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Manual Results');
        XLSX.writeFile(wb, safeTitle() + '_Manual_Report.xlsx');
        manualAlert('success', 'Excel ' + (isAr() ? 'تم الحفظ' : 'saved'));
    }

    function manualExportPdf() {
        if (typeof jspdf === 'undefined') { manualAlert('error', 'PDF library not loaded'); return; }
        var doc = new jspdf.jsPDF();
        var pw = doc.internal.pageSize.getWidth();
        var f = manualReportFields();
        var title = manualTestTitle();
        doc.setFontSize(16);
        doc.setTextColor(20, 30, 55);
        doc.text(f.lab, pw / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(180, 160, 60);
        doc.text(title + ' — Manual Report', pw / 2, 33, { align: 'center' });
        var my = 45;
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text('Sample #: ' + f.sample, 18, my);
        doc.text('Specs: ' + f.specs, 18, my + 6);
        doc.text('Date: ' + new Date().toLocaleString(), 18, my + 12);
        doc.text('Location: ' + (manualLocation ? (manualLocation.lat + ', ' + manualLocation.lng) : '--'), 18, my + 18);
        doc.text('Tech: ' + f.tech + '  |  Eng: ' + f.eng, 18, my + 24);
        var rows = (window.manualResults || []).map(function(r) {
            return [r.label, r.value + (r.unit ? ' ' + r.unit : ''), r.status || '--'];
        });
        if (doc.autoTable) {
            doc.autoTable({
                startY: my + 32,
                head: [['Parameter', 'Value', 'Status']],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                columnStyles: { 0: { cellWidth: 74 }, 1: { cellWidth: 44 }, 2: { cellWidth: 20 } }
            });
            var fy = doc.lastAutoTable.finalY + 8;
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text('Generated: ' + new Date().toLocaleString(), 14, fy + 4);
        }
        doc.save(safeTitle() + '_Manual_Report.pdf');
        manualAlert('success', 'PDF ' + (isAr() ? 'تم الحفظ' : 'saved'));
    }

    function manualExportPrint() {
        var f = manualReportFields();
        var title = manualTestTitle();
        var locStr = manualLocation ? (manualLocation.lat + ', ' + manualLocation.lng) : '--';
        var html = '<div style="text-align:center;margin-bottom:16px;">';
        html += '<h1 style="font-size:18px;margin-bottom:2px;">' + f.lab + '</h1>';
        html += '<p style="font-size:11px;color:#888;">' + title + ' — Manual Report</p></div>';
        html += '<table style="width:100%;font-size:11px;margin-bottom:12px;border-collapse:collapse;">';
        html += '<tr><td style="padding:2px 8px;width:140px;color:#666;">Test:</td><td style="padding:2px 8px;">' + title + '</td></tr>';
        html += '<tr><td style="padding:2px 8px;color:#666;">Sample #:</td><td style="padding:2px 8px;">' + f.sample + '</td></tr>';
        html += '<tr><td style="padding:2px 8px;color:#666;">Specs:</td><td style="padding:2px 8px;">' + f.specs + '</td></tr>';
        html += '<tr><td style="padding:2px 8px;color:#666;">Date:</td><td style="padding:2px 8px;">' + new Date().toLocaleString() + '</td></tr>';
        html += '<tr><td style="padding:2px 8px;color:#666;">Location:</td><td style="padding:2px 8px;">' + locStr + '</td></tr>';
        html += '<tr><td style="padding:2px 8px;color:#666;">Technician:</td><td style="padding:2px 8px;">' + f.tech + '</td><td style="padding:2px 8px;color:#666;">Engineer:</td><td style="padding:2px 8px;">' + f.eng + '</td></tr>';
        html += '</table>';
        html += '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px;">';
        html += '<tr style="background:#3b82f6;color:#fff;">';
        html += '<th style="padding:6px 10px;border:1px solid #3b82f6;text-align:left;">Parameter</th>';
        html += '<th style="padding:6px 10px;border:1px solid #3b82f6;text-align:right;">Value</th>';
        html += '<th style="padding:6px 10px;border:1px solid #3b82f6;text-align:center;">Status</th></tr>';
        (window.manualResults || []).forEach(function(r) {
            var sc = r.status === 'pass' ? '#10b981' : r.status === 'fail' ? '#ef4444' : r.status === 'marginal' ? '#f59e0b' : '#999';
            html += '<tr><td style="padding:5px 10px;border:1px solid #ddd;">' + r.label + '</td>';
            html += '<td style="padding:5px 10px;border:1px solid #ddd;text-align:right;">' + r.value + (r.unit ? ' ' + r.unit : '') + '</td>';
            html += '<td style="padding:5px 10px;border:1px solid #ddd;text-align:center;font-weight:700;color:' + sc + ';">' + (r.status || '--') + '</td></tr>';
        });
        html += '</table>';
        html += '<p style="font-size:9px;color:#999;text-align:center;">Generated: ' + new Date().toLocaleString() + '</p>';
        var pc = document.getElementById('printContent');
        if (pc) pc.innerHTML = html;
        var pd = document.getElementById('printDate');
        if (pd) pd.textContent = new Date().toLocaleString();
        setTimeout(function() { window.print(); }, 400);
    }

    function manualRenderResults() {
        var body = document.getElementById('manualResultsBody');
        var section = document.getElementById('manualResultsSection');
        var reportSection = document.getElementById('manualReportSection');
        if (!body || !section) return;
        body.innerHTML = '';
        (window.manualResults || []).forEach(function(r) {
            var cls = r.status === 'pass' ? 'pass' : r.status === 'fail' ? 'fail' : r.status === 'marginal' ? 'marginal' : '';
            var statusCell = '<span style="color:var(--text-muted);">--</span>';
            if (cls) statusCell = '<span class="badge ' + cls + '">' + r.status.toUpperCase() + '</span>';
            body.innerHTML += '<tr>' +
                '<td class="rtd-label">' + r.label + '</td>' +
                '<td class="rtd-value">' + r.value + (r.unit ? ' <span class="rtd-unit">' + r.unit + '</span>' : '') + '</td>' +
                '<td class="rtd-status">' + statusCell + '</td></tr>';
        });
        section.style.display = 'block';
        if (reportSection) reportSection.style.display = 'block';
    }

    window.manualAlert = manualAlert;
    window.manualRenderResults = manualRenderResults;
    window.manualExportExcel = manualExportExcel;
    window.manualExportPdf = manualExportPdf;
    window.manualExportPrint = manualExportPrint;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTestTabs);
    } else {
        initTestTabs();
    }

    setInterval(function() {
        if (currentMode === 'normal') {
            var zc = document.getElementById('zoneContainer');
            if (zc) zc.style.display = 'none';
        }
    }, 1000);
})();
