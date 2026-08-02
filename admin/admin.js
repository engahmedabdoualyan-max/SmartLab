/* smartLAB — Admin Panel (Complete) */
(function(){
'use strict';

/* ===== AUTH (server-verified session) ===== */
var session = null;
fetch('/api/session', { credentials: 'same-origin' })
    .then(function(r){ return r.json(); })
    .then(function(d){
        if (!d || !d.authed) { window.location.href = 'login.html'; return; }
        session = { email: d.email, expires: Date.now() + 1000 * 60 * 60 };
        var el = document.getElementById('adminEmail');
        if (el) el.textContent = d.email;
        bootAdmin();
    })
    .catch(function(){
        window.location.href = 'login.html';
    });

/* ===== KEYS ===== */
var K={STRUCT:'smartlab_site_structure',CONTENT:'smartlab_content',REPORTS:'smartlab_reports',SETTINGS:'smartlab_settings',USERS:'smartlab_users',DESIGNS:'smartlab_page_designs',ZONES:'smartlab_test_zones'};
var STRUCT_KEY=K.STRUCT,CONTENT_KEY=K.CONTENT,REPORTS_KEY=K.REPORTS,SETTINGS_KEY=K.SETTINGS,USERS_KEY=K.USERS,DESIGNS_KEY=K.DESIGNS,ZONES_KEY=K.ZONES;

/* ===== FALLBACK ===== */
var FALLBACK_STRUCT={"sections":[
{"id":"concrete","name":"Concrete Testing","nameAr":"\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u062e\u0631\u0633\u0627\u0646\u0629","icon":"\uD83C\uDFD7\uFE0F","color":"#fb923c","path":"/concrete/","tests":[{"id":"test-compressive","name":"Compressive Strength","icon":"\uD83D\uDCAA","path":"/concrete/tests/compressive/index.html","standard":"ASTM C39","status":"active"},{"id":"test-slump","name":"Slump Test","icon":"\uD83D\uDD2C","path":"/concrete/tests/slump/index.html","standard":"ASTM C143","status":"active"}],"designs":[{"id":"design-mix","name":"Mix Design","icon":"\uD83E\uDDEA","path":"/concrete/design/design-mix.html"}],"clients":[{"id":"client-projects","name":"Projects","icon":"\uD83D\uDCCB","path":"/concrete/client/client-projects.html"}]},
{"id":"asphalt","name":"Asphalt Testing","nameAr":"\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u0625\u0633\u0641\u0644\u062a","icon":"\uD83D\uDEE3\uFE0F","color":"#3b82f6","path":"/asphalt/","tests":[{"id":"asphalt-marshall","name":"Marshall Stability","icon":"\uD83D\uDD28","path":"/asphalt/tests/marshall/index.html","standard":"AASHTO T 245","status":"active"}],"designs":[{"id":"asphalt-design-mix","name":"Mix Design","icon":"\uD83E\uDDEA","path":"/asphalt/design/design-mix.html"}],"clients":[{"id":"asphalt-client-projects","name":"Projects","icon":"\uD83D\uDCCB","path":"/asphalt/client/client-projects.html"}]},
{"id":"soil","name":"Soil Testing","nameAr":"\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u062a\u0631\u0628\u0629","icon":"\uD83C\uDF0D","color":"#10b981","path":"/soil/","tests":[{"id":"soil-proctor","name":"Proctor Test","icon":"\uD83D\uDD28","path":"/soil/tests/proctor/index.html","standard":"ASTM D698","status":"active"}],"designs":[{"id":"soil-design-classification","name":"Classification","icon":"\uD83D\uDCCB","path":"/soil/design/design-classification.html"}],"clients":[{"id":"soil-client-projects","name":"Projects","icon":"\uD83D\uDCCB","path":"/soil/client/client-projects.html"}]}
]};

/* ===== DEFAULTS ===== */
var DFLT_CONTENT={hero:{fields:[{key:'hero_title',label:'Main Title',default:'Smart Laboratory Testing'},{key:'hero_subtitle',label:'Subtitle',default:'Professional civil engineering lab services'},{key:'hero_cta',label:'CTA Button',default:'Explore Tests'},{key:'hero_bg',label:'Background Image URL',default:''}]},about:{fields:[{key:'about_title',label:'Title',default:'About smartLAB'},{key:'about_text',label:'Description',type:'textarea',default:'We provide comprehensive civil engineering testing services.'},{key:'about_image',label:'Image URL',default:''}]},services:{fields:[{key:'services_title',label:'Title',default:'Our Services'},{key:'services_text',label:'Description',type:'textarea',default:'Full range of material testing services.'}]},contact:{fields:[{key:'contact_title',label:'Title',default:'Get In Touch'},{key:'contact_email',label:'Email',default:''},{key:'contact_phone',label:'Phone',default:''},{key:'contact_address',label:'Address',type:'textarea',default:''}]},footer:{fields:[{key:'footer_text',label:'Footer Text',default:'\u00A9 2026 smartLAB. All rights reserved.'},{key:'footer_links',label:'Footer Links (JSON)',type:'textarea',default:'[]'}]},header:{fields:[{key:'header_logo',label:'Logo URL',default:'../assets/logo.png'},{key:'header_cta',label:'CTA Button Text',default:'Contact Us'}]}};
var DFLT_SETTINGS={siteName:'smartLAB',siteNameAr:'\u0633\u0645\u0627\u0631\u062A \u0644\u0627\u0628',logo:'../assets/logo.png',favicon:'../favicon.ico',email:'info@smartlab.com',phone_eg:'+20 100 000 0000',phone_ksa:'+966 50 000 0000',address:'Cairo, Egypt',copyright:'\u00A9 2026 smartLAB. All rights reserved.'};
var DFLT_USERS=[{id:'usr_admin',name:'Admin',email:'eng.ahmedabdoualyan@gmail.com',role:'admin',lastLogin:Date.now(),avatar:''}];
var EMOJIS=['\uD83E\uDDEA','\uD83D\uDD2C','\uD83D\uDCAA','\uD83D\uDD28','\u2696\uFE0F','\uD83C\uDF21\uFE0F','\uD83D\uDCE1','\uD83E\uDDF1','\uD83C\uDFD7\uFE0F','\uD83D\uDCA8','\uD83D\uDCA7','\uD83D\uDCCA','\uD83D\uDCC8','\uD83D\uDCCB','\uD83D\uDCC4','\uD83D\uDC65','\uD83D\uDD27','\uD83D\uDCC5','\uD83D\uDD0D','\uD83D\uDEE1\uFE0F','\uD83D\uDEE3\uFE0F','\uD83D\uDCF1','\uD83C\uDFAF','\u26A1','\uD83D\uDD25','\uD83C\uDF0A','\uD83D\uDCD0','\uD83C\uDBDC','\uD83E\uDDEC','\uD83E\uDDEB','\uD83E\uDEA8','\u26CF\uFE0F','\u2699\uFE0F','\uD83D\uDE9B','\uD83D\uDCE6','\u2705','\u274C','\u26A0\uFE0F','\uD83D\uDCA1','\uD83C\uDF93','\uD83D\uDCC9','\uD83D\uDD04','\u23F1\uFE0F','\uD83C\uDFC6','\uD83C\uDFBD','\uD83D\uDCC2','\uD83D\uDCDD','\uD83C\uDFAE','\uD83D\uDCBB','\uD83E\uDDED','\uD83D\uDCB0','\u2764\uFE0F','\u2B50','\u2728','\uD83C\uDF1F','\uD83C\uDF08'];
var COLOR_SWATCHES=['#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899','#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#fb923c','#f87171','#fbbf24','#34d399','#60a5fa'];

/* ===== STATE ===== */
function loadData(key,fb){try{var d=JSON.parse(localStorage.getItem(key));if(d!==null&&d!==undefined)return d}catch(e){}return fb}
function saveData(key,data){try{localStorage.setItem(key,JSON.stringify(data))}catch(e){}}
function saveStructure(){saveData(STRUCT_KEY,structure)}
function saveContent(){saveData(CONTENT_KEY,content)}
function saveSettingsData(){saveData(SETTINGS_KEY,settings)}
function saveUsers(){saveData(USERS_KEY,users)}
function saveReports(){saveData(REPORTS_KEY,reports)}
function saveDesigns(){saveData(DESIGNS_KEY,pageDesigns)}
function saveTestZones(){saveData(ZONES_KEY,testZones)}

var structSrc=typeof window.SITE_STRUCTURE!=='undefined'?window.SITE_STRUCTURE:FALLBACK_STRUCT;
var structure=loadData(STRUCT_KEY,null);if(!structure||!structure.sections)structure=JSON.parse(JSON.stringify(structSrc));
var content=loadData(CONTENT_KEY,null)||JSON.parse(JSON.stringify(DFLT_CONTENT));
var settings=loadData(SETTINGS_KEY,null)||JSON.parse(JSON.stringify(DFLT_SETTINGS));
var users=loadData(USERS_KEY,null)||JSON.parse(JSON.stringify(DFLT_USERS));
var reports=loadData(REPORTS_KEY,[]);
var pageDesigns=loadData(DESIGNS_KEY,{});
var testZones=loadData(ZONES_KEY,{});
var view='dashboard',sectionId=null,tab='tests',searchQ='',contentTab='hero';

/* ===== UTILITIES ===== */
function $(id){return document.getElementById(id)}
function esc(s){
    if(s===null||s===undefined)return '';
    var d=document.createElement('div');d.textContent=String(s);return d.innerHTML;
}
function uid(){return 'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).substr(2,6)}
function formatDate(ts){
    if(!ts)return '-';
    var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
}
function fileSize(bytes){
    if(!bytes)return '0 B';
    var u=['B','KB','MB','GB'],i=0,s=bytes;
    while(s>=1024&&i<u.length-1){s/=1024;i++}
    return s.toFixed(1)+' '+u[i];
}

/* ===== TOAST ===== */
function toast(msg,type){
    var c=$('toastContainer');if(!c)return;
    var t=document.createElement('div');
    t.className='toast toast-'+(type||'info');
    t.innerHTML='';
    var icons={success:'\u2705',error:'\u274C',info:'\u2139\uFE0F',warning:'\u26A0\uFE0F'};
    t.innerHTML=(icons[type]||'\u2139\uFE0F')+' '+esc(msg);
    c.appendChild(t);
    setTimeout(function(){t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(function(){t.remove()},300)},3000);
}
var showToast=toast;

/* ===== MODAL ===== */
function openModal(title,bodyHtml,onSave,wide){
    $('modalTitle').textContent=title;
    $('modalBody').innerHTML=bodyHtml;
    var foot=$('modalFoot');
    if(onSave){
        foot.innerHTML='<button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="App.confirmModal()">Save</button>';
        window._modalOnSave=onSave;
    }else{
        foot.innerHTML='<button class="btn btn-primary" onclick="App.closeModal()">Close</button>';
    }
    $('modalOverlay').classList.add('open');
}
function closeModal(){$('modalOverlay').classList.remove('open');window._modalOnSave=null;}
function confirmModal(){if(typeof window._modalOnSave==='function')window._modalOnSave();closeModal();}

/* ===== EMOJI & COLOR PICKERS ===== */
function buildEmojiPicker(selected){
    var h='<div class="emoji-picker" id="emojiPicker">';
    for(var i=0;i<EMOJIS.length;i++){
        var sel=EMOJIS[i]===selected?' selected':'';
        h+='<button class="emoji-opt'+sel+'" onclick="App.pickEmoji(this)">'+EMOJIS[i]+'</button>';
    }
    return h+'</div>';
}
function pickEmoji(el){
    var p=$('emojiPicker');if(p)p.querySelectorAll('.emoji-opt').forEach(function(b){b.classList.remove('selected')});
    el.classList.add('selected');
    var f=$('f-icon');if(f)f.value=el.textContent;
}
function buildColorPicker(selected){
    var c=selected||'#3b82f6';
    var h='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">';
    h+='<input type="color" id="f-color" value="'+esc(c)+'" style="height:36px;width:48px;padding:2px;cursor:pointer;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-input);">';
    h+='<span id="f-color-label" style="font-size:12px;color:var(--text-muted);font-family:SF Mono,monospace;">'+esc(c)+'</span></div>';
    h+='<div class="color-swatches" id="f-color-swatches">';
    COLOR_SWATCHES.forEach(function(sc){
        var s=sc===c?' selected':'';
        h+='<div class="color-swatch'+s+'" style="background:'+sc+';" data-color="'+sc+'" onclick="App.pickColor(this)"></div>';
    });
    return h+'</div>';
}
function pickColor(el){
    var c=el.getAttribute('data-color');
    var inp=$('f-color');if(inp)inp.value=c;
    var lbl=$('f-color-label');if(lbl)lbl.textContent=c;
    var sw=$('f-color-swatches');if(sw)sw.querySelectorAll('.color-swatch').forEach(function(s){s.classList.remove('selected')});
    el.classList.add('selected');
}
function bindColorSync(){
    var inp=$('f-color');if(!inp)return;
    inp.addEventListener('input',function(){
        var lbl=$('f-color-label');if(lbl)lbl.textContent=this.value;
        var sw=$('f-color-swatches');if(sw)sw.querySelectorAll('.color-swatch').forEach(function(s){s.classList.toggle('selected',s.getAttribute('data-color')===inp.value)});
    });
}
function getSectionIconHtml(s,sz){
    var size=sz||48;
    if(s.iconUrl)return '<img src="'+esc(s.iconUrl)+'" alt="icon" style="width:100%;height:100%;object-fit:cover;">';
    return '<span style="font-size:'+Math.round(size*0.5)+'px;">'+(s.icon||'\uD83D\uDCC2')+'</span>';
}
function getIconHtml(item,size){
    var s=size||36;
    if(item&&item.iconUrl)return '<img src="'+esc(item.iconUrl)+'" alt="icon" style="width:'+s+'px;height:'+s+'px;object-fit:cover;border-radius:6px;">';
    return '<span style="font-size:'+Math.round(s*0.6)+'px;">'+(item?(item.icon||'\uD83D\uDCC4'):'\uD83D\uDCC4')+'</span>';
}

/* ===== NAVIGATION ===== */
function navigate(v,sid){
    if(v&&v.indexOf('section:')===0){view='section';sectionId=v.substring(8);}
    else{view=v||'dashboard';sectionId=sid||null;}
    tab='tests';searchQ='';renderSidebar();renderMain();
}
function setTab(t){tab=t;renderSection();}
function search(q){searchQ=q;renderSection();}
function setContentTab(k){contentTab=k;renderContentManager();}

/* ===== SIDEBAR ===== */
function navBtn(id,icon,label,active,badge){
    var cls='nav-item'+(active?' active':'');
    var h='<button class="'+cls+'" onclick="App.navigate(\''+esc(id)+'\')"><span class="nav-icon">'+icon+'</span><span class="nav-label">'+esc(label)+'</span>';
    if(badge!==undefined&&badge!==null&&badge!=='')h+='<span class="nav-badge">'+badge+'</span>';
    return h+'</button>';
}
function renderSidebar(){
    var nav=$('sidebarNav');if(!nav)return;
    var h='<div class="nav-section"><div class="nav-section-title">Overview</div>'+navBtn('dashboard','\uD83D\uDCCA','Dashboard',view==='dashboard')+'</div>';
    h+='<div class="nav-section"><div class="nav-section-title">Lab Sections</div>';
    (structure.sections||[]).forEach(function(s){
        var cnt=(s.tests||[]).length+(s.designs||[]).length+(s.clients||[]).length;
        h+=navBtn('section:'+s.id,s.icon,s.name,view==='section'&&sectionId===s.id,cnt);
    });
    h+='</div><div class="nav-section"><div class="nav-section-title">Management</div>';
    h+=navBtn('content','\uD83D\uDCC4','Content',view==='content');
    h+=navBtn('zones','\uD83D\uDCCF','Zone Manager',view==='zones');
    h+=navBtn('designer','\uD83C\uDFA8','Page Designer',view==='designer');
    h+=navBtn('reports','\uD83D\uDCCA','Reports',view==='reports');
    h+=navBtn('users','\uD83D\uDC65','Users',view==='users');
    h+=navBtn('settings','\u2699\uFE0F','Settings',view==='settings');
    h+='</div><div class="nav-section"><div class="nav-section-title">Actions</div>';
    h+='<button class="nav-item" onclick="App.addSection()"><span class="nav-icon">\u2795</span><span class="nav-label">Add Section</span></button>';
    h+='<button class="nav-item" onclick="App.resetData()"><span class="nav-icon">\uD83D\uDD04</span><span class="nav-label">Reset to Default</span></button></div>';
    nav.innerHTML=h;
}

/* ===== STAT CARD ===== */
function statCard(icon,val,label){return '<div class="stat-card"><div class="stat-icon">'+icon+'</div><div class="stat-value">'+val+'</div><div class="stat-label">'+label+'</div></div>';}

/* ===== DASHBOARD ===== */
function renderDashboard(){
    var tT=0,tD=0,tC=0;
    (structure.sections||[]).forEach(function(s){tT+=(s.tests||[]).length;tD+=(s.designs||[]).length;tC+=(s.clients||[]).length});
    var ti=tT+tD+tC;
    var h='<div class="page-header"><h1>Admin <span>Dashboard</span></h1><div class="header-actions"><button class="btn btn-primary" onclick="App.addSection()">\u2795 Add Section</button></div></div>';
    h+='<div class="stats-row">';
    h+=statCard('\uD83D\uDCC1',(structure.sections||[]).length,'Sections');
    h+=statCard('\uD83E\uDDEA',tT,'Tests');
    h+=statCard('\uD83D\uDCD0',tD,'Designs');
    h+=statCard('\uD83D\uDC65',tC,'Client Pages');
    h+=statCard('\uD83C\uDFAF',ti,'Total Items');
    h+=statCard('\uD83D\uDC64',(users||[]).length,'Users');
    h+='</div><h2 style="font-size:16px;margin-bottom:16px;">Quick Actions</h2>';
    h+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px;">';
    h+='<button class="btn btn-primary" onclick="App.navigate(\'content\')">\uD83D\uDCC4 Edit Content</button>';
    h+='<button class="btn btn-success" onclick="App.navigate(\'designer\')">\uD83C\uDFA8 Page Designer</button>';
    h+='<button class="btn btn-warning" onclick="App.navigate(\'reports\')">\uD83D\uDCCA Reports</button>';
    h+='<button class="btn btn-ghost" onclick="App.navigate(\'settings\')">\u2699\uFE0F Settings</button></div>';
    h+='<h2 style="font-size:16px;margin-bottom:16px;">Site Sections</h2><div class="sections-grid">';
    (structure.sections||[]).forEach(function(s){
        var tc=(s.tests||[]).length,dc=(s.designs||[]).length,cc=(s.clients||[]).length;
        h+='<div class="section-card"><div class="section-card-header"><div class="section-card-icon" style="background:'+(s.color||'#3b82f6')+'20;border:1px solid '+(s.color||'#3b82f6')+'40;">';
        h+=getSectionIconHtml(s,48);
        h+='</div><div class="section-card-info"><h3>'+esc(s.name)+'</h3><p>'+esc(s.nameAr||'')+'</p></div></div>';
        h+='<div class="section-card-stats"><span>\uD83E\uDDEA '+tc+' tests</span><span>\uD83D\uDCD0 '+dc+' designs</span><span>\uD83D\uDC65 '+cc+' clients</span></div>';
        h+='<div class="section-card-actions"><button class="btn btn-primary btn-sm" onclick="App.navigate(\'section:'+s.id+'\')">View</button>';
        h+='<button class="btn btn-ghost btn-sm" onclick="App.editSection(\''+s.id+'\')">Edit</button>';
        h+='<button class="btn btn-danger btn-sm" onclick="App.deleteSection(\''+s.id+'\')">Delete</button></div></div>';
    });
    h+='</div>';
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}

/* ===== SECTION VIEW ===== */
function filterItems(items){
    if(!searchQ)return items||[];
    var q=searchQ.toLowerCase();
    return(items||[]).filter(function(i){return(i.name||'').toLowerCase().indexOf(q)>-1||(i.nameAr||'').toLowerCase().indexOf(q)>-1||(i.path||'').toLowerCase().indexOf(q)>-1||(i.standard||'').toLowerCase().indexOf(q)>-1});
}
function renderItemRow(secId,tn,item,idx){
    var h='<li class="item-row" draggable="true" data-id="'+esc(item.id)+'" data-tab="'+esc(tn)+'" data-sec="'+esc(secId)+'">';
    h+='<span class="drag-handle">\u2801\u2801</span><div class="item-icon">';
    if(item.iconUrl)h+='<img src="'+esc(item.iconUrl)+'" alt="icon">';
    else h+='<span style="font-size:20px;">'+(item.icon||'\uD83D\uDCC4')+'</span>';
    h+='</div><div class="item-info"><h4>'+esc(item.name||'Untitled')+'</h4>';
    var sub=item.nameAr||item.standard||'';if(sub)h+='<p>'+esc(sub)+'</p>';
    if(item.description)h+='<p style="font-size:11px;color:var(--text-muted);margin-top:2px;">'+esc(item.description.length>80?item.description.substring(0,80)+'...':item.description)+'</p>';
    h+='</div>';
    if(item.path)h+='<span class="item-path" title="'+esc(item.path)+'">'+esc(item.path)+'</span>';
    if(item.standard)h+='<span class="item-status status-active">'+esc(item.standard)+'</span>';
    h+='<div class="item-actions">';
    h+='<button class="btn btn-ghost btn-sm" onclick="App.openHtmlEditor(\''+secId+'\',\''+tn+'\',\''+esc(item.id)+'\')">\uD83C\uDFA8</button>';
    h+='<button class="btn btn-ghost btn-sm" onclick="App.editItem(\''+secId+'\',\''+tn+'\',\''+esc(item.id)+'\')">\u270F\uFE0F</button>';
    h+='<button class="btn btn-danger btn-sm" onclick="App.duplicateItem(\''+secId+'\',\''+tn+'\',\''+esc(item.id)+'\')">\uD83D\uDD04</button>';
    h+='<button class="btn btn-danger btn-sm" onclick="App.deleteItem(\''+secId+'\',\''+tn+'\',\''+esc(item.id)+'\')">\uD83D\uDDD1\uFE0F</button>';
    h+='</div></li>';
    return h;
}
function renderSection(){
    var sec=(structure.sections||[]).find(function(s){return s.id===sectionId});
    if(!sec){view='dashboard';renderMain();return;}
    var h='<div class="breadcrumb"><a href="javascript:void(0)" onclick="App.navigate(\'dashboard\')">Dashboard</a><span class="sep">/</span><span>'+esc(sec.name)+'</span></div>';
    h+='<div class="page-header"><h1>'+getSectionIconHtml(sec,32)+' '+esc(sec.name)+' <span style="color:var(--text-muted);font-size:14px;font-weight:400;">'+esc(sec.nameAr||'')+'</span></h1>';
    h+='<div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'dashboard\')">\u2190 Back</button>';
    h+='<button class="btn btn-ghost" onclick="App.editSection(\''+sec.id+'\')">\u270F\uFE0F Edit</button>';
    h+='<button class="btn btn-danger" onclick="App.deleteSection(\''+sec.id+'\')">\uD83D\uDDD1\uFE0F Delete</button></div></div>';
    h+='<div class="search-box" style="margin-bottom:20px;max-width:360px;"><span class="search-icon">\uD83D\uDD0D</span>';
    h+='<input type="text" placeholder="Search..." value="'+esc(searchQ)+'" oninput="App.search(this.value)"></div>';
    h+='<div class="tab-bar">';
    var tabs=['tests','designs','clients'];
    tabs.forEach(function(t){
        var cnt=(sec[t]||[]).length;
        h+='<button class="tab-btn'+(tab===t?' active':'')+'" onclick="App.setTab(\''+t+'\')">'+t.charAt(0).toUpperCase()+t.slice(1)+' <span style="opacity:0.5">('+cnt+')</span></button>';
    });
    h+='</div>';
    tabs.forEach(function(t){
        var items=filterItems(sec[t]||[]);
        h+='<div class="tab-panel'+(tab===t?' active':'')+'" id="tab-'+t+'">';
        h+='<div class="content-panel"><div class="panel-header"><h2>'+t.charAt(0).toUpperCase()+t.slice(1)+' <span class="count">'+items.length+'</span></h2>';
        h+='<button class="btn btn-primary btn-sm" onclick="App.addItem(\''+sec.id+'\',\''+t+'\')">+ Add '+t.slice(0,-1)+'</button></div>';
        if(items.length===0){h+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCE9</div><h3>No '+t+' yet</h3></div>';}
        else{h+='<ul class="item-list">';items.forEach(function(it,idx){h+=renderItemRow(sec.id,t,it,idx)});h+='</ul>';}
        h+='</div></div>';
    });
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}

/* ===== ITEMS ===== */
function addItem(secId,tn){
    var item={id:uid(),name:'',nameAr:'',icon:'\uD83D\uDCC4',iconUrl:'',path:'',standard:'',status:'active',description:''};
    openModal('Add '+tn.slice(0,-1),buildItemForm(item,secId,tn),function(){confirmAddItem(secId,tn)});
}
function editItem(secId,tn,itemId){
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});if(!sec)return;
    var item=(sec[tn]||[]).find(function(i){return i.id===itemId});if(!item)return;
    openModal('Edit '+tn.slice(0,-1),buildItemForm(item,secId,tn),function(){confirmEditItem(secId,tn,itemId)});
}
function deleteItem(secId,tn,itemId){
    if(!confirm('Delete this item?'))return;
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});if(!sec)return;
    sec[tn]=(sec[tn]||[]).filter(function(i){return i.id!==itemId});
    saveStructure();renderSection();showToast('Item deleted');
}
function duplicateItem(secId,tn,itemId){
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});if(!sec)return;
    var item=(sec[tn]||[]).find(function(i){return i.id===itemId});if(!item)return;
    var copy=JSON.parse(JSON.stringify(item));copy.id=uid();copy.name=item.name+' (copy)';
    if(!sec[tn])sec[tn]=[];sec[tn].push(copy);
    saveStructure();renderSection();showToast('Item duplicated');
}
function buildItemForm(item,secId,tn){
    var iconPreview='';
    if(item.iconUrl){iconPreview='<div class="icon-preview" style="border-color:var(--accent-emerald);margin-top:4px;display:inline-flex;"><img src="'+esc(item.iconUrl)+'" alt="icon" style="width:32px;height:32px;object-fit:cover;border-radius:4px;"></div><button class="btn btn-xs btn-ghost" onclick="App.removeIcon()">Remove</button>';}
    var h='<div class="modal-field"><label>Name</label><input id="f-name" value="'+esc(item.name||'')+'" placeholder="Item name"></div>';
    h+='<div class="modal-field"><label>Name (Arabic)</label><input id="f-nameAr" value="'+esc(item.nameAr||'')+'" placeholder="\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629"></div>';
    h+='<div class="modal-row"><div class="modal-field"><label>Icon</label>';
    h+='<div style="display:flex;gap:8px;align-items:center;"><input id="f-icon" value="'+esc(item.icon||'')+'" placeholder="Emoji" style="flex:1;">';
    h+='<button class="btn btn-ghost btn-sm" onclick="App.pickEmojiField()">\uD83D\uDE0A</button></div>';
    h+='<input type="hidden" id="f-iconUrl" value="'+esc(item.iconUrl||'')+'">';
    h+='<div class="icon-upload-area" style="margin-top:4px;"><label class="btn btn-ghost btn-xs" style="cursor:pointer;">+ Upload Icon<input type="file" accept="image/*" style="display:none" onchange="App.uploadIcon(this)"></label></div>';
    h+='<div id="f-icon-preview-area">'+iconPreview+'</div></div>';
    h+='<div class="modal-field"><label>Path</label><input id="f-path" value="'+esc(item.path||'')+'" placeholder="/concrete/tests/test.html"></div></div>';
    h+='<div class="modal-row"><div class="modal-field"><label>Standard</label><input id="f-standard" value="'+esc(item.standard||'')+'" placeholder="ASTM C39"></div>';
    h+='<div class="modal-field"><label>Status</label><select id="f-status"><option value="active"'+(item.status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(item.status==='inactive'?' selected':'')+'>Inactive</option></select></div></div>';
    h+='<div class="modal-field"><label>Description</label><textarea id="f-desc" rows="3" placeholder="Item description">'+esc(item.description||'')+'</textarea></div>';
    return h;
}
function confirmAddItem(secId,tn){
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});if(!sec)return;
    if(!sec[tn])sec[tn]=[];
    sec[tn].push({id:uid(),name:$('f-name').value,nameAr:$('f-nameAr').value,icon:$('f-icon').value,iconUrl:($('f-iconUrl')||{}).value||'',path:$('f-path').value,standard:$('f-standard').value,description:$('f-desc').value,status:$('f-status').value});
    saveStructure();renderSection();showToast('Item added');
}
function confirmEditItem(secId,tn,itemId){
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});if(!sec)return;
    var item=(sec[tn]||[]).find(function(i){return i.id===itemId});if(!item)return;
    item.name=$('f-name').value;item.nameAr=$('f-nameAr').value;item.icon=$('f-icon').value;
    item.iconUrl=($('f-iconUrl')||{}).value||'';
    item.path=$('f-path').value;item.standard=$('f-standard').value;item.description=$('f-desc').value;item.status=$('f-status').value;
    saveStructure();renderSection();showToast('Item updated');
}
function pickEmojiField(){
    var current=($('f-icon')||{}).value||'';
    var mc=$('modalBody');if(!mc)return;
    var orig=mc.innerHTML;
    mc.innerHTML='<p style="margin-bottom:10px;">Pick an icon:</p>'+buildEmojiPicker(current)+'<div style="margin-top:12px;"><button class="btn btn-ghost" onclick="App.restoreModalForm()">Back</button></div>';
    window._modalOrigForm=orig;
}
function restoreModalForm(){var mc=$('modalBody');if(mc&&window._modalOrigForm)mc.innerHTML=window._modalOrigForm;}
function uploadIcon(input){
    if(!input.files||!input.files[0])return;
    var file=input.files[0];if(file.size>2*1024*1024){showToast('Icon must be under 2MB','error');return;}
    var reader=new FileReader();
    reader.onload=function(e){
        var dataUrl=e.target.result;
        var iconField=$('f-iconUrl');if(iconField)iconField.value=dataUrl;
        var emojiField=$('f-icon');if(emojiField)emojiField.value='';
        var area=$('f-icon-preview-area');if(area)area.innerHTML='<div class="icon-preview" style="border-color:var(--accent-emerald);margin-top:4px;display:inline-flex;"><img src="'+dataUrl+'" alt="icon" style="width:32px;height:32px;object-fit:cover;border-radius:4px;"></div><button class="btn btn-xs btn-ghost" onclick="App.removeIcon()">Remove</button>';
        var picker=$('emojiPicker');if(picker)picker.querySelectorAll('.emoji-opt').forEach(function(b){b.classList.remove('selected')});
        showToast('Icon uploaded','success');
    };
    reader.readAsDataURL(file);
}
function removeIcon(){
    var urlField=$('f-iconUrl');if(urlField)urlField.value='';
    var emojiField=$('f-icon');if(emojiField)emojiField.value='';
    var area=$('f-icon-preview-area');if(area)area.innerHTML='';
    var picker=$('emojiPicker');if(picker)picker.querySelectorAll('.emoji-opt').forEach(function(b){b.classList.remove('selected')});
}

