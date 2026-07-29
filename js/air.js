// ================================================================
// AIR CONTENT TEST
// ================================================================
var airState={isRunning:false,readings:[]};
function onAirConnChange(){var v=document.getElementById('air-conn').value;if(v==='demo'){document.getElementById('air-demo-banner').style.display='flex';}else{document.getElementById('air-demo-banner').style.display='none';}}
function startAirTest(){
    var conn=document.getElementById('air-conn').value;if(!conn){alert('Select connection type');return;}
    airState={isRunning:true,readings:[]};
    document.getElementById('air-btn-start').style.display='none';
    document.getElementById('air-btn-stop').style.display='flex';
    document.getElementById('air-results-panel').style.display='none';
    if(conn==='demo')runAirDemo();else if(conn==='manual')runAirManual();
}
function stopAirTest(){
    airState.isRunning=false;
    document.getElementById('air-btn-start').style.display='flex';
    document.getElementById('air-btn-stop').style.display='none';
    calculateAirResults();
}
function runAirManual(){
    var air=prompt('Enter measured air content (%):');if(!air)return;
    airState.readings.push({air:parseFloat(air),pressure:0,uw:2400});
    calculateAirResults();
}
function runAirDemo(){
    if(!airState.isRunning)return;
    var targetAir=parseFloat(document.getElementById('air-target').value)||5;
    var readings=[];var steps=10;
    for(var i=0;i<steps;i++){
        readings.push({air:targetAir+Math.random()*1.5-0.75,pressure:14.7*(1-targetAir/100),uw:2350+Math.random()*100});
    }
    var idx=0;
    function stepAir(){
        if(!airState.isRunning||idx>=readings.length){calculateAirResults();return;}
        var rd=readings[idx];idx++;
        airState.readings.push(rd);
        document.getElementById('air-val-pressure').textContent=rd.pressure.toFixed(1);
        document.getElementById('air-val-air').textContent=rd.air.toFixed(1);
        document.getElementById('air-val-uw').textContent=rd.uw.toFixed(0);
        document.getElementById('air-val-status').textContent='Measuring...';
        setTimeout(stepAir,1200);
    }
    stepAir();
}
function calculateAirResults(){
    var r=airState.readings;if(r.length===0)return;
    var avgAir=r.reduce(function(s,v){return s+v.air;},0)/r.length;
    var avgUw=r.reduce(function(s,v){return s+v.uw;},0)/r.length;
    var target=parseFloat(document.getElementById('air-target').value)||5;
    var diff=Math.abs(avgAir-target);
    var pass=diff<=1.5;
    var method=document.getElementById('air-method').value;
    var concTemp=document.getElementById('air-conc-temp').value;
    var panel=document.getElementById('air-results-panel');panel.style.display='block';
    var html=safeResultStatus(pass,pass?'PASS':'FAIL');
    html+=safeResultRow('Average Air Content',avgAir.toFixed(1)+'%');
    html+=safeResultRow('Target Air Content',target+'%');
    html+=safeResultRow('Deviation from Target','±'+diff.toFixed(1)+'%');
    html+=safeResultRow('Average Unit Weight',avgUw.toFixed(0)+' kg/m³');
    html+=safeResultRow('Method',method.charAt(0).toUpperCase()+method.slice(1));
    html+=safeResultRow('Concrete Temp',concTemp+'°C');
    safeSetHTML('air-results-body',html);
    saveTestSession('air',{airContent:avgAir,target:target,unitWeight:avgUw,method:method});
}
