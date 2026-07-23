// ================================================================
// TEST CONTROL
// ================================================================
async function startTest(){var connType=document.getElementById('com-port-select').value;if(!connType){alert('Select connection first');return;}hammerWeight=parseFloat(document.getElementById('inp_hammer_weight').value)||2.5;moldVolume=parseFloat(document.getElementById('inp_mold_volume').value)||0.001;targetStrikes=parseInt(document.getElementById('inp_target_strikes').value)||25;targetRatio=parseFloat(document.getElementById('inp_target_ratio').value)||95;safeSetText('target-display',targetStrikes);strikes=[];isTesting=true;isDemoMode=(connType==='demo');isManual=(connType==='manual');document.getElementById('btn-start').style.display='none';document.getElementById('btn-stop').style.display='flex';document.getElementById('btn-tare').style.display=isManual?'none':'flex';document.getElementById('live-indicator').style.display='flex';document.getElementById('results-panel').style.display='none';document.getElementById('btn-pdf').style.display='none';var slb=document.getElementById('strike-log-body');if(slb)slb.textContent='';logTestStarted('compaction',currentTest?currentTest.id:'');if(isDemoMode){document.getElementById('demo-banner').style.display='flex';document.getElementById('serial-dot').className='status-dot scanning';safeSetText('serial-text','Demo');runDemoMode();}else if(isManual){document.getElementById('demo-banner').style.display='none';document.getElementById('serial-dot').className='status-dot idle';safeSetText('serial-text','Manual');showToast('Manual mode: enter readings in the form below','info');}else{document.getElementById('demo-banner').style.display='none';if(!serialPort){var ok=await connectSerial();if(!ok){stopTest();return;}}await sendSerialCommand('START');startSerialStream();}}
function stopTest(){isTesting=false;document.getElementById('btn-start').style.display='flex';document.getElementById('btn-stop').style.display='none';document.getElementById('live-indicator').style.display='none';if(!isDemoMode&&!isManual){sendSerialCommand('STOP');stopSerial();}if(strikes.length>0){logTestStopped('compaction',currentTest?currentTest.id:'',{strikeCount:strikes.length});calculateFinalResults();}else{logTestStopped('compaction',currentTest?currentTest.id:'',{strikeCount:0,abandoned:true});}}
async function tareScale(){if(!isDemoMode)await sendSerialCommand('TARE');}
function runDemoMode(){var n=0;var iv=setInterval(function(){if(!isTesting||n>=targetStrikes){clearInterval(iv);if(isTesting)stopTest();return;}n++;processStrike(Math.round((8+Math.random()*7)*100)/100,Math.round((200+Math.random()*300)*100)/100);},800);}

// ================================================================
// PROCESS STRIKE
// ================================================================
function processStrike(moisture, force) {
    // Input validation and sanitization
    if (!Number.isFinite(moisture) || !Number.isFinite(force)) {
        showToast('Invalid input: Must be numeric values', 'error');
        return;
    }
    
    // Clamp values to prevent unrealistic data
    moisture = Math.max(0, Math.min(100, moisture));
    force = Math.max(0, Math.min(100000, force));

    var wetDensity = force / (moldVolume * 9.81);
    var dryDensity = wetDensity / (1 + moisture / 100);
    var strike = {
        index: strikes.length + 1,
        moisture: moisture,
        force: force,
        wetDensity: Math.round(wetDensity * 100) / 100,
        dryDensity: Math.round(dryDensity * 100) / 100,
        time: new Date().toLocaleTimeString()
    };
    strikes.push(strike);
    
    safeSetText('val-moisture', moisture);
    safeSetText('val-force', force);
    safeSetText('strike-counter', strikes.length);
    
    var sf = 0;
    for (var i = 0; i < strikes.length; i++) sf += strikes[i].force;
    safeSetText('val-avg-force', Math.round(sf / strikes.length * 100) / 100);
    safeSetText('val-dry-density', dryDensity);
    
    var progress = Math.min(strikes.length / targetStrikes, 1);
    var gaugeEl = document.getElementById('gauge-fill');
    if (gaugeEl) {
        gaugeEl.style.strokeDashoffset = 264 - (progress * 264);
    }
    
    var mdd = dryDensity;
    for (var j = 0; j < strikes.length; j++) {
        if (strikes[j].dryDensity > mdd) mdd = strikes[j].dryDensity;
    }
    var rw = parseFloat(document.getElementById('inp_ref_weight').value) || 0;
    var rd = rw > 0 ? rw / moldVolume : 0;
    var cr = rd > 0 ? (mdd / rd) * 100 : 0;
    safeSetText('ratio-display', cr > 0 ? Math.round(cr) + '%' : '--%');
    
    var tbody = document.getElementById('strike-log-body');
    if (strikes.length === 1 && tbody) tbody.textContent = '';
    var tr = document.createElement('tr');
    var td1 = document.createElement('td'); td1.style.fontWeight = '700'; td1.textContent = strike.index;
    var td2 = document.createElement('td'); td2.textContent = strike.moisture;
    var td3 = document.createElement('td'); td3.textContent = strike.force;
    var td4 = document.createElement('td'); td4.textContent = strike.dryDensity;
    var td5 = document.createElement('td'); td5.style.color = 'var(--text-muted)'; td5.style.fontSize = '10px'; td5.textContent = strike.time;
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4); tr.appendChild(td5);
    tbody.appendChild(tr);
    var lc = tbody.closest('.strike-log');
    if (lc) lc.scrollTop = lc.scrollHeight;
    
    if (strikes.length >= targetStrikes) stopTest();
}