/* ===== SECTION MANAGEMENT ===== */
function addSection(){
    openModal('Add Section',buildSectionForm(null),function(){confirmAddSection()});
}
function editSection(sid){
    var sec=(structure.sections||[]).find(function(s){return s.id===sid});if(!sec)return;
    openModal('Edit Section',buildSectionForm(sec),function(){confirmEditSection(sid)});
}
function deleteSection(sid){
    if(!confirm('Delete this section and all its items?'))return;
    if(!confirm('Are you sure? This cannot be undone.'))return;
    structure.sections=(structure.sections||[]).filter(function(s){return s.id!==sid});
    saveStructure();view='dashboard';sectionId=null;renderSidebar();renderMain();showToast('Section deleted');
}
function buildSectionForm(sec){
    var h='<div class="modal-row"><div class="modal-field"><label>Section ID</label><input id="f-sec-id" value="'+esc(sec?sec.id:'')+'" placeholder="concrete"></div>';
    h+='<div class="modal-field"><label>Icon</label><input id="f-sec-icon" value="'+esc(sec?sec.icon:'')+'" placeholder="\uD83C\uDFD7\uFE0F"><button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="App.pickSecEmoji()">\uD83D\uDE0A Pick</button></div></div>';
    h+='<div class="modal-row"><div class="modal-field"><label>Name</label><input id="f-sec-name" value="'+esc(sec?sec.name:'')+'" placeholder="Concrete Testing"></div>';
    h+='<div class="modal-field"><label>Name (Arabic)</label><input id="f-sec-nameAr" value="'+esc(sec?sec.nameAr:'')+'" placeholder="\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u062e\u0631\u0633\u0627\u0646\u0629"></div></div>';
    h+='<div class="modal-row"><div class="modal-field"><label>Path</label><input id="f-sec-path" value="'+esc(sec?sec.path:'')+'" placeholder="/concrete/"></div>';
    h+='<div class="modal-field"><label>Color</label>'+buildColorPicker(sec?sec.color:'#3b82f6')+'</div></div>';
    h+='<div class="modal-field"><label>Icon URL (optional)</label><input id="f-sec-iconUrl" value="'+esc(sec?sec.iconUrl:'')+'" placeholder="https://..."></div>';
    return h;
}
function confirmAddSection(){
    var sid=($('f-sec-id')||{}).value;if(!sid){showToast('Section ID is required','error');return;}
    if((structure.sections||[]).find(function(s){return s.id===sid})){showToast('Section ID already exists','error');return;}
    if(!structure.sections)structure.sections=[];
    structure.sections.push({id:sid,name:($('f-sec-name')||{}).value,nameAr:($('f-sec-nameAr')||{}).value,icon:($('f-sec-icon')||{}).value,iconUrl:($('f-sec-iconUrl')||{}).value,path:($('f-sec-path')||{}).value,color:($('f-color')||{}).value||'#3b82f6',tests:[],designs:[],clients:[]});
    saveStructure();renderSidebar();renderMain();showToast('Section added');
}
function confirmEditSection(sid){
    var sec=(structure.sections||[]).find(function(s){return s.id===sid});if(!sec)return;
    sec.name=($('f-sec-name')||{}).value;sec.nameAr=($('f-sec-nameAr')||{}).value;sec.icon=($('f-sec-icon')||{}).value;
    sec.iconUrl=($('f-sec-iconUrl')||{}).value;sec.path=($('f-sec-path')||{}).value;sec.color=($('f-color')||{}).value||'#3b82f6';
    saveStructure();renderSidebar();renderMain();showToast('Section updated');
}

