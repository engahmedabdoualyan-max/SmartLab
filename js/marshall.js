var marData=[],marIsTesting=false;

function openMar(test){
    marData=[];marIsTesting=false;
    showScreen('marshall');
    document.getElementById('marshall-page-title').textContent=test.name;
    document.getElementById('mar-results-panel').style.display='none';
    document.getElementById('mar-btn-start').style.display='flex';
    document.getElementById('mar-btn-stop').style.display='none';
    document.getElementById('mar-demo-banner').style.display='none';
    document.getElementById('mar-val-flow').textContent='--';
    document.getElementById('mar-val-stab').textContent='--';
    document.getElementById('mar-val-maxload').textContent='--';
    document.getElementById('mar-val-disp').textContent='--';
    document.getElementById('mar-vol-panel').style.display='none';
    drawMarChart();
}
function startMarshallTest(){
    var conn=document.getElementById('mar-com-port-select').value;
    if(!conn){alert('Select connection first');return;}
    marData=[];marIsTesting=true;
    document.getElementById('mar-btn-start').style.display='none';
    document.getElementById('mar-btn-stop').style.display='flex';
    document.getElementById('mar-results-panel').style.display='none';
    document.getElementById('mar-vol-panel').style.display='none';
    logTestStarted('marshall',currentTest?currentTest.id:'');
    drawMarChart();
    if(conn==='demo'){
        document.getElementById('mar-demo-banner').style.display='flex';
        document.getElementById('mar-serial-dot').className='status-dot scanning';
        document.getElementById('mar-serial-text').textContent='Demo';
        var maxLoad=8000+Math.random()*4000;
        var flowAtMax=Math.round(2+Math.random()*3);
        var i=0;var interval=setInterval(function(){
            if(!marIsTesting||i>=60){clearInterval(interval);if(marIsTesting)stopMarshallTest();return;}
            i++;
            var disp=i*0.12;
            var load=Math.round(maxLoad*Math.sin(Math.PI*disp/(flowAtMax*4))*100)/100;
            if(load<0)load=0;
            var flow=Math.round(disp/0.25);
            var stab=Math.round(maxLoad*0.92);
            processMarReading(flow,load,disp,stab);
        },150);
    }
}
function stopMarshallTest(){marIsTesting=false;document.getElementById('mar-btn-start').style.display='flex';document.getElementById('mar-btn-stop').style.display='none';logTestStopped('marshall',currentTest?currentTest.id:'',{dataCount:marData.length});if(marData.length>0)showMarResults();}
function processMarReading(flow,load,disp,stab){
    if(!marIsTesting)return;
    marData.push({flow:flow,load:load,disp:disp,stab:stab,time:new Date().toLocaleTimeString()});
    var mx=Math.max.apply(null,marData.map(function(r){return r.load;}));
    document.getElementById('mar-val-flow').textContent=flow;
    document.getElementById('mar-val-stab').textContent=stab;
    document.getElementById('mar-val-maxload').textContent=mx.toFixed(0);
    document.getElementById('mar-val-disp').textContent=disp.toFixed(2);
    drawMarChart();
}
function drawMarChart(){
    var canvas=document.getElementById('mar-chart');if(!canvas)return;
    var ctx=canvas.getContext('2d');var W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,W,H);
    var pad={l:50,r:20,t:20,b:30};var gw=W-pad.l-pad.r,gh=H-pad.t-pad.b;
    ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
    if(marData.length<2)return;
    var maxLoad=Math.max.apply(null,marData.map(function(r){return r.load;}))*1.1||1;
    var maxDisp=marData[marData.length-1].disp*1.1||1;
    ctx.beginPath();ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
    for(var j=0;j<marData.length;j++){
        var rx=pad.l+(marData[j].disp/maxDisp)*gw;var ry=H-pad.b-(marData[j].load/maxLoad)*gh;
        if(j===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);
    }
    ctx.stroke();
    ctx.fillStyle='#64748b';ctx.font='9px Cairo';ctx.fillText('Flow (0.25mm)',W/2-20,H-5);ctx.save();ctx.translate(10,H/2+20);ctx.rotate(-Math.PI/2);ctx.fillText('Load (N)',0,0);ctx.restore();
}
function showMarResults(){
    var maxLoad=Math.max.apply(null,marData.map(function(r){return r.load;}));
    var flowAtMax=Math.round(marData[marData.length-1].flow);
    var stab=Math.round(maxLoad*0.92);
    var stabilityMin=7500,flowRange=[2,4];
    var passStab=stab>=stabilityMin;
    var passFlow=flowAtMax>=flowRange[0]&&flowAtMax<=flowRange[1];
    var pass=passStab&&passFlow;
    var dia=parseFloat(document.getElementById('mar_inp_diameter').value)||101.6;
    var ht=parseFloat(document.getElementById('mar_inp_height').value)||63.5;
    var area=Math.PI*Math.pow(dia/2,2);
    var stabilityPSI=stab/area;

    // Volumetric properties
    var Gmm=parseFloat(document.getElementById('mar_inp_gmm').value);
    var Gsb=parseFloat(document.getElementById('mar_inp_gsb').value);
    var binderPct=parseFloat(document.getElementById('mar_inp_binder').value);
    var va='--',vma='--',vfa='--';
    if(Gmm>0&&Gsb>0){
        var GmbVal=stab/(area*ht*0.001);
        if(!isNaN(GmbVal)&&GmbVal>0){
            va=calcVa(GmbVal,Gmm).toFixed(1)+'%';
            var Ps=100-(binderPct||5);
            vma=calcVMA(GmbVal,Gsb,Ps).toFixed(1)+'%';
            var vmaNum=parseFloat(vma);
            var vaNum=parseFloat(va);
            if(!isNaN(vmaNum)&&!isNaN(vaNum)&&vmaNum>0){
                vfa=calcVFA(vmaNum,vaNum).toFixed(1)+'%';
            }
        }
    }
    document.getElementById('mar-vol-panel').style.display='block';
    document.getElementById('mar-vol-va').textContent=va;
    document.getElementById('mar-vol-vma').textContent=vma;
    document.getElementById('mar-vol-vfa').textContent=vfa;

    document.getElementById('mar-results-panel').style.display='block';
    var marHtml=safeResultStatus(pass,pass?'PASS':'FAIL')+
        safeResultRow('Stability',stab+' N')+
        safeResultRow('Flow',flowAtMax+' × 0.25mm')+
        safeResultRow('Max Load',maxLoad.toFixed(0)+' N')+
        safeResultRow('Stability (PSI)',stabilityPSI.toFixed(2)+' N/mm²')+
        safeResultRow('Diameter',dia+' mm')+
        safeResultRow('Height',ht+' mm');
    safeSetHTML('mar-results-body',marHtml);
    rateLimitedFirestoreWrite('sessions',{testId:currentTest.id,domainId:currentDomain?currentDomain.id:'',domainName:currentDomain?currentDomain.name:'',testName:currentTest.name,results:{stability:stab,flow:flowAtMax,max_load:maxLoad,stability_psi:stabilityPSI,diameter:dia,height:ht,va:va,vma:vma,vfa:vfa,status:pass?'PASS':'FAIL'},userId:currentUser?currentUser.uid:'guest'}).catch(function(err){console.error('showMarResults save error:',err);});
}
function onMarConnTypeChange(){
    var sel=document.getElementById('mar-com-port-select').value;
    if(sel==='demo'){
        document.getElementById('mar-serial-dot').className='status-dot scanning';
        document.getElementById('mar-serial-text').textContent='Demo Ready';
    }else{
        document.getElementById('mar-serial-dot').className='status-dot disconnected';
        document.getElementById('mar-serial-text').textContent='Disconnected';
    }
}
