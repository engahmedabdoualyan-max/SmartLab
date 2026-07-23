function renderAppHeader(screen) {
    var h = document.getElementById('app-header');
    if (!h) { h = document.createElement('header'); h.id = 'app-header'; h.className = 'app-header'; h.setAttribute('role', 'navigation'); document.body.insertBefore(h, document.body.firstChild); }
    var mainScreens = { domains: 1, dashboard: 1, test: 1, chat: 1 };
    var isTest = !mainScreens[screen] && screen !== 'chat' && screen !== 'domains' && screen !== 'dashboard';
    if (isTest) { renderTestHeader(h, screen); return; }
    var pfx = screen === 'domains' ? '' : screen === 'dashboard' ? 'dash-' : screen === 'test' ? 'test-' : 'chat-';
    var ddId = pfx + 'user-dropdown';
    var iconId = pfx + 'user-icon';
    var ddNameId = pfx + 'dd-name';
    var ddEmailId = pfx + 'dd-email';
    var hh = '<div class="header-right">';
    if (screen === 'chat') {
        hh += '<div class="header-logo" style="font-size:20px;" aria-hidden="true">\uD83E\uDD16</div>' +
              '<div><span class="header-title" id="chat-agent-name">Agent</span><div style="font-size:10px;color:var(--text-muted);" id="chat-agent-role"></div></div>';
    } else {
        hh += '<div class="header-logo" aria-hidden="true">SL</div><span class="header-title">' + (screen === 'test' ? '<span id="test-page-title"></span>' : 'SmartLAP') + '</span>';
        if (screen === 'dashboard') hh += '<span class="header-badge" id="dash-domain-name"></span>';
    }
    hh += '</div><div class="header-left">';
    var themeBtn = '<button id="dark-toggle" class="dark-toggle" onclick="toggleDarkMode()" title="Toggle Dark Mode">' +
        (document.documentElement.getAttribute('data-theme') === 'dark' ? '\u2600' : '\uD83C\uDF19') + '</button>';
    if (screen === 'domains') {
        hh += '<select class="lang-select" id="lang-select" onchange="setLang(this.value)" aria-label="Language">' +
              langOptions('full') + '</select>' +
              themeBtn +
              '<div class="header-user-btn" role="button" tabindex="0" aria-label="User menu" onclick="toggleUserDropdown(event)">' +
              '<div class="user-icon" id="user-icon-el">U</div><span class="user-name-text" id="user-name-display">User</span><span class="dd-arrow">\u25BC</span>' +
              headerDropdown(ddId, iconId, ddNameId, ddEmailId) + '</div>';
    } else if (screen === 'dashboard') {
        hh += '<select class="lang-select" id="lang-select2" onchange="setLang(this.value)" aria-label="Language">' +
              langOptions('short') + '</select>' +
              themeBtn +
              '<button onclick="showScreen(\'domains\')" class="btn-back" data-i18n="change_domain">Change Domain</button>' +
              headerDropdown(ddId, iconId, ddNameId, ddEmailId);
    } else if (screen === 'test') {
        hh += '<button onclick="goBackToDashboard()" class="btn-back">\u2192 <span data-i18n="dashboard">Dashboard</span></button>' +
              themeBtn +
              headerDropdown(ddId, iconId, ddNameId, ddEmailId);
    } else if (screen === 'chat') {
        hh += '<button onclick="showScreen(\'domains\')" class="btn-back">\u2190 <span data-i18n="back">Back</span></button>' +
              themeBtn +
              headerDropdown(ddId, iconId, ddNameId, ddEmailId);
    }
    hh += '</div>';
    h.innerHTML = hh;
    h.setAttribute('aria-label', screen + ' header');
}

function renderTestHeader(h, screen) {
    var name = screen.replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
    var el = document.querySelector('#screen-' + screen + ' [data-title]');
    if (el) name = el.getAttribute('data-title');
    var pfx = screen.substring(0,4) + '-';
    h.innerHTML =
        '<div class="header-right"><div class="header-logo" aria-hidden="true">SL</div><span class="header-title">' + name + '</span></div>' +
        '<div class="header-left">' +
        '<button onclick="goBackToDashboard()" class="btn-back">\u2192 <span data-i18n="dashboard">Dashboard</span></button>' +
        headerDropdown(pfx + 'user-dropdown', pfx + 'user-icon', pfx + 'dd-name', pfx + 'dd-email') +
        '</div>';
    h.setAttribute('aria-label', screen + ' header');
}

function langOptions(style) {
    if (style === 'full') return '<option value="en">\uD83C\uDDEC\uD83C\uDDE7 English</option><option value="ar">\uD83C\uDDEA\uD83C\uDDEC \u0627\u0644\u0639\u0631\u0628\u064A\u0629</option><option value="zh">\uD83C\uDDE8\uD83C\uDDF3 \u4E2D\u6587</option><option value="de">\uD83C\uDDE9\uD83C\uDDEA Deutsch</option><option value="fr">\uD83C\uDDEB\uD83C\uDDF7 Fran\u00E7ais</option><option value="ja">\uD83C\uDDEF\uD83C\uDDF5 \u65E5\u672C\u8A9E</option><option value="ru">\uD83C\uDDF7\uD83C\uDDFA \u0420\u0443\u0441\u0441\u043A\u0438\u0439</option>';
    return '<option value="en">\uD83C\uDDEC\uD83C\uDDE7 EN</option><option value="ar">\uD83C\uDDEA\uD83C\uDDEC AR</option><option value="zh">\uD83C\uDDE8\uD83C\uDDF3 ZH</option><option value="de">\uD83C\uDDE9\uD83C\uDDEA DE</option><option value="fr">\uD83C\uDDEB\uD83C\uDDF7 FR</option><option value="ja">\uD83C\uDDEF\uD83C\uDDF5 JA</option><option value="ru">\uD83C\uDDF7\uD83C\uDDFA RU</option>';
}

function headerDropdown(ddId, iconId, ddNameId, ddEmailId) {
    return '<div class="header-user-btn" role="button" tabindex="0" aria-label="User menu" onclick="toggleUserDropdown(event)" style="margin-left:4px;">' +
        '<div class="user-icon" id="' + iconId + '">U</div><span class="dd-arrow">\u25BC</span>' +
        '<div class="user-dropdown" id="' + ddId + '">' +
        '<div class="dd-header"><div class="dd-name" id="' + ddNameId + '">User</div><div class="dd-email" id="' + ddEmailId + '">\u2014</div></div>' +
        '<button class="dd-item" onclick="showScreen(\'domains\')"><span class="dd-icon">\uD83C\uDFE0</span> <span data-i18n="change_domain">Change Domain</span></button>' +
        '<button class="dd-item danger" onclick="doSignOut()"><span class="dd-icon">\uD83D\uDEAA</span> <span data-i18n="sign_out">Sign Out</span></button></div></div>';
}

var HAS_HEADER = { domains:1, dashboard:1, test:1, chat:1 };

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-' + id).classList.add('active');
    window.scrollTo(0,0);
    if (HAS_HEADER[id]) renderAppHeader(id);
}
// ================================================================
// AI TEAM
// ================================================================
var AI_AGENTS = [
    { id:'hw', icon:'🔧', color:'#f59e0b', bgColor:'rgba(245,158,11,0.1)', roleColor:'#fef3c7', title:'Hardware Engineer', ar:'مساعد مهندس الهاردوير', zh:'硬件工程师助手', de:'Hardware-Ingenieur', fr:'Ingénieur matériel', ja:'ハードウェアエンジニア', ru:'Аппаратный инженер',
      desc:'Circuit design, Arduino/ESP32 programming, sensor calibration, HX711, load cells, wiring diagrams.',
      desc_ar:'تصميم الدوائر، برمجة Arduino/ESP32، معاملة المستشعرات، HX711، خلايا الحمل.',
      desc_zh:'电路设计、Arduino/ESP32编程、传感器校准、HX711、称重传感器。',
      desc_de:'Schaltungsdesign, Arduino/ESP32-Programmierung, Sensorkalibrierung, HX711.',
      desc_fr:'Conception de circuits, programmation Arduino/ESP32, étalonnage des capteurs, HX711.',
      desc_ja:'回路設計、Arduino/ESP32プログラミング、センサー較正、HX711。',
      desc_ru:'Проектирование схем, программирование Arduino/ESP32, калибровка датчиков, HX711.',
      system:'You are a senior embedded systems and hardware engineer. You specialize in Arduino/ESP32, sensor integration (HX711 load cells, capacitive soil moisture sensors), circuit design, PCB layout, and Web Serial API communication. Give concise, practical answers with pin configurations, code snippets, and wiring diagrams when asked.' },
    { id:'lab', icon:'🧪', color:'#3b82f6', bgColor:'rgba(59,130,246,0.1)', roleColor:'#dbeafe', title:'Lab Test Engineer', ar:'مساعد مهندس المختبرات', zh:'实验室测试工程师', de:'Labortest-Ingenieur', fr:'Ingénieur de laboratoire', ja:'ラボテストエンジニア', ru:'Лаборант',
      desc:'Compaction testing, Proctor test, soil mechanics, density calculations, ASTM/BS standards.',
      desc_ar:'اختبار الدمك، اختبار بروكتور، ميكانيكا التربة، حسابات الكثافة، معايير ASTM/BS.',
      desc_zh:'压实测试、普罗克特试验、土力学、密度计算、ASTM/BS标准。',
      desc_de:'Verdichtungstest, Proctor-Test, Bodenmechanik, Dichteberechnungen, ASTM/BS.',
      desc_fr:'Test de compactage, essai Proctor, mécanique des sols, calculs de densité, normes ASTM/BS.',
      desc_ja:'締固め試験、プロクター試験、土質力学、密度計算、ASTM/BS規格。',
      desc_ru:'Тесты уплотнения, испытание Проктора, механика грунтов, стандарты ASTM/BS.',
      system:'You are a senior geotechnical and materials lab engineer. You specialize in soil compaction testing (Standard/Modified Proctor), moisture content determination, density testing, concrete slump tests, asphalt penetration tests. You know ASTM, BS, and EN standards. Give precise engineering answers with formulas and compliance requirements.' },
    { id:'pm', icon:'📋', color:'#8b5cf6', bgColor:'rgba(139,92,246,0.1)', roleColor:'#ede9fe', title:'Project Manager', ar:'مساعد مدير المشروع', zh:'项目经理助手', de:'Projektmanager', fr:'Chef de projet', ja:'プロジェクトマネージャー', ru:'Менеджер проектов',
      desc:'Sprint planning, task delegation, roadmap creation, progress tracking, team coordination.',
      desc_ar:'تخطيط السباقات، توزيع المهام، إنشاء خارطة الطريق، تتبع التقدم، تنسيق الفريق.',
      desc_zh:'冲刺计划、任务分配、路线图创建、进度跟踪、团队协调。',
      desc_de:'Sprint-Planung, Aufgabenverteilung, Roadmap, Fortschrittsverfolgung.',
      desc_fr:'Planification sprints, délégation de tâches, feuille de route, suivi.',
      desc_ja:'スプリント計画、タスク委譲、ロードマップ作成、進捗追跡。',
      desc_ru:'Планирование спринтов, распределение задач, дорожная карта.',
      system:'You are an expert project manager for software and hardware engineering projects. You create development plans, break tasks into sprints, delegate work to team members, track progress, and coordinate between hardware, software, and lab teams. You produce clear action items with deadlines and priorities. Think step by step when planning.' },
    { id:'dev', icon:'💻', color:'#10b981', bgColor:'rgba(16,185,129,0.1)', roleColor:'#d1fae5', title:'Software Developer', ar:'مساعد المبرمج', zh:'软件开发助手', de:'Software-Entwickler', fr:'Développeur logiciel', ja:'ソフトウェア開発者', ru:'Программист',
      desc:'Frontend/backend, Web Serial API, Firebase integration, PDF generation, code review.',
      desc_ar:'تطوير الواجهة الأمامية والخلفية، Web Serial API، Firebase، توليد PDF، مراجعة الكود.',
      desc_zh:'前端/后端开发、Web Serial API、Firebase集成、PDF生成。',
      desc_de:'Frontend/Backend-Entwicklung, Web Serial API, Firebase-Integration.',
      desc_fr:'Développement frontend/backend, Web Serial API, intégration Firebase.',
      desc_ja:'フロントエンド/バックエンド開発、Web Serial API、Firebase統合。',
      desc_ru:'Фронтенд/бэкенд разработка, Web Serial API, интеграция Firebase.',
      system:'You are a senior full-stack developer specializing in JavaScript, HTML/CSS, Firebase (Firestore, Auth), Web Serial API, and PDF generation (jsPDF). You review code for bugs, suggest improvements, write clean production-ready code, and help debug issues. Be concise and provide working code examples.' },
    { id:'research', icon:'🔍', color:'#ef4444', bgColor:'rgba(239,68,68,0.1)', roleColor:'#fee2e2', title:'Research Analyst', ar:'مساعد الباحث', zh:'研究分析师', de:'Forschungsanalyst', fr:'Analyste de recherche', ja:'リサーチアナリスト', ru:'Аналитик',
      desc:'Market research, competitor analysis, similar software comparison, feature recommendations.',
      desc_ar:'بحث السوق، تحليل المنافسين، مقارنة البرامج المشابهة، توصيات الميزات.',
      desc_zh:'市场研究、竞争对手分析、类似软件比较、功能推荐。',
      desc_de:'Marktforschung, Wettbewerbsanalyse, Vergleich ähnlicher Software.',
      desc_fr:'Étude de marché, analyse concurrentielle, comparaison de logiciels similaires.',
      desc_ja:'市場調査、競合分析、類似ソフトウェア比較。',
      desc_ru:'Исследование рынка, анализ конкурентов, сравнение ПО.',
      system:'You are a technology research analyst specializing in engineering software, lab automation systems, IoT platforms, and educational technology. You research competitors (like MIDAS, GeoStudio, PLAXIS, Vensim, LabVIEW), compare features, identify market gaps, and recommend new features for SmartLAP. Be thorough and cite sources when possible.' }
];

