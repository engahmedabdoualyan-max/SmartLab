// ================================================================
// BITUMEN PHOTO-TESTER
// ================================================================
var bitIsTesting=false;

function openBit(test){
    bitIsTesting=false;
    showScreen('bitumen');
    document.getElementById('bit-page-title').textContent=test.name;
    document.getElementById('bit-results-panel').style.display='none';
    document.getElementById('bit-btn-start').style.display='flex';
    document.getElementById('bit-btn-stop').style.display='none';
    document.getElementById('bit-demo-banner').style.display='none';
    document.getElementById('bit-val-light').textContent='--';
    document.getElementById('bit-val-trans').textContent='--';
    document.getElementById('bit-val-purity').textContent='--';
    document.getElementById('bit-val-status').textContent='--';
}
function stopBitumenTest(){
    bitIsTesting=false;
    document.getElementById('bit-btn-start').style.display='flex';
    document.getElementById('bit-btn-stop').style.display='none';
    if(document.getElementById('bit-val-purity').textContent!=='--'){
        var lux=parseFloat(document.getElementById('bit-val-light').textContent)||0;
        var trans=parseFloat(document.getElementById('bit-val-trans').textContent)||0;
        var purity=parseFloat(document.getElementById('bit-val-purity').textContent)||0;
        var pass=purity>=80;
        rateLimitedFirestoreWrite('sessions',{testId:currentTest?currentTest.id:'',domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest?currentTest.name:'',results:{light_intensity:lux,transmission:trans,purity:purity,status:pass?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest'}).catch(function(err){console.error('stopBitumenTest save error:',err);});
    }
}
function startBitumenTest(){
    var conn=document.getElementById('bit-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    bitIsTesting=true;
    document.getElementById('bit-btn-start').style.display='none';
    document.getElementById('bit-btn-stop').style.display='flex';
    document.getElementById('bit-results-panel').style.display='none';
    if(conn==='demo'){
        document.getElementById('bit-demo-banner').style.display='flex';
        document.getElementById('bit-serial-dot').className='status-dot scanning';
        document.getElementById('bit-serial-text').textContent='Demo';
        var baseLight=400+Math.random()*200;
        var trans=Math.round(baseLight/10*100)/100;
        var purity=Math.round(75+Math.random()*20);
        var pass=purity>=80;
        safeSetText('bit-val-light',baseLight.toFixed(0));
        safeSetText('bit-val-trans',trans.toFixed(2));
        safeSetText('bit-val-purity',purity);
        safeSetText('bit-val-status',pass?'✅ PASS':'❌ FAIL');
        var statusEl=document.getElementById('bit-val-status');
        if(statusEl)statusEl.style.color=pass?'#16a34a':'#ef4444';
        document.getElementById('bit-results-panel').style.display='block';
        var sampleVal=document.getElementById('bit_inp_sampleid')?document.getElementById('bit_inp_sampleid').value:'';
        var gradeVal=document.getElementById('bit_inp_grade')?document.getElementById('bit_inp_grade').value:'';
        var resultsHtml=safeResultStatus(pass,pass?'PASS':'FAIL')+
            safeResultRow('Light Intensity',baseLight.toFixed(0)+' lux')+
            safeResultRow('Transmission',trans.toFixed(2)+'%')+
            safeResultRow('Purity Index',purity+'/100')+
            safeResultRow('Sample',sampleVal)+
            safeResultRow('Grade',gradeVal);
        safeSetHTML('bit-results-body',resultsHtml);
        rateLimitedFirestoreWrite('sessions',{testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:{light_intensity:baseLight,transmission:trans,purity:purity,grade:gradeVal,status:pass?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest'}).catch(function(err){console.error('startBitumenTest save error:',err);});
    }
}

// Note: openTest dispatcher is now defined in navigation.js
// Test type routing is handled there
function onBitConnTypeChange(){
    var sel=document.getElementById('bit-com-port-select').value;
    if(sel==='demo'){
        document.getElementById('bit-serial-dot').className='status-dot scanning';
        document.getElementById('bit-serial-text').textContent='Demo Ready';
    }else{
        document.getElementById('bit-serial-dot').className='status-dot disconnected';
        document.getElementById('bit-serial-text').textContent='Disconnected';
    }
}
