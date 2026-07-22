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
    var grid = document.getElementById('ai-team-grid');
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
        var response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDDr7EQ95hLdecc1BDIZIFhmmmVMLArBsU', {
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
async function loadDomains() {
    var c = document.getElementById('domains-list');
    c.innerHTML = '<p style="color:var(--text-muted);">Loading...</p>';
    try {
        var snap = await db.collection('domains').get();
        if (snap.empty) { await seedDomains(); return loadDomains(); }
        c.innerHTML = '';
        var domains=[];snap.forEach(function(doc){var d=doc.data();d.id=doc.id;domains.push(d);});domains.sort(function(a,b){return (a.order||0)-(b.order||0);});
        var icons = { 'طرق':'🛣️', 'خرسانة':'🏗️', 'أسفلت':'🛤️', 'Roads':'🛣️', 'Concrete':'🏗️', 'Asphalt':'🛤️', '道路':'🛣️', '混凝土':'🏗️', '沥青':'🛤️', 'Straßen':'🛣️', 'Beton':'🏗️', 'Asphalt':'🛤️' };
        domains.forEach(function(d) {
            var ik = Object.keys(icons).find(function(k){return d.name.includes(k);}) || '🔬';
            var card = document.createElement('a'); card.href='#'; card.className='domain-card'; card.setAttribute('tabindex','0'); card.setAttribute('role','button'); card.setAttribute('aria-label',d.name);
            card.onclick = function(e){e.preventDefault();selectDomain(d);};
            card.innerHTML = '<div class="domain-icon" aria-hidden="true">'+(icons[ik]||'🔬')+'</div><div class="domain-info"><h3>'+d.name+'</h3><p>'+(d.description||'')+'</p></div>';
            c.appendChild(card);
        });
        loadAITeam();
        loadStats();
    } catch(e) { c.innerHTML='<p style="color:#ef4444;">Error: '+e.message+'</p>'; }
}

