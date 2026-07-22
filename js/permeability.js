// ================================================================
// PERMEABILITY TEST (Constant Head / Falling Head)
// ================================================================
var permState={isRunning:false,readings:[],K:0};
function onPermConnChange(){var v=document.getElementById('perm-conn').value;if(v==='demo'){document.getElementById('perm-demo-banner').style.display='flex';}else{document.getElementById('perm-demo-banner').style.display='none';}}
function startPermTest(){
    var conn=document.getElementById('perm-conn').value;if(!conn){alert('Select connection type');return;}
    permState={isRunning:true,readings:[],K:0};
    document.getElementById('perm-btn-start').style.display='none';
    document.getElementById('perm-btn-stop').style.display='flex';
    document.getElementById('perm-results-panel').style.display='none';
    if(conn==='demo')runPermDemo();else if(conn==='manual')runPermManual();
}
function stopPermTest(){
    permState.isRunning=false;
    document.getElementById('perm-btn-start').style.display='flex';
    document.getElementById('perm-btn-stop').style.display='none';
    calculatePermResults();
}
function runPermManual(){
    var q=prompt('Enter flow rate Q (cm³/s):');if(!q)return;
    var l=prompt('Enter sample length L (cm):');if(!l)return;
    var h=prompt('Enter head difference h (cm):');if(!h)return;
    var t=prompt('Enter time t (s):');if(!t)return;
    permState.readings.push({Q:parseFloat(q),L:parseFloat(l),h:parseFloat(h),t:parseFloat(t)});
    calculatePermResults();
}
function runPermDemo(){
    if(!permState.isRunning)return;
    var method=document.getElementById('perm-method').value;
    var readings=[];var steps=10;
    for(var i=0;i<steps;i++){
        var Q=0.05+Math.random()*0.15;
        var L=11.6;
        var A=78.5;
        var h=100+Math.random()*50;
        var t=10;
        var K=(Q*L)/(A*h*t);
        readings.push({Q:Q,L:L,A:A,h:h,t:t,K:K,step:i+1});
    }
    var idx=0;
    function stepPerm(){
        if(!permState.isRunning||idx>=readings.length){calculatePermResults();return;}
        var rd=readings[idx];idx++;
        permState.readings.push(rd);
        document.getElementById('perm-val-Q').textContent=rd.Q.toFixed(4);
        document.getElementById('perm-val-head').textContent=rd.h.toFixed(1);
        document.getElementById('perm-val-length').textContent=rd.L.toFixed(1);
        document.getElementById('perm-val-K').textContent=(rd.K*100).toFixed(4);
        document.getElementById('perm-val-status').textContent='Measuring...';
        setTimeout(stepPerm,1500);
    }
    stepPerm();
}
function calculatePermResults(){
    var r=permState.readings;if(r.length===0)return;
    var avgK=r.reduce(function(s,v){return s+v.K;},0)/r.length;
    permState.K=avgK;
    var method=document.getElementById('perm-method').value;
    var soilType=document.getElementById('perm-soil-type').value;
    var pass=avgK>0;
    var panel=document.getElementById('perm-results-panel');panel.style.display='block';
    var html='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅':'❌')+' Result</div>';
    html+='<div class="result-row"><span class="result-label">Hydraulic Conductivity K</span><span class="result-value">'+(avgK*100).toExponential(3)+' cm/s</span></div>';
    html+='<div class="result-row"><span class="result-label">Method</span><span class="result-value">'+method.charAt(0).toUpperCase()+method.slice(1)+' Head</span></div>';
    html+='<div class="result-row"><span class="result-label">Soil Type</span><span class="result-value">'+soilType+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Readings Count</span><span class="result-value">'+r.length+'</span></div>';
    document.getElementById('perm-results-body').innerHTML=html;
    saveTestSession('permeability',{K:avgK,method:method,soilType:soilType,readings:r});
}
function generatePermPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLAP - Permeability Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Method: '+document.getElementById('perm-method').value+' Head',195,y,{align:'right'});y+=5;
        doc.text('Soil Type: '+document.getElementById('perm-soil-type').value,195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('perm-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Hydraulic Conductivity K: '+(permState.K*100).toExponential(3)+' cm/s',195,y,{align:'right'});y+=5;
        doc.text('Readings: '+permState.readings.length,195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLAP v1.0.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Permeability_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
