// ================================================================
// CBR TEST
// ================================================================
var cbrReadings=[], cbrIsTesting=false, cbrConnType='';

function openCBR(test){
    cbrReadings=[];cbrIsTesting=false;currentSessionId=null;
    showScreen('cbr');
    document.getElementById('cbr-page-title').textContent=test.name;
    document.getElementById('cbr-results-panel').style.display='none';
    document.getElementById('cbr-btn-pdf').style.display='none';
    document.getElementById('cbr-btn-start').style.display='flex';
    document.getElementById('cbr-btn-stop').style.display='none';
    document.getElementById('cbr-live-indicator').style.display='none';
    document.getElementById('cbr-log-body').innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Start test</td></tr>';
    document.getElementById('cbr-val-pen').textContent='--';
    document.getElementById('cbr-val-load').textContent='--';
    document.getElementById('cbr-val-pressure').textContent='--';
    document.getElementById('cbr-val-ratio').textContent='--';
    document.getElementById('cbr-serial-console').style.display='none';
    document.getElementById('cbr-demo-banner').style.display='none';
    drawCBRChart();
    loadCBRHistory();
}

function onCBRConnTypeChange(){
    var sel=document.getElementById('cbr-com-port-select').value;
    cbrConnType=sel;
    document.getElementById('cbr-lan-config').style.display=sel==='lan'?'block':'none';
    document.getElementById('cbr-bt-config').style.display=sel==='bluetooth'?'block':'none';
    document.getElementById('cbr-manual-config').style.display=sel==='manual'?'block':'none';
    document.getElementById('cbr-conn-status-area').style.display=(sel==='lan'||sel==='bluetooth')?'none':'block';
    document.getElementById('cbr-btn-manual').style.display='none';
    if(sel==='manual'){document.getElementById('cbr-conn-status-area').style.display='none';}
}

function cbrLog(text,type){
    var con=document.getElementById('cbr-serial-console');
    if(con.style.display==='none')con.style.display='block';
    var now=new Date().toLocaleTimeString('en-US');
    var cls=type==='rx'?'rx':(type==='tx'?'tx':'');
    con.innerHTML+='<div class="serial-line"><span class="ts">['+now+']</span> <span class="'+cls+'">'+text+'</span></div>';
    con.scrollTop=con.scrollHeight;
}

