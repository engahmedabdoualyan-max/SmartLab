function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    var icons = { error: '⚠️', success: '✅', info: 'ℹ️', warning: '⚡' };
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var iconSpan = document.createElement('span');
    iconSpan.textContent = icons[type] || 'ℹ️';
    var msgSpan = document.createElement('span');
    msgSpan.textContent = typeof sanitizeInput === 'function' ? sanitizeInput(message) : String(message);
    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 5000);
}
// ================================================================
// STATE
// ================================================================
var currentDomain = null, currentTest = null, currentSessionId = null;
var serialPort = null, serialReader = null, serialKeepReading = false, isDemoMode = false, isManual = false;
var isTesting = false, strikes = [], targetStrikes = 25, targetRatio = 95, hammerWeight = 2.5, moldVolume = 0.001;
var currentAgent = null;
var connType = '', lanSocket = null, btDevice = null, btCharacteristic = null;
// ================================================================
// STATISTICS DASHBOARD
// ================================================================
function loadStats() {
    var totalEl = document.getElementById('stat-total-tests');
    var passEl = document.getElementById('stat-pass-rate');
    var domainsEl = document.getElementById('stat-active-domains');
    var recentEl = document.getElementById('stat-recent-sessions');
    var breakdownEl = document.getElementById('stats-domain-breakdown');
    var activityEl = document.getElementById('stats-recent-activity');

    db.collection('sessions').get().then(function(snap) {
        var total = 0, passes = 0, domainCounts = {}, recentSessions = [];
        var domainNames = { compaction:'Compaction', cbr:'CBR', slump:'Slump', maturity:'Maturity', marshall:'Marshall', bitumen:'Bitumen', penetration:'Penetration', straightedge:'Straightedge', sieve:'Sieve Analysis', compressive:'Compressive', ductility:'Ductility', air:'Air Content', atterberg:'Atterberg Limits' };
        var colorPalette = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#14b8a6','#f97316'];

        snap.forEach(function(doc) {
            var d = doc.data();
            total++;
            var result = (d.result || d.status || '').toUpperCase();
            if (result === 'PASS') passes++;
            var dom = d.domain || d.testType || d.test || 'Unknown';
            domainCounts[dom] = (domainCounts[dom] || 0) + 1;
            var ts = d.createdAt || d.timestamp || d.date;
            if (ts) {
                var dateObj = ts.toDate ? ts.toDate() : new Date(ts);
                recentSessions.push({ domain: dom, date: dateObj, result: result || 'N/A', id: doc.id });
            }
        });

        totalEl.textContent = total;
        passEl.textContent = total > 0 ? Math.round((passes / total) * 100) + '%' : '0%';
        var domainKeys = Object.keys(domainCounts);
        domainsEl.textContent = domainKeys.length;

        var now = new Date();
        var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        var recentCount = recentSessions.filter(function(s) { return s.date >= weekAgo; }).length;
        recentEl.textContent = recentCount;

        var passTrend = document.getElementById('stat-pass-trend');
        if (total > 0) {
            var pct = Math.round((passes / total) * 100);
            if (pct >= 80) { passTrend.textContent = '↑ Good performance'; passTrend.className = 'stat-trend up'; }
            else if (pct >= 50) { passTrend.textContent = '→ Average'; passTrend.className = 'stat-trend neutral'; }
            else { passTrend.textContent = '↓ Below target'; passTrend.className = 'stat-trend down'; }
        }
        var totalTrend = document.getElementById('stat-total-trend');
        totalTrend.textContent = 'Across ' + domainKeys.length + ' domains';
        totalTrend.className = 'stat-trend neutral';
        var recentTrend = document.getElementById('stat-recent-trend');
        recentTrend.textContent = 'Last 7 days';
        recentTrend.className = 'stat-trend neutral';

        if (domainKeys.length === 0) {
            breakdownEl.innerHTML = '<div class="stats-empty"><div class="stats-empty-icon">📊</div>No test data yet</div>';
        } else {
            var maxCount = Math.max.apply(null, Object.values(domainCounts));
            var html = '<table class="stats-table"><thead><tr><th>Domain</th><th>Tests</th><th>Distribution</th></tr></thead><tbody>';
            domainKeys.sort(function(a,b){ return domainCounts[b]-domainCounts[a]; });
            domainKeys.forEach(function(dom, i) {
                var pct = total > 0 ? Math.round((domainCounts[dom] / total) * 100) : 0;
                var barWidth = maxCount > 0 ? Math.round((domainCounts[dom] / maxCount) * 100) : 0;
                var color = colorPalette[i % colorPalette.length];
                var label = domainNames[dom] || dom;
                html += '<tr><td><strong>' + label + '</strong></td><td>' + domainCounts[dom] + ' <span style="color:var(--text-muted);font-size:10px;">(' + pct + '%)</span></td>';
                html += '<td><div class="domain-bar"><div class="domain-bar-fill" style="width:' + barWidth + '%;background:' + color + ';"></div></div></td></tr>';
            });
            html += '</tbody></table>';
            breakdownEl.innerHTML = html;
        }

        recentSessions.sort(function(a,b){ return b.date - a.date; });
        var last5 = recentSessions.slice(0, 5);
        if (last5.length === 0) {
            activityEl.innerHTML = '<div class="stats-empty"><div class="stats-empty-icon">🕐</div>No recent activity</div>';
        } else {
            var ahtml = '<table class="stats-table"><thead><tr><th>Date</th><th>Domain</th><th>Result</th></tr></thead><tbody>';
            last5.forEach(function(s) {
                var label = domainNames[s.domain] || s.domain;
                var dateStr = s.date.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
                var resultColor = s.result === 'PASS' ? 'var(--success)' : s.result === 'FAIL' ? 'var(--danger)' : 'var(--text-muted)';
                ahtml += '<tr><td>' + dateStr + '</td><td>' + label + '</td><td style="color:' + resultColor + ';font-weight:700;">' + s.result + '</td></tr>';
            });
            ahtml += '</tbody></table>';
            activityEl.innerHTML = ahtml;
        }
    }).catch(function(e) {
        totalEl.textContent = '0';
        passEl.textContent = '0%';
        domainsEl.textContent = '0';
        recentEl.textContent = '0';
        breakdownEl.innerHTML = '<div class="stats-empty"><div class="stats-empty-icon">📊</div>Unable to load data</div>';
        activityEl.innerHTML = '<div class="stats-empty"><div class="stats-empty-icon">🕐</div>Unable to load data</div>';
    });
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {updateViaCache: 'none'}).then(function(reg) {
        if (reg.waiting) reg.waiting.postMessage({type: 'SKIP_WAITING'});
    }).catch(function(e) { console.log('SW registration failed:', e); });
}