// ================================================================
// FINAL RESULTS
// ================================================================
function calculateFinalResults(){if(strikes.length===0)return;var mdd=0,om=0,tm=0,tf=0,mf=0;for(var i=0;i<strikes.length;i++){tm+=strikes[i].moisture;tf+=strikes[i].force;if(strikes[i].force>mf)mf=strikes[i].force;if(strikes[i].dryDensity>mdd){mdd=strikes[i].dryDensity;om=strikes[i].moisture;}}var am=tm/strikes.length,af=tf/strikes.length;var rw=parseFloat(document.getElementById('inp_ref_weight').value)||0;var rd=rw>0?rw/moldVolume:0;var cr=rd>0?(mdd/rd)*100:0;var passed=cr>=targetRatio;var results={strikes_count:strikes.length,target_strikes:targetStrikes,max_dry_density:Math.round(mdd*100)/100,optimum_moisture:Math.round(om*100)/100,average_moisture:Math.round(am*100)/100,average_force:Math.round(af*100)/100,max_force:Math.round(mf*100)/100,reference_density:Math.round(rd*100)/100,compaction_ratio:Math.round(cr*100)/100,hammer_weight:hammerWeight,mold_volume:moldVolume,status:passed?'PASS':'FAIL'};
rateLimitedFirestoreWrite('sessions',{testId:currentTest.id,domainId:currentDomain.id,domainName:currentDomain.name,testName:currentTest.name,engineerInputs:{hammer_weight:hammerWeight,mold_volume:moldVolume,target_strikes:targetStrikes,target_ratio:targetRatio,ref_weight:rw},strikes:strikes,results:results,userId:currentUser?currentUser.uid:'guest'}).then(function(docRef){currentSessionId=docRef.id;logSessionCreated(docRef.id,'compaction');displayResults(results);loadHistory();}).catch(function(err){showToast('Failed to save results: '+err.message,'error');});}

function displayResults(results){var panel=document.getElementById('results-panel');var body=document.getElementById('results-body');panel.style.display='block';var labels={strikes_count:'Strikes Completed',target_strikes:'Target Strikes',max_dry_density:'Max Dry Density (kg/m³)',optimum_moisture:'Optimum Moisture %',average_moisture:'Avg Moisture %',average_force:'Avg Force (N)',max_force:'Max Force (N)',reference_density:'Reference Density (kg/m³)',compaction_ratio:'Compaction Ratio %',hammer_weight:'Hammer (kg)',mold_volume:'Mold (m³)',status:'Status'};var html='';if(results.status){var p=results.status==='PASS';var ratioVal=results.compaction_ratio!==undefined?results.compaction_ratio+'%':'';html+=safeResultStatus(p,results.status+' — '+ratioVal);}Object.keys(results).forEach(function(k){html+=safeResultRow(labels[k]||k,results[k]);});safeSetHTML(body,html);if(results.compaction_ratio>0){document.getElementById('chart-box').style.display='block';setTimeout(function(){document.getElementById('chart-fill').style.width=Math.min(results.compaction_ratio,100)+'%';},100);}document.getElementById('btn-pdf').style.display='flex';var mlBtn=document.getElementById('btn-ml-compaction');if(mlBtn)mlBtn.style.display='flex';}

async function loadHistory(){if(!currentTest)return;try{var snap=await db.collection('sessions').where('testId','==',currentTest.id).get();var tbody=document.getElementById('history-body');if(snap.empty)return;if(tbody)tbody.textContent='';var rows=[];snap.forEach(function(doc){var s=doc.data();rows.push(s);});rows.sort(function(a,b){return (b.createdAt&&b.createdAt.seconds||0)-(a.createdAt&&a.createdAt.seconds||0);});rows.slice(0,10).forEach(function(s){var st=(s.results&&s.results.status)||'?';var dens=(s.results&&s.results.max_dry_density)||'--';var date=s.createdAt?new Date(s.createdAt.seconds*1000).toLocaleDateString():'--';var tr=document.createElement('tr');var td1=document.createElement('td');td1.textContent=date;var td2=document.createElement('td');td2.textContent=st;if(st==='PASS')td2.className='result-pass';else if(st==='FAIL')td2.className='result-fail';var td3=document.createElement('td');td3.textContent=dens+' kg/m³';tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tbody.appendChild(tr);});}catch(e){console.error('loadHistory error:',e);showToast('Failed to load history: '+e.message,'error');}}

function saveTestSession(type,results){
    try{
        rateLimitedFirestoreWrite('sessions',{
            testId:currentTest?currentTest.id:'',
            testType:type,
            userId:currentUser?currentUser.uid:'guest',
            results:results
        }).catch(function(err){console.error('saveTestSession error:',err);showToast('Failed to save session: '+err.message,'error');});
    }catch(e){console.error('saveTestSession error:',e);showToast('Failed to save session: '+e.message,'error');}
}
