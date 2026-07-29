// ================================================================
// CONCRETE MATURITY TEST
// ================================================================
var matReadings=[],matIsTesting=false,matStartTime=0;

function openMat(test){
    matReadings=[];matIsTesting=false;
    showScreen('maturity');
    document.getElementById('mat-page-title').textContent=test.name;
    document.getElementById('mat-results-panel').style.display='none';
    document.getElementById('mat-btn-start').style.display='flex';
    document.getElementById('mat-btn-stop').style.display='none';
    document.getElementById('mat-demo-banner').style.display='none';
    document.getElementById('mat-val-temp').textContent='--';
    document.getElementById('mat-val-maturity').textContent='--';
    document.getElementById('mat-val-strength').textContent='--';
    document.getElementById('mat-val-time').textContent='--';
    document.getElementById('mat-log-body').innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Start test</td></tr>';
    drawMatChart();
}
function onMatConnTypeChange(){var sel=document.getElementById('mat-com-port-select').value;}
function startMatTest(){
    var conn=document.getElementById('mat-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    matReadings=[];matIsTesting=true;matStartTime=Date.now();
    document.getElementById('mat-btn-start').style.display='none';
    document.getElementById('mat-btn-stop').style.display='flex';
    document.getElementById('mat-results-panel').style.display='none';
    document.getElementById('mat-log-body').innerHTML='';
    drawMatChart();
    if(conn==='demo'){
        document.getElementById('mat-demo-banner').style.display='flex';
        document.getElementById('mat-serial-dot').className='status-dot scanning';
        document.getElementById('mat-serial-text').textContent='Demo';
        var interval=(parseInt(document.getElementById('mat_inp_interval').value)||15)*60000/60;
        var hours=0;var temp=22;var totalMaturity=0;
        var iv=setInterval(function(){
            if(!matIsTesting||hours>=168){clearInterval(iv);if(matIsTesting)stopMatTest();return;}
            hours=Math.round((hours+0.25)*100)/100;
            temp=Math.round((25+15*(1-Math.exp(-hours/24))+Math.random()*2)*10)/10;
            var dt=0.25;
            totalMaturity=Math.round((totalMaturity+temp*dt)*100)/100;
            var strength=Math.round(30*(1-Math.exp(-0.02*totalMaturity))*100)/100;
            var target=parseFloat(document.getElementById('mat_inp_target').value)||30;
            var pct=Math.round(strength/target*100);
            processMatReading(hours,temp,totalMaturity,strength,pct);
        },300);
    }
}
function stopMatTest(){matIsTesting=false;document.getElementById('mat-btn-start').style.display='flex';document.getElementById('mat-btn-stop').style.display='none';if(matReadings.length>0)showMatResults();}
function processMatReading(hours,temp,maturity,strength,pct){
    if(!matIsTesting)return;
    var reading={index:matReadings.length+1,hours:hours,temp:temp,maturity:maturity,strength:strength,pct:pct,time:new Date().toLocaleTimeString()};
    matReadings.push(reading);
    document.getElementById('mat-val-temp').textContent=temp+'°C';
    document.getElementById('mat-val-maturity').textContent=maturity;
    document.getElementById('mat-val-strength').textContent=strength;
    document.getElementById('mat-val-time').textContent=hours;
    var tbody=document.getElementById('mat-log-body');
    if(matReadings.length===1)tbody.innerHTML='';
    var tr=document.createElement('tr');
    tr.innerHTML='<td style="font-weight:700;">'+reading.index+'</td><td>'+reading.hours+'</td><td>'+reading.temp+'</td><td>'+reading.maturity+'</td><td>'+reading.strength+'</td>';
    tbody.appendChild(tr);
    var lc=tbody.closest('.strike-log');if(lc)lc.scrollTop=lc.scrollHeight;
    drawMatChart();
}
function drawMatChart(){
    var canvas=document.getElementById('mat-chart');if(!canvas)return;
    var ctx=canvas.getContext('2d');var W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim()||'#f8fafc';ctx.fillRect(0,0,W,H);
    var pad={l:50,r:20,t:20,b:30};var gw=W-pad.l-pad.r,gh=H-pad.t-pad.b;
    ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
    if(matReadings.length<2)return;
    var maxH=matReadings[matReadings.length-1].hours*1.1||168;
    var target=parseFloat(document.getElementById('mat_inp_target').value)||30;var maxS=target*1.2;
    var ty=H-pad.b-(target/maxS)*gh;ctx.beginPath();ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(239,68,68,0.5)';ctx.moveTo(pad.l,ty);ctx.lineTo(W-pad.r,ty);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ef4444';ctx.font='9px Cairo';ctx.fillText('Target: '+target+' MPa',W-pad.r-90,ty-4);
    ctx.beginPath();ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;
    for(var j=0;j<matReadings.length;j++){var rx=pad.l+(matReadings[j].hours/maxH)*gw;var ry=H-pad.b-(matReadings[j].strength/maxS)*gh;if(j===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);}
    ctx.stroke();
}
function showMatResults(){
    var last=matReadings[matReadings.length-1];var target=parseFloat(document.getElementById('mat_inp_target').value)||30;
    var reached=last.strength>=target;
    var results={final_strength:last.strength,max_maturity:last.maturity,total_hours:last.hours,target_strength:target,status:reached?'PASS':'CURING'};
    document.getElementById('mat-results-panel').style.display='block';
    var matHtml=safeResultStatus(reached,reached?'✅ Target Reached':'⏳ Still Curing')+
        safeResultRow('Final Strength',last.strength+' MPa')+
        safeResultRow('Maturity Index',last.maturity+' °C·h')+
        safeResultRow('Elapsed Time',last.hours+' hours')+
        safeResultRow('Target Strength',target+' MPa');
    safeSetHTML('mat-results-body',matHtml);
    rateLimitedFirestoreWrite('sessions',{testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:results,userId:currentUser?currentUser.uid:'guest'}).catch(function(err){console.error('showMatResults save error:',err);});
}
