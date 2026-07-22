// ================================================================
// WATER ABSORPTION TEST
// ================================================================
var waState={isRunning:false,readings:[],absorption:0};
function onWAConnChange(){var v=document.getElementById('wa-conn').value;if(v==='demo'){document.getElementById('wa-demo-banner').style.display='flex';}else{document.getElementById('wa-demo-banner').style.display='none';}}
function startWATest(){
    var conn=document.getElementById('wa-conn').value;if(!conn){alert('Select connection type');return;}
    waState={isRunning:true,readings:[],absorption:0};
    document.getElementById('wa-btn-start').style.display='none';
    document.getElementById('wa-btn-stop').style.display='flex';
    document.getElementById('wa-results-panel').style.display='none';
    if(conn==='demo')runWADemo();else if(conn==='manual')runWAManual();
}
function stopWATest(){
    waState.isRunning=false;
    document.getElementById('wa-btn-start').style.display='flex';
    document.getElementById('wa-btn-stop').style.display='none';
    calculateWAResults();
}
function runWAManual(){
    var od=prompt('Enter oven-dry weight OD (g):');if(!od)return;
    var ssd=prompt('Enter saturated surface-dry weight SSD (g):');if(!ssd)return;
    var abs=((parseFloat(ssd)-parseFloat(od))/parseFloat(od))*100;
    waState.readings.push({OD:parseFloat(od),SSD:parseFloat(ssd),absorption:abs});
    calculateWAResults();
}
function runWADemo(){
    if(!waState.isRunning)return;
    var readings=[];var steps=5;
    for(var i=0;i<steps;i++){
        var OD=2200+Math.random()*200;
        var absPct=3+Math.random()*5;
        var SSD=OD*(1+absPct/100);
        readings.push({OD:OD,SSD:SSD,absorption:absPct,step:i+1});
    }
    var idx=0;
    function stepWA(){
        if(!waState.isRunning||idx>=readings.length){calculateWAResults();return;}
        var rd=readings[idx];idx++;
        waState.readings.push(rd);
        document.getElementById('wa-val-OD').textContent=rd.OD.toFixed(1);
        document.getElementById('wa-val-SSD').textContent=rd.SSD.toFixed(1);
        document.getElementById('wa-val-abs').textContent=rd.absorption.toFixed(2);
        document.getElementById('wa-val-status').textContent='Measuring...';
        setTimeout(stepWA,1800);
    }
    stepWA();
}
function calculateWAResults(){
    var r=waState.readings;if(r.length===0)return;
    var avgAbs=r.reduce(function(s,v){return s+v.absorption;},0)/r.length;
    waState.absorption=avgAbs;
    var material=document.getElementById('wa-material').value;
    var pass=avgAbs<=7;
    var panel=document.getElementById('wa-results-panel');panel.style.display='block';
    var html='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅':'❌')+' '+avgAbs.toFixed(2)+'%</div>';
    html+='<div class="result-row"><span class="result-label">Water Absorption</span><span class="result-value">'+avgAbs.toFixed(2)+'%</span></div>';
    html+='<div class="result-row"><span class="result-label">Material</span><span class="result-value">'+material+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Requirement (max 7%)</span><span class="result-value">'+(pass?'Satisfied':'Not Satisfied')+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Readings Count</span><span class="result-value">'+r.length+'</span></div>';
    document.getElementById('wa-results-body').innerHTML=html;
    saveTestSession('water_absorption',{absorption:avgAbs,material:material,readings:r});
}
function generateWAPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLAP - Water Absorption Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Material: '+document.getElementById('wa-material').value,195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('wa-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Water Absorption: '+waState.absorption.toFixed(2)+'%',195,y,{align:'right'});y+=5;
        doc.text('Status: '+(waState.absorption<=7?'PASS':'FAIL'),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLAP v1.0.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Water_Absorption_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
