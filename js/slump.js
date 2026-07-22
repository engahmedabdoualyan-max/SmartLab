// ================================================================
// DIGITAL SLUMP TEST
// ================================================================
function openSlump(test){
    showScreen('slump');
    document.getElementById('slump-page-title').textContent=test.name;
    document.getElementById('slump-results-panel').style.display='none';
    document.getElementById('slump-btn-start').style.display='flex';
    document.getElementById('slump-btn-stop').style.display='none';
    document.getElementById('slump-demo-banner').style.display='none';
    document.getElementById('slump-val-dist').textContent='--';
    document.getElementById('slump-val-slump').textContent='--';
    document.getElementById('slump-val-dev').textContent='--';
    document.getElementById('slump-val-status').textContent='--';
}
function onSlumpConnTypeChange(){var sel=document.getElementById('slump-com-port-select').value;}
function startSlumpTest(){
    var conn=document.getElementById('slump-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    document.getElementById('slump-btn-start').style.display='none';
    document.getElementById('slump-btn-stop').style.display='flex';
    document.getElementById('slump-results-panel').style.display='none';
    logTestStarted('slump',currentTest?currentTest.id:'');
    if(conn==='demo'){document.getElementById('slump-demo-banner').style.display='flex';document.getElementById('slump-serial-dot').className='status-dot scanning';document.getElementById('slump-serial-text').textContent='Demo';
        setTimeout(function(){var h=parseFloat(document.getElementById('slump_inp_height').value)||305;var slump=Math.round(60+Math.random()*80);var dist=h-slump;document.getElementById('slump-val-dist').textContent=dist;document.getElementById('slump-val-slump').textContent=slump;var tol=parseFloat(document.getElementById('slump_inp_tolerance').value)||25;var target=parseFloat(document.getElementById('slump_inp_target').value)||100;var dev=Math.abs(slump-target);document.getElementById('slump-val-dev').textContent=dev;var ok=dev<=tol;document.getElementById('slump-val-status').textContent=ok?'✅ PASS':'❌ FAIL';
            document.getElementById('slump-results-panel').style.display='block';document.getElementById('slump-results-body').innerHTML='<div class="result-status '+(ok?'pass':'fail')+'">'+(ok?'✅':'❌')+' '+(ok?'PASS':'FAIL')+'</div><div class="result-row"><span class="result-label">Slump Value</span><span class="result-value">'+slump+' mm</span></div><div class="result-row"><span class="result-label">Target</span><span class="result-value">'+target+' mm</span></div><div class="result-row"><span class="result-label">Deviation</span><span class="result-value">'+dev+' mm</span></div><div class="result-row"><span class="result-label">Tolerance</span><span class="result-value">±'+tol+' mm</span></div>';
            db.collection('sessions').add({testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:{slump_value:slump,target:target,deviation:dev,tolerance:tol,status:ok?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        },2000);
    }
}
function stopSlumpTest(){document.getElementById('slump-btn-start').style.display='flex';document.getElementById('slump-btn-stop').style.display='none';}
