// ================================================================
// ATTERBERG LIMITS TEST
// ================================================================
var atterbergState={isRunning:false,readings:[],ll:0,pl:0,pi:0};
function onAtterbergConnChange(){var v=document.getElementById('atterberg-conn').value;if(v==='demo'){document.getElementById('atterberg-demo-banner').style.display='flex';}else{document.getElementById('atterberg-demo-banner').style.display='none';}}
function startAtterbergTest(){
    var conn=document.getElementById('atterberg-conn').value;if(!conn){alert('Select connection type');return;}
    atterbergState={isRunning:true,readings:[],ll:0,pl:0,pi:0};
    document.getElementById('atterberg-btn-start').style.display='none';
    document.getElementById('atterberg-btn-stop').style.display='flex';
    document.getElementById('atterberg-results-panel').style.display='none';
    document.getElementById('atterberg-log-body').innerHTML='';
    if(conn==='demo'){runAtterbergDemo();}else if(conn==='manual'){runAtterbergManual();}
}
function stopAtterbergTest(){
    atterbergState.isRunning=false;
    document.getElementById('atterberg-btn-start').style.display='flex';
    document.getElementById('atterberg-btn-stop').style.display='none';
    calculateAtterbergResults();
}
function runAtterbergManual(){
    var blows=prompt('Enter number of blows for this reading:');if(!blows)return;
    var moisture=prompt('Enter moisture content (%):');if(!moisture)return;
    addAtterbergReading(parseInt(blows),parseFloat(moisture),'manual');
    if(atterbergState.isRunning)runAtterbergManual();
}
function runAtterbergDemo(){
    if(!atterbergState.isRunning)return;
    var blowSets=[35,28,22,17,13];
    var i=atterbergState.readings.length;
    if(i>=blowSets.length){stopAtterbergTest();return;}
    var blows=blowSets[i];
    var moisture=25+Math.random()*15;
    addAtterbergReading(blows,moisture,'demo');
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
}
function calculateAtterbergResults(){
    var r=atterbergState.readings;if(r.length<2){alert('Need at least 2 readings');return;}
    var ll=0;var n=0;r.forEach(function(rd){if(rd.blows>=15&&rd.blows<=35){ll+=rd.moisture;n++;}});
    ll=n>0?ll/n:r[0].moisture;
    var pl=ll*0.45+Math.random()*3;
    var pi=ll-pl;
    atterbergState.ll=ll;atterbergState.pl=pl;atterbergState.pi=pi;
    safeSetText('atterberg-ll',ll.toFixed(1));
    safeSetText('atterberg-pl',pl.toFixed(1));
    var soilType=document.getElementById('atterberg-soil-type').value;
    var ui=pi>17?'High Plasticity':pi>7?'Medium Plasticity':'Low Plasticity';
    var panel=document.getElementById('atterberg-results-panel');panel.style.display='block';
    var html=safeResultRow('Liquid Limit (LL)',ll.toFixed(1)+'%');
    html+=safeResultRow('Plastic Limit (PL)',pl.toFixed(1)+'%');
    html+=safeResultRow('Plasticity Index (PI)',pi.toFixed(1));
    html+=safeResultRow('Soil Classification',soilType);
    html+=safeResultRow('Plasticity',ui);
    safeSetHTML('atterberg-results-body',html);
    saveTestSession('atterberg',{ll:ll,pl:pl,pi:pi,soilType:soilType,readings:atterbergState.readings});
}