function loadAITeam() {
    var grid = document.getElementById('ai-team-grid-modal');
    if (!grid) grid = document.getElementById('ai-team-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var t = I18N[currentLang] || I18N.en;
    AI_AGENTS.forEach(function(agent) {
        var title = agent['title_' + currentLang] || agent.title;
        var desc = agent['desc_' + currentLang] || agent.desc;
        var card = document.createElement('div');
        card.className = 'ai-card';
        card.onclick = function() { openChat(agent); };
        var chatLabel = t.chat_with || 'Chat with';
        card.innerHTML = '<div class="ai-role" style="background:' + agent.roleColor + ';color:' + agent.color + ';">AI</div>' +
            '<div class="ai-avatar" style="background:' + agent.bgColor + ';">' + agent.icon + '</div>' +
            '<h3>' + title + '</h3><p>' + desc + '</p>' +
            '<div class="chat-indicator">' + chatLabel + ' ' + title + ' <span class="arrow">→</span></div>';
        grid.appendChild(card);
    });
}
function openChat(agent) {
    currentAgent = agent;
    var title = agent['title_' + currentLang] || agent.title;
    var role = agent['role_' + currentLang] || '';
    document.getElementById('chat-agent-name').textContent = agent.icon + ' ' + title;
    document.getElementById('chat-agent-role').textContent = role;
    document.getElementById('chat-avatar').textContent = agent.icon;
    document.getElementById('chat-messages').innerHTML = '';
    var t = I18N[currentLang] || I18N.en;
    addChatMsg('ai', t.type_msg ? 'Hello! I am your ' + title + '. How can I help you today?' : 'Hello! How can I help you?', 'system');
    showScreen('chat');
}

function addChatMsg(type, text, role) {
    var container = document.getElementById('chat-messages');
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (type === 'user' ? 'user' : 'ai');
    if (type === 'ai' && role !== 'system') {
        var title = currentAgent['title_' + currentLang] || currentAgent.title;
        div.innerHTML = '<div class="msg-role">' + currentAgent.icon + ' ' + title + '</div>' + text;
    } else {
        div.textContent = text;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendChat() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text || !currentAgent) return;
    input.value = '';
    addChatMsg('user', text);

    var typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg ai';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="msg-role">' + currentAgent.icon + '</div><em>Typing...</em>';
    document.getElementById('chat-messages').appendChild(typingDiv);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

    try {
        var GEMINI_API_KEY = (typeof SmartLAP_CONFIG !== 'undefined' && SmartLAP_CONFIG.gemini && SmartLAP_CONFIG.gemini.apiKey) 
            ? SmartLAP_CONFIG.gemini.apiKey 
            : null;
        if (!GEMINI_API_KEY) {
            document.getElementById('typing-indicator').remove();
            var msg = currentLang === 'ar' ? 'خدمة الذكاء الاصطناعي غير مهيأة — أضف مفتاح API في الإعدادات' : 'AI service not configured — add an API key in settings';
            addChatMsg('ai', msg);
            return;
        }
        var GEMINI_MODEL = (typeof SmartLAP_CONFIG !== 'undefined' && SmartLAP_CONFIG.gemini && SmartLAP_CONFIG.gemini.model) 
            ? SmartLAP_CONFIG.gemini.model 
            : 'gemini-2.0-flash';
        var response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: currentAgent.system + '\n\nUser: ' + text }] }]
            })
        });
        var data = await response.json();
        var reply = 'Sorry, I could not process that.';
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            reply = data.candidates[0].content.parts[0].text;
        }
        document.getElementById('typing-indicator').remove();
        addChatMsg('ai', reply);
    } catch(e) {
        document.getElementById('typing-indicator').remove();
        var t = I18N[currentLang] || I18N.en;
        var errMsg = t.chat_error || 'Connection error. Please try again.';
        var retryLabel = t.retry || 'Retry';
        addChatMsg('ai', errMsg + ' <button class="chat-retry-btn" onclick="retryChat(\'' + text.replace(/'/g, "\\'") + '\')">' + retryLabel + ' ↻</button>');
    }
}
function retryChat(text) {
    var input = document.getElementById('chat-input');
    input.value = text;
    sendChat();
}
// ================================================================
// DOMAINS & TESTS — with Local Firestore Fallback
// ================================================================

// Hardcoded local domain data for when Firestore is unavailable
var LOCAL_DOMAINS = [
    {
        id: 'local-soil',
        name: 'قسم الطرق والتربة',
        nameEn: 'Roads & Soil Department',
        description: 'اختبارات الطرق والتربة',
        descriptionEn: 'Roads and soil testing',
        order: 1,
        icon: '🛣️',
        tests: ['compaction', 'cbr', 'straightedge', 'atterberg', 'sieve', 'specific_gravity', 'permeability', 'water_absorption', 'direct_shear']
    },
    {
        id: 'local-concrete',
        name: 'قسم الخرسانة',
        nameEn: 'Concrete Department',
        description: 'اختبارات الخرسانة',
        descriptionEn: 'Concrete testing',
        order: 2,
        icon: '🏗️',
        tests: ['slump', 'maturity', 'compressive', 'flexural', 'split_tensile']
    },
    {
        id: 'local-asphalt',
        name: 'قسم الأسفلت',
        nameEn: 'Asphalt Department',
        description: 'اختبارات الأسفلت',
        descriptionEn: 'Asphalt testing',
        order: 3,
        icon: '🛤️',
        tests: ['marshall', 'bitumen', 'penetration', 'ductility', 'softening_point', 'viscosity']
    }
];

/**
 * Load domains from local hardcoded data (Firestore fallback).
 */
function loadLocalDomains() {
    var c = document.getElementById('domains-list');
    if (!c) return;
    c.textContent = '';
    var isArabic = currentLang === 'ar';
    LOCAL_DOMAINS.forEach(function(d) {
        var domainName = isArabic ? d.name : (d.nameEn || d.name);
        var domainDesc = isArabic ? d.description : (d.descriptionEn || d.description);
        var card = document.createElement('a');
        card.href = '#';
        card.className = 'domain-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', domainName);
        card.onclick = function(e) {
            e.preventDefault();
            selectDomain(d);
        };
        var iconDiv = document.createElement('div');
        iconDiv.className = 'domain-icon';
        iconDiv.setAttribute('aria-hidden', 'true');
        iconDiv.textContent = d.icon || '🔬';
        var infoDiv = document.createElement('div');
        infoDiv.className = 'domain-info';
        var h3 = document.createElement('h3');
        h3.textContent = domainName;
        var pDesc = document.createElement('p');
        pDesc.textContent = domainDesc;
        infoDiv.appendChild(h3);
        infoDiv.appendChild(pDesc);
        card.appendChild(iconDiv);
        card.appendChild(infoDiv);
        c.appendChild(card);
    });
    loadAITeam();
    loadStats();
}

var TEST_DEFS = {
  compaction:    { name:'Compaction (Proctor)',         icon:'⚡' },
  cbr:           { name:'CBR',                          icon:'📊' },
  straightedge:  { name:'Straightedge',                 icon:'📐' },
  slump:         { name:'Slump Test',                   icon:'📐' },
  maturity:      { name:'Concrete Maturity',            icon:'🌡️' },
  marshall:      { name:'Marshall Test',                icon:'⚖️' },
  bitumen:       { name:'Bitumen Photo-Tester',         icon:'🧪' },
  penetration:   { name:'Bitumen Penetration',          icon:'🌡️' },
  ductility:     { name:'Ductility',                    icon:'🔗' },
  softening_point:{name:'Softening Point',              icon:'🌡️' },
  viscosity:     { name:'Viscosity',                    icon:'⏳' },
  atterberg:     { name:'Atterberg Limits',             icon:'🧪' },
  sieve:         { name:'Sieve Analysis',               icon:'📐' },
  compressive:   { name:'Compressive Strength',         icon:'🏗️' },
  flexural:      { name:'Flexural Strength',            icon:'📐' },
  split_tensile: { name:'Split Tensile',                icon:'💥' },
  permeability:  { name:'Permeability',                 icon:'💧' },
  specific_gravity:{name:'Specific Gravity',            icon:'⚖️' },
  water_absorption:{name:'Water Absorption',            icon:'💧' },
  air:           { name:'Air Content',                  icon:'💨' },
  direct_shear:  { name:'Direct Shear',                 icon:'✂️' }
};

