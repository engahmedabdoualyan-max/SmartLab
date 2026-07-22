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
        db.collection('sessions').add({testId:currentTest?currentTest.id:'',domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest?currentTest.name:'',results:{light_intensity:lux,transmission:trans,purity:purity,status:pass?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
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
        document.getElementById('bit-val-light').textContent=baseLight.toFixed(0);
        document.getElementById('bit-val-trans').textContent=trans.toFixed(2);
        document.getElementById('bit-val-purity').textContent=purity;
        document.getElementById('bit-val-status').textContent=pass?'✅ PASS':'❌ FAIL';
        document.getElementById('bit-val-status').style.color=pass?'#16a34a':'#ef4444';
        document.getElementById('bit-results-panel').style.display='block';
        document.getElementById('bit-results-body').innerHTML='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅ PASS':'❌ FAIL')+'</div><div class="result-row"><span class="result-label">Light Intensity</span><span class="result-value">'+baseLight.toFixed(0)+' lux</span></div><div class="result-row"><span class="result-label">Transmission</span><span class="result-value">'+trans.toFixed(2)+'%</span></div><div class="result-row"><span class="result-label">Purity Index</span><span class="result-value">'+purity+'/100</span></div><div class="result-row"><span class="result-label">Sample</span><span class="result-value">'+document.getElementById('bit_inp_sampleid').value+'</span></div><div class="result-row"><span class="result-label">Grade</span><span class="result-value">'+document.getElementById('bit_inp_grade').value+'</span></div>';
        db.collection('sessions').add({testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:{light_intensity:baseLight,transmission:trans,purity:purity,grade:document.getElementById('bit_inp_grade').value,status:pass?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
}

// Update dispatcher to handle all test types
var _lastOpenTest=window.openTest;
openTest=function(test){currentTest=test;if(test.type==='straightedge'){openSE(test);return;}if(test.type==='slump'){openSlump(test);return;}if(test.type==='maturity'){openMat(test);return;}if(test.type==='marshall'){openMar(test);return;}if(test.type==='bitumen'){openBit(test);return;}if(test.type==='penetration'){openPen(test);return;}if(test.type==='atterberg'){openAtterberg(test);return;}if(test.type==='sieve'){openSieve(test);return;}if(test.type==='compressive'){openComp(test);return;}if(test.type==='ductility'){openDuct(test);return;}if(test.type==='air'){openAir(test);return;}_lastOpenTest(test);};
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
