// ================================================================
// ATTERBERG LIMITS TEST
// ================================================================
var atterbergState={isRunning:false,readings:[],ll:0,pl:0,pi:0};
function onAtterbergConnChange(){var v=document.getElementById('atterberg-conn').value;if(v==='demo'){document.getElementById('atterberg-demo-banner').style.display='flex';document.getElementById('atterberg-manual-inputs').style.display='none';}else{document.getElementById('atterberg-demo-banner').style.display='none';document.getElementById('atterberg-manual-inputs').style.display='flex';}}
function startAtterbergTest(){
    var conn=document.getElementById('atterberg-conn').value;if(!conn){alert('Select connection type');return;}
    atterbergState={isRunning:true,readings:[],ll:0,pl:0,pi:0};
    document.getElementById('atterberg-btn-start').style.display='none';
    document.getElementById('atterberg-btn-stop').style.display='flex';
    document.getElementById('atterberg-results-panel').style.display='none';
    document.getElementById('atterberg-log-body').innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">Collecting readings...</td></tr>';
    if(conn==='demo'){runAtterbergDemo();} else{document.getElementById('atterberg-manual-inputs').style.display='flex';}
}
function stopAtterbergTest(){
    atterbergState.isRunning=false;
    document.getElementById('atterberg-btn-start').style.display='flex';
    document.getElementById('atterberg-btn-stop').style.display='none';
    document.getElementById('atterberg-manual-inputs').style.display='none';
    calculateAtterbergResults();
}
function submitAtterbergReading(){
    if(!atterbergState.isRunning) return;
    var blows=parseInt(document.getElementById('atterberg-inp-blows').value,10);
    var moisture=parseFloat(document.getElementById('atterberg-inp-moisture').value);
    if(isNaN(blows)||blows<1){showToast('Enter valid number of blows','warning');return;}
    if(isNaN(moisture)||moisture<0||moisture>100){showToast('Enter valid moisture content (0-100%)','warning');return;}
    addAtterbergReading(blows,moisture,'manual');
    document.getElementById('atterberg-inp-blows').value='';
    document.getElementById('atterberg-inp-moisture').value='';
}
function runAtterbergDemo(){
    if(!atterbergState.isRunning)return;
    var calibData=[{blows:35,moisture:18.2},{blows:28,moisture:21.5},{blows:22,moisture:24.8},{blows:17,moisture:28.3},{blows:13,moisture:32.1}];
    var i=atterbergState.readings.length;
    if(i>=calibData.length){stopAtterbergTest();return;}
    var d=calibData[i];
    addAtterbergReading(d.blows,d.moisture,'demo');
    setTimeout(runAtterbergDemo,1500);
}
function addAtterbergReading(blows,moisture,mode){
    atterbergState.readings.push({blows:blows,moisture:moisture,mode:mode});
    document.getElementById('atterberg-blows').textContent=blows;
    document.getElementById('atterberg-cone-depth').textContent=(blows*0.2).toFixed(1);
    var tbody=document.getElementById('atterberg-log-body');
    if(atterbergState.readings.length===1)tbody.innerHTML='';
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+atterbergState.readings.length+'</td><td>'+blows+'</td><td>'+moisture.toFixed(1)+'</td><td>'+mode+'</td>';
    tbody.appendChild(tr);
    if(atterbergState.readings.length>=3){
        var hint=document.getElementById('atterberg-pl-hint');
        if(hint)hint.style.display='block';
    }
}
function calculateAtterbergResults(){
    var r=atterbergState.readings;if(r.length<2){alert('Need at least 2 readings');return;}
    var ll=0;var n=0;r.forEach(function(rd){if(rd.blows>=15&&rd.blows<=35){ll+=rd.moisture;n++;}});
    ll=n>0?ll/n:r[r.length-1].moisture;
    var pl=parseFloat(document.getElementById('atterberg-inp-pl').value);
    if(isNaN(pl)||pl<0||pl>100){
        pl=ll*0.45;
        showToast('Plastic Limit (PL) not entered. Using estimated PL='+pl.toFixed(1)+'%. Enter PL manually for accuracy.','info');
    }
    var pi=typeof calcPI==='function'?calcPI(ll,pl):ll-pl;
    var soilType=document.getElementById('atterberg-soil-type').value;
    var ui=typeof classifyPlasticity==='function'?classifyPlasticity(pi):(pi>17?'High Plasticity':pi>7?'Medium Plasticity':'Low Plasticity');
    atterbergState.ll=ll;atterbergState.pl=pl;atterbergState.pi=pi;
    safeSetText('atterberg-ll',ll.toFixed(1));
    safeSetText('atterberg-pl',pl.toFixed(1));
    var panel=document.getElementById('atterberg-results-panel');panel.style.display='block';
    var html=safeResultRow('Liquid Limit (LL)',ll.toFixed(1)+'%');
    html+=safeResultRow('Plastic Limit (PL)',pl.toFixed(1)+'%');
    html+=safeResultRow('Plasticity Index (PI)',pi.toFixed(1));
    html+=safeResultRow('Soil Classification',soilType);
    html+=safeResultRow('Plasticity',ui);
    safeSetHTML('atterberg-results-body',html);
    saveTestSession('atterberg',{ll:ll,pl:pl,pi:pi,soilType:soilType,readings:atterbergState.readings});
}