function openStaticTest(type, name) {
  var def = TEST_DEFS[type] || { name: name || type };
  var t = I18N[currentLang] || I18N.en;
  var displayName = t['test_' + type] || def.name || name || type;
  var test = { id: type + '-static', type: type, name: displayName, nameEn: def.name };
  currentTest = test;
  openTest(test);
}

async function loadDomains() {
    var c = document.getElementById('domains-list');
    if (c) c.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><span>Loading...</span></div>';
    try {
        var snap = await db.collection('domains').get();
        if (snap.empty) {
            // Try seeding first, fall back to local if that fails
            try {
                await seedDomains();
                return loadDomains();
            } catch (seedErr) {
                console.warn('seedDomains failed, using local fallback:', seedErr.message);
                if (typeof USE_LOCAL_FALLBACK !== 'undefined') USE_LOCAL_FALLBACK = true;
                loadLocalDomains();
                return;
            }
        }
        if(c)c.textContent='';
        var domains=[];snap.forEach(function(doc){var d=doc.data();d.id=doc.id;domains.push(d);});domains.sort(function(a,b){return (a.order||0)-(b.order||0);});
        var domainKeyMap = {1:'roads',2:'concrete',3:'asphalt'};
        var icons = { 'طرق':'🛣️', 'خرسانة':'🏗️', 'أسفلت':'🛤️', 'Roads':'🛣️', 'Concrete':'🏗️', 'Asphalt':'🛤️', '道路':'🛣️', '混凝土':'🏗️', '沥青':'🛤️', 'Straßen':'🛣️', 'Beton':'🏗️', 'Asphalt':'🛤️' };
        domains.forEach(function(d) {
            var key = d.key || domainKeyMap[d.order] || '';
            if (!key) { Object.keys(icons).forEach(function(k) { if (d.name.indexOf(k) !== -1) { key = k === 'طرق' || k === 'Roads' || k === '道路' || k === 'Straßen' ? 'roads' : k === 'خرسانة' || k === 'Concrete' || k === '混凝土' || k === 'Beton' ? 'concrete' : 'asphalt'; }}); }
            var t = I18N[currentLang] || I18N.en;
            var dn = t['domain_' + key] || d.nameEn || d.name;
            var dd = t['domain_' + key + '_desc'] || d.descriptionEn || d.description || '';
            var ik = Object.keys(icons).find(function(k){return d.name.includes(k);}) || '🔬';
            var card = document.createElement('a'); card.href='#'; card.className='domain-card'; card.setAttribute('tabindex','0'); card.setAttribute('role','button'); card.setAttribute('aria-label',dn);
            card.onclick = function(dRef,keyRef){return function(e){e.preventDefault();selectDomain(dRef,keyRef);};}(d,key);
            var iconDiv=document.createElement('div');iconDiv.className='domain-icon';iconDiv.setAttribute('aria-hidden','true');iconDiv.textContent=icons[ik]||'🔬';
            var infoDiv=document.createElement('div');infoDiv.className='domain-info';
            var h3=document.createElement('h3');h3.textContent=dn;
            var pDesc=document.createElement('p');pDesc.textContent=dd;
            infoDiv.appendChild(h3);infoDiv.appendChild(pDesc);
            card.appendChild(iconDiv);card.appendChild(infoDiv);
            c.appendChild(card);
        });
        loadAITeam();
        loadStats();
    } catch(e) {
        console.warn('loadDomains Firestore error, using local fallback:', e.message);
        if (typeof USE_LOCAL_FALLBACK !== 'undefined') USE_LOCAL_FALLBACK = true;
        loadLocalDomains();
    }
}

async function seedDomains() {
    // If in fallback mode, skip Firestore entirely
    if (typeof USE_LOCAL_FALLBACK !== 'undefined' && USE_LOCAL_FALLBACK) {
        console.warn('seedDomains: skipping Firestore seed in fallback mode');
        loadLocalDomains();
        return;
    }
    var batch = db.batch();
    [{key:'roads',name:'قسم الطرق والتربة',nameEn:'Roads & Soil',description:'اختبارات الطرق والتربة',descriptionEn:'Roads and soil testing',order:1,icon:'🛣️'},{key:'concrete',name:'قسم الخرسانة',nameEn:'Concrete',description:'اختبارات الخرسانة',descriptionEn:'Concrete testing',order:2,icon:'🏗️'},{key:'asphalt',name:'قسم الأسفلت',nameEn:'Asphalt',description:'اختبارات الأسفلت',descriptionEn:'Asphalt testing',order:3,icon:'🛤️'}].forEach(function(d){batch.set(db.collection('domains').doc(d.key),d);});
    await batch.commit();
    var tb = db.batch();
    var ds = await db.collection('domains').where('name','==','قسم الطرق والتربة').get();
if(!ds.empty){var did=ds.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار الدمك',nameEn:'Compaction (Proctor)',domainId:did,order:1,type:'compaction',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار تحديد الرطوبة',nameEn:'Moisture Test',domainId:did,order:2,type:'moisture',config:{inputs:[{name:'وزن_الأرض',label:'وزن العينة الرطبة (كغ)',type:'number'},{name:'وزن_الجافة',label:'وزن العينة الجافة (كغ)',type:'number'}]}});tb.set(db.collection('tests').doc(),{name:'اختبار نسبة الحمل (CBR)',nameEn:'CBR',domainId:did,order:3,type:'cbr',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار استقامة الطرق (Straightedge)',nameEn:'Straightedge',domainId:did,order:4,type:'straightedge',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'حدود أتربرغ (Atterberg Limits)',nameEn:'Atterberg Limits',domainId:did,order:5,type:'atterberg',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'التحاليل الحجمية (Sieve Analysis)',nameEn:'Sieve Analysis',domainId:did,order:6,type:'sieve',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار القص المباشر (Direct Shear)',nameEn:'Direct Shear',domainId:did,order:7,type:'direct_shear',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار النفاذية (Permeability)',nameEn:'Permeability',domainId:did,order:8,type:'permeability',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الوزن النوعي (Specific Gravity)',nameEn:'Specific Gravity',domainId:did,order:9,type:'specific_gravity',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'امتصاص الماء (Water Absorption)',nameEn:'Water Absorption',domainId:did,order:10,type:'water_absorption',config:{inputs:[]}});}
    var d2=await db.collection('domains').where('name','==','قسم الخرسانة').get();
    if(!d2.empty){var cid=d2.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار الانضباط (Slump)',nameEn:'Slump Test',domainId:cid,order:1,type:'slump',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نضج الخرسانة (Maturity)',nameEn:'Concrete Maturity',domainId:cid,order:2,type:'maturity',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الشد الانضغاطي (Compressive Strength)',nameEn:'Compressive Strength',domainId:cid,order:3,type:'compressive',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نسبة الهواء (Air Content)',nameEn:'Air Content',domainId:cid,order:4,type:'air',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'قوة الانثناء (Flexural Strength)',nameEn:'Flexural Strength',domainId:cid,order:5,type:'flexural',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الشد الانشعابي (Split Tensile)',nameEn:'Split Tensile',domainId:cid,order:6,type:'split_tensile',config:{inputs:[]}});}
    var d3=await db.collection('domains').where('name','==','قسم الأسفلت').get();
    if(!d3.empty){var aid=d3.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار مارشال الرقمي (Marshall)',nameEn:'Marshall Test',domainId:aid,order:1,type:'marshall',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'_photo-Tester للбитومين',nameEn:'Bitumen Photo-Tester',domainId:aid,order:2,type:'bitumen',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار الانساب (Penetration)',nameEn:'Penetration',domainId:aid,order:3,type:'penetration',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار المطاوعة (Ductility)',nameEn:'Ductility',domainId:aid,order:4,type:'ductility',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نقطة التليين (Softening Point)',nameEn:'Softening Point',domainId:aid,order:5,type:'softening_point',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اللزوجة (Viscosity)',nameEn:'Viscosity',domainId:aid,order:6,type:'viscosity',config:{inputs:[]}});}
    await tb.commit();
}

function selectDomain(domain, key) {
  currentDomain = domain;
  showScreen('dashboard');
  var t = I18N[currentLang] || I18N.en;
  if (!key) { var domainKeyMap = {1:'roads',2:'concrete',3:'asphalt'}; key = domain.key || domainKeyMap[domain.order] || ''; }
  var dn = t['domain_' + key] || domain.nameEn || domain.name;
  var dd = t['domain_' + key + '_desc'] || domain.descriptionEn || domain.description;
  document.getElementById('dash-domain-name').textContent = dn;
  document.getElementById('dash-title').textContent = dn;
  document.getElementById('dash-subtitle').textContent = dd;
  // Hide all department sections first
  var sections = document.querySelectorAll('.dept-section');
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
  }
  // Show matching section based on domain name
  var sectionId = null;
  var name = domain.name.toLowerCase();
  if (name.indexOf('خرسانة') !== -1 || name.indexOf('concrete') !== -1 || name.indexOf('混凝土') !== -1 || name.indexOf('beton') !== -1) {
    sectionId = 'dept-concrete';
  } else if (name.indexOf('طرق') !== -1 || name.indexOf('تربة') !== -1 || name.indexOf('roads') !== -1 || name.indexOf('soil') !== -1 || name.indexOf('straße') !== -1) {
    sectionId = 'dept-soil';
  } else if (name.indexOf('أسفلت') !== -1 || name.indexOf('asphalt') !== -1 || name.indexOf('沥青') !== -1) {
    sectionId = 'dept-asphalt';
  }
  if (sectionId) {
    document.getElementById(sectionId).style.display = 'grid';
  }
  loadAITeam();
  loadStats();
}

