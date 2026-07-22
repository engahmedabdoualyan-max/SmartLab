// ================================================================
// SIEVE ANALYSIS TEST
// ================================================================
var sieveSizes=[75,37.5,19,9.5,4.75,2.36,1.18,0.6,0.3,0.15,0.075];
var sieveState={isRunning:false};
function onSieveConnChange(){var v=document.getElementById('sieve-conn').value;if(v==='demo'){document.getElementById('sieve-demo-banner').style.display='flex';}else{document.getElementById('sieve-demo-banner').style.display='none';}}
function startSieveTest(){
    var conn=document.getElementById('sieve-conn').value;if(!conn){alert('Select connection type');return;}
    sieveState.isRunning=true;
    document.getElementById('sieve-btn-start').style.display='none';
    document.getElementById('sieve-btn-stop').style.display='flex';
    document.getElementById('sieve-results-panel').style.display='none';
    if(conn==='demo'){runSieveDemo();}else if(conn==='manual'){calculateSieveResults();}
}
function stopSieveTest(){
    sieveState.isRunning=false;
    document.getElementById('sieve-btn-start').style.display='flex';
    document.getElementById('sieve-btn-stop').style.display='none';
    calculateSieveResults();
}
function runSieveDemo(){
    var total=parseFloat(document.getElementById('sieve-total-mass').value)||500;
    var inputs=document.querySelectorAll('.sieve-mass');
    var demoVals=[0,5,25,60,80,70,55,45,40,35,30];
    var sum=0;demoVals.forEach(function(v){sum+=v;});
    inputs.forEach(function(inp,i){inp.value=(demoVals[i]/sum*total).toFixed(1);});
    calculateSieveResults();
}
function calculateSieveResults(){
    var total=parseFloat(document.getElementById('sieve-total-mass').value)||500;
    var inputs=document.querySelectorAll('.sieve-mass');
    var retPcts=[];var passPcts=[];var cumRet=0;
    var retCells=document.querySelectorAll('.sieve-pct-ret');
    var passCells=document.querySelectorAll('.sieve-pct-pass');
    inputs.forEach(function(inp,i){
        var mass=parseFloat(inp.value)||0;
        var pct=total>0?(mass/total*100):0;
        cumRet+=pct;
        retPcts.push(pct);passPcts.push(Math.max(0,100-cumRet));
        if(retCells[i])retCells[i].textContent=pct.toFixed(1);
        if(passCells[i])passCells[i].textContent=passPcts[i].toFixed(1);
    });
    var fines=passPcts.length>0?passPcts[passPcts.length-1]:0;
    var gravel=100-passPcts[0];
    var sand=100-gravel-fines;
    var cu=0,cc=0;
    var d60=0,d30=0,d10=0;
    for(var i=0;i<passPcts.length-1;i++){
        if(passPcts[i]>=60&&passPcts[i+1]<60)d60=sieveSizes[i];
        if(passPcts[i]>=30&&passPcts[i+1]<30)d30=sieveSizes[i];
        if(passPcts[i]>=10&&passPcts[i+1]<10)d10=sieveSizes[i];
    }
    if(d10>0){cu=d60/d10;cc=(d30*d30)/(d60*d10);}
    var wellGraded=cu>6&&cc>1&&cc<3;
    var classification=fines>12?'Fine-grained (Silt/Clay)':gravel>sand?'Coarse-grained (Gravel)':'Coarse-grained (Sand)';
    var panel=document.getElementById('sieve-results-panel');panel.style.display='block';
    var html='<div class="result-row"><span class="result-label">Gravel (>4.75mm)</span><span class="result-value">'+gravel.toFixed(1)+'%</span></div>';
    html+='<div class="result-row"><span class="result-label">Sand (0.075-4.75mm)</span><span class="result-value">'+sand.toFixed(1)+'%</span></div>';
    html+='<div class="result-row"><span class="result-label">Fines (<0.075mm)</span><span class="result-value">'+fines.toFixed(1)+'%</span></div>';
    html+='<div class="result-row"><span class="result-label">Cu (Coefficient of Uniformity)</span><span class="result-value">'+cu.toFixed(2)+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Cc (Coefficient of Curvature)</span><span class="result-value">'+cc.toFixed(2)+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Classification</span><span class="result-value">'+classification+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Gradation</span><span class="result-value">'+(wellGraded?'Well Graded':'Poorly Graded')+'</span></div>';
    document.getElementById('sieve-results-body').innerHTML=html;
    saveTestSession('sieve',{fines:fines,gravel:gravel,sand:sand,cu:cu,cc:cc,classification:classification});
}
