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
        setTimeout(function(){var h=parseFloat(document.getElementById('slump_inp_height').value)||305;var slump=Math.round(60+Math.random()*80);var dist=h-slump;safeSetText('slump-val-dist',dist);safeSetText('slump-val-slump',slump);var tol=parseFloat(document.getElementById('slump_inp_tolerance').value)||25;var target=parseFloat(document.getElementById('slump_inp_target').value)||100;var dev=Math.abs(slump-target);safeSetText('slump-val-dev',dev);var ok=dev<=tol;safeSetText('slump-val-status',ok?'✅ PASS':'❌ FAIL');
            document.getElementById('slump-results-panel').style.display='block';
            var slumpHtml=safeResultStatus(ok,ok?'PASS':'FAIL')+
                safeResultRow('Slump Value',slump+' mm')+
                safeResultRow('Target',target+' mm')+
                safeResultRow('Deviation',dev+' mm')+
                safeResultRow('Tolerance','±'+tol+' mm');
            safeSetHTML('slump-results-body',slumpHtml);
            rateLimitedFirestoreWrite('sessions',{testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:{slump_value:slump,target:target,deviation:dev,tolerance:tol,status:ok?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest'}).catch(function(err){console.error('startSlumpTest save error:',err);});
        },2000);
    }
}
function stopSlumpTest(){document.getElementById('slump-btn-start').style.display='flex';document.getElementById('slump-btn-stop').style.display='none';}
