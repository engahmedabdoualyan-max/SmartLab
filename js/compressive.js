var compState={isRunning:false,readings:[],peakForce:0,peakStress:0};
var compBatch=[];

function onCompConnChange(){var v=document.getElementById('comp-conn').value;if(v==='demo'){document.getElementById('comp-demo-banner').style.display='flex';}else{document.getElementById('comp-demo-banner').style.display='none';}}
function onCompSpecimenChange(){
  var t=document.getElementById('comp-specimen-type').value;
  if(t==='cylinder'){document.getElementById('comp-actual-dia').value=150;document.getElementById('comp-actual-height').value=300;}
  else if(t==='cube'){document.getElementById('comp-actual-dia').value=150;document.getElementById('comp-actual-height').value=150;}
  else if(t==='cylinder100'){document.getElementById('comp-actual-dia').value=100;document.getElementById('comp-actual-height').value=200;}
  else if(t==='cube100'){document.getElementById('comp-actual-dia').value=100;document.getElementById('comp-actual-height').value=100;}
  checkCompLDCorrection();
}
function checkCompLDCorrection(){
  var d=parseFloat(document.getElementById('comp-actual-dia').value)||150;
  var h=parseFloat(document.getElementById('comp-actual-height').value)||300;
  var ratio=h/d;
  var cf=calcLDCorrection(h,d);
  var info=document.getElementById('comp-ld-info');
  if(!info)return;
  if(cf<1.0)info.innerHTML='L/D = '+ratio.toFixed(2)+' — Correction factor: '+cf.toFixed(2)+' (ASTM C39)';
  else info.innerHTML='L/D = '+ratio.toFixed(2)+' — No correction needed (ASTM C39)';
}
function getCompArea(){
  var t=document.getElementById('comp-specimen-type').value;
  if(t==='cube')return 150*150;
  if(t==='cube100')return 100*100;
  if(t==='cylinder100')return Math.PI*50*50;
  var d=parseFloat(document.getElementById('comp-actual-dia').value)||150;
  return Math.PI*Math.pow(d/2,2);
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
  var d=parseFloat(document.getElementById('comp-actual-dia').value)||150;
  var h=parseFloat(document.getElementById('comp-actual-height').value)||300;
  var corrected=calcCorrectedStrength(strength,h,d);
  var fmode=document.getElementById('comp-failure-mode').value;
  var fmodeDesc=fmode?describeFailureMode(fmode):'Not specified';
  var pass=corrected>=25&&fmode!=='end';
  var panel=document.getElementById('comp-results-panel');panel.style.display='block';
  var html=safeResultStatus(pass,pass?'PASS':'FAIL');
  html+=safeResultRow('Peak Force',compState.peakForce.toFixed(1)+' kN');
  html+=safeResultRow('Cross-sectional Area',(area/1000).toFixed(0)+' cm²');
  html+=safeResultRow('Measured Strength',strength.toFixed(1)+' MPa');
  html+=safeResultRow('L/D Correction Factor',calcLDCorrection(h,d).toFixed(3));
  html+=safeResultRow('Corrected Strength (ASTM C39)',corrected.toFixed(1)+' MPa');
  html+=safeResultRow('Failure Mode',fmodeDesc);
  html+=safeResultRow('Specimen',specLabel);
  html+=safeResultRow('Age',age+' days');
  safeSetHTML('comp-results-body',html);
  safeSetText('comp-strength-display',corrected.toFixed(1)+' MPa');
  saveTestSession('compressive',{strength:corrected,rawStrength:strength,peakForce:compState.peakForce,area:area,age:age,specimen:spec,diameter:d,height:h,ldCorrection:calcLDCorrection(h,d),failureMode:fmode});
}
function addCompResult(){
  var area=getCompArea();
  var strength=(compState.peakForce*1000)/area;
  var d=parseFloat(document.getElementById('comp-actual-dia').value)||150;
  var h=parseFloat(document.getElementById('comp-actual-height').value)||300;
  var corrected=calcCorrectedStrength(strength,h,d);
  var fmode=document.getElementById('comp-failure-mode').value;
  var entry={strength:corrected,rawStrength:strength,dia:d,height:h,fmode:fmode,time:new Date().toLocaleTimeString()};
  compBatch.push(entry);
  document.getElementById('comp-batch-count').textContent=compBatch.length+' specimens';
  var values=compBatch.map(function(e){return e.strength;});
  var cov=calcCOV(values);
  var mean=values.reduce(function(a,b){return a+b;},0)/values.length;
  var sqDiff=0;
  for(var i=0;i<values.length;i++)sqDiff+=(values[i]-mean)*(values[i]-mean);
  var std=Math.sqrt(sqDiff/(values.length-1));
  document.getElementById('comp-batch-mean').textContent=mean.toFixed(1);
  document.getElementById('comp-batch-std').textContent=std.toFixed(2);
  document.getElementById('comp-batch-cov').textContent=cov.toFixed(1);
  document.getElementById('comp-batch-class').textContent=classifyCOV(cov);
  document.getElementById('comp-batch-stats').style.display='block';
  showToast('Result added to batch ('+compBatch.length+' total)','success');
}
