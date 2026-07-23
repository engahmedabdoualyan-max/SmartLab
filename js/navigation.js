function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-' + id).classList.add('active');
    window.scrollTo(0,0);
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
        var GEMINI_API_KEY = (typeof SmartLAP_CONFIG !== 'undefined') 
            ? SmartLAP_CONFIG.gemini.apiKey 
            : 'AIzaSyDDr7EQ95hLdecc1BDIZIFhmmmVMLArBsU';
        var GEMINI_MODEL = (typeof SmartLAP_CONFIG !== 'undefined') 
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
// DOMAINS & TESTS
// ================================================================
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
  var test = { id: type + '-static', type: type, name: def.name };
  currentTest = test;
  openTest(test);
}

async function loadDomains() {
    var c = document.getElementById('domains-list');
    safeSetText(c,'Loading...');
    try {
        var snap = await db.collection('domains').get();
        if (snap.empty) { await seedDomains(); return loadDomains(); }
        if(c)c.textContent='';
        var domains=[];snap.forEach(function(doc){var d=doc.data();d.id=doc.id;domains.push(d);});domains.sort(function(a,b){return (a.order||0)-(b.order||0);});
        var icons = { 'طرق':'🛣️', 'خرسانة':'🏗️', 'أسفلت':'🛤️', 'Roads':'🛣️', 'Concrete':'🏗️', 'Asphalt':'🛤️', '道路':'🛣️', '混凝土':'🏗️', '沥青':'🛤️', 'Straßen':'🛣️', 'Beton':'🏗️', 'Asphalt':'🛤️' };
        domains.forEach(function(d) {
            var ik = Object.keys(icons).find(function(k){return d.name.includes(k);}) || '🔬';
            var card = document.createElement('a'); card.href='#'; card.className='domain-card'; card.setAttribute('tabindex','0'); card.setAttribute('role','button'); card.setAttribute('aria-label',d.name);
            card.onclick = function(e){e.preventDefault();selectDomain(d);};
            var iconDiv=document.createElement('div');iconDiv.className='domain-icon';iconDiv.setAttribute('aria-hidden','true');iconDiv.textContent=icons[ik]||'🔬';
            var infoDiv=document.createElement('div');infoDiv.className='domain-info';
            var h3=document.createElement('h3');h3.textContent=d.name;
            var pDesc=document.createElement('p');pDesc.textContent=d.description||'';
            infoDiv.appendChild(h3);infoDiv.appendChild(pDesc);
            card.appendChild(iconDiv);card.appendChild(infoDiv);
            c.appendChild(card);
        });
        loadAITeam();
        loadStats();
    } catch(e) { if(c)safeSetText(c,'Error: '+sanitizeInput(e.message)); }
}

async function seedDomains() {
    var batch = db.batch();
    [{name:'قسم الطرق والتربة',description:'اختبارات الطرق والتربة',order:1},{name:'قسم الخرسانة',description:'اختبارات الخرسانة',order:2},{name:'قسم الأسفلت',description:'اختبارات الأسفلت',order:3}].forEach(function(d){batch.set(db.collection('domains').doc(),d);});
    await batch.commit();
    var tb = db.batch();
    var ds = await db.collection('domains').where('name','==','قسم الطرق والتربة').get();
if(!ds.empty){var did=ds.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار الدمك',domainId:did,order:1,type:'compaction',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار تحديد الرطوبة',domainId:did,order:2,type:'moisture',config:{inputs:[{name:'وزن_الأرض',label:'وزن العينة الرطبة (كغ)',type:'number'},{name:'وزن_الجافة',label:'وزن العينة الجافة (كغ)',type:'number'}]}});tb.set(db.collection('tests').doc(),{name:'اختبار نسبة الحمل (CBR)',domainId:did,order:3,type:'cbr',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار استقامة الطرق (Straightedge)',domainId:did,order:4,type:'straightedge',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'حدود أتربرغ (Atterberg Limits)',domainId:did,order:5,type:'atterberg',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'التحاليل الحجمية (Sieve Analysis)',domainId:did,order:6,type:'sieve',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار القص المباشر (Direct Shear)',domainId:did,order:7,type:'direct_shear',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار النفاذية (Permeability)',domainId:did,order:8,type:'permeability',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الوزن النوعي (Specific Gravity)',domainId:did,order:9,type:'specific_gravity',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'امتصاص الماء (Water Absorption)',domainId:did,order:10,type:'water_absorption',config:{inputs:[]}});}
    var d2=await db.collection('domains').where('name','==','قسم الخرسانة').get();
    if(!d2.empty){var cid=d2.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار الانضباط (Slump)',domainId:cid,order:1,type:'slump',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نضج الخرسانة (Maturity)',domainId:cid,order:2,type:'maturity',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الشد الانضغاطي (Compressive Strength)',domainId:cid,order:3,type:'compressive',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نسبة الهواء (Air Content)',domainId:cid,order:4,type:'air',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'قوة الانثناء (Flexural Strength)',domainId:cid,order:5,type:'flexural',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الشد الانشعابي (Split Tensile)',domainId:cid,order:6,type:'split_tensile',config:{inputs:[]}});}
    var d3=await db.collection('domains').where('name','==','قسم الأسفلت').get();
    if(!d3.empty){var aid=d3.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار مارشال الرقمي (Marshall)',domainId:aid,order:1,type:'marshall',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'_photo-Tester للбитومين',domainId:aid,order:2,type:'bitumen',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار الانساب (Penetration)',domainId:aid,order:3,type:'penetration',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار المطاوعة (Ductility)',domainId:aid,order:4,type:'ductility',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نقطة التليين (Softening Point)',domainId:aid,order:5,type:'softening_point',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اللزوجة (Viscosity)',domainId:aid,order:6,type:'viscosity',config:{inputs:[]}});}
    await tb.commit();
}

function selectDomain(domain) {
  currentDomain = domain;
  showScreen('dashboard');
  document.getElementById('dash-domain-name').textContent = domain.name;
  document.getElementById('dash-title').textContent = domain.name;
  document.getElementById('dash-subtitle').textContent = domain.description;
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
  document.getElementById('test-page-title').textContent = test.name;
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
