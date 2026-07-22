// ================================================================
// AI ANOMALY DETECTION
// ================================================================
var anomalyBuffer=[];
var ANOMALY_WINDOW=20;

function detectAnomaly(value,metricName){
    anomalyBuffer.push({value:value,time:Date.now(),metric:metricName});
    if(anomalyBuffer.length>ANOMALY_WINDOW*3)anomalyBuffer=anomalyBuffer.slice(-ANOMALY_WINDOW*2);
    var recent=anomalyBuffer.filter(function(r){return r.metric===metricName;}).slice(-ANOMALY_WINDOW);
    if(recent.length<5)return null;
    var vals=recent.map(function(r){return r.value;});
    var mean=vals.reduce(function(a,b){return a+b;},0)/vals.length;
    var variance=vals.reduce(function(a,b){return a+Math.pow(b-mean,2);},0)/vals.length;
    var stddev=Math.sqrt(variance);
    if(stddev===0)return null;
    var zScore=(value-mean)/stddev;
    var anomalies=[];
    if(Math.abs(zScore)>3){
        anomalies.push({type:'outlier',severity:'critical',message:metricName+' outlier detected: '+value+' (Z-score: '+zScore.toFixed(2)+')'});
    }else if(Math.abs(zScore)>2){
        anomalies.push({type:'warning',severity:'warning',message:metricName+' unusual reading: '+value+' (Z-score: '+zScore.toFixed(2)+')'});
    }
    if(recent.length>=3){
        var lastThree=recent.slice(-3);
        var trend=lastThree[2].value-lastThree[0].value;
        if(Math.abs(trend)>stddev*2&&stddev>0){
            anomalies.push({type:'trend',severity:'warning',message:metricName+' rapid trend: '+trend.toFixed(2)+' over last readings'});
        }
    }
    if(recent.length>=2){
        var last=recent[recent.length-1].value;
        var prev=recent[recent.length-2].value;
        var jumpRate=Math.abs(last-prev)/Math.max(Math.abs(prev),0.001);
        if(jumpRate>0.5){
            anomalies.push({type:'spike',severity:'warning',message:metricName+' sudden spike: '+prev.toFixed(2)+' → '+last.toFixed(2)});
        }
    }
    if(anomalies.length>0){
        logAnomaly(metricName,anomalies,value,mean,stddev);
    }
    return anomalies.length>0?anomalies:null;
}

function logAnomaly(metric,anomalies,value,mean,stddev){
    var panel=document.getElementById('anomaly-log');
    if(!panel)return;
    panel.style.display='block';
    var log=document.getElementById('anomaly-log-body');
    if(!log)return;
    anomalies.forEach(function(a){
        var cls=a.severity==='critical'?'anomaly-critical':'anomaly-warning';
        var icon=a.severity==='critical'?'🚨':'⚠️';
        var tr=document.createElement('tr');
        tr.className=cls;
        var time=new Date().toLocaleTimeString();
        tr.innerHTML='<td>'+time+'</td><td>'+icon+' '+a.type.toUpperCase()+'</td><td>'+a.message+'</td><td>'+value.toFixed(2)+'</td><td>'+mean.toFixed(2)+'</td><td>±'+stddev.toFixed(2)+'</td>';
        log.insertBefore(tr,log.firstChild);
        if(log.children.length>50)log.removeChild(log.lastChild);
    });
    db.collection('anomalies').add({metric:metric,anomalies:anomalies.map(function(a){return a.type;}),value:value,mean:mean,stddev:stddev,testId:currentTest?currentTest.id:'',userId:currentUser?currentUser.uid:'guest',createdAt:firebase.firestore.FieldValue.serverTimestamp()}).catch(function(){});
}

// ================================================================
// AGENCY / STANDARD SELECTOR
// ================================================================
var currentAgency='ASTM';
var agencyStandards={
    'ASTM':{
        'compaction':'D698 / D1557','cbr':'D1883','slump':'C143/C143M',
        'maturity':'C1074','marshall':'D6927','penetration':'D5','bitumen':'D2041'
    },
    'AASHTO':{
        'compaction':'T99 / T180','cbr':'T193','slump':'T119',
        'maturity':'','marshall':'T245','penetration':'T49','bitumen':'T228'
    },
    'BS':{
        'compaction':'1377 Part 4','cbr':'1377 Part 9','slump':'1881 Part 102',
        'maturity':'EN 12390','marshall':'EN 12697-34','penetration':'EN 1426','bitumen':'EN 12591'
    }
};

function setAgency(agency){
    currentAgency=agency;
    var el=document.getElementById('agency-display');
    if(el)el.textContent=agency;
    var std=agencyStandards[agency];
    if(!std)return;
    var testType=currentTest?currentTest.type:'compaction';
    var stdCode=std[testType]||'';
    var stdEl=document.getElementById('standard-code-display');
    if(stdEl&&stdCode)stdEl.textContent=agency+' '+stdCode;
}

function updateAgencyDisplay(){
    if(!currentTest)return;
    var std=agencyStandards[currentAgency];
    if(!std)return;
    var stdCode=std[currentTest.type]||'';
    var stdEl=document.getElementById('standard-code-display');
    if(stdEl&&stdCode)stdEl.textContent=currentAgency+' '+stdCode;
}

// ================================================================
// ARRHENIUS MATURITY FUNCTION (Enhanced)
// ================================================================
var arrheniusData={};
function calculateArrheniusMaturity(temperatures,t0){
    if(!temperatures||temperatures.length<2)return 0;
    t0=t0||-10;
    var totalM=0;
    for(var i=1;i<temperatures.length;i++){
        var dt=0.25;
        var T=(temperatures[i]+temperatures[i-1])/2;
        totalM+=(T-t0)*dt;
    }
    return totalM;
}
function estimateStrengthFromMaturity(M,a,b){
    a=a||30;b=b||0.02;
    return a*(1-Math.exp(-b*M));
}
