// ================================================================
// SPLIT TENSILE STRENGTH TEST
// ================================================================
var splitState={isRunning:false,readings:[],peakForce:0,tensileStrength:0};
function onSplitConnChange(){var v=document.getElementById('split-conn').value;if(v==='demo'){document.getElementById('split-demo-banner').style.display='flex';}else{document.getElementById('split-demo-banner').style.display='none';}}
function startSplitTest(){
    var conn=document.getElementById('split-conn').value;if(!conn){alert('Select connection type');return;}
    splitState={isRunning:true,readings:[],peakForce:0,tensileStrength:0};
    document.getElementById('split-btn-start').style.display='none';
    document.getElementById('split-btn-stop').style.display='flex';
    document.getElementById('split-results-panel').style.display='none';
    if(conn==='demo')runSplitDemo();else if(conn==='manual')runSplitManual();
}
function stopSplitTest(){
    splitState.isRunning=false;
    document.getElementById('split-btn-start').style.display='flex';
    document.getElementById('split-btn-stop').style.display='none';
    calculateSplitResults();
}
function runSplitManual(){
    var f=prompt('Enter peak load P (kN):');if(!f)return;
    splitState.peakForce=parseFloat(f);
    calculateSplitResults();
}
function runSplitDemo(){
    if(!splitState.isRunning)return;
    var D=parseFloat(document.getElementById('split-diameter').value)||150;
    var L=parseFloat(document.getElementById('split-length').value)||300;
    var targetT=2.5+Math.random()*1.5;
    var peakP=targetT*Math.PI*D*L/2/1000;
    var readings=[];var steps=40;
    for(var i=0;i<=steps;i++){
        var t=i/steps;
        var P=peakP*Math.pow(t,0.5)*(1-0.3*Math.pow(t,3));
        var T=(2*P*1000)/(Math.PI*L*D);
        readings.push({force:P,tensile:T,disp:t*2,step:i});
    }
    var idx=0;
    function stepSplit(){
        if(!splitState.isRunning||idx>=readings.length){calculateSplitResults();return;}
        var rd=readings[idx];idx++;
        splitState.readings.push(rd);
        if(rd.force>splitState.peakForce)splitState.peakForce=rd.force;
        var T=(2*rd.force*1000)/(Math.PI*L*D);
        document.getElementById('split-val-force').textContent=rd.force.toFixed(1);
        document.getElementById('split-val-tensile').textContent=T.toFixed(2);
        document.getElementById('split-val-disp').textContent=rd.disp.toFixed(2);
        document.getElementById('split-val-peak').textContent=splitState.peakForce.toFixed(1);
        setTimeout(stepSplit,120);
    }
    stepSplit();
}
function calculateSplitResults(){
    var D=parseFloat(document.getElementById('split-diameter').value)||150;
    var L=parseFloat(document.getElementById('split-length').value)||300;
    var T=(2*splitState.peakForce*1000)/(Math.PI*L*D);
    splitState.tensileStrength=T;
    var grade=document.getElementById('split-grade').value;
    var pass=T>=2.0;
    var panel=document.getElementById('split-results-panel');panel.style.display='block';
    var html=safeResultStatus(pass,T.toFixed(2)+' MPa');
    html+=safeResultRow('Peak Load P',splitState.peakForce.toFixed(1)+' kN');
    html+=safeResultRow('Split Tensile Strength T',T.toFixed(2)+' MPa');
    html+=safeResultRow('Diameter D',D+' mm');
    html+=safeResultRow('Length L',L+' mm');
    html+=safeResultRow('Concrete Grade',grade);
    safeSetHTML('split-results-body',html);
    saveTestSession('split_tensile',{tensileStrength:T,peakForce:splitState.peakForce,diameter:D,length:L,grade:grade});
}
function generateSplitPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLAP - Split Tensile Strength Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('split-standard').value,195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('split-grade').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Peak Load: '+splitState.peakForce.toFixed(1)+' kN',195,y,{align:'right'});y+=5;
        doc.text('Split Tensile Strength: '+splitState.tensileStrength.toFixed(2)+' MPa',195,y,{align:'right'});y+=5;
        doc.text('Status: '+(splitState.tensileStrength>=2.0?'PASS':'FAIL'),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLAP v1.0.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Split_Tensile_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
