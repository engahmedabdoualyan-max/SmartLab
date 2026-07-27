/* ============================================================
   smartLAB — Concrete Standards Library App Logic
   ============================================================ */

(function () {
    'use strict';
    let activeCategory = 'all';

    function init() {
        const params = new URLSearchParams(window.location.search);
        const qParam = params.get('q') || '';
        const catParam = params.get('cat') || 'all';
        if (catParam && CATEGORIES.some(c => c.id === catParam)) activeCategory = catParam;
        if (qParam) { const s = document.getElementById('searchInput'); if (s) s.value = qParam; }
        renderStats();
        renderChips();
        renderStandards();
    }

    function renderStats() {
        const el = document.getElementById('libStats');
        if (!el) return;
        const oc = {};
        STANDARDS.forEach(s => { oc[s.org] = (oc[s.org] || 0) + 1; });
        const top = Object.entries(oc).sort((a, b) => b[1] - a[1]).slice(0, 4);
        el.innerHTML = `<div class="lib-stat"><div class="lib-stat-num">${STANDARDS.length}</div><div class="lib-stat-label">Total</div></div>` +
            top.map(([o, c]) => `<div class="lib-stat"><div class="lib-stat-num">${c}</div><div class="lib-stat-label">${ORG_LABELS[o] || o.toUpperCase()}</div></div>`).join('');
    }

    function renderChips() {
        const el = document.getElementById('filterChips');
        if (!el) return;
        const counts = { all: STANDARDS.length };
        STANDARDS.forEach(s => s.categories.forEach(c => { counts[c] = (counts[c] || 0) + 1; }));
        el.innerHTML = CATEGORIES.map(c =>
            `<div class="chip${c.id === activeCategory ? ' active' : ''}" data-cat="${c.id}" onclick="filterByCategory('${c.id}')">${c.label} <span style="opacity:0.5;margin-left:2px">${counts[c.id] || 0}</span></div>`
        ).join('');
    }

    window.filterByCategory = function (cat) {
        activeCategory = cat;
        document.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.dataset.cat === cat));
        renderStandards();
    };
    window.filterStandards = function () { renderStandards(); };

    function renderStandards() {
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const grid = document.getElementById('stdGrid');
        const countEl = document.getElementById('stdCount');
        const emptyEl = document.getElementById('emptyState');
        if (!grid) return;
        const filtered = STANDARDS.filter(s => {
            if (activeCategory !== 'all' && !s.categories.includes(activeCategory)) return false;
            if (q) { const h = [s.code, s.title, s.org, s.desc, ...s.tags].join(' ').toLowerCase(); return h.includes(q); }
            return true;
        });
        const pct = STANDARDS.length > 0 ? (filtered.length / STANDARDS.length * 100) : 0;
        countEl.innerHTML = `<span>Showing <strong>${filtered.length}</strong> of ${STANDARDS.length} standards</span><div class="count-bar" style="flex:1"><div class="count-fill" style="width:${pct}%"></div></div>`;
        if (filtered.length === 0) { grid.innerHTML = ''; emptyEl.style.display = ''; return; }
        emptyEl.style.display = 'none';
        grid.innerHTML = filtered.map(s => {
            const ol = ORG_LABELS[s.org] || s.org.toUpperCase();
            const oc = ORG_CLASSES[s.org] || '';
            return `<div class="std-card" data-org="${s.org}"><div class="std-card-top"><div class="std-code-group"><div class="std-code">${esc(s.code)}</div><div class="std-title">${esc(s.title)}</div></div><span class="std-org ${oc}">${ol}</span></div><div class="std-card-body"><div class="std-desc">${esc(s.desc)}</div><div class="std-tags">${s.tags.map(t => `<span class="std-tag">${esc(t)}</span>`).join('')}</div></div>${s.year ? `<div class="std-card-year">${s.year}</div>` : ''}</div>`;
        }).join('');
    }

    function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
    document.addEventListener('DOMContentLoaded', init);
})();
