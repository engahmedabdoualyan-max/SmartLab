// ================================================================
// DUCTILITY TEST
// ================================================================
var ductState={isRunning:false,readings:[],maxExtension:0,breakPoint:0};
function onDuctConnChange(){var v=document.getElementById('duct-conn').value;if(v==='demo'){document.getElementById('duct-demo-banner').style.display='flex';}else{document.getElementById('duct-demo-banner').style.display='none';}}
function startDuctTest(){
    var conn=document.getElementById('duct-conn').value;if(!conn){alert('Select connection type');return;}
    ductState={isRunning:true,readings:[],maxExtension:0,breakPoint:0};
    document.getElementById('duct-btn-start').style.display='none';
    document.getElementById('duct-btn-stop').style.display='flex';
    document.getElementById('duct-results-panel').style.display='none';
    if(conn==='demo')runDuctDemo();else if(conn==='manual')runDuctManual();
}
function stopDuctTest(){
    ductState.isRunning=false;
    document.getElementById('duct-btn-start').style.display='flex';
    document.getElementById('duct-btn-stop').style.display='none';
    calculateDuctResults();
}
function runDuctManual(){
    var ext=prompt('Enter extension at break (cm):');if(!ext)return;
    ductState.maxExtension=parseFloat(ext);ductState.breakPoint=parseFloat(ext);
    calculateDuctResults();
}
function runDuctDemo(){
    if(!ductState.isRunning)return;
    var maxExt=80+Math.random()*70;
    var breakAt=maxExt*(0.8+Math.random()*0.15);
    var readings=[];var steps=40;
    for(var i=0;i<=steps;i++){
        var t=i/steps;
        var ext=t*maxExt;
        var force=t<0.9?5+Math.random()*2:(t<1?8-3*(t-0.9)/0.1:0);
        readings.push({ext:ext,force:force,broken:ext>breakAt});
    }
    var idx=0;
    function stepDuct(){
        if(!ductState.isRunning||idx>=readings.length){calculateDuctResults();return;}
        var rd=readings[idx];idx++;
        ductState.readings.push(rd);
        if(rd.ext>ductState.maxExtension)ductState.maxExtension=rd.ext;
        if(rd.broken&&ductState.breakPoint===0)ductState.breakPoint=rd.ext;
        document.getElementById('duct-val-ext').textContent=rd.ext.toFixed(1);
        document.getElementById('duct-val-force').textContent=rd.force.toFixed(2);
        document.getElementById('duct-val-speed').textContent='5';
        document.getElementById('duct-val-status').textContent=rd.broken?'BROKEN':'Pulling';
        document.getElementById('duct-val-status').style.color=rd.broken?'var(--danger)':'var(--accent)';
        setTimeout(stepDuct,150);
    }
    stepDuct();
}
function calculateDuctResults(){
    var ext=ductState.breakPoint||ductState.maxExtension;
    var grade=document.getElementById('duct-grade').value;
    var temp=document.getElementById('duct-temp').value;
    var pass=ext>=50;
    var panel=document.getElementById('duct-results-panel');panel.style.display='block';
    var html='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅':'❌')+' '+(pass?'PASS':'FAIL')+'</div>';
    html+='<div class="result-row"><span class="result-label">Ductility (Extension at Break)</span><span class="result-value">'+ext.toFixed(1)+' cm</span></div>';
    html+='<div class="result-row"><span class="result-label">Bitumen Grade</span><span class="result-value">'+grade+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Test Temperature</span><span class="result-value">'+temp+'°C</span></div>';
    html+='<div class="result-row"><span class="result-label">Requirement (min 50cm)</span><span class="result-value">'+(pass?'Satisfied':'Not Satisfied')+'</span></div>';
    document.getElementById('duct-results-body').innerHTML=html;
    saveTestSession('ductility',{ductility:ext,grade:grade,temp:temp});
}