function openTest(test){
  currentTest = test;
  if (!canRunTest(test.type)) {
    showToast('Permission denied: your role (' + currentUserRole + ') cannot run this test', 'error');
    return;
  }
  if (test.type === 'cbr') { openCBR(test); return; }
  if (test.type === 'atterberg') { openAtterberg(test); return; }
  if (test.type === 'sieve') { openSieve(test); return; }
  if (test.type === 'compressive') { openComp(test); return; }
  if (test.type === 'ductility') { openDuct(test); return; }
  if (test.type === 'air') { openAir(test); return; }
  if (test.type === 'direct_shear') { openDirectShear(test); return; }
  if (test.type === 'flexural') { openFlexural(test); return; }
  if (test.type === 'split_tensile') { openSplitTensile(test); return; }
  if (test.type === 'permeability') { openPermeability(test); return; }
  if (test.type === 'specific_gravity') { openSpecificGravity(test); return; }
  if (test.type === 'water_absorption') { openWaterAbsorption(test); return; }
  if (test.type === 'softening_point') { openSofteningPoint(test); return; }
  if (test.type === 'viscosity') { openViscosity(test); return; }
  if (test.type === 'slump') { openSlump(test); return; }
  if (test.type === 'maturity') { openMat(test); return; }
  if (test.type === 'marshall') { openMar(test); return; }
  if (test.type === 'bitumen') { openBit(test); return; }
  if (test.type === 'straightedge') { openSE(test); return; }
  // Default: compaction test screen
  strikes = []; isTesting = false; currentSessionId = null;
  showScreen('test');
  var t = I18N[currentLang] || I18N.en;
  document.getElementById('test-page-title').textContent = t['test_' + test.type] || test.nameEn || test.name;
  document.getElementById('results-panel').style.display = 'none';
  document.getElementById('btn-pdf').style.display = 'none';
  document.getElementById('chart-box').style.display = 'none';
  document.getElementById('btn-start').style.display = 'flex';
  document.getElementById('btn-stop').style.display = 'none';
  document.getElementById('btn-tare').style.display = 'none';
  var slb = document.getElementById('strike-log-body');
  if (slb) slb.textContent = 'Start test';
  safeSetText('val-moisture', '--');
  safeSetText('val-force', '--');
  safeSetText('val-avg-force', '--');
  safeSetText('val-dry-density', '--');
  safeSetText('strike-counter', '0');
  safeSetText('ratio-display', '--%');
  safeSetText('target-display', document.getElementById('inp_target_strikes').value || '25');
  var gf = document.getElementById('gauge-fill');
  if (gf) gf.style.strokeDashoffset = '264';
  var sc = document.getElementById('serial-console');
  if (sc) sc.style.display = 'none';
  var db = document.getElementById('demo-banner');
  if (db) db.style.display = 'none';
  loadHistory();
}
function openAtterberg(test){currentTest=test;showScreen('atterberg');}
function openSieve(test){currentTest=test;showScreen('sieve');}
function openComp(test){currentTest=test;showScreen('compressive');}
function openDuct(test){currentTest=test;showScreen('ductility');}
function openAir(test){currentTest=test;showScreen('air');}
function openFlexural(test){currentTest=test;showScreen('flexural');}
function openSplitTensile(test){currentTest=test;showScreen('split_tensile');}
function openPermeability(test){currentTest=test;showScreen('permeability');}
function openSpecificGravity(test){currentTest=test;showScreen('specific_gravity');}
function openWaterAbsorption(test){currentTest=test;showScreen('water_absorption');}
function openSofteningPoint(test){currentTest=test;showScreen('softening_point');}
function openViscosity(test){currentTest=test;showScreen('viscosity');}
function goBackToDashboard(){if(isTesting){if(!confirm('Test in progress. Leave?'))return;stopSerial();}if(currentDomain)selectDomain(currentDomain);else showScreen('domains');}

// ================================================================
// DYNAMIC TEST ENGINE — DISPATCH & EXECUTION
// ================================================================

/** @type {Array} Saved dynamic test definitions */
var dynamicTestDefinitions = [];

/** @type {Array} Dynamic test execution readings log */
var dynamicReadings = [];

/** @type {boolean} Whether dynamic test is currently running */
var dynamicTesting = false;

/** @type {Object} Current dynamic test config */
var dynamicConfig = null;

/**
 * Open the Dynamic Test Engine Admin screen.
 * Called from the card in #dept-concrete.
 */
function openDynamicTest() {
    currentTest = { id: 'dynamic-admin', type: 'dynamic', name: 'Dynamic Test Engine' };
    dynamicReadings = [];
    dynamicTesting = false;
    dynamicConfig = null;
    showScreen('dynamic-admin');
    loadDynamicSavedTests();
}

/**
 * Add a new parameter row to the Admin screen.
 */
function addDynamicParam() {
    var container = document.getElementById('dyn-params-container');
    var index = container.children.length;
    var row = document.createElement('div');
    row.className = 'dyn-param-row';
    row.dataset.index = index;
    row.innerHTML =
        '<div class="dyn-param-fields">' +
            '<input type="text" class="dyn-param-name" placeholder="Parameter name (e.g. Load)" style="flex:2;">' +
            '<select class="dyn-param-type" style="flex:1;">' +
                '<option value="Numeric">Numeric</option>' +
                '<option value="Text">Text</option>' +
                '<option value="SensorInput">Sensor Input</option>' +
            '</select>' +
            '<input type="text" class="dyn-param-unit" placeholder="Unit (e.g. kN)" style="flex:1;">' +
            '<button class="dyn-param-remove" onclick="removeDynamicParam(this)" title="Remove parameter" style="flex:0;">✕</button>' +
        '</div>';
    container.appendChild(row);
}

/**
 * Remove a parameter row from the Admin screen.
 * @param {HTMLElement} btn - The remove button clicked
 */
function removeDynamicParam(btn) {
    var row = btn.closest('.dyn-param-row');
    if (row) {
        row.style.animation = 'slideUp 0.2s ease reverse';
        setTimeout(function() { row.parentNode.removeChild(row); }, 200);
    }
}

/**
 * Validate the equation entered in the Admin screen.
 */
function validateDynamicEquation() {
    var equation = document.getElementById('dyn-equation').value.trim();
    var resultEl = document.getElementById('dyn-validation-result');
    if (!equation) {
        resultEl.className = 'dyn-validation-fail';
        resultEl.textContent = '⚠️ Please enter a formula.';
        resultEl.style.display = 'block';
        return;
    }
    // Collect parameter names
    var paramNames = [];
    var inputs = document.querySelectorAll('#dyn-params-container .dyn-param-name');
    for (var i = 0; i < inputs.length; i++) {
        var name = inputs[i].value.trim();
        if (name) paramNames.push(name);
    }
    // Build dummy variables
    var vars = {};
    for (var j = 0; j < paramNames.length; j++) {
        vars[paramNames[j]] = 1;
    }
    // Validate using EquationEvaluator
    try {
        var evaluator = window.equationEvaluator || new EquationEvaluator();
        // First check syntax
        if (!evaluator.IsValidFormula(equation)) {
            resultEl.className = 'dyn-validation-fail';
            resultEl.textContent = '⚠️ Formula contains invalid syntax.';
            resultEl.style.display = 'block';
            return;
        }
        // Then test with dummy values
        var result = evaluator.EvaluateFormula(equation, vars);
        resultEl.className = 'dyn-validation-pass';
        resultEl.textContent = '✅ Formula is valid! Test result with dummy values: ' + result.toFixed(4);
        resultEl.style.display = 'block';
    } catch (e) {
        resultEl.className = 'dyn-validation-fail';
        resultEl.textContent = '⚠️ ' + e.message;
        resultEl.style.display = 'block';
    }
}

/**
 * Save the dynamic test definition and navigate to Execution view.
 */
function saveDynamicTest() {
    var testName = document.getElementById('dyn-test-name').value.trim();
    var equation = document.getElementById('dyn-equation').value.trim();
    var resultLabel = document.getElementById('dyn-result-label').value.trim();
    var defaultMode = document.getElementById('dyn-default-mode').value;
    var sensorId = document.getElementById('dyn-sensor-id').value.trim();

    if (!testName) {
        showToast('Please enter a test name', 'warning');
        return;
    }
    if (!equation) {
        showToast('Please enter a formula', 'warning');
        return;
    }

    // Collect parameters
    var params = [];
    var paramRows = document.querySelectorAll('#dyn-params-container .dyn-param-row');
    for (var i = 0; i < paramRows.length; i++) {
        var nameInput = paramRows[i].querySelector('.dyn-param-name');
        var typeSelect = paramRows[i].querySelector('.dyn-param-type');
        var unitInput = paramRows[i].querySelector('.dyn-param-unit');
        var paramName = nameInput.value.trim();
        if (paramName) {
            params.push({
                name: paramName,
                type: typeSelect.value,
                unit: unitInput.value.trim()
            });
        }
    }

    if (params.length === 0) {
        showToast('Please add at least one parameter', 'warning');
        return;
    }

    // Build config
    dynamicConfig = {
        testName: testName,
        equation: equation,
        resultLabel: resultLabel || 'Result',
        defaultMode: defaultMode,
        sensorId: sensorId || null,
        params: params,
        createdAt: new Date().toISOString()
    };

    // Save to local array
    dynamicTestDefinitions.push(dynamicConfig);
    localStorage.setItem('smartlap_dynamic_tests', JSON.stringify(dynamicTestDefinitions));

    showToast('Test "' + testName + '" saved!', 'success');

    // Set mode controller
    if (defaultMode === 'HardwareIoTMode') {
        dynamicModeController.SetHardwareIoTMode();
    } else {
        dynamicModeController.SetManualMode();
    }

    // Navigate to execution view
    launchDynamicExecution(dynamicConfig);
}

/**
 * Load saved test definitions from localStorage.
 */
