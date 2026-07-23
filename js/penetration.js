// ================================================================
// PENETRATION TEST (Bitumen)
// ================================================================
var penIsTesting=false;

function openPen(test){
    penIsTesting=false;
    showScreen('penetration');
    document.getElementById('pen-page-title').textContent=test.name;
    document.getElementById('pen-results-panel').style.display='none';
    document.getElementById('pen-btn-start').style.display='flex';
    document.getElementById('pen-btn-stop').style.display='none';
    document.getElementById('pen-demo-banner').style.display='none';
    document.getElementById('pen-val-pen').textContent='--';
    document.getElementById('pen-val-temp').textContent='--';
    document.getElementById('pen-val-load').textContent='--';
    document.getElementById('pen-val-status').textContent='--';
}
function onPenConnTypeChange(){
    var sel=document.getElementById('pen-com-port-select').value;
    if(sel==='demo'){
        document.getElementById('pen-serial-dot').className='status-dot';
        document.getElementById('pen-serial-text').textContent='Demo Ready';
    }else{
        document.getElementById('pen-serial-dot').className='status-dot disconnected';
        document.getElementById('pen-serial-text').textContent='Disconnected';
    }
}
function startPenTest(){
    var conn=document.getElementById('pen-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    penIsTesting=true;
    document.getElementById('pen-btn-start').style.display='none';
    document.getElementById('pen-btn-stop').style.display='flex';
    document.getElementById('pen-results-panel').style.display='none';
    if(conn==='demo'){
        document.getElementById('pen-demo-banner').style.display='flex';
        document.getElementById('pen-serial-dot').className='status-dot scanning';
        document.getElementById('pen-serial-text').textContent='Demo';
        var duration=parseInt(document.getElementById('pen_inp_duration').value)||5;
        var load=parseInt(document.getElementById('pen_inp_load').value)||100;
        var basePen=30+Math.random()*60;
        var i=0;var interval=setInterval(function(){
            if(!penIsTesting||i>=duration*2){clearInterval(interval);if(penIsTesting)stopPenTest();return;}
            i++;
            var pen=Math.round(basePen*(1-Math.exp(-i*0.5))*10)/10;
            var temp=parseFloat(document.getElementById('pen_inp_temp').value)||25;
            processPenReading(pen,temp,load);
        },500);
    }else{
        document.getElementById('pen-demo-banner').style.display='none';
        connectSerial().then(function(ok){if(ok){sendSerialCommand('START');startSerialStream();}else{stopPenTest();}});
    }
}
function stopPenTest(){
    penIsTesting=false;
    document.getElementById('pen-btn-start').style.display='flex';
    document.getElementById('pen-btn-stop').style.display='none';
    var penVal=parseFloat(document.getElementById('pen-val-pen').textContent);
    if(!isNaN(penVal)){
        var grade=document.getElementById('pen_inp_grade').value;
        var temp=document.getElementById('pen_inp_temp').value;
        var load=document.getElementById('pen_inp_load').value;
        var sampleId=document.getElementById('pen_inp_sampleid').value;
        var gradeSplit=grade.split('-');
        var minGrade=parseFloat(gradeSplit[0])||0;
        var maxGrade=parseFloat(gradeSplit[1])||100;
        var pass=penVal>=minGrade&&penVal<=maxGrade;
        safeSetText('pen-val-status',pass?'✅ PASS':'❌ FAIL');
        document.getElementById('pen-results-panel').style.display='block';
        var penHtml=safeResultStatus(pass,pass?'PASS':'FAIL')+
            safeResultRow('Penetration',penVal+' × 0.1mm')+
            safeResultRow('Grade Range',grade)+
            safeResultRow('Temperature',temp+' °C')+
            safeResultRow('Needle Load',load+' g')+
            safeResultRow('Sample ID',sampleId);
        safeSetHTML('pen-results-body',penHtml);
        rateLimitedFirestoreWrite('sessions',{testId:currentTest?currentTest.id:'',domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest?currentTest.name:'',results:{penetration:penVal,grade:grade,temperature:temp,needle_load:load,status:pass?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest'}).catch(function(err){console.error('stopPenTest save error:',err);});
    }
}
function processPenReading(pen,temp,load){
    if(!penIsTesting)return;
    document.getElementById('pen-val-pen').textContent=pen;
    document.getElementById('pen-val-temp').textContent=temp;
    document.getElementById('pen-val-load').textContent=load;
}
function processPenSerial(pen){
    if(!penIsTesting)return;
    var temp=parseFloat(document.getElementById('pen_inp_temp').value)||25;
    var load=parseInt(document.getElementById('pen_inp_load').value)||100;
    processPenReading(pen,temp,load);
}