/* ===== CONTENT MANAGER ===== */
function renderContentManager(){
    var keys=Object.keys(content);
    var h='<div class="content-manager"><div class="content-left"><div class="content-nav">';
    keys.forEach(function(k){
        var sec=content[k];
        h+='<button class="content-nav-btn'+(contentTab===k?' active':'')+'" onclick="App.setContentTab(\''+k+'\')"><span class="content-nav-icon">'+(sec.icon||'\uD83D\uDCC4')+'</span>'+(sec.label||k)+'</button>';
    });
    h+='</div></div><div class="content-right">';
    var tab=content[contentTab];
    if(tab){
        h+='<div class="content-form"><div class="content-form-title">'+(tab.icon||'\uD83D\uDCC4')+' '+(tab.title||contentTab)+'</div><div class="content-fields">';
        (tab.fields||[]).forEach(function(f){
            var val=typeof settings[f.key]!=='undefined'?settings[f.key]:(f.default||'');
            h+='<div class="content-field-group"><label class="content-field-label">'+(f.label||f.key)+'</label>';
            if(f.type==='textarea')h+='<textarea class="content-field-input" id="cf-'+f.key+'" rows="3" onchange="App.saveContentField(\''+f.key+'\',this.value)">'+esc(val)+'</textarea>';
            else h+='<input class="content-field-input" id="cf-'+f.key+'" value="'+esc(val)+'" onchange="App.saveContentField(\''+f.key+'\',this.value)">';
            h+='</div>';
        });
        h+='</div></div>';
    }
    h+='</div></div>';
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function saveContentField(key,val){settings[key]=val;saveSettingsData();}

/* ===== ZONE MANAGER ===== */
function renderZoneManager(){
    var h='<div class="page-header"><h1>\uD83D\uDCCF Zone <span>Manager</span></h1><div class="header-actions"><button class="btn btn-primary" onclick="App.navigate(\'dashboard\')">\u2190 Back</button></div></div>';
    h+='<p style="color:var(--text-muted);margin-bottom:20px;">Manage test zone layouts (video, PDF, etc.) for each test page.</p>';
    var sections=structure.sections||[];
    if(sections.length===0){h+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCCF</div><h3>No sections</h3></div>';}
    else{
        sections.forEach(function(sec){
            var tests=sec.tests||[];if(tests.length===0)return;
            h+='<div class="content-panel" style="margin-bottom:20px;"><div class="panel-header"><h2>'+(sec.icon||'')+' '+esc(sec.name)+'</h2></div><ul class="item-list">';
            tests.forEach(function(test){
                var zc=testZones[test.id];var zoneCount=zc&&typeof zc==='object'&&!Array.isArray(zc)?(zc.zones||[]).length:0;
                h+='<li class="item-row" style="cursor:default;"><div class="item-icon">'+(test.icon||'\uD83D\uDCC4')+'</div>';
                h+='<div class="item-info"><h4>'+esc(test.name)+'</h4><p>'+zoneCount+' zone'+(zoneCount!==1?'s':'')+'</p></div>';
                h+='<div class="item-actions"><button class="btn btn-primary btn-sm" onclick="App.selectZoneTest(\''+test.id+'\',\''+sec.id+'\')">Manage Zones</button></div></li>';
            });
            h+='</ul></div>';
        });
    }
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function getZoneConfig(testId){
    var v=testZones[testId];
    if(v&&typeof v==='object'&&!Array.isArray(v)&&!v.zones){
        v.zones=[];
        if(v.layout===undefined)v.layout='1-col';
        if(v.showHeader===undefined)v.showHeader=true;
        if(v.showFooter===undefined)v.showFooter=true;
    }
    if(!v||typeof v!=='object'||Array.isArray(v)){
        var zones=Array.isArray(v)?v:[];
        var layout=testZones[testId+'_layout']||'1-col';
        var showHeader=testZones[testId+'_showHeader']!==false;
        var showFooter=testZones[testId+'_showFooter']!==false;
        testZones[testId]={layout:layout,zones:zones,showHeader:showHeader,showFooter:showFooter};
        delete testZones[testId+'_layout'];delete testZones[testId+'_showHeader'];delete testZones[testId+'_showFooter'];
    }
    return testZones[testId];
}
function selectZoneTest(testId,secId){
    var config=getZoneConfig(testId);
    var zones=config.zones;
    var test=null;(structure.sections||[]).forEach(function(s){(s.tests||[]).forEach(function(t){if(t.id===testId)test=t})});
    if(!test)return;
    var h='<div class="breadcrumb"><a href="javascript:void(0)" onclick="App.navigate(\'zones\')">Zone Manager</a><span class="sep">/</span><span>'+esc(test.name)+'</span></div>';
    h+='<div class="page-header"><h1>'+(test.icon||'')+' '+esc(test.name)+' <span style="font-size:14px;font-weight:400;color:var(--text-muted);">Zones</span></h1>';
    h+='<div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'zones\')">\u2190 Back</button>';
    h+='<button class="btn btn-danger" onclick="App.resetTestZones(\''+testId+'\')">\uD83D\uDD04 Reset</button>';
    h+='<button class="btn btn-primary" onclick="App.addZoneToTest(\''+testId+'\')">+ Add Zone</button></div></div>';
    h+='<div style="display:flex;gap:16px;margin-bottom:16px;align-items:center;">';
    h+='<label style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:6px;"><input type="checkbox" '+(config.showHeader?'checked':'')+' onchange="App.toggleZoneHeader(\''+testId+'\',this.checked)"> Show Header</label>';
    h+='<label style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:6px;"><input type="checkbox" '+(config.showFooter?'checked':'')+' onchange="App.toggleZoneFooter(\''+testId+'\',this.checked)"> Show Footer</label>';
    h+='<div style="margin-left:auto;"><label style="font-size:12px;color:var(--text-muted);margin-right:8px;">Layout:</label>';
    h+='<select onchange="App.setZoneLayout(\''+testId+'\',this.value)" style="padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;">';
    var layouts={'1-col':'1 Column','2-col-equal':'2 Columns Equal','2-col-1-2':'2 Columns (1:2)','2-col-2-1':'2 Columns (2:1)','3-col':'3 Columns','2-row':'2 Rows'};
    Object.keys(layouts).forEach(function(l){h+='<option value="'+l+'"'+(l===config.layout?' selected':'')+'>'+layouts[l]+'</option>'});
    h+='</select></div></div>';
    if(zones.length===0){
        h+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCCF</div><h3>No zones yet</h3><p>Add zones like video, PDF, or text explanations.</p></div>';
    }else{
        h+='<div style="display:grid;gap:12px;">'+renderZoneGrid(testId)+'</div>';
    }
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function renderZoneGrid(testId){
    var config=getZoneConfig(testId);
    var zones=config.zones;
    var layout=config.layout;
    var cols=layout==='2-col-equal'||layout==='2-col-1-2'||layout==='2-col-2-1'?2:layout==='3-col'?3:1;
    var style=layout==='2-row'?'grid-template-rows:1fr 1fr;grid-template-columns:1fr;':'grid-template-columns:repeat('+cols+',1fr);';
    if(layout==='2-col-1-2')style='grid-template-columns:1fr 2fr;';
    else if(layout==='2-col-2-1')style='grid-template-columns:2fr 1fr;';
    var h='<div style="display:grid;'+style+'gap:12px;">';
    zones.forEach(function(z,i){
        h+='<div class="zone-card" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;position:relative;">';
        h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
        h+='<strong>'+esc(z.title||z.type)+'</strong>';
        h+='<div style="display:flex;gap:4px;">';
        h+='<button class="btn btn-ghost btn-xs" onclick="App.editZone(\''+testId+'\','+i+')">\u270F\uFE0F</button>';
        h+='<button class="btn btn-danger btn-xs" onclick="App.deleteZone(\''+testId+'\','+i+')">\uD83D\uDDD1\uFE0F</button></div></div>';
        h+='<p style="font-size:12px;color:var(--text-muted);">'+esc(z.type)+(z.fileName?' — '+esc(z.fileName):'')+'</p>';
        if(i>0)h+='<button class="btn btn-ghost btn-xs" onclick="App.moveZone(\''+testId+'\','+i+',-1)" style="position:absolute;top:50%;left:-16px;">\u25C0</button>';
        if(i<zones.length-1)h+='<button class="btn btn-ghost btn-xs" onclick="App.moveZone(\''+testId+'\','+i+',1)" style="position:absolute;top:50%;right:-16px;">\u25B6</button>';
        h+='</div>';
    });
    return h+'</div>';
}
function addZoneToTest(testId){
    var h='<div class="modal-field"><label>Zone Type</label><select id="f-zone-type">';
    var types={video:'Video',pdf:'PDF Document',presentation:'Presentation',text:'Text Explanation',hardware:'Required Equipment',firmware:'Device Firmware',custom:'Custom'};
    Object.keys(types).forEach(function(t){h+='<option value="'+t+'">'+types[t]+'</option>'});
    h+='</select></div><div class="modal-field"><label>Title</label><input id="f-zone-title" placeholder="Video Guide"></div>';
    h+='<div class="modal-field"><label>Title (Arabic)</label><input id="f-zone-titleAr" placeholder="\u062F\u0644\u064A\u0644 \u0641\u064A\u062F\u064A\u0648"></div>';
    h+='<div class="modal-field"><label>Content (URL or embed code)</label><textarea id="f-zone-content" rows="3" placeholder="https://youtube.com/..."></textarea></div>';
    openModal('Add Zone',h,function(){confirmAddZone(testId)});
}
function confirmAddZone(testId){
    var type=$('f-zone-type').value;
    var config=getZoneConfig(testId);
    config.zones.push({id:uid(),type:type,title:$('f-zone-title').value,titleAr:$('f-zone-titleAr').value,content:$('f-zone-content').value,fileName:''});
    saveTestZones();selectZoneTest(testId,'');showToast('Zone added');
}
function editZone(testId,idx){
    var config=getZoneConfig(testId);var zones=config.zones;var z=zones[idx];if(!z)return;
    var h='<div class="modal-field"><label>Zone Type</label><select id="f-zone-type">';
    var types={video:'Video',pdf:'PDF Document',presentation:'Presentation',text:'Text Explanation',hardware:'Required Equipment',firmware:'Device Firmware',custom:'Custom'};
    Object.keys(types).forEach(function(t){h+='<option value="'+t+'"'+(t===z.type?' selected':'')+'>'+types[t]+'</option>'});
    h+='</select></div><div class="modal-field"><label>Title</label><input id="f-zone-title" value="'+esc(z.title||'')+'"></div>';
    h+='<div class="modal-field"><label>Title (Arabic)</label><input id="f-zone-titleAr" value="'+esc(z.titleAr||'')+'"></div>';
    h+='<div class="modal-field"><label>Content</label><textarea id="f-zone-content" rows="3">'+esc(z.content||'')+'</textarea></div>';
    openModal('Edit Zone',h,function(){confirmEditZone(testId,idx)});
}
function confirmEditZone(testId,idx){
    var config=getZoneConfig(testId);var zones=config.zones;var z=zones[idx];if(!z)return;
    z.type=$('f-zone-type').value;z.title=$('f-zone-title').value;z.titleAr=$('f-zone-titleAr').value;z.content=$('f-zone-content').value;
    saveTestZones();selectZoneTest(testId,'');showToast('Zone updated');
}
function deleteZone(testId,idx){
    if(!confirm('Delete this zone?'))return;
    var config=getZoneConfig(testId);config.zones.splice(idx,1);
    saveTestZones();selectZoneTest(testId,'');showToast('Zone deleted');
}
function moveZone(testId,idx,dir){
    var config=getZoneConfig(testId);var zones=config.zones;var ni=idx+dir;if(ni<0||ni>=zones.length)return;
    var t=zones[idx];zones[idx]=zones[ni];zones[ni]=t;
    saveTestZones();selectZoneTest(testId,'');
}
function setZoneLayout(testId,layout){var config=getZoneConfig(testId);config.layout=layout;saveTestZones();selectZoneTest(testId,'');}
function toggleZoneHeader(testId,show){var config=getZoneConfig(testId);config.showHeader=show;saveTestZones();selectZoneTest(testId,'');}
function toggleZoneFooter(testId,show){var config=getZoneConfig(testId);config.showFooter=show;saveTestZones();selectZoneTest(testId,'');}
function resetTestZones(testId){
    if(!confirm('Reset all zones for this test page?'))return;
    delete testZones[testId];
    saveTestZones();selectZoneTest(testId,'');showToast('Zones reset','info');
}

/* ===== PAGE DESIGNER ===== */
function renderDesigner(){
    var h='<div class="page-header"><h1>\uD83C\uDFA8 Page <span>Designer</span></h1><div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'dashboard\')">\u2190 Back</button></div></div>';
    h+='<p style="color:var(--text-muted);margin-bottom:20px;">Design sidebar fields for test, design, and client pages.</p>';
    var sections=structure.sections||[];
    if(sections.length===0){h+='<div class="empty-state"><div class="empty-icon">\uD83C\uDFA8</div><h3>No sections</h3></div>';}
    else{
        sections.forEach(function(sec){
            var allItems=(sec.tests||[]).concat(sec.designs||[]).concat(sec.clients||[]);if(allItems.length===0)return;
            h+='<div class="content-panel" style="margin-bottom:20px;"><div class="panel-header"><h2>'+(sec.icon||'')+' '+esc(sec.name)+'</h2>';
            h+='<span style="font-size:12px;color:var(--text-muted);">'+allItems.length+' pages</span></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;padding:16px;">';
            allItems.forEach(function(item){
                var fields=(pageDesigns[sec.id]||{})[item.id];var fcnt=fields?fields.length:0;
                h+='<div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;cursor:pointer;" onclick="App.openDesignerItem(\''+sec.id+'\',\''+item.id+'\')">';
                h+='<div style="font-size:20px;margin-bottom:4px;">'+(item.icon||'\uD83D\uDCC4')+'</div>';
                h+='<div style="font-size:12px;font-weight:600;">'+esc(item.name)+'</div>';
                h+='<div style="font-size:10px;color:var(--text-muted);margin-top:4px;">'+fcnt+' field'+(fcnt!==1?'s':'')+'</div></div>';
            });
            h+='</div></div>';
        });
    }
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function renderDesignerForItem(secId,itemId){
    if(!pageDesigns[secId])pageDesigns[secId]={};
    if(!pageDesigns[secId][itemId])pageDesigns[secId][itemId]={sidebarFields:[]};
    var fields=pageDesigns[secId][itemId].sidebarFields||[];
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});
    var item=null;
    if(sec){var allItems=(sec.tests||[]).concat(sec.designs||[]).concat(sec.clients||[]);item=allItems.find(function(i){return i.id===itemId})}
    if(!item)return;
    var h='<div class="breadcrumb"><a href="javascript:void(0)" onclick="App.navigate(\'designer\')">Designer</a><span class="sep">/</span><span>'+esc(item.name)+'</span></div>';
    h+='<div class="page-header"><h1>'+(item.icon||'')+' '+esc(item.name)+' <span style="font-size:14px;font-weight:400;color:var(--text-muted);">Sidebar Fields</span></h1>';
    h+='<div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'designer\')">\u2190 Back</button>';
    h+='<button class="btn btn-primary" onclick="App.addDesignerItem(\''+secId+'\',\''+itemId+'\')">+ Add Field</button></div></div>';
    if(fields.length===0){h+='<div class="empty-state"><div class="empty-icon">\uD83C\uDFA8</div><h3>No fields yet</h3></div>';}
    else{
        h+='<div class="designer-panel"><div class="designer-section-select"><h3 style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:12px;">Fields ('+fields.length+')</h3><div class="designer-items-grid">';
        fields.forEach(function(f,i){
            h+='<div class="field-item" draggable="true" data-idx="'+i+'"><span class="field-drag">\u2801\u2801</span><span class="field-name">'+esc(f.label||f.key||'Field')+'</span>';
            h+='<span style="font-size:10px;color:var(--text-muted);">'+esc(f.type||'text')+'</span>';
            h+='<span class="field-remove" onclick="App.removeDesignerField(\''+secId+'\',\''+itemId+'\','+i+')">\u2716</span></div>';
        });
        h+='</div></div><div class="designer-main"><div class="field-config" style="padding:20px;"><p style="color:var(--text-muted);font-size:13px;">Select a field to edit.</p></div></div></div>';
    }
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function addDesignerItem(secId,itemId){
    if(!pageDesigns[secId])pageDesigns[secId]={};
    if(!pageDesigns[secId][itemId])pageDesigns[secId][itemId]={sidebarFields:[]};
    var h='<div class="modal-field"><label>Field Key</label><input id="df-key" placeholder="field_name"></div>';
    h+='<div class="modal-field"><label>Label</label><input id="df-label" placeholder="Field Name"></div>';
    h+='<div class="modal-field"><label>Type</label><select id="df-type"><option value="text">Text</option><option value="number">Number</option><option value="select">Select</option><option value="textarea">Textarea</option><option value="file">File</option></select></div>';
    h+='<div class="modal-field"><label>Default Value</label><input id="df-default" placeholder=""></div>';
    h+='<div class="modal-field"><label>Options (for Select, comma-separated)</label><input id="df-options" placeholder="opt1,opt2,opt3"></div>';
    openModal('Add Field',h,function(){confirmAddDesignerField(secId,itemId)});
}
function confirmAddDesignerField(secId,itemId){
    var fields=pageDesigns[secId][itemId].sidebarFields||[];
    fields.push({id:uid(),key:$('df-key').value,label:$('df-label').value,type:$('df-type').value,default:$('df-default').value,options:$('df-options').value});
    pageDesigns[secId][itemId].sidebarFields=fields;saveDesigns();
    renderDesignerForItem(secId,itemId);showToast('Field added');
}
function removeDesignerField(secId,itemId,idx){
    if(!pageDesigns[secId]||!pageDesigns[secId][itemId])return;
    var fields=pageDesigns[secId][itemId].sidebarFields||[];fields.splice(idx,1);
    saveDesigns();renderDesignerForItem(secId,itemId);showToast('Field removed');
}

/* ===== HTML EDITOR ===== */
function openHtmlEditor(secId,tn,itemId){
    var sec=(structure.sections||[]).find(function(s){return s.id===secId});if(!sec)return;
    var item=(sec[tn]||[]).find(function(i){return i.id===itemId});if(!item)return;
    var isExisting=item.fileType==='existing';
    var htmlContent=item.htmlContent||getTemplateHtml(item,sec);
    var h='<div style="display:flex;flex-direction:column;gap:12px;">';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    h+='<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">File Type</label>';
    h+='<select id="html-file-type" style="width:100%;padding:8px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:13px;" onchange="App.toggleHtmlPathType()">';
    h+='<option value="existing"'+(isExisting?' selected':'')+'>Existing File</option><option value="new"'+(isExisting?'':' selected')+'>New File (Template)</option></select></div>';
    h+='<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Path</label>';
    h+='<input id="html-file-path" value="'+esc(item.path||'')+'" style="width:100%;padding:8px;background:rgba(30,41,59,0.5);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-size:13px;" placeholder="/concrete/tests/new-test/index.html"></div></div>';
    h+='<div><label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">HTML Code</label>';
    h+='<textarea id="html-editor-content" rows="20" style="width:100%;padding:12px;background:#0d1117;border:1px solid var(--border-glass);border-radius:8px;color:#c9d1d9;font-family:\'SF Mono\',Monaco,Consolas,monospace;font-size:12px;line-height:1.5;resize:vertical;tab-size:2;">'+esc(htmlContent)+'</textarea></div>';
    h+='<div style="display:flex;gap:8px;justify-content:space-between;"><div>';
    h+='<button class="btn btn-ghost" onclick="App.formatHtml()" style="font-size:12px;">Format HTML</button>';
    h+='<button class="btn btn-ghost" onclick="App.previewHtml()" style="font-size:12px;margin-left:6px;">Preview</button></div>';
    h+='<div style="font-size:11px;color:var(--text-muted);line-height:1.5;">Edit the HTML code directly.<br>Changes are saved to localStorage.</div></div></div>';
    openModal('HTML Editor - '+(item.name||'Test'),h,function(){
        item.fileType=$('html-file-type').value;item.path=$('html-file-path').value;item.htmlContent=$('html-editor-content').value;
        saveStructure();showToast('HTML saved for "'+item.name+'"','success');closeModal();
    },true);
}
function getTemplateHtml(item,section){
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>smartLAB \u2014 '+esc(item.name||'Test')+'</title>\n    <link rel="icon" href="../../favicon.ico">\n    <link rel="stylesheet" href="test-common.css">\n    <link rel="stylesheet" href="../../test-zones.css">\n</head>\n<body>\n    <div id="header-placeholder"></div>\n    <div class="page">\n        <a href="../'+(section.id||'')+'.html" class="back-link"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Back to '+esc(section.name||'Tests')+'</a>\n        <h1 class="page-title">'+esc(item.name||'Test').replace(/ /g,' <span>')+'</h1>\n        <p class="page-sub">'+esc(item.description||item.standard||'')+'</p>\n        <div class="level-top"><span class="lt-label">Test Level</span><div class="lt-btns"><button class="lt-btn active" data-level="quick">\u26A1 Quick</button><button class="lt-btn" data-level="unofficial">\uD83C\uDF81 Unofficial</button><button class="lt-btn" data-level="certified">\uD83D\uDD12 Certified</button></div></div>\n        <div class="billboard"><div class="bb-inner"><div class="bb-icon">'+(item.icon||'\uD83D\uDCCA')+'</div><div class="bb-body"><div class="bb-step-label">STEP 1 / 1</div><div class="bb-title">'+esc(item.name||'Test')+'</div><div class="bb-desc">'+esc(item.description||'Complete the test procedure')+'</div></div></div></div>\n        <div class="two-col"><div class="sidebar"><div class="sidebar-title">\u2699 Test Parameters</div></div><div class="main-area"><div id="zone-container"></div></div></div>\n    </div>\n    <div id="footer-placeholder"></div>\n    <script src="../assets/site-config.js"><\/script>\n    <script src="../components.js"><\/script>\n    <script src="test-zone.js"><\/script>\n</body>\n</html>';
}
function formatHtml(){
    var ta=$('html-editor-content');if(!ta)return;
    var code=ta.value;code=code.replace(/>\s*</g,'>\n<');code=code.replace(/\n\s*\n/g,'\n');ta.value=code;
    showToast('HTML formatted','info');
}
function previewHtml(){
    var ta=$('html-editor-content');if(!ta)return;
    var win=window.open('','_blank');win.document.write(ta.value);win.document.close();
}
function toggleHtmlPathType(){
    var type=$('html-file-type').value;var pathInput=$('html-file-path');
    if(pathInput)pathInput.style.borderColor=type==='new'?'rgba(251,191,36,0.5)':'';
}

/* ===== REPORTS ===== */
function renderReports(){
    var h='<div class="page-header"><h1>\uD83D\uDCCA Reports</h1><div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'dashboard\')">\u2190 Back</button></div></div>';
    h+='<p style="color:var(--text-muted);margin-bottom:20px;">Generated PDF reports are stored in the browser.</p>';
    if(!reports||reports.length===0){h+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCCA</div><h3>No reports yet</h3></div>';}
    else{
        h+='<div class="file-grid">';
        reports.forEach(function(r,i){
            h+='<div class="file-card"><div class="file-icon">\uD83D\uDCC4</div><div class="file-name">'+esc(r.name||'Report')+'</div>';
            h+='<div class="file-meta">'+(r.date?formatDate(r.date):'')+' | '+fileSize(r.size)+'</div>';
            h+='<div class="file-actions"><button class="btn btn-primary btn-xs" onclick="App.downloadReport('+i+')">\u2B07 Download</button>';
            h+='<button class="btn btn-danger btn-xs" onclick="App.deleteReport('+i+')">\uD83D\uDDD1\uFE0F</button></div></div>';
        });
        h+='</div>';
    }
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function addReport(name,dataUrl,size){
    if(!reports)reports=[];
    reports.push({id:uid(),name:name,dataUrl:dataUrl,size:size||0,date:Date.now()});saveReports();
}
function deleteReport(idx){
    if(!confirm('Delete this report?'))return;
    reports.splice(idx,1);saveReports();renderReports();showToast('Report deleted');
}
function downloadReport(idx){
    var r=reports[idx];if(!r||!r.dataUrl)return;
    var a=document.createElement('a');a.href=r.dataUrl;a.download=r.name||'report.pdf';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
}

/* ===== USERS ===== */
function renderUsers(){
    var h='<div class="page-header"><h1>\uD83D\uDC65 User <span>Management</span></h1><div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'dashboard\')">\u2190 Back</button><button class="btn btn-primary" onclick="App.addUser()">+ Add User</button></div></div>';
    h+='<div class="content-panel"><table class="data-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Last Login</th><th>Actions</th></tr></thead><tbody>';
    (users||[]).forEach(function(u){
        h+='<tr><td><div class="user-cell"><div class="avatar">'+(u.name?u.name.charAt(0).toUpperCase():'?')+'</div>'+esc(u.name||'')+'</div></td>';
        h+='<td>'+esc(u.email||'')+'</td><td><span class="role-badge role-'+(u.role||'user')+'">'+(u.role||'user')+'</span></td>';
        h+='<td>'+formatDate(u.lastLogin)+'</td>';
        h+='<td><div class="item-actions"><button class="btn btn-ghost btn-sm" onclick="App.editUser(\''+u.id+'\')">\u270F\uFE0F</button>';
        h+='<button class="btn btn-danger btn-sm" onclick="App.deleteUser(\''+u.id+'\')">\uD83D\uDDD1\uFE0F</button></div></td></tr>';
    });
    h+='</tbody></table></div>';
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function addUser(){
    var h='<div class="modal-row"><div class="modal-field"><label>Name</label><input id="fu-name" placeholder="User Name"></div>';
    h+='<div class="modal-field"><label>Email</label><input id="fu-email" placeholder="user@example.com"></div></div>';
    h+='<div class="modal-row"><div class="modal-field"><label>Password</label><input id="fu-pass" type="password" placeholder="Min 6"></div>';
    h+='<div class="modal-field"><label>Role</label><select id="fu-role"><option value="user">User</option><option value="admin">Admin</option></select></div></div>';
    openModal('Add User',h,function(){confirmAddUser()});
}
function confirmAddUser(){
    var email=$('fu-email').value;if(!email){showToast('Email is required','error');return;}
    if((users||[]).find(function(u){return u.email===email})){showToast('Email already exists','error');return;}
    if(!users)users=[];
    users.push({id:uid(),name:$('fu-name').value,email:email,role:$('fu-role').value,lastLogin:Date.now(),avatar:''});saveUsers();renderUsers();showToast('User added');
}
function editUser(uid){
    var u=(users||[]).find(function(x){return x.id===uid});if(!u)return;
    var h='<div class="modal-row"><div class="modal-field"><label>Name</label><input id="fu-name" value="'+esc(u.name||'')+'"></div>';
    h+='<div class="modal-field"><label>Email</label><input id="fu-email" value="'+esc(u.email||'')+'"></div></div>';
    h+='<div class="modal-row"><div class="modal-field"><label>Password (leave blank)</label><input id="fu-pass" type="password" placeholder="Min 6"></div>';
    h+='<div class="modal-field"><label>Role</label><select id="fu-role"><option value="user"'+(u.role==='user'?' selected':'')+'>User</option><option value="admin"'+(u.role==='admin'?' selected':'')+'>Admin</option></select></div></div>';
    openModal('Edit User',h,function(){confirmEditUser(uid)});
}
function confirmEditUser(uid){
    var u=(users||[]).find(function(x){return x.id===uid});if(!u)return;
    u.name=$('fu-name').value;u.email=$('fu-email').value;u.role=$('fu-role').value;saveUsers();renderUsers();showToast('User updated');
}
function deleteUser(uid){
    if(!confirm('Delete this user?'))return;
    users=(users||[]).filter(function(u){return u.id!==uid});saveUsers();renderUsers();showToast('User deleted');
}

/* ===== SETTINGS ===== */
function renderSettings(){
    var s=settings||{};
    var logoPreviewHtml='';
    if(s.logo&&s.logo.indexOf('data:')===0)logoPreviewHtml='<img src="'+s.logo+'" alt="logo">';
    else{var init=(s.siteName||'SL');logoPreviewHtml='<span>'+init.charAt(0).toUpperCase()+'</span>';}
    var favPreviewHtml='';
    if(s.favicon&&s.favicon.indexOf('data:')===0)favPreviewHtml='<img src="'+s.favicon+'" alt="favicon">';
    else{var fi=(s.siteName||'SL');favPreviewHtml='<span>'+fi.charAt(0).toUpperCase()+'</span>';}
    var h='<div class="page-header"><h1>\u2699\uFE0F <span>Settings</span></h1><div class="header-actions"><button class="btn btn-ghost" onclick="App.navigate(\'dashboard\')">\u2190 Back</button><button class="btn btn-primary" onclick="App.saveSettings()">\uD83D\uDCBE Save</button></div></div>';
    h+='<div class="settings-grid">';
    h+='<div class="settings-card"><div class="settings-card-header">\uD83C\uDFE0 General</div><div class="settings-card-body">';
    h+='<div class="form-group"><label>Site Name (EN)</label><input id="set-siteName" value="'+esc(s.siteName||'')+'"></div>';
    h+='<div class="form-group"><label>Site Name (AR)</label><input id="set-siteNameAr" value="'+esc(s.siteNameAr||'')+'"></div>';
    h+='<div class="form-group"><label>Logo</label><div class="logo-upload-row"><div class="logo-preview" id="logo-preview">'+logoPreviewHtml+'</div>';
    h+='<div class="logo-upload-actions"><label class="btn btn-sm btn-outline logo-upload-label" style="cursor:pointer;">\uD83D\uDCC1 Upload<input type="file" accept="image/*" style="display:none" onchange="App.uploadLogo(this)"></label>';
    if(s.logo&&s.logo.indexOf('data:')===0)h+='<button class="btn btn-sm btn-danger" onclick="App.removeLogo()">\u2716 Remove</button>';
    h+='</div></div><input type="hidden" id="set-logo" value="'+esc(s.logo||'')+'"></div>';
    h+='<div class="form-group"><label>Favicon</label><div class="logo-upload-row"><div class="logo-preview fav-preview" id="fav-preview">'+favPreviewHtml+'</div>';
    h+='<div class="logo-upload-actions"><label class="btn btn-sm btn-outline logo-upload-label" style="cursor:pointer;">\uD83D\uDCC1 Upload<input type="file" accept="image/*" style="display:none" onchange="App.uploadFavicon(this)"></label>';
    if(s.favicon&&s.favicon.indexOf('data:')===0)h+='<button class="btn btn-sm btn-danger" onclick="App.removeFavicon()">\u2716 Remove</button>';
    h+='</div></div><input type="hidden" id="set-favicon" value="'+esc(s.favicon||'')+'"></div>';
    h+='<div class="form-group"><label>Copyright</label><input id="set-copyright" value="'+esc(s.copyright||'')+'"></div></div></div>';
    h+='<div class="settings-card"><div class="settings-card-header">\uD83D\uDCE7 Contact</div><div class="settings-card-body">';
    h+='<div class="form-group"><label>Email</label><input id="set-email" value="'+esc(s.email||'')+'"></div>';
    h+='<div class="form-group"><label>Phone (Egypt)</label><input id="set-phone_eg" value="'+esc(s.phone_eg||'')+'"></div>';
    h+='<div class="form-group"><label>Phone (KSA)</label><input id="set-phone_ksa" value="'+esc(s.phone_ksa||'')+'"></div>';
    h+='<div class="form-group"><label>Address</label><input id="set-address" value="'+esc(s.address||'')+'"></div></div></div>';
    h+='</div>';
    var mc=$('mainContent');if(mc)mc.innerHTML=h;
}
function saveSettings(){
    settings.siteName=($('set-siteName')||{}).value||'';
    settings.siteNameAr=($('set-siteNameAr')||{}).value||'';
    settings.logo=($('set-logo')||{}).value||'';
    settings.favicon=($('set-favicon')||{}).value||'';
    settings.copyright=($('set-copyright')||{}).value||'';
    settings.email=($('set-email')||{}).value||'';
    settings.phone_eg=($('set-phone_eg')||{}).value||'';
    settings.phone_ksa=($('set-phone_ksa')||{}).value||'';
    settings.address=($('set-address')||{}).value||'';
    saveSettingsData();showToast('Settings saved');
}
function uploadLogo(input){
    if(!input.files||!input.files[0])return;
    var file=input.files[0];if(file.size>2*1024*1024){showToast('Logo must be under 2MB','error');return;}
    var reader=new FileReader();
    reader.onload=function(e){
        var dataUrl=e.target.result;
        ($('set-logo')||{}).value=dataUrl;
        var prev=$('logo-preview');if(prev){prev.innerHTML='<img src="'+dataUrl+'" alt="logo">';prev.classList.add('has-logo');}
        showToast('Logo uploaded','success');
    };
    reader.readAsDataURL(file);
}
function removeLogo(){
    ($('set-logo')||{}).value='/assets/logo.png';
    var prev=$('logo-preview');if(prev){prev.innerHTML='<span>'+(settings.siteName||'SL').charAt(0).toUpperCase()+'</span>';prev.classList.remove('has-logo');}
    showToast('Logo reverted to default','info');
}
function uploadFavicon(input){
    if(!input.files||!input.files[0])return;
    var file=input.files[0];if(file.size>2*1024*1024){showToast('Favicon must be under 2MB','error');return;}
    var reader=new FileReader();
    reader.onload=function(e){
        var dataUrl=e.target.result;
        ($('set-favicon')||{}).value=dataUrl;
        var prev=$('fav-preview');if(prev){prev.innerHTML='<img src="'+dataUrl+'" alt="favicon">';prev.classList.add('has-favicon');}
        showToast('Favicon uploaded','success');
    };
    reader.readAsDataURL(file);
}
function removeFavicon(){
    ($('set-favicon')||{}).value='/favicon.ico';
    var prev=$('fav-preview');if(prev){prev.innerHTML='<span>F</span>';prev.classList.remove('has-favicon');}
    showToast('Favicon reverted to default','info');
}

/* ===== RESET ===== */
function resetData(){
    if(!confirm('This will reset ALL data to defaults. Are you sure?'))return;
    if(!confirm('This action cannot be undone. Continue?'))return;
    localStorage.removeItem(STRUCT_KEY);localStorage.removeItem(CONTENT_KEY);localStorage.removeItem(DESIGNS_KEY);
    localStorage.removeItem(REPORTS_KEY);localStorage.removeItem(USERS_KEY);localStorage.removeItem(SETTINGS_KEY);
    structure=JSON.parse(JSON.stringify(structSrc));content=JSON.parse(JSON.stringify(DFLT_CONTENT));pageDesigns={};
    reports=[];users=JSON.parse(JSON.stringify(DFLT_USERS));settings=JSON.parse(JSON.stringify(DFLT_SETTINGS));
    saveStructure();saveContent();saveDesigns();saveReports();saveUsers();saveSettingsData();
    view='dashboard';sectionId=null;renderSidebar();renderMain();showToast('All data has been reset to defaults');
}

/* ===== LOGOUT ===== */
function logout(){
    function go(){ window.location.href = 'login.html'; }
    try {
        fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
            .then(go, go);
    } catch(e) { go(); }
}

/* ===== MAIN RENDER DISPATCHER ===== */
function renderMain(){
    switch(view){
        case'dashboard':renderDashboard();break;
        case'section':renderSection();break;
        case'content':renderContentManager();break;
        case'zones':renderZoneManager();break;
        case'designer':renderDesigner();break;
        case'reports':renderReports();break;
        case'users':renderUsers();break;
        case'settings':renderSettings();break;
        default:renderDashboard();break;
    }
}

/* ===== GLOBAL API ===== */
window.App={
    navigate:navigate,setTab:setTab,search:search,setContentTab:setContentTab,
    addSection:addSection,editSection:editSection,deleteSection:deleteSection,
    addItem:addItem,editItem:editItem,deleteItem:deleteItem,duplicateItem:duplicateItem,
    pickEmoji:pickEmoji,pickEmojiField:pickEmojiField,
    pickSecEmoji:function(){
        var current=($('f-sec-icon')||{}).value||'';
        var mc=$('modalBody');if(!mc)return;
        var orig=mc.innerHTML;
        mc.innerHTML='<p style="margin-bottom:10px;">Pick an icon:</p>'+buildEmojiPicker(current)+'<div style="margin-top:12px;"><button class="btn btn-ghost" onclick="App.restoreModalForm()">Back</button></div>';
        window._modalOrigForm=orig;
    },
    restoreModalForm:restoreModalForm,
    closeModal:closeModal,confirmModal:confirmModal,resetData:resetData,
    saveContentField:saveContentField,saveSettings:saveSettings,
    addUser:addUser,editUser:editUser,deleteUser:deleteUser,
    selectZoneTest:selectZoneTest,addZoneToTest:addZoneToTest,
    editZone:editZone,deleteZone:deleteZone,moveZone:moveZone,
    setZoneLayout:setZoneLayout,toggleZoneHeader:toggleZoneHeader,toggleZoneFooter:toggleZoneFooter,resetTestZones:resetTestZones,
    addDesignerItem:addDesignerItem,removeDesignerField:removeDesignerField,openDesignerItem:renderDesignerForItem,
    openHtmlEditor:openHtmlEditor,formatHtml:formatHtml,previewHtml:previewHtml,toggleHtmlPathType:toggleHtmlPathType,
    addReport:addReport,deleteReport:deleteReport,downloadReport:downloadReport,
    pickColor:pickColor,logout:logout,
    uploadIcon:uploadIcon,removeIcon:removeIcon,
    uploadLogo:uploadLogo,removeLogo:removeLogo,uploadFavicon:uploadFavicon,removeFavicon:removeFavicon,
    confirmAddSection:confirmAddSection,confirmEditSection:confirmEditSection,
    confirmAddUser:confirmAddUser,confirmEditUser:confirmEditUser,
    confirmAddZone:confirmAddZone,confirmEditZone:confirmEditZone,
    confirmAddDesignerField:confirmAddDesignerField
};

/* ===== INIT ===== */
function bootAdmin(){
try{
    renderSidebar();
    renderMain();
}catch(e){
    console.error('[smartLAB] Init error:',e);
    var mc=$('mainContent');
    if(mc)mc.textContent='Admin Panel Error: '+(e.message||e)+'\n\n'+(e.stack||'');
}
}

})();
