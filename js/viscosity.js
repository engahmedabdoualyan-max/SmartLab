// ================================================================
// VISCOSITY TEST (Saybolt Furol / Rotational)
// ================================================================
var viscState={isRunning:false,readings:[],viscosity:0};
function onViscConnChange(){var v=document.getElementById('visc-conn').value;if(v==='demo'){document.getElementById('visc-demo-banner').style.display='flex';}else{document.getElementById('visc-demo-banner').style.display='none';}}
function startViscTest(){
    var conn=document.getElementById('visc-conn').value;if(!conn){alert('Select connection type');return;}
    viscState={isRunning:true,readings:[],viscosity:0};
    document.getElementById('visc-btn-start').style.display='none';
    document.getElementById('visc-btn-stop').style.display='flex';
    document.getElementById('visc-results-panel').style.display='none';
    if(conn==='demo')runViscDemo();else if(conn==='manual')runViscManual();
}
function stopViscTest(){
    viscState.isRunning=false;
    document.getElementById('visc-btn-start').style.display='flex';
    document.getElementById('visc-btn-stop').style.display='none';
    calculateViscResults();
}
function runViscManual(){
    var flowTime=prompt('Enter flow time (seconds):');if(!flowTime)return;
    viscState.readings.push({flowTime:parseFloat(flowTime)});
    calculateViscResults();
}
function runViscDemo(){
    if(!viscState.isRunning)return;
    var targetVisc=80+Math.random()*120;
    var readings=[];var steps=15;
    for(var i=0;i<steps;i++){
        var flowTime=targetVisc*(0.95+Math.random()*0.1);
        var temp=parseFloat(document.getElementById('visc-temp').value)||135;
        readings.push({flowTime:flowTime,temp:temp,step:i+1});
    }
    var idx=0;
    function stepVisc(){
        if(!viscState.isRunning||idx>=readings.length){calculateViscResults();return;}
        var rd=readings[idx];idx++;
        viscState.readings.push(rd);
        document.getElementById('visc-val-time').textContent=rd.flowTime.toFixed(1);
        document.getElementById('visc-val-temp').textContent=rd.temp.toFixed(1);
        document.getElementById('visc-val-visc').textContent=rd.flowTime.toFixed(0);
        document.getElementById('visc-val-status').textContent='Collecting...';
        setTimeout(stepVisc,2000);
    }
    stepVisc();
}
function calculateViscResults(){
    var r=viscState.readings;if(r.length===0)return;
    var avgFlow=r.reduce(function(s,v){return s+v.flowTime;},0)/r.length;
    viscState.viscosity=avgFlow;
    var grade=document.getElementById('visc-grade').value;
    var temp=document.getElementById('visc-temp').value;
    var pass=avgFlow>=30;
    var panel=document.getElementById('visc-results-panel');panel.style.display='block';
    var html='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅':'❌')+' '+avgFlow.toFixed(0)+' sec</div>';
    html+='<div class="result-row"><span class="result-label">Flow Time (Viscosity)</span><span class="result-value">'+avgFlow.toFixed(1)+' seconds</span></div>';
    html+='<div class="result-row"><span class="result-label">Test Temperature</span><span class="result-value">'+temp+'°C</span></div>';
    html+='<div class="result-row"><span class="result-label">Bitumen Grade</span><span class="result-value">'+grade+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Method</span><span class="result-value">Saybolt Furol</span></div>';
    html+='<div class="result-row"><span class="result-label">Readings Count</span><span class="result-value">'+r.length+'</span></div>';
    document.getElementById('visc-results-body').innerHTML=html;
    saveTestSession('viscosity',{viscosity:avgFlow,temp:temp,grade:grade,readings:r});
}
function generateViscPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLAP - Viscosity Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('visc-grade').value,195,y,{align:'right'});y+=5;
        doc.text('Temperature: '+document.getElementById('visc-temp').value+' C',195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('visc-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Flow Time: '+viscState.viscosity.toFixed(1)+' seconds',195,y,{align:'right'});y+=5;
        doc.text('Status: '+(viscState.viscosity>=30?'PASS':'FAIL'),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLAP v1.0.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Viscosity_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