function loadDynamicSavedTests() {
    var saved = localStorage.getItem('smartlap_dynamic_tests');
    if (saved) {
        try {
            dynamicTestDefinitions = JSON.parse(saved);
        } catch (e) {
            dynamicTestDefinitions = [];
        }
    }
    var tbody = document.getElementById('dyn-saved-tests-body');
    if (!tbody) return;
    if (dynamicTestDefinitions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">No saved tests yet. Create one above.</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < dynamicTestDefinitions.length; i++) {
        var def = dynamicTestDefinitions[i];
        var modeLabel = def.defaultMode === 'HardwareIoTMode' ? '🔌 Hardware' : '✏️ Manual';
        html += '<tr>' +
            '<td><strong>' + escapeHtml(def.testName) + '</strong></td>' +
            '<td style="font-size:10px;font-family:Courier New,monospace;">' + escapeHtml(def.equation) + '</td>' +
            '<td>' + modeLabel + '</td>' +
            '<td><button onclick="launchDynamicTest(' + i + ')" class="btn-secondary" style="width:auto;padding:4px 12px;font-size:10px;">▶ Run</button>' +
            ' <button onclick="deleteDynamicTest(' + i + ')" class="btn-secondary" style="width:auto;padding:4px 12px;font-size:10px;color:var(--danger);border-color:var(--danger);">🗑</button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

/**
 * Escape HTML special characters.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Launch a previously saved test from the list.
 * @param {number} index
 */
function launchDynamicTest(index) {
    var def = dynamicTestDefinitions[index];
    if (!def) {
        showToast('Test definition not found', 'error');
        return;
    }
    dynamicConfig = def;
    launchDynamicExecution(def);
}

/**
 * Delete a saved test definition.
 * @param {number} index
 */
function deleteDynamicTest(index) {
    if (index >= 0 && index < dynamicTestDefinitions.length) {
        dynamicTestDefinitions.splice(index, 1);
        localStorage.setItem('smartlap_dynamic_tests', JSON.stringify(dynamicTestDefinitions));
        loadDynamicSavedTests();
        showToast('Test deleted', 'info');
    }
}

/**
 * Launch the dynamic test execution screen with a given config.
 * @param {Object} config - The test configuration
 */
function launchDynamicExecution(config) {
    dynamicTesting = false;
    dynamicReadings = [];
    currentTest = { id: 'dynamic-exec', type: 'dynamic', name: config.testName };

    showScreen('dynamic-exec');
    document.getElementById('dyn-exec-title').textContent = '🧪 ' + config.testName + ' — Execution';
    document.getElementById('dyn-exec-params-title').textContent = 'Input Parameters';

    // Populate parameter inputs
    var paramsBody = document.getElementById('dyn-exec-params-body');
    paramsBody.innerHTML = '';
    for (var i = 0; i < config.params.length; i++) {
        var p = config.params[i];
        var unitLabel = p.unit ? ' (' + p.unit + ')' : '';
        var inputType = p.type === 'Numeric' || p.type === 'SensorInput' ? 'number' : 'text';
        var inputStep = p.type === 'Numeric' || p.type === 'SensorInput' ? 'step="any"' : '';
        var label = document.createElement('label');
        label.style.cssText = 'display:block;font-size:12px;font-weight:600;color:var(--text);margin-bottom:6px;';
        label.textContent = p.name + unitLabel;
        var input = document.createElement('input');
        input.type = inputType;
        input.id = 'dyn-param-' + p.name;
        input.className = 'dyn-exec-param-input';
        input.placeholder = p.name + unitLabel;
        input.setAttribute('step', p.type === 'Numeric' || p.type === 'SensorInput' ? 'any' : '');
        input.style.cssText = 'width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:Cairo,sans-serif;font-size:14px;margin-bottom:12px;background:var(--surface);color:var(--text);';
        input.onfocus = function() { this.style.borderColor = 'var(--accent)'; this.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; };
        input.onblur = function() { this.style.borderColor = ''; this.style.boxShadow = ''; };
        if (p.type === 'SensorInput') {
            input.disabled = dynamicModeController.IsHardwareIoTMode();
            input.placeholder = 'Sensor value (auto-read in IoT mode)';
        }
        paramsBody.appendChild(label);
        paramsBody.appendChild(input);
    }

    // Set connection banner
    updateDynamicConnBanner();

    // Reset results
    document.getElementById('dyn-result-label-display').textContent = config.resultLabel || 'Result';
    document.getElementById('dyn-result-value').textContent = '--';
    document.getElementById('dyn-result-unit').textContent = '';
    document.getElementById('dyn-results-panel').style.display = 'none';
    document.getElementById('dyn-live-indicator').style.display = 'none';
    document.getElementById('dyn-demo-banner').style.display = 'none';
    document.getElementById('dyn-override-btn').style.display = 'none';
    document.getElementById('dyn-btn-start').style.display = 'flex';
    document.getElementById('dyn-btn-stop').style.display = 'none';

    var logBody = document.getElementById('dyn-log-body');
    if (logBody) logBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Start test to see data</td></tr>';

    // Listen for mode changes from DualModeController
    dynamicModeController.OnModeChange(function(newMode) {
        updateDynamicConnBanner();
        // Enable/disable sensor inputs based on mode
        var sensorInputs = document.querySelectorAll('.dyn-exec-param-input');
        for (var j = 0; j < sensorInputs.length; j++) {
            // Re-enable or disable based on mode
            var paramRow = sensorInputs[j].closest('.form-group') || sensorInputs[j].parentNode;
            var isSensor = sensorInputs[j].id.indexOf('dyn-param-') === 0 && config.params.some(function(p) {
                return p.type === 'SensorInput' && sensorInputs[j].id === 'dyn-param-' + p.name;
            });
            if (isSensor) {
                sensorInputs[j].disabled = (newMode === 'HardwareIoTMode');
            }
        }
    });
}

/**
 * Start the dynamic test execution.
 */
function startDynamicExecution() {
    if (dynamicTesting) return;
    if (!dynamicConfig) {
        showToast('No test configuration loaded', 'error');
        return;
    }

    dynamicTesting = true;
    dynamicReadings = [];

    document.getElementById('dyn-btn-start').style.display = 'none';
    document.getElementById('dyn-btn-stop').style.display = 'flex';
    document.getElementById('dyn-live-indicator').style.display = 'flex';
    document.getElementById('dyn-results-panel').style.display = 'none';
    document.getElementById('dyn-override-btn').style.display = dynamicModeController.IsHardwareIoTMode() ? 'flex' : 'none';

    // If in demo mode, show banner
    var connSelect = document.getElementById('dyn-conn-select');
    if (connSelect && connSelect.value === 'demo') {
        document.getElementById('dyn-demo-banner').style.display = 'flex';
    }

    showToast('Test started — ' + dynamicConfig.testName, 'success');

    // If manual mode, run a single computation with current values
    if (dynamicModeController.IsManualMode() || connSelect.value === 'manual') {
        computeDynamicResult();
    } else if (connSelect.value === 'demo') {
        // Demo mode: simulate periodic readings
        window._dynDemoInterval = setInterval(function() {
            if (!dynamicTesting) {
                clearInterval(window._dynDemoInterval);
                return;
            }
            // Generate random sensor values for demo
            var demoParams = {};
            for (var i = 0; i < dynamicConfig.params.length; i++) {
                var p = dynamicConfig.params[i];
                if (p.type === 'Numeric' || p.type === 'SensorInput') {
                    demoParams[p.name] = 10 + Math.random() * 90;
                    var inputEl = document.getElementById('dyn-param-' + p.name);
                    if (inputEl) inputEl.value = demoParams[p.name].toFixed(2);
                } else {
                    demoParams[p.name] = 'Demo value';
                }
            }
            computeDynamicResultWithValues(demoParams);
        }, 2000);
    }
    // For hardware modes (browser-serial, lan, bluetooth), the serial handler
    // will call computeDynamicResult() when data arrives
}

/**
 * Stop the dynamic test execution.
 */
function stopDynamicExecution() {
    dynamicTesting = false;
    document.getElementById('dyn-btn-start').style.display = 'flex';
    document.getElementById('dyn-btn-stop').style.display = 'none';
    document.getElementById('dyn-live-indicator').style.display = 'none';
    document.getElementById('dyn-demo-banner').style.display = 'none';
    document.getElementById('dyn-override-btn').style.display = 'none';

    if (window._dynDemoInterval) {
        clearInterval(window._dynDemoInterval);
        window._dynDemoInterval = null;
    }

    // Stop serial connections
    if (typeof stopSerial === 'function') {
        try { stopSerial(); } catch(e) {}
    }

    showToast('Test stopped', 'info');
}

/**
 * Collect current input values and compute the equation result.
 */
function computeDynamicResult() {
    if (!dynamicTesting || !dynamicConfig) return;

    var vars = {};
    for (var i = 0; i < dynamicConfig.params.length; i++) {
        var p = dynamicConfig.params[i];
        var inputEl = document.getElementById('dyn-param-' + p.name);
        if (inputEl) {
            var val = inputEl.value.trim();
            if (p.type === 'Numeric' || p.type === 'SensorInput') {
                var num = parseFloat(val);
                vars[p.name] = isNaN(num) ? 0 : num;
            } else {
                vars[p.name] = val;
            }
        } else {
            vars[p.name] = p.type === 'Numeric' ? 0 : '';
        }
    }

    computeDynamicResultWithValues(vars);
}

/**
 * Compute and display result using given variable values.
 * @param {Object} vars - Dictionary of parameter values
 */
function computeDynamicResultWithValues(vars) {
    if (!dynamicConfig) return;

    try {
        var evaluator = window.equationEvaluator || new EquationEvaluator();
        var result = evaluator.EvaluateFormula(dynamicConfig.equation, vars);

        // Update live display
        document.getElementById('dyn-result-value').textContent = result.toFixed(4);
        var unitSpan = document.getElementById('dyn-result-unit');
        if (dynamicConfig.params.length > 0) {
            // Try to find a unit from the first numeric/sensor param
            for (var i = 0; i < dynamicConfig.params.length; i++) {
                if (dynamicConfig.params[i].unit) {
                    unitSpan.textContent = dynamicConfig.params[i].unit;
                    break;
                }
            }
        }

        // Log this reading
        var reading = {
            index: dynamicReadings.length + 1,
            values: Object.assign({}, vars),
            result: result,
            mode: dynamicModeController.IsManualMode() ? 'Manual' : 'Hardware',
            time: new Date().toLocaleTimeString()
        };
        dynamicReadings.push(reading);

        // Update log table
        var logBody = document.getElementById('dyn-log-body');
        if (logBody) {
            var valuesStr = '';
            var keys = Object.keys(vars);
            for (var j = 0; j < keys.length; j++) {
                valuesStr += keys[j] + '=' + (typeof vars[keys[j]] === 'number' ? vars[keys[j]].toFixed(2) : vars[keys[j]]) + ' ';
            }
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + reading.index + '</td>' +
                '<td style="font-size:10px;">' + escapeHtml(valuesStr) + '</td>' +
                '<td><strong>' + result.toFixed(4) + '</strong></td>' +
                '<td>' + reading.mode + '</td>' +
                '<td>' + reading.time + '</td>';
            logBody.appendChild(tr);
            logBody.parentElement.scrollTop = logBody.scrollHeight;
        }

    } catch (e) {
        document.getElementById('dyn-result-value').textContent = 'ERR';
        console.error('Dynamic test computation error:', e);
        if (dynamicReadings.length === 0) {
            showToast('Formula error: ' + e.message, 'error');
        }
    }
}

/**
 * Toggle between Manual and Hardware IoT mode.
 */
function toggleDynamicMode() {
    if (dynamicModeController.IsManualMode()) {
        dynamicModeController.SetHardwareIoTMode();
        document.getElementById('dyn-mode-toggle').textContent = '✏️ Switch to Manual';
        showToast('Switched to Hardware IoT Mode', 'info');
    } else {
        dynamicModeController.SetManualMode();
        document.getElementById('dyn-mode-toggle').textContent = '🔁 Switch to Hardware';
        showToast('Switched to Manual Mode', 'info');
    }
    updateDynamicConnBanner();
}

/**
 * Override hardware mode to manual input.
 */
function overrideToManual() {
    dynamicModeController.SetManualMode();
    document.getElementById('dyn-override-btn').style.display = 'none';
    // Enable all inputs
    var inputs = document.querySelectorAll('.dyn-exec-param-input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }
    showToast('Overridden to Manual Input', 'success');
}

/**
 * Handle connection type change on execution screen.
 */
function onDynamicConnChange() {
    var sel = document.getElementById('dyn-conn-select').value;
    if (sel === 'manual') {
        dynamicModeController.SetManualMode();
        var inputs = document.querySelectorAll('.dyn-exec-param-input');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
        document.getElementById('dyn-override-btn').style.display = 'none';
    } else if (sel === 'demo') {
        dynamicModeController.SetManualMode();
    } else {
        dynamicModeController.SetHardwareIoTMode();
        // Disable sensor inputs when in hardware mode
        if (dynamicConfig) {
            var params = dynamicConfig.params;
            for (var j = 0; j < params.length; j++) {
                if (params[j].type === 'SensorInput') {
                    var inputEl = document.getElementById('dyn-param-' + params[j].name);
                    if (inputEl) inputEl.disabled = true;
                }
            }
        }
        document.getElementById('dyn-override-btn').style.display = 'flex';
    }
    updateDynamicConnBanner();
}

/**
 * Update the connection status banner UI.
 */
function updateDynamicConnBanner() {
    var dot = document.getElementById('dyn-conn-dot');
    var text = document.getElementById('dyn-conn-text');
    var toggleBtn = document.getElementById('dyn-mode-toggle');

    if (dynamicModeController.IsManualMode()) {
        dot.className = 'dyn-conn-indicator offline';
        text.textContent = 'Manual Mode — Enter values below';
        toggleBtn.textContent = '🔁 Switch to Hardware';
    } else {
        dot.className = 'dyn-conn-indicator online';
        text.textContent = 'Hardware IoT Mode — Reading from sensors';
        toggleBtn.textContent = '✏️ Switch to Manual';
    }
}

/**
 * Generate PDF report for the dynamic test.
 */
function generateDynamicPDF() {
    if (dynamicReadings.length === 0) {
        showToast('No readings to export', 'warning');
        return;
    }
    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        doc.setFontSize(20); doc.setFont(undefined, 'bold');
        doc.text('SmartLAP - Dynamic Test Report', 105, 18, { align: 'center' });
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions', 105, 26, { align: 'center' });
        doc.line(15, 30, 195, 30);

        var y = 38;
        doc.setFont(undefined, 'bold'); doc.text('Test Information', 195, y, { align: 'right' }); y += 7;
        doc.setFont(undefined, 'normal');
        doc.text('Date: ' + new Date().toLocaleString(), 195, y, { align: 'right' }); y += 5;
        doc.text('Test: ' + (dynamicConfig ? dynamicConfig.testName : ''), 195, y, { align: 'right' }); y += 5;
        doc.text('Formula: ' + (dynamicConfig ? dynamicConfig.equation : ''), 195, y, { align: 'right' }); y += 5;
        doc.text('Mode: ' + (dynamicModeController.IsManualMode() ? 'Manual' : 'Hardware IoT'), 195, y, { align: 'right' }); y += 8;
        doc.line(15, y, 195, y); y += 6;

        doc.setFont(undefined, 'bold'); doc.text('Readings Log', 195, y, { align: 'right' }); y += 6;
        var hdrs = ['#', 'Values', 'Result', 'Mode', 'Time'];
        var cx = [195, 175, 140, 110, 90];
        doc.setFontSize(8);
        for (var h = 0; h < hdrs.length; h++) doc.text(hdrs[h], cx[h], y, { align: 'right' });
        y += 1; doc.line(15, y, 195, y); y += 4;
        doc.setFont(undefined, 'normal');
        for (var i = 0; i < dynamicReadings.length; i++) {
            var r = dynamicReadings[i];
            doc.text(String(r.index), cx[0], y, { align: 'right' });
            var valsStr = '';
            var keys = Object.keys(r.values);
            for (var k = 0; k < keys.length; k++) {
                valsStr += keys[k] + '=' + (typeof r.values[keys[k]] === 'number' ? r.values[keys[k]].toFixed(2) : r.values[keys[k]]) + ' ';
            }
            doc.text(valsStr.substring(0, 25), cx[1], y, { align: 'right' });
            doc.text(String(r.result.toFixed(4)), cx[2], y, { align: 'right' });
            doc.text(r.mode, cx[3], y, { align: 'right' });
            doc.text(r.time, cx[4], y, { align: 'right' });
            y += 4; if (y > 270) { doc.addPage(); y = 20; }
        }
        y += 4; doc.line(15, y, 195, y); y += 6;
        doc.setFontSize(11); doc.setFont(undefined, 'bold');
        doc.text('Final Summary', 195, y, { align: 'right' }); y += 7;
        doc.setFont(undefined, 'normal');
        doc.text('Total Readings: ' + dynamicReadings.length, 195, y, { align: 'right' }); y += 5;
        if (dynamicReadings.length > 0) {
            var lastResult = dynamicReadings[dynamicReadings.length - 1].result;
            doc.text('Last Result: ' + lastResult.toFixed(4), 195, y, { align: 'right' }); y += 5;
        }
        doc.setFontSize(7); doc.setTextColor(150);
        doc.text('SmartLAP v1.0.0 — Fimto Soft', 105, 285, { align: 'center' });
        doc.save('Dynamic_Test_Report_' + new Date().toISOString().slice(0, 10) + '.pdf');
        showToast('PDF downloaded', 'success');
    } catch (e) {
        showToast('PDF error: ' + e.message, 'error');
    }
}

/**
 * Show AI predictions modal for dynamic test.
 */
function showDynamicAIPredictions() {
    if (dynamicReadings.length === 0) {
        showToast('No data to analyze', 'warning');
        return;
    }
    var body = document.getElementById('ml-predictions-body');
    if (!body) return;
    body.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.style.cssText = 'font-size:14px;font-weight:700;color:var(--accent);margin:0 0 12px;';
    h4.textContent = '🧠 AI Predictions — ' + (dynamicConfig ? dynamicConfig.testName : 'Dynamic Test');
    body.appendChild(h4);

    var readings = dynamicReadings;
    var values = readings.map(function(r) { return r.result; });
    var avg = values.reduce(function(s, v) { return s + v; }, 0) / values.length;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var sorted = values.slice().sort(function(a, b) { return a - b; });
    var median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    var stdSum = 0;
    for (var i = 0; i < values.length; i++) {
        stdSum += Math.pow(values[i] - avg, 2);
    }
    var stdDev = Math.sqrt(stdSum / values.length);

    var statsHtml =
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">Readings</div>' +
                '<div style="font-size:22px;font-weight:900;color:var(--text);">' + readings.length + '</div></div>' +
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">Average</div>' +
                '<div style="font-size:22px;font-weight:900;color:var(--accent);">' + avg.toFixed(4) + '</div></div>' +
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">Median</div>' +
                '<div style="font-size:22px;font-weight:900;color:var(--success);">' + median.toFixed(4) + '</div></div>' +
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">Std Deviation</div>' +
                '<div style="font-size:22px;font-weight:900;color:var(--warning);">' + stdDev.toFixed(4) + '</div></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">Min</div>' +
                '<div style="font-size:18px;font-weight:900;color:var(--danger);">' + min.toFixed(4) + '</div></div>' +
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">Max</div>' +
                '<div style="font-size:18px;font-weight:900;color:var(--success);">' + max.toFixed(4) + '</div></div>' +
        '</div>';

    body.innerHTML += statsHtml;

    // Trend analysis
    if (values.length >= 3) {
        var trend = values[values.length - 1] - values[0];
        var trendDir = trend > 0 ? '📈 Upward' : trend < 0 ? '📉 Downward' : '➡️ Stable';
        var trendColor = trend > 0 ? 'var(--success)' : trend < 0 ? 'var(--danger)' : 'var(--text-muted)';
        body.innerHTML +=
            '<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:4px;">🔮 Trend Analysis</div>' +
                '<div style="font-size:16px;font-weight:700;color:' + trendColor + ';">' + trendDir +
                ' (Δ=' + trend.toFixed(4) + ')</div></div>';
    }

    // Prediction using linear extrapolation
    if (values.length >= 5) {
        var n = values.length;
        var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (var j = 0; j < n; j++) {
            sumX += j;
            sumY += values[j];
            sumXY += j * values[j];
            sumX2 += j * j;
        }
        var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        var intercept = (sumY - slope * sumX) / n;
        var predNext = slope * n + intercept;

        body.innerHTML +=
            '<div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:8px;padding:12px;margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;color:#8b5cf6;margin-bottom:4px;">🔮 Predicted Next Value (Linear Trend)</div>' +
                '<div style="font-size:24px;font-weight:900;color:#8b5cf6;">' + predNext.toFixed(4) + '</div>' +
                '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Based on last ' + n + ' readings (R² extrapolation)</div></div>';
    }

    // Open the modal
    var modal = document.getElementById('modal-ml-predictions');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Create overlay if it doesn't exist
        var overlay = document.createElement('div');
        overlay.className = 'fab-modal-overlay show';
        overlay.id = 'modal-ml-predictions';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.style.display = 'none'; };
        overlay.innerHTML = '<div class="fab-modal">' +
            '<div class="fab-modal-header"><h3>🧠 AI Predictions — ' + (dynamicConfig ? dynamicConfig.testName : 'Dynamic Test') + '</h3>' +
            '<button class="fab-modal-close" onclick="this.closest(\'.fab-modal-overlay\').style.display=\'none\'">✕</button></div>' +
            '<div class="fab-modal-body">' + body.innerHTML + '</div></div>';
        document.body.appendChild(overlay);
    }

    showToast('AI analysis complete', 'success');
}

