// ================================================================
// STRAIGHTEDGE TEST
// ================================================================
var seReadings=[], seIsTesting=false, seConnType='';

function openSE(test){
    seReadings=[];seIsTesting=false;
    showScreen('straightedge');
    document.getElementById('se-page-title').textContent=test.name;
    document.getElementById('se-results-panel').style.display='none';
    document.getElementById('se-btn-start').style.display='flex';
    document.getElementById('se-btn-stop').style.display='none';
    document.getElementById('se-live-indicator').style.display='none';
    document.getElementById('se-log-body').innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Start test</td></tr>';
    document.getElementById('se-val-dist').textContent='--';
    document.getElementById('se-val-irreg').textContent='--';
    document.getElementById('se-val-maxdev').textContent='--';
    document.getElementById('se-val-status').textContent='--';
    document.getElementById('se-demo-banner').style.display='none';
    drawSEChart();
}

function onSEConnTypeChange(){
    var sel=document.getElementById('se-com-port-select').value;
    seConnType=sel;
}

function startSETest(){
    var conn=document.getElementById('se-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    seReadings=[];seIsTesting=true;
    document.getElementById('se-btn-start').style.display='none';
    document.getElementById('se-btn-stop').style.display='flex';
    document.getElementById('se-live-indicator').style.display='flex';
    document.getElementById('se-results-panel').style.display='none';
    document.getElementById('se-log-body').innerHTML='';
    drawSEChart();
    if(conn==='demo'){
        document.getElementById('se-demo-banner').style.display='flex';
        document.getElementById('se-serial-dot').className='status-dot scanning';
        document.getElementById('se-serial-text').textContent='Demo';
        runSEDemo();
    } else {
        document.getElementById('se-demo-banner').style.display='none';
        if(!serialPort){connectSerial().then(function(ok){if(ok){sendSerialCommand('START');startSerialStream();}else stopSETest();});}
        else{sendSerialCommand('START');startSerialStream();}
    }
}

function stopSETest(){
    seIsTesting=false;
    document.getElementById('se-btn-start').style.display='flex';
    document.getElementById('se-btn-stop').style.display='none';
    document.getElementById('se-live-indicator').style.display='none';
    if(seConnType!=='demo'){sendSerialCommand('STOP');stopSerial();}
    if(seReadings.length>0)calculateSEResults();
}

function runSEDemo(){
    var interval=parseFloat(document.getElementById('se_inp_interval').value)||0.3;
    var totalLen=parseFloat(document.getElementById('se_inp_length').value)||3;
    var pos=0;
    var iv=setInterval(function(){
        if(!seIsTesting||pos>totalLen){clearInterval(iv);if(seIsTesting)stopSETest();return;}
        pos=Math.round((pos+interval)*100)/100;
        var irreg=Math.round((Math.random()*15-3)*100)/100;
        var incl=Math.round((Math.random()*2-1)*100)/100;
        processSEReading(pos,irreg,incl);
    },500);
}

function processSEReading(position,irregularity,inclination){
    if(!seIsTesting)return;
    var reading={index:seReadings.length+1,position:position,irregularity:irregularity,inclination:inclination,time:new Date().toLocaleTimeString()};
    seReadings.push(reading);
    document.getElementById('se-val-dist').textContent=position;
    document.getElementById('se-val-irreg').textContent=irregularity;
    var maxDev=0;for(var i=0;i<seReadings.length;i++)if(Math.abs(seReadings[i].irregularity)>Math.abs(maxDev))maxDev=seReadings[i].irregularity;
    document.getElementById('se-val-maxdev').textContent=maxDev;
    var tol=parseFloat(document.getElementById('se_inp_tolerance').value)||12;
    var status=Math.abs(maxDev)<=tol?'✅ PASS':'❌ FAIL';
    document.getElementById('se-val-status').textContent=status;
    var tbody=document.getElementById('se-log-body');
    if(seReadings.length===1)tbody.innerHTML='';
    var tr=document.createElement('tr');
    tr.innerHTML='<td style="font-weight:700;">'+reading.index+'</td><td>'+reading.position+'</td><td>'+reading.irregularity+'</td><td>'+reading.inclination+'</td><td style="color:var(--text-muted);font-size:10px;">'+reading.time+'</td>';
    tbody.appendChild(tr);
    var lc=tbody.closest('.strike-log');if(lc)lc.scrollTop=lc.scrollHeight;
    drawSEChart();
}

function drawSEChart(){
    var canvas=document.getElementById('se-chart');if(!canvas)return;
    var ctx=canvas.getContext('2d');var W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,W,H);
    var pad={l:50,r:20,t:20,b:30};var gw=W-pad.l-pad.r,gh=H-pad.t-pad.b;
    ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
    if(seReadings.length<2)return;
    var maxPos=seReadings[seReadings.length-1].position*1.1||3;
    var maxIrr=0;for(var i=0;i<seReadings.length;i++)if(Math.abs(seReadings[i].irregularity)>maxIrr)maxIrr=Math.abs(seReadings[i].irregularity);
    maxIrr=maxIrr*1.2||15;
    var tol=parseFloat(document.getElementById('se_inp_tolerance').value)||12;
    var tolY1=H-pad.b/2-(tol/maxIrr)*(gh/2);var tolY2=H-pad.b/2+(tol/maxIrr)*(gh/2);
    ctx.fillStyle='rgba(16,185,129,0.08)';ctx.fillRect(pad.l,tolY1,gw,tolY2-tolY1);
    ctx.strokeStyle='rgba(239,68,68,0.3)';ctx.setLineDash([4,4]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(pad.l,tolY1);ctx.lineTo(W-pad.r,tolY1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(pad.l,tolY2);ctx.lineTo(W-pad.r,tolY2);ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;
    for(var j=0;j<seReadings.length;j++){
        var rx=pad.l+(seReadings[j].position/maxPos)*gw;
        var ry=H-pad.b/2-(seReadings[j].irregularity/maxIrr)*(gh/2);
        if(j===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);
    }
    ctx.stroke();
}

function calculateSEResults(){
    if(seReadings.length===0)return;
    var maxDev=0,sumAbs=0;
    for(var i=0;i<seReadings.length;i++){var v=Math.abs(seReadings[i].irregularity);sumAbs+=v;if(v>maxDev)maxDev=v;}
    var avgDev=Math.round(sumAbs/seReadings.length*100)/100;
    var tol=parseFloat(document.getElementById('se_inp_tolerance').value)||12;
    var passed=maxDev<=tol;
    var results={readings_count:seReadings.length,max_deviation:maxDev,average_deviation:avgDev,tolerance:tol,status:passed?'PASS':'FAIL'};
    document.getElementById('se-results-panel').style.display='block';
    var body=document.getElementById('se-results-body');
    var html='<div class="result-status '+(passed?'pass':'fail')+'">'+(passed?'✅':'❌')+' '+results.status+'</div>';
    var labels={readings_count:'Total Readings',max_deviation:'Max Deviation (mm)',average_deviation:'Avg Deviation (mm)',tolerance:'Tolerance (mm)',status:'Status'};
    Object.keys(results).forEach(function(k){html+='<div class="result-row"><span class="result-label">'+(labels[k]||k)+'</span><span class="result-value">'+results[k]+'</span></div>';});
    body.innerHTML=html;
    db.collection('sessions').add({testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:results,userId:currentUser?currentUser.uid:'guest',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
}