async function seedDomains() {
    var batch = db.batch();
    [{name:'قسم الطرق والتربة',description:'اختبارات الطرق والتربة',order:1},{name:'قسم الخرسانة',description:'اختبارات الخرسانة',order:2},{name:'قسم الأسفلت',description:'اختبارات الأسفلت',order:3}].forEach(function(d){batch.set(db.collection('domains').doc(),d);});
    await batch.commit();
    var tb = db.batch();
    var ds = await db.collection('domains').where('name','==','قسم الطرق والتربة').get();
    if(!ds.empty){var did=ds.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار الدمك',domainId:did,order:1,type:'compaction',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار تحديد الرطوبة',domainId:did,order:2,type:'moisture',config:{inputs:[{name:'وزن_الأرض',label:'وزن العينة الرطبة (كغ)',type:'number'},{name:'وزن_الجافة',label:'وزن العينة الجافة (كغ)',type:'number'}]}});tb.set(db.collection('tests').doc(),{name:'اختبار نسبة الحمل (CBR)',domainId:did,order:3,type:'cbr',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار استقامة الطرق (Straightedge)',domainId:did,order:4,type:'straightedge',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'حدود أتربرغ (Atterberg Limits)',domainId:did,order:5,type:'atterberg',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'التحاليل الحجمية (Sieve Analysis)',domainId:did,order:6,type:'sieve',config:{inputs:[]}});}
    var d2=await db.collection('domains').where('name','==','قسم الخرسانة').get();
    if(!d2.empty){var cid=d2.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار الانضباط (Slump)',domainId:cid,order:1,type:'slump',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نضج الخرسانة (Maturity)',domainId:cid,order:2,type:'maturity',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'الشد الانضغاطي (Compressive Strength)',domainId:cid,order:3,type:'compressive',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'نسبة الهواء (Air Content)',domainId:cid,order:4,type:'air',config:{inputs:[]}});}
    var d3=await db.collection('domains').where('name','==','قسم الأسفلت').get();
    if(!d3.empty){var aid=d3.docs[0].id;tb.set(db.collection('tests').doc(),{name:'اختبار مارشال الرقمي (Marshall)',domainId:aid,order:1,type:'marshall',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'_photo-Tester للбитومين',domainId:aid,order:2,type:'bitumen',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار الانساب (Penetration)',domainId:aid,order:3,type:'penetration',config:{inputs:[]}});tb.set(db.collection('tests').doc(),{name:'اختبار المطاوعة (Ductility)',domainId:aid,order:4,type:'ductility',config:{inputs:[]}});}
    await tb.commit();
}

async function selectDomain(domain) {
    currentDomain=domain;showScreen('dashboard');
    document.getElementById('dash-domain-name').textContent=domain.name;
    document.getElementById('dash-title').textContent=domain.name;
    document.getElementById('dash-subtitle').textContent=domain.description;
    var grid=document.getElementById('tests-grid');grid.innerHTML='<p style="color:var(--text-muted);">Loading...</p>';
    try{var snap=await db.collection('tests').where('domainId','==',domain.id).get();grid.innerHTML='';
    if(snap.empty){grid.innerHTML='<p style="color:var(--text-muted);padding:40px;">No tests</p>';return;}
    var tests=[];snap.forEach(function(doc){var t=doc.data();t.id=doc.id;tests.push(t);});tests.sort(function(a,b){return (a.order||0)-(b.order||0);});
    var tIcons={'دمك':'⚡','رطوبة':'💧','انضباط':'📐','انساب':'🌡️','نسبة':'📊','CBR':'📊','cbr':'📊','استقامة':'📐','straightedge':'📐','هبوط':'📐','slump':'📐','مaturity':'🌡️','maturity':'🌡️','مارشال':'⚖️','marshall':'⚖️','بتومين':'🧪','bitumen':'🧪','marşal':'⚖️','_photo':'🧪','فتو':'🧪','Atterberg':'🧪','atterberg':'🧪','sieve':'📐','Sieve':'📐','compressive':'🏗️','Compressive':'🏗️','ductility':'🔗','Ductility':'🔗','air':'💨','Air':'💨'};
    var tDescs={compaction:'Proctor compaction test with real-time density calculations',cbr:'California Bearing Ratio — penetration & load analysis',straightedge:'Surface evenness measurement with IMU + laser',slump:'Ultrasonic cone height measurement',maturity:'Temperature logging with Nurse-Saul / Arrhenius index',marshall:'Load-displacement stability & flow test',bitumen:'Light intensity transmission & purity test',penetration:'Needle penetration depth measurement',moisture:'Soil moisture content determination',atterberg:'Liquid & Plastic limits — Atterberg consistency test',sieve:'Grain size distribution — gradation analysis',compressive:'Uniaxial compressive strength — cylinder/cube',ductility:'Bitumen ductility — extension at break test',air:'Fresh concrete air content — pressure/volumetric method'};
    tests.forEach(function(t){var ik=Object.keys(tIcons).find(function(k){return t.name.includes(k);});
    var card=document.createElement('a');card.href='#';card.className='test-card slide-up';card.setAttribute('tabindex','0');card.setAttribute('role','button');card.setAttribute('aria-label',t.name);card.onclick=function(e){e.preventDefault();openTest(t);};
    card.innerHTML='<div class="test-card-icon" aria-hidden="true">'+(tIcons[ik]||'🔬')+'</div><h3>'+t.name+'</h3><p>'+(tDescs[t.type]||'Interactive test with real-time sensor data')+'</p><div class="card-footer"><span class="card-tag">'+(t.type==='compaction'||t.type==='cbr'?'Hardware':'Manual')+'</span><div class="card-arrow" aria-hidden="true">←</div></div>';
    grid.appendChild(card);});}catch(e){grid.innerHTML='<p style="color:#ef4444;">Error: '+e.message+'</p>';}
}

function openTest(test){
    currentTest=test;
    if(!canRunTest(test.type)){
        showToast('Permission denied: your role ('+currentUserRole+') cannot run this test','error');
        return;
    }
    if(test.type==='cbr'){openCBR(test);return;}
    if(test.type==='atterberg'){openAtterberg(test);return;}
    if(test.type==='sieve'){openSieve(test);return;}
    if(test.type==='compressive'){openComp(test);return;}
    if(test.type==='ductility'){openDuct(test);return;}
    if(test.type==='air'){openAir(test);return;}
    strikes=[];isTesting=false;currentSessionId=null;showScreen('test');document.getElementById('test-page-title').textContent=test.name;document.getElementById('results-panel').style.display='none';document.getElementById('btn-pdf').style.display='none';document.getElementById('chart-box').style.display='none';document.getElementById('btn-start').style.display='flex';document.getElementById('btn-stop').style.display='none';document.getElementById('btn-tare').style.display='none';document.getElementById('strike-log-body').innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Start test</td></tr>';document.getElementById('val-moisture').textContent='--';document.getElementById('val-force').textContent='--';document.getElementById('val-avg-force').textContent='--';document.getElementById('val-dry-density').textContent='--';document.getElementById('strike-counter').textContent='0';document.getElementById('ratio-display').textContent='--%';document.getElementById('target-display').textContent=document.getElementById('inp_target_strikes').value||'25';document.getElementById('gauge-fill').style.strokeDashoffset='264';document.getElementById('serial-console').style.display='none';document.getElementById('demo-banner').style.display='none';loadHistory();}
function openAtterberg(test){currentTest=test;showScreen('atterberg');}
function openSieve(test){currentTest=test;showScreen('sieve');}
function openComp(test){currentTest=test;showScreen('compressive');}
function openDuct(test){currentTest=test;showScreen('ductility');}
function openAir(test){currentTest=test;showScreen('air');}
function goBackToDashboard(){if(isTesting){if(!confirm('Test in progress. Leave?'))return;stopSerial();}if(currentDomain)selectDomain(currentDomain);else showScreen('domains');}
