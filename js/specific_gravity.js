// ================================================================
// SPECIFIC GRAVITY TEST (Pyconometer Method)
// ================================================================
var sgState={isRunning:false,readings:[],Gs:0};
function onSGConnChange(){var v=document.getElementById('sg-conn').value;if(v==='demo'){document.getElementById('sg-demo-banner').style.display='flex';}else{document.getElementById('sg-demo-banner').style.display='none';}}
function startSGTest(){
    var conn=document.getElementById('sg-conn').value;if(!conn){alert('Select connection type');return;}
    sgState={isRunning:true,readings:[],Gs:0};
    document.getElementById('sg-btn-start').style.display='none';
    document.getElementById('sg-btn-stop').style.display='flex';
    document.getElementById('sg-results-panel').style.display='none';
    if(conn==='demo')runSGDemo();else if(conn==='manual')runSGManual();
}
function stopSGTest(){
    sgState.isRunning=false;
    document.getElementById('sg-btn-start').style.display='flex';
    document.getElementById('sg-btn-stop').style.display='none';
    calculateSGResults();
}
function runSGManual(){
    var Ws=prompt('Enter dry soil weight Ws (g):');if(!Ws)return;
    var W1=prompt('Enter pycnometer + water weight W1 (g):');if(!W1)return;
    var W2=prompt('Enter pycnometer + water + soil weight W2 (g):');if(!W2)return;
    var rhows=parseFloat(document.getElementById('sg-rhow').value)||1;
    var Gs=(parseFloat(Ws)*rhows)/(parseFloat(W2)-parseFloat(W1));
    sgState.readings.push({Ws:parseFloat(Ws),W1:parseFloat(W1),W2:parseFloat(W2),Gs:Gs});
    calculateSGResults();
}
function runSGDemo(){
    if(!sgState.isRunning)return;
    var readings=[];var steps=5;
    for(var i=0;i<steps;i++){
        var Ws=100+Math.random()*50;
        var W1=200+Math.random()*10;
        var W2=W1+Ws-2+Math.random()*4;
        var Gs=(Ws*1)/(W2-W1);
        readings.push({Ws:Ws,W1:W1,W2:W2,Gs:Gs,step:i+1});
    }
    var idx=0;
    function stepSG(){
        if(!sgState.isRunning||idx>=readings.length){calculateSGResults();return;}
        var rd=readings[idx];idx++;
        sgState.readings.push(rd);
        document.getElementById('sg-val-Ws').textContent=rd.Ws.toFixed(1);
        document.getElementById('sg-val-W1').textContent=rd.W1.toFixed(1);
        document.getElementById('sg-val-W2').textContent=rd.W2.toFixed(1);
        document.getElementById('sg-val-Gs').textContent=rd.Gs.toFixed(3);
        document.getElementById('sg-val-status').textContent='Measuring...';
        setTimeout(stepSG,1800);
    }
    stepSG();
}
function calculateSGResults(){
    var r=sgState.readings;if(r.length===0)return;
    var avgGs=r.reduce(function(s,v){return s+v.Gs;},0)/r.length;
    sgState.Gs=avgGs;
    var soilType=document.getElementById('sg-soil-type').value;
    var pass=avgGs>=2.4&&avgGs<=3.0;
    var panel=document.getElementById('sg-results-panel');panel.style.display='block';
    var html=safeResultStatus(pass,'Result');
    html+=safeResultRow('Specific Gravity Gs',avgGs.toFixed(3));
    html+=safeResultRow('Soil Type',soilType);
    html+=safeResultRow('Typical Range','2.60 – 2.80');
    html+=safeResultRow('Readings Count',r.length);
    safeSetHTML('sg-results-body',html);
    saveTestSession('specific_gravity',{Gs:avgGs,soilType:soilType,readings:r});
}
function generateSGPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Specific Gravity Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Soil Type: '+document.getElementById('sg-soil-type').value,195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('sg-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Specific Gravity Gs: '+sgState.Gs.toFixed(3),195,y,{align:'right'});y+=5;
        doc.text('Readings: '+sgState.readings.length,195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Specific_Gravity_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
