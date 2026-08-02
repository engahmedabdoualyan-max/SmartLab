(function(){
'use strict';
var STRUCT_KEY='smartlab_site_structure';
var sectionId=typeof SECTION_ID!=='undefined'?SECTION_ID:null;
if(!sectionId)return;
var defaults=typeof SECTION_DEFAULTS!=='undefined'?SECTION_DEFAULTS:{tests:[],designs:[],library:[],clients:[]};
function loadData(key,fb){try{var d=JSON.parse(localStorage.getItem(key));if(d!==null&&d!==undefined)return d}catch(e){}return fb}
function buildCard(item){
    var defDesc='';
    for(var cat in defaults){
        var found=(defaults[cat]||[]).find(function(d){return d.path===item.path||d.id===item.id});
        if(found){defDesc=found.description||'';break}
    }
    var desc=item.description||defDesc;
    var target=item.path&&(item.path.indexOf('.html')>-1)?'_blank':'';
    return '<a href="'+(item.path||'#')+'"'+(target?' target="'+target+'"':'')+' class="design-card">'+
        '<div class="dc-icon">'+(item.image?'<img src="'+item.image+'" alt="'+(item.name||'')+'">':(item.icon||'📄'))+'</div>'+
        '<div class="dc-body">'+
        '<div class="dc-name">'+(item.name||'')+'</div>'+
        (desc?'<div class="dc-desc">'+esc(desc)+'</div>':'')+
        '</div></a>';
}
function esc(s){
    if(s===null||s===undefined)return '';
    var d=document.createElement('div');d.textContent=String(s);return d.innerHTML;
}
function renderPanel(id,items){
    var panel=document.getElementById('panel-'+id);
    if(!panel)return;
    var grid=panel.querySelector('.card-grid');
    if(grid)grid.innerHTML=items.map(buildCard).join('');
}
function init(){
    var struct=loadData(STRUCT_KEY,null);
    var sec=null;
    if(struct&&struct.sections)sec=struct.sections.find(function(s){return s.id===sectionId});
    var tests=sec?sec.tests:defaults.tests;
    var designs=sec?sec.designs:defaults.designs;
    var clients=sec?sec.clients:defaults.clients;
    var library=defaults.library||[];
    renderPanel('tests',tests);
    renderPanel('design',designs);
    renderPanel('library',library);
    renderPanel('client',clients);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