async function startCBRTest(){
    var conn=document.getElementById('cbr-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    cbrReadings=[];cbrIsTesting=true;
    document.getElementById('cbr-btn-start').style.display='none';
    document.getElementById('cbr-btn-stop').style.display='flex';
    document.getElementById('cbr-live-indicator').style.display='flex';
    document.getElementById('cbr-results-panel').style.display='none';
    document.getElementById('cbr-btn-pdf').style.display='none';
    document.getElementById('cbr-log-body').innerHTML='';
    logTestStarted('cbr',currentTest?currentTest.id:'');
    drawCBRChart();
    if(conn==='demo'){
        document.getElementById('cbr-demo-banner').style.display='flex';
        document.getElementById('cbr-serial-dot').className='status-dot scanning';
        document.getElementById('cbr-serial-text').textContent='Demo';
        runCBRDemo();
    } else if(conn==='manual'){
        document.getElementById('cbr-btn-manual').style.display='flex';
    } else {
        document.getElementById('cbr-demo-banner').style.display='none';
        if(conn==='browser-serial'){
            if(!serialPort){var ok=await connectSerial();if(!ok){stopCBRTest();return;}}
            await sendSerialCommand('START');
            startSerialStream();
        }
    }
}

function stopCBRTest(){
    cbrIsTesting=false;
    document.getElementById('cbr-btn-start').style.display='flex';
    document.getElementById('cbr-btn-stop').style.display='none';
    document.getElementById('cbr-live-indicator').style.display='none';
    document.getElementById('cbr-btn-manual').style.display='none';
    logTestStopped('cbr',currentTest?currentTest.id:'',{readingCount:cbrReadings.length});
    if(!isDemoMode&&cbrConnType!=='manual'){sendSerialCommand('STOP');stopSerial();}
    if(cbrReadings.length>0)calculateCBRResults();
}

function submitManualCBRReading(){
    if(!cbrIsTesting)return;
    var pen=parseFloat(document.getElementById('cbr-manual-pen').value);
    var load=parseFloat(document.getElementById('cbr-manual-load').value);
    if(isNaN(pen)||isNaN(load)){alert('Enter penetration and load');return;}
    processCBRReading(pen,load);
    document.getElementById('cbr-manual-pen').value='';
    document.getElementById('cbr-manual-load').value='';
    document.getElementById('cbr-manual-pen').focus();
}

var CBR_CALIB_DATA=[{pen:0.5,load:824},{pen:1.0,load:1890},{pen:1.5,load:3120},{pen:2.0,load:4600},{pen:2.5,load:6200},{pen:3.0,load:7210},{pen:3.5,load:7900},{pen:4.0,load:8400},{pen:4.5,load:8770},{pen:5.0,load:9100},{pen:5.5,load:9380},{pen:6.0,load:9580},{pen:6.5,load:9720},{pen:7.0,load:9820},{pen:7.5,load:9900},{pen:8.0,load:9960},{pen:8.5,load:10010},{pen:9.0,load:10050},{pen:9.5,load:10080},{pen:10.0,load:10100}];
function runCBRDemo(){
    var i=0;var maxPen=parseFloat(document.getElementById('cbr_inp_max_pen').value)||12.5;
    var iv=setInterval(function(){
        if(!cbrIsTesting||i>=CBR_CALIB_DATA.length||CBR_CALIB_DATA[i].pen>maxPen){clearInterval(iv);if(cbrIsTesting)stopCBRTest();return;}
        var d=CBR_CALIB_DATA[i];
        processCBRReading(d.pen,d.load);
        i++;
    },400);
}

function processCBRReading(penetration,load){
    if(!cbrIsTesting)return;
    var pistonArea=parseFloat(document.getElementById('cbr_inp_piston_area').value)||1963.5;
    var std25=parseFloat(document.getElementById('cbr_inp_std_25').value)||13240;
    var std50=parseFloat(document.getElementById('cbr_inp_std_50').value)||19960;
    var cbrVal=typeof calcCBR==='function'?calcCBR(penetration,load,std25,std50):(penetration>=4.5&&penetration<=5.5?load/std50:load/std25)*100;
    var pressure=typeof calcCBRPressure==='function'?calcCBRPressure(load,pistonArea):Math.round(load/pistonArea*1000*100)/100;
    var cbr=cbrVal;
    var cbr25=(load/std25)*100,cbr50=(load/std50)*100;
    var reading={index:cbrReadings.length+1,penetration:penetration,load:load,pressure:pressure,cbr:cbr,time:new Date().toLocaleTimeString()};
    cbrReadings.push(reading);
    document.getElementById('cbr-val-pen').textContent=penetration;
    document.getElementById('cbr-val-load').textContent=load;
    document.getElementById('cbr-val-pressure').textContent=pressure;
    document.getElementById('cbr-val-ratio').textContent=cbr+'%';
    var tbody=document.getElementById('cbr-log-body');
    if(cbrReadings.length===1&&tbody)tbody.textContent='';
    var tr=document.createElement('tr');
    var td1=document.createElement('td');td1.style.fontWeight='700';td1.textContent=reading.index;
    var td2=document.createElement('td');td2.textContent=reading.penetration;
    var td3=document.createElement('td');td3.textContent=reading.load;
    var td4=document.createElement('td');td4.textContent=reading.pressure;
    var td5=document.createElement('td');td5.style.color='var(--text-muted)';td5.style.fontSize='10px';td5.textContent=reading.time;
    tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tr.appendChild(td4);tr.appendChild(td5);
    tbody.appendChild(tr);
    var lc=tbody.closest('.strike-log');
    if(lc)lc.scrollTop=lc.scrollHeight;
    drawCBRChart();
}

function drawCBRChart(){
    var canvas=document.getElementById('cbr-chart');
    if(!canvas)return;
    var ctx=canvas.getContext('2d');
    var W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
    var pad={l:50,r:20,t:20,b:35};
    var gw=W-pad.l-pad.r,gh=H-pad.t-pad.b;
    ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
    if(cbrReadings.length<2)return;
    var maxPen=0,maxLoad=0;
    for(var i=0;i<cbrReadings.length;i++){if(cbrReadings[i].penetration>maxPen)maxPen=cbrReadings[i].penetration;if(cbrReadings[i].load>maxLoad)maxLoad=cbrReadings[i].load;}
    maxPen=maxPen*1.1||12.5;maxLoad=maxLoad*1.1||15000;
    ctx.fillStyle='#94a3b8';ctx.font='10px Cairo';
    for(var p=0;p<=maxPen;p+=2.5){var x=pad.l+(p/maxPen)*gw;ctx.fillText(p+'mm',x-10,H-pad.b+14);ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.strokeStyle='#f1f5f9';ctx.stroke();}
    for(var l=0;l<=maxLoad;l+=2000){var y=H-pad.b-(l/maxLoad)*gh;ctx.fillText(l>1000?(l/1000)+'kN':l,pad.l-42,y+4);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.strokeStyle='#f1f5f9';ctx.stroke();}
    ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=2.5;
    for(var j=0;j<cbrReadings.length;j++){
        var rx=pad.l+(cbrReadings[j].penetration/maxPen)*gw;
        var ry=H-pad.b-(cbrReadings[j].load/maxLoad)*gh;
        if(j===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);
    }
    ctx.stroke();
    for(var k=0;k<cbrReadings.length;k++){
        var dx=pad.l+(cbrReadings[k].penetration/maxPen)*gw;
        var dy=H-pad.b-(cbrReadings[k].load/maxLoad)*gh;
        ctx.beginPath();ctx.arc(dx,dy,3,0,Math.PI*2);ctx.fillStyle='#3b82f6';ctx.fill();
    }
    var std25=parseFloat(document.getElementById('cbr_inp_std_25').value)||13240;
    var y25=H-pad.b-(std25/maxLoad)*gh;
    if(y25>pad.t){
        ctx.beginPath();ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(239,68,68,0.5)';ctx.lineWidth=1;
        ctx.moveTo(pad.l,y25);ctx.lineTo(W-pad.r,y25);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#ef4444';ctx.font='9px Cairo';ctx.fillText('Std 2.5mm',W-pad.r-60,y25-4);
    }
}

function calculateCBRResults(){
    if(cbrReadings.length===0)return;
    var std25=parseFloat(document.getElementById('cbr_inp_std_25').value)||13240;
    var std50=parseFloat(document.getElementById('cbr_inp_std_50').value)||19960;
    var maxPen=cbrReadings[cbrReadings.length-1].penetration;
    var cbrAt25=0,cbrAt50=0,maxLoad=0;
    for(var i=0;i<cbrReadings.length;i++){
        if(cbrReadings[i].load>maxLoad)maxLoad=cbrReadings[i].load;
        if(Math.abs(cbrReadings[i].penetration-2.5)<0.6)cbrAt25=cbrReadings[i].cbr;
        if(Math.abs(cbrReadings[i].penetration-5)<0.6)cbrAt50=cbrReadings[i].cbr;
    }
    var finalCBR=typeof calcCBRFinalResult==='function'?calcCBRFinalResult(cbrAt25,cbrAt50).cbr:(cbrAt50>cbrAt25?cbrAt50:cbrAt25);
    var passed=finalCBR>=3;
    var results={
        cbr_value:finalCBR,
        cbr_at_25:cbrAt25,
        cbr_at_50:cbrAt50,
        max_load:maxLoad,
        max_penetration:maxPen,
        readings_count:cbrReadings.length,
        status:passed?'PASS':'FAIL'
    };
    rateLimitedFirestoreWrite('sessions',{
        testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',
        domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,
        readings:cbrReadings,results:results,
        userId:currentUser?currentUser.uid:'guest'
    }).then(function(docRef){currentSessionId=docRef.id;displayCBRResults(results);loadCBRHistory();}).catch(function(err){showToast('Failed to save CBR results: '+err.message,'error');});
}

function displayCBRResults(results){
    var panel=document.getElementById('cbr-results-panel');
    var body=document.getElementById('cbr-results-body');
    panel.style.display='block';
    var html='';
    var p=results.status==='PASS';
    html+=safeResultStatus(p,results.status+' — CBR: '+results.cbr_value+'%');
    var labels={cbr_value:'CBR Value %',cbr_at_25:'CBR @ 2.5mm %',cbr_at_50:'CBR @ 5.0mm %',max_load:'Maximum Load (N)',max_penetration:'Max Penetration (mm)',readings_count:'Total Readings',status:'Status'};
    Object.keys(results).forEach(function(k){
        html+=safeResultRow(labels[k]||k,results[k]);
    });
    safeSetHTML(body,html);
    document.getElementById('cbr-btn-pdf').style.display='flex';
}

async function loadCBRHistory(){
    if(!currentTest)return;
    try{var snap=await db.collection('sessions').where('testId','==',currentTest.id).get();
    var tbody=document.getElementById('cbr-history-body');
    if(snap.empty)return;if(tbody)tbody.textContent='';
    var rows=[];snap.forEach(function(doc){rows.push(doc.data());});rows.sort(function(a,b){return (b.createdAt&&b.createdAt.seconds||0)-(a.createdAt&&a.createdAt.seconds||0);});
    rows.slice(0,10).forEach(function(s){var st=(s.results&&s.results.status)||'?';var cbr=(s.results&&s.results.cbr_value)||'--';var date=s.createdAt?new Date(s.createdAt.seconds*1000).toLocaleDateString():'--';
    var tr=document.createElement('tr');
    var td1=document.createElement('td');td1.textContent=date;
    var td2=document.createElement('td');td2.textContent=st;if(st==='PASS')td2.className='result-pass';else if(st==='FAIL')td2.className='result-fail';
    var td3=document.createElement('td');td3.textContent=cbr+'%';
    tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tbody.appendChild(tr);});}catch(e){console.error('loadCBRHistory error:',e);showToast('Failed to load CBR history: '+e.message,'error');}
}