function toggleDarkMode() {
    var theme = document.documentElement.getAttribute('data-theme');
    var next = theme === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('smartlap-theme', next || 'light');
    var btn = document.getElementById('dark-toggle');
    if (btn) btn.textContent = next === 'dark' ? '\u2600' : '\uD83C\uDF19';
}

(function() {
    if (localStorage.getItem('smartlap-theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

function exportToExcel(testName, data) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    var headers = Object.keys(data[0]);
    var csv = '\uFEFF';
    csv += headers.join(',') + '\n';
    for (var i = 0; i < data.length; i++) {
        var row = [];
        for (var j = 0; j < headers.length; j++) {
            var val = data[i][headers[j]];
            var str = val != null ? String(val) : '';
            if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
                str = '"' + str.replace(/"/g, '""') + '"';
            }
            row.push(str);
        }
        csv += row.join(',') + '\n';
    }
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = testName.replace(/[^a-zA-Z0-9_\-]/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast('CSV exported: ' + link.download, 'success');
}

// ===== TEST INFO DATA =====
var TEST_INFO = {
  compaction: {
    standard:'ASTM D698 / D1557',
    equipment:['Proctor mold (944 cm³ or 2124 cm³)','Hammer (2.5 kg or 4.5 kg)','Balance (0.1 g sensitivity)','Oven (110 ± 5°C)','Sieve No. 4','Mixing tools','Moisture cans'],
    procedure:['Prepare soil sample and adjust moisture content','Compact soil in 3 layers with specified blows per layer','Trim excess soil and weigh mold + compacted soil','Extract sample and measure moisture content','Repeat for 4-5 moisture points','Plot dry density vs moisture content curve'],
    duration:'~2 hours per point (full curve: 8-10 hours)',
    theory_en:'Compaction is the process of densifying soil by reducing air voids through mechanical energy. The Proctor test determines the maximum dry density (MDD) and optimum moisture content (OMC) for a given compactive effort. The standard Proctor uses a 2.5 kg hammer falling 305 mm with 25 blows per layer, while the modified Proctor uses a 4.5 kg hammer falling 457 mm with 25 blows per layer.',
    theory_ar:'الدمك هو عملية زيادة كثافة التربة بتقليل الفراغات الهوائية باستخدام طاقة ميكانيكية. اختبار بروكتور يحدد أقصى كثافة جافة (MDD) والمحتوى الرطوبي الأمثل (OMC) لجهد دمك معين.'
  },
  cbr: {
    standard:'ASTM D1883',
    equipment:['CBR mold (152 mm dia)','Surcharge weights (4.5 kg)','Penetration piston (49.6 mm dia)','Loading frame with proving ring','Dial gauge (0.01 mm)','Soaking tank','Swelling gauge'],
    procedure:['Compact soil in CBR mold at OMC','Apply surcharge weights','Soak in water for 4 days (if required)','Measure swelling','Mount mold on loading frame','Apply penetration at 1.27 mm/min','Record load at 2.5 mm and 5.0 mm penetration'],
    duration:'~1 hour (unsoaked) or 4 days (soaked)',
    theory_en:'The California Bearing Ratio (CBR) measures the bearing capacity of soil subgrade and base courses. It is the ratio of the force required to penetrate a soil mass with a standard piston to the force required for an equal penetration in a standard crushed stone material. CBR = (Test Load / Standard Load) × 100.',
    theory_ar:'نسبة كاليفورنيا للحمل (CBR) تقيس قدرة تحمل تربة الطبقة الأساسية والطبقات التحتية.'
  },
  straightedge: {
    standard:'ASTM E1155 / AASHTO',
    equipment:['4 m straightedge','Taper gauge (wedge)','Measuring tape','Level'],
    procedure:['Place straightedge on surface','Measure gap under straightedge with taper gauge','Record maximum deviation','Repeat at specified intervals','Calculate average irregularity'],
    duration:'~30 min per section',
    theory_en:'The straightedge test measures surface evenness of concrete floors and pavements. The maximum gap between the straightedge and the surface determines the irregularity index.',
    theory_ar:'اختبار الاستقامة لقياس تسوية أسطح الخرسانة والأرضيات.'
  },
  slump: {
    standard:'ASTM C143',
    equipment:['Slump cone (300 mm height)','Tamping rod (16 mm dia, 600 mm long)','Measuring tape','Base plate','Scoop'],
    procedure:['Moisten cone and base plate','Fill cone in 3 layers, rod 25 times each','Level the top','Remove cone carefully in 5 ± 2 seconds','Measure slump as vertical drop','Record slump in mm'],
    duration:'~10 min',
    theory_en:'The slump test measures the consistency of fresh concrete. The difference between the height of the mold and the height of the concrete after subsidence is the slump value. Higher slump indicates more workable concrete.',
    theory_ar:'اختبار الهبوط لقياس قابلية تشغيل الخرسانة الطازجة.'
  },
  maturity: {
    standard:'ASTM C1074',
    equipment:['Temperature sensor / data logger','Maturity meter','Thermocouple wires','Compression machine (for correlation)'],
    procedure:['Embed temperature sensor in concrete','Record temperature over time','Calculate Nurse-Saul maturity: M = Σ(T - T₀) × Δt','Calculate Arrhenius maturity if needed','Correlate maturity with compressive strength'],
    duration:'Continuous monitoring (1-28 days)',
    theory_en:'Concrete maturity is a method to estimate in-place concrete strength based on temperature history. The Nurse-Saul method uses a linear relationship: M = Σ(T - T₀) × Δt, where T₀ = -10°C. The Arrhenius method accounts for temperature sensitivity of cement hydration.',
    theory_ar:'نضج الخرسانة طريقة لتقدير مقاومة الخرسانة في الموقع بناءً على تاريخ درجة الحرارة.'
  },
  marshall: {
    standard:'ASTM D6927',
    equipment:['Marshall compaction hammer','Marshall stability apparatus','Mold (101.6 mm dia)','Water bath (60°C)','Flow meter','Balance','Oven'],
    procedure:['Prepare asphalt mix at specified temperature','Compact specimen with 50 or 75 blows per side','Cool to room temperature','Heat in water bath at 60°C for 30-40 min','Load at 50 mm/min until failure','Record stability (kN) and flow (mm)'],
    duration:'~2 hours per specimen',
    theory_en:'The Marshall test determines the stability and flow of asphalt concrete specimens. Stability is the maximum load resistance, and flow is the vertical deformation at failure. Used for mix design and quality control.',
    theory_ar:'اختبار مارشال لتحديد ثباتية وانسيابية خلطات الأسفلت.'
  },
  bitumen: {
    standard:'ASTM D2172',
    equipment:['Solvent (trichloroethylene or equivalent)','Filter paper','Balance','Oven','Centrifuge (optional)'],
    procedure:['Weigh bituminous mixture sample','Dissolve binder in solvent','Separate aggregate by filtration or centrifuge','Dry and weigh aggregate','Calculate bitumen content by difference'],
    duration:'~1-2 hours',
    theory_en:'The bitumen content test determines the percentage of asphalt binder in a mix. The binder is dissolved using a solvent, and the remaining aggregate is weighed to calculate binder content by difference.',
    theory_ar:'اختبار تحديد نسبة البيتومين في الخلطات الأسفلتية.'
  },
  penetration: {
    standard:'ASTM D5',
    equipment:['Penetrometer','Standard needle (100 g)','Timer','Sample container','Water bath (25°C)'],
    procedure:['Heat bitumen and pour into sample container','Cool to room temperature','Condition in water bath at 25°C for 1 hour','Place under penetrometer','Release needle for 5 seconds','Read penetration depth (0.1 mm units)'],
    duration:'~2 hours',
    theory_en:'The penetration test measures the hardness of bitumen by determining the depth a standard needle penetrates under specified conditions. Penetration grade (e.g., 60/70) classifies bitumen for different applications.',
    theory_ar:'اختبار الاختراق لقياس صلابة البيتومين.'
  },
  ductility: {
    standard:'ASTM D113',
    equipment:['Ductility mold (briquette)','Ductility testing machine','Water bath (25°C)'],
    procedure:['Pour bitumen into briquette mold','Cool and trim excess','Condition in water bath at 25°C','Place in ductility machine','Pull at 5 cm/min','Record distance at break (cm)'],
    duration:'~1 hour',
    theory_en:'The ductility test measures the cohesive properties of bitumen by stretching a briquette specimen at a specified speed and temperature. The distance at which the thread breaks indicates ductility.',
    theory_ar:'اختبار المطاوعة لقياس خاصية التماسك للبيتومين.'
  },
  softening_point: {
    standard:'ASTM D36',
    equipment:['Ring and Ball apparatus','Thermometer','Glycerol bath','Steel balls (3.5 mm)','Hot plate'],
    procedure:['Prepare bitumen specimen in brass rings','Place rings in apparatus with steel balls','Heat bath at 5°C/min','Record temperature when ball touches bottom plate','Report as softening point (°C)'],
    duration:'~30 min',
    theory_en:'The ring and ball softening point test determines the temperature at which bitumen reaches a specified softness. A steel ball placed on a bitumen disc causes the disc to sag and touch a base plate at the softening point temperature.',
    theory_ar:'اختبار نقطة التليين (الحلقة والكرة) لتحديد درجة حرارة تليين البيتومين.'
  },
  viscosity: {
    standard:'ASTM D4402',
    equipment:['Rotational viscometer','Thermocouple','Heating unit','Spindle','Sample chamber'],
    procedure:['Heat bitumen to test temperature','Place sample in viscometer chamber','Insert spindle','Apply torque','Record viscosity at specified shear rate','Repeat at different temperatures if needed'],
    duration:'~30 min per temperature',
    theory_en:'Viscosity measures the resistance of bitumen to flow. The rotational viscometer measures torque at controlled speed and temperature. Viscosity-temperature curves are used to determine mixing and compaction temperatures.',
    theory_ar:'اللزوجة تقيس مقاومة البيتومين للجريان.'
  },
  atterberg: {
    standard:'ASTM D4318',
    equipment:['Liquid limit device (Casagrande)','Grooving tool','Moisture cans','Balance','Oven','Glass plate','Plastic limit rolling thread'],
    procedure:['Prepare soil sample passing No. 40 sieve','Mix with water to form paste','Place in liquid limit device','Cut groove and drop cup 25 times','Measure moisture content','Roll thread for plastic limit','Calculate PI = LL - PL'],
    duration:'~2 hours',
    theory_en:'Atterberg limits define the critical water contents of fine-grained soils. The Liquid Limit (LL) is where soil transitions from plastic to liquid state. The Plastic Limit (PL) is where soil becomes non-plastic. Plasticity Index (PI = LL - PL) indicates soil plasticity.',
    theory_ar:'حدود أتربرغ تحدد محتويات الماء الحرجة للتربة الناعمة.'
  },
  sieve: {
    standard:'ASTM D6913 / D422',
    equipment:['Sieve stack (various sizes)','Mechanical shaker','Balance (0.1 g)','Oven'],
    procedure:['Dry soil sample in oven','Weigh total sample','Arrange sieve stack in descending order','Place sample on top sieve','Shake for 10-15 minutes','Weigh material retained on each sieve','Calculate % passing and % retained'],
    duration:'~1 hour',
    theory_en:'Sieve analysis determines the particle size distribution of soil. The cumulative percentage passing each sieve is plotted on a semi-log graph. Key parameters: D10, D30, D60. Cu = D60/D10, Cc = D30²/(D60×D10).',
    theory_ar:'التحليل الحجمي لتوزيع أحجام حبيبات التربة.'
  },
  compressive: {
    standard:'ASTM C39',
    equipment:['Compression testing machine','Cylinder mold (150×300 mm)','Capping apparatus','Measuring calipers'],
    procedure:['Prepare concrete cylinders','Cure for specified period (7, 14, 28 days)','Cap ends with sulfur or neoprene','Place in compression machine','Load at 0.25 ± 0.05 MPa/s','Record maximum load','Calculate stress = Load / Area'],
    duration:'~10 min per specimen (plus curing)',
    theory_en:'Compressive strength is the ability of concrete to resist axial loads. f_c = P/A, where P is the maximum load and A is the cross-sectional area. Strength depends on water-cement ratio, curing, age, and aggregate quality.',
    theory_ar:'مقاومة الانضغاط هي قدرة الخرسانة على مقاومة الأحمال المحورية.'
  },
  air: {
    standard:'ASTM C231',
    equipment:['Air content meter (pressure type)','Strike-off bar','Measuring vessel','Rubber mallet','Trowel'],
    procedure:['Fill measure with fresh concrete in 3 layers','Rod each layer 25 times','Strike off and clean','Seal air meter chamber','Apply pressure and read air content %','Release pressure and verify'],
    duration:'~15 min',
    theory_en:'The pressure method measures air content in fresh concrete. Boyle\'s Law is applied: increasing pressure reduces air volume proportionally. Air content affects durability, especially freeze-thaw resistance.',
    theory_ar:'نسبة الهواء في الخرسانة الطازجة بطريقة الضغط.'
  },
  flexural: {
    standard:'ASTM C78',
    equipment:['Flexural testing machine','Third-point loading apparatus','Beam molds (150×150×500 mm)','Deflection gauge'],
    procedure:['Prepare concrete beam specimen','Cure for 28 days','Position beam on supports','Apply load at third points','Record maximum load','Calculate modulus of rupture R = PL/(bd²)'],
    duration:'~15 min per specimen',
    theory_en:'The flexural strength (modulus of rupture) measures the tensile strength of concrete in bending. R = PL/(bd²) for third-point loading. Used for pavement and structural design.',
    theory_ar:'مقاومة الانثناء (معامل التمزق) تقيس مقاومة الخرسانة للشد في الانحناء.'
  },
  split_tensile: {
    standard:'ASTM C496',
    equipment:['Compression testing machine','Cylinder mold','Bearing strips (plywood)','Measuring tape'],
    procedure:['Prepare concrete cylinder','Place cylinder horizontally in machine','Apply load along diameter at 0.7-1.4 MPa/min','Record maximum load','Calculate T = 2P/(πLD)'],
    duration:'~10 min per specimen',
    theory_en:'The split tensile test measures the tensile strength of concrete by applying a diametral compressive load. T = 2P/(πLD). Values are typically 8-14% of compressive strength.',
    theory_ar:'اختبار الشد الانشعابي لقياس مقاومة الخرسانة للشد.'
  },
  permeability: {
    standard:'ASTM D2434',
    equipment:['Permeameter','Standpipe','Timer','Graduated cylinder','Thermometer'],
    procedure:['Compact soil in permeameter','Saturate specimen with water','Apply constant head (constant head test)','Measure flow rate Q over time','Measure head difference h','Calculate k = QL/(Aht)'],
    duration:'~1-2 hours',
    theory_en:'Permeability (hydraulic conductivity) measures the ease of water flow through soil. k = QL/(Aht) for constant head test. Falling head: k = (aL)/(At) × ln(h₁/h₂). Fine-grained soils have lower k values.',
    theory_ar:'النفاذية تقيس سهولة جريان الماء في التربة.'
  },
  specific_gravity: {
    standard:'ASTM D854',
    equipment:['Pycnometer (volumetric flask)','Balance (0.001 g)','Vacuum pump','Water bath','Oven'],
    procedure:['Dry soil sample','Weigh empty pycnometer','Add dry soil and weigh','Add water and de-air','Fill to calibration mark','Weigh pycnometer + soil + water','Calculate Gs = Ws/(Ws + Wpw - Wpsw)'],
    duration:'~1 hour',
    theory_en:'Specific gravity (Gs) is the ratio of the weight of soil solids to the weight of an equal volume of water. Used to calculate void ratio, porosity, and saturation. Gs = Ws/(Ws + Wpw - Wpsw).',
    theory_ar:'الوزن النوعي لحبيبات التربة.'
  },
  water_absorption: {
    standard:'ASTM C642',
    equipment:['Balance (0.1 g)','Oven (110 ± 5°C)','Water tank','Wire basket'],
    procedure:['Dry specimen to constant weight (Wdry)','Immerse in water for 24 hours','Surface dry with cloth (Wsat)','Weigh saturated specimen','Calculate absorption% = (Wsat-Wdry)/Wdry × 100'],
    duration:'~24 hours',
    theory_en:'Water absorption measures the porosity of aggregates or concrete. The percentage of water absorbed relative to dry weight indicates the material\'s permeability and durability potential.',
    theory_ar:'امتصاص الماء يقيس مسامية الركام أو الخرسانة.'
  },
  direct_shear: {
    standard:'ASTM D3080',
    equipment:['Direct shear apparatus','Shear box (60×60 mm)','Porous stones','Dial gauges','Weight hanger'],
    procedure:['Prepare soil specimen in shear box','Apply normal stress','Saturate specimen if needed','Apply shear at constant strain rate (0.5 mm/min)','Record shear force vs displacement','Repeat at 3 normal stresses','Plot Mohr-Coulomb failure envelope'],
    duration:'~1 hour per specimen (3 tests minimum)',
    theory_en:'The direct shear test determines shear strength parameters: cohesion (c) and friction angle (φ). τ = c + σ tan(φ). Three or more specimens at different normal stresses define the failure envelope.',
    theory_ar:'اختبار القص المباشر لتحديد معاملات مقاومة القص (التماسك وزاوية الاحتكاك).'
  }
};

function showExperiment(type) {
    var t = I18N[currentLang] || I18N.en;
    var info = TEST_INFO[type];
    if (!info) { showToast('Info not available for ' + type, 'warning'); return; }
    var isAr = currentLang === 'ar';
    var testName = t['test_' + type] || type;
    document.getElementById('modal-experiment-title').textContent = testName + ' — ' + (isAr ? 'شرح التجربة' : 'Experiment Procedure');
    var body = document.getElementById('modal-experiment-body');
    body.innerHTML =
        '<div class="exp-section">' +
            '<h4>' + (isAr ? '🎯 الهدف من التجربة' : '🎯 Objective') + '</h4>' +
            '<p>' + (isAr ? info.theory_ar : info.theory_en) + '</p>' +
        '</div>' +
        '<div class="exp-section">' +
            '<h4>' + (isAr ? '📋 المواصفة القياسية' : '📋 Standard') + '</h4>' +
            '<p style="font-weight:700;color:var(--accent);">' + info.standard + '</p>' +
        '</div>' +
        '<div class="exp-section">' +
            '<h4>' + (isAr ? '🔧 خطوات العمل بالتفصيل' : '🔧 Detailed Procedure') + '</h4>' +
            '<ol>' + info.procedure.map(function(s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
        '</div>' +
        '<div class="exp-section">' +
            '<h4>' + (isAr ? '⏱ الوقت المستغرق' : '⏱ Duration') + '</h4>' +
            '<p>' + info.duration + '</p>' +
        '</div>' +
        '<div class="exp-section" style="background:var(--surface-alt);border-radius:8px;padding:12px;margin-top:8px;">' +
            '<h4>' + (isAr ? '💡 ملاحظات هامة' : '💡 Important Notes') + '</h4>' +
            '<p style="font-size:12px;color:var(--text-muted);">' + (isAr ?
                'تأكد من معايرة الأجهزة قبل البدء. سجل جميع القراءات في دفتر الملاحظات. اتبع إرشادات السلامة المهنية.' :
                'Ensure all equipment is calibrated before starting. Record all readings in the lab notebook. Follow all safety guidelines.') + '</p>' +
        '</div>';
    document.getElementById('modal-experiment').classList.add('show');
}

function showTechDetails(type) {
    var t = I18N[currentLang] || I18N.en;
    var info = TEST_INFO[type];
    if (!info) { showToast('Details not available for ' + type, 'warning'); return; }
    var isAr = currentLang === 'ar';
    var testName = t['test_' + type] || type;
    document.getElementById('modal-techdetails-title').textContent = testName + ' — ' + (isAr ? 'تفاصيل فنية' : 'Technical Details');
    var body = document.getElementById('modal-techdetails-body');
    body.innerHTML =
        '<dl class="tech-grid">' +
            '<dt>' + (isAr ? '📏 المواصفة' : '📏 Standard') + '</dt><dd>' + info.standard + '</dd>' +
            '<dt>' + (isAr ? '⏱ المدة' : '⏱ Duration') + '</dt><dd>' + info.duration + '</dd>' +
        '</dl>' +
        '<div class="exp-section">' +
            '<h4>' + (isAr ? '⚙️ الأجهزة والمعدات المطلوبة' : '⚙️ Required Equipment') + '</h4>' +
            '<ul>' + info.equipment.map(function(s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="exp-section">' +
            '<h4>' + (isAr ? '🔬 المبدأ العلمي' : '🔬 Scientific Principle') + '</h4>' +
            '<p>' + (isAr ? info.theory_ar : info.theory_en) + '</p>' +
        '</div>';
    document.getElementById('modal-techdetails').classList.add('show');
}

// ===== FIREBASE MIGRATION: patch old domains/tests with nameEn =====
async function migrateFirebaseData() {
    if (typeof db === 'undefined') return;
    try {
        var snap = await db.collection('domains').get();
        var batch = db.batch();
        var changed = 0;
        snap.forEach(function(doc) {
            var d = doc.data();
            var updates = {};
            if (!d.key) { var key = d.order === 1 ? 'roads' : d.order === 2 ? 'concrete' : d.order === 3 ? 'asphalt' : ''; if (key) updates.key = key; }
            if (!d.nameEn) {
                var en = '';
                if (d.name.indexOf('طرق') !== -1) en = 'Roads & Soil';
                else if (d.name.indexOf('خرسانة') !== -1) en = 'Concrete';
                else if (d.name.indexOf('أسفلت') !== -1) en = 'Asphalt';
                if (en) { updates.nameEn = en; updates.descriptionEn = d.description || ''; }
            }
            if (Object.keys(updates).length > 0) { batch.update(doc.ref, updates); changed++; }
        });
        if (changed > 0) await batch.commit();
        // Migrate tests
        var tSnap = await db.collection('tests').get();
        var tBatch = db.batch();
        var tChanged = 0;
        var testNameMap = {
            'الدمك':'Compaction (Proctor)','رطوبة':'Moisture Test','CBR':'CBR','استقامة':'Straightedge',
            'أتربرغ':'Atterberg Limits','حجمية':'Sieve Analysis','قص':'Direct Shear','نفاذية':'Permeability',
            'نوعي':'Specific Gravity','امتصاص':'Water Absorption','انضباط':'Slump Test','نضج':'Concrete Maturity',
            'انضغاطي':'Compressive Strength','هواء':'Air Content','انثناء':'Flexural Strength','انشعابي':'Split Tensile',
            'مارشال':'Marshall Test','بيتومين':'Bitumen Photo-Tester','انساب':'Penetration','مطاوعة':'Ductility',
            'تليين':'Softening Point','لزوجة':'Viscosity'
        };
        tSnap.forEach(function(doc) {
            var t = doc.data();
            if (!t.nameEn && t.name) {
                var en = '';
                Object.keys(testNameMap).forEach(function(k) {
                    if (t.name.indexOf(k) !== -1) en = testNameMap[k];
                });
                if (en) { tBatch.update(doc.ref, { nameEn: en }); tChanged++; }
            }
        });
        if (tChanged > 0) await tBatch.commit();
        if (changed || tChanged) console.log('Migration: patched ' + changed + ' domains + ' + tChanged + ' tests');
    } catch(e) { console.warn('Migration skipped:', e.message); }
}
setTimeout(migrateFirebaseData, 3000);
