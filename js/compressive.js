// ================================================================
// COMPRESSIVE STRENGTH TEST
// ================================================================
var compState={isRunning:false,readings:[],peakForce:0,peakStress:0};
function onCompConnChange(){var v=document.getElementById('comp-conn').value;if(v==='demo'){document.getElementById('comp-demo-banner').style.display='flex';}else{document.getElementById('comp-demo-banner').style.display='none';}}
function getCompArea(){
    var t=document.getElementById('comp-specimen-type').value;
    if(t==='cube')return 150*150;
    if(t==='cube100')return 100*100;
    if(t==='cylinder100')return Math.PI*50*50;
    return Math.PI*75*75;
}
function startCompTest(){
    var conn=document.getElementById('comp-conn').value;if(!conn){alert('Select connection type');return;}
    compState={isRunning:true,readings:[],peakForce:0,peakStress:0};
    document.getElementById('comp-btn-start').style.display='none';
    document.getElementById('comp-btn-stop').style.display='flex';
    document.getElementById('comp-results-panel').style.display='none';
    if(conn==='demo')runCompDemo();else if(conn==='manual')runCompManual();
}
function stopCompTest(){
    compState.isRunning=false;
    document.getElementById('comp-btn-start').style.display='flex';
    document.getElementById('comp-btn-stop').style.display='none';
    calculateCompResults();
}
function runCompManual(){
    var f=prompt('Enter peak force (kN):');if(!f)return;
    compState.peakForce=parseFloat(f);
    calculateCompResults();
}
function runCompDemo(){
    if(!compState.isRunning)return;
    var area=getCompArea();
    var targetStrength=30+Math.random()*20;
    var peakF=targetStrength*area/1000;
    var readings=[];var steps=50;
    for(var i=0;i<=steps;i++){
        var t=i/steps;
        var f=peakF*Math.pow(t,0.5)*(1-0.3*Math.pow(t,3));
        readings.push({force:f,disp:t*3,step:i});
    }
    var idx=0;
    function stepDemo(){
        if(!compState.isRunning||idx>=readings.length){calculateCompResults();return;}
        var rd=readings[idx];idx++;
        compState.readings.push(rd);
        if(rd.force>compState.peakForce){compState.peakForce=rd.force;}
        var stress=(rd.force*1000)/area;
        document.getElementById('comp-force-display').textContent=rd.force.toFixed(0);
        document.getElementById('comp-val-force').textContent=rd.force.toFixed(1);
        document.getElementById('comp-val-disp').textContent=rd.disp.toFixed(2);
        document.getElementById('comp-val-stress').textContent=stress.toFixed(1);
        document.getElementById('comp-val-strain').textContent=(rd.disp/300*100).toFixed(3);
        document.getElementById('comp-peak-force').textContent=compState.peakForce.toFixed(1)+' kN';
        var pct=Math.min(100,rd.force/compState.peakForce*100);
        var circ=document.getElementById('comp-gauge-fill');
        if(circ)circ.setAttribute('stroke-dashoffset',264-264*pct/100);
        setTimeout(stepDemo,80);
    }
    stepDemo();
}
function calculateCompResults(){
    var area=getCompArea();
    var strength=(compState.peakForce*1000)/area;
    compState.peakStress=strength;
    var age=document.getElementById('comp-age').value;
    var spec=document.getElementById('comp-specimen-type').value;
    var specLabel=spec==='cube'?'150mm Cube':spec==='cube100'?'100mm Cube':spec==='cylinder100'?'100×200mm Cylinder':'150×300mm Cylinder';
    var pass=strength>=25;
    var panel=document.getElementById('comp-results-panel');panel.style.display='block';
    var html='<div class="result-status '+(pass?'pass':'fail')+'">'+(pass?'✅':'❌')+' '+(pass?'PASS':'FAIL')+' — '+strength.toFixed(1)+' MPa</div>';
    html+='<div class="result-row"><span class="result-label">Peak Force</span><span class="result-value">'+compState.peakForce.toFixed(1)+' kN</span></div>';
    html+='<div class="result-row"><span class="result-label">Cross-sectional Area</span><span class="result-value">'+(area/1000).toFixed(0)+' cm²</span></div>';
    html+='<div class="result-row"><span class="result-label">Compressive Strength</span><span class="result-value">'+strength.toFixed(1)+' MPa</span></div>';
    html+='<div class="result-row"><span class="result-label">Specimen</span><span class="result-value">'+specLabel+'</span></div>';
    html+='<div class="result-row"><span class="result-label">Age</span><span class="result-value">'+age+' days</span></div>';
    document.getElementById('comp-results-body').innerHTML=html;
    document.getElementById('comp-strength-display').textContent=strength.toFixed(1)+' MPa';
    saveTestSession('compressive',{strength:strength,peakForce:compState.peakForce,area:area,age:age,specimen:spec});
}
