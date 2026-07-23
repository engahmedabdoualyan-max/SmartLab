// ================================================================
// FLEXURAL STRENGTH TEST (Modulus of Rupture)
// ================================================================
var flexState={isRunning:false,readings:[],peakForce:0,modulus:0};
function onFlexConnChange(){var v=document.getElementById('flex-conn').value;if(v==='demo'){document.getElementById('flex-demo-banner').style.display='flex';}else{document.getElementById('flex-demo-banner').style.display='none';}}
function startFlexTest(){
    var conn=document.getElementById('flex-conn').value;if(!conn){alert('Select connection type');return;}
    flexState={isRunning:true,readings:[],peakForce:0,modulus:0};
    document.getElementById('flex-btn-start').style.display='none';
    document.getElementById('flex-btn-stop').style.display='flex';
    document.getElementById('flex-results-panel').style.display='none';
    if(conn==='demo')runFlexDemo();else if(conn==='manual')runFlexManual();
}
function stopFlexTest(){
    flexState.isRunning=false;
    document.getElementById('flex-btn-start').style.display='flex';
    document.getElementById('flex-btn-stop').style.display='none';
    calculateFlexResults();
}
function runFlexManual(){
    var f=prompt('Enter peak load P (N):');if(!f)return;
    flexState.peakForce=parseFloat(f);
    calculateFlexResults();
}
function runFlexDemo(){
    if(!flexState.isRunning)return;
    var targetStrength=3.5+Math.random()*2;
    var b=parseFloat(document.getElementById('flex-width').value)||150;
    var d=parseFloat(document.getElementById('flex-depth').value)||150;
    var L=parseFloat(document.getElementById('flex-span').value)||450;
    var peakP=targetStrength*b*d*d/(L);
    var readings=[];var steps=40;
    for(var i=0;i<=steps;i++){
        var t=i/steps;
        var P=peakP*Math.pow(t,0.6)*(1-0.35*Math.pow(t,4));
        var R=(P*L)/(b*d*d);
        readings.push({force:P,modulus:R,disp:t*3,step:i});
    }
    var idx=0;
    function stepFlex(){
        if(!flexState.isRunning||idx>=readings.length){calculateFlexResults();return;}
        var rd=readings[idx];idx++;
        flexState.readings.push(rd);
        if(rd.force>flexState.peakForce)flexState.peakForce=rd.force;
        var stress=(rd.force*L)/(b*d*d);
        document.getElementById('flex-val-force').textContent=rd.force.toFixed(0);
        document.getElementById('flex-val-stress').textContent=stress.toFixed(2);
        document.getElementById('flex-val-disp').textContent=rd.disp.toFixed(2);
        document.getElementById('flex-val-peak').textContent=flexState.peakForce.toFixed(0);
        setTimeout(stepFlex,120);
    }
    stepFlex();
}
function calculateFlexResults(){
    var b=parseFloat(document.getElementById('flex-width').value)||150;
    var d=parseFloat(document.getElementById('flex-depth').value)||150;
    var L=parseFloat(document.getElementById('flex-span').value)||450;
    var loading=document.getElementById('flex-loading').value;
    var modulus;
    if(loading==='center'){
        modulus=(flexState.peakForce*L)/(b*d*d);
    }else{
        modulus=(flexState.peakForce*L)/(b*d*d);
    }
    flexState.modulus=modulus;
    var grade=document.getElementById('flex-grade').value;
    var pass=modulus>=3.5;
    var panel=document.getElementById('flex-results-panel');panel.style.display='block';
    var html=safeResultStatus(pass,modulus.toFixed(2)+' MPa');
    html+=safeResultRow('Peak Load P',flexState.peakForce.toFixed(1)+' N');
    html+=safeResultRow('Modulus of Rupture R',modulus.toFixed(2)+' MPa');
    html+=safeResultRow('Beam Width b',b+' mm');
    html+=safeResultRow('Beam Depth d',d+' mm');
    html+=safeResultRow('Span L',L+' mm');
    html+=safeResultRow('Loading Type',loading.charAt(0).toUpperCase()+loading.slice(1)+'-point');
    html+=safeResultRow('Concrete Grade',grade);
    safeSetHTML('flex-results-body',html);
    saveTestSession('flexural',{modulus:modulus,peakForce:flexState.peakForce,width:b,depth:d,span:L,loading:loading,grade:grade});
}
function generateFlexPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Flexural Strength Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('flex-standard').value,195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('flex-grade').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Peak Load: '+flexState.peakForce.toFixed(1)+' N',195,y,{align:'right'});y+=5;
        doc.text('Modulus of Rupture: '+flexState.modulus.toFixed(2)+' MPa',195,y,{align:'right'});y+=5;
        doc.text('Status: '+(flexState.modulus>=3.5?'PASS':'FAIL'),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Flexural_Strength_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
