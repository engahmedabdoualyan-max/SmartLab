// ================================================================
// SOFTENING POINT TEST (Ring and Ball)
// ================================================================
var spState={isRunning:false,readings:[],softeningTemp:0};
function onSPConnChange(){var v=document.getElementById('sp-conn').value;if(v==='demo'){document.getElementById('sp-demo-banner').style.display='flex';}else{document.getElementById('sp-demo-banner').style.display='none';}}
function startSPTest(){
    var conn=document.getElementById('sp-conn').value;if(!conn){alert('Select connection type');return;}
    spState={isRunning:true,readings:[],softeningTemp:0};
    document.getElementById('sp-btn-start').style.display='none';
    document.getElementById('sp-btn-stop').style.display='flex';
    document.getElementById('sp-results-panel').style.display='none';
    if(conn==='demo')runSPDemo();else if(conn==='manual')runSPManual();
}
function stopSPTest(){
    spState.isRunning=false;
    document.getElementById('sp-btn-start').style.display='flex';
    document.getElementById('sp-btn-stop').style.display='none';
    calculateSPResults();
}
function runSPManual(){
    var temp=prompt('Enter softening point temperature (°C):');if(!temp)return;
    spState.softeningTemp=parseFloat(temp);
    spState.readings.push({temp:parseFloat(temp)});
    calculateSPResults();
}
function runSPDemo(){
    if(!spState.isRunning)return;
    var targetTemp=45+Math.random()*30;
    var readings=[];var steps=30;
    for(var i=0;i<=steps;i++){
        var t=i/steps;
        var temp=25+t*60;
        var ballDrop=temp>=targetTemp;
        readings.push({temp:temp,ballDrop:ballDrop,step:i});
    }
    var idx=0;
    function stepSP(){
        if(!spState.isRunning||idx>=readings.length){calculateSPResults();return;}
        var rd=readings[idx];idx++;
        spState.readings.push(rd);
        document.getElementById('sp-val-temp').textContent=rd.temp.toFixed(1);
        document.getElementById('sp-val-rate').textContent='5.0';
        document.getElementById('sp-val-time').textContent=(rd.step*2).toFixed(0);
        document.getElementById('sp-val-status').textContent=rd.ballDrop?'Ball Dropped':'Heating';
        document.getElementById('sp-val-status').style.color=rd.ballDrop?'var(--danger)':'var(--accent)';
        if(rd.ballDrop&&spState.softeningTemp===0)spState.softeningTemp=rd.temp;
        setTimeout(stepSP,800);
    }
    stepSP();
}
function calculateSPResults(){
    if(spState.readings.length===0)return;
    var grade=document.getElementById('sp-grade').value;
    var pass=spState.softeningTemp>=40&&spState.softeningTemp<=60;
    var panel=document.getElementById('sp-results-panel');panel.style.display='block';
    var html='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅':'❌')+' '+spState.softeningTemp.toFixed(1)+'°C</div>';
    html+='<div class="result-row"><span class="result-label">Softening Point</span><span class="result-value">'+spState.softeningTemp.toFixed(1)+'°C</span></div>';
    html+='<div class="result-row"><span class="result-label">Bitumen Grade</span><span class="result-value">'+grade+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Method</span><span class="result-value">Ring and Ball</span></div>';
    document.getElementById('sp-results-body').innerHTML=html;
    saveTestSession('softening_point',{softeningTemp:spState.softeningTemp,grade:grade,readings:spState.readings});
}
function generateSPPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLAP - Softening Point Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('sp-grade').value,195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('sp-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Softening Point: '+spState.softeningTemp.toFixed(1)+' C',195,y,{align:'right'});y+=5;
        doc.text('Status: '+(spState.softeningTemp>=40&&spState.softeningTemp<=60?'PASS':'FAIL'),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLAP v1.0.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Softening_Point_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
