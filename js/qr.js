// ================================================================
// QR SPECIMEN TRACKING
// ================================================================
var qrSpecimens=[];

function openQRTracking(){
    qrSpecimens=[];
    var overlay=document.getElementById('qr-tracking-modal');
    if(!overlay)return;
    loadQRList();
}

function createQRSpecimen(){
    var sampleId=document.getElementById('qr-sample-id')?document.getElementById('qr-sample-id').value.trim():'SP-'+Date.now();
    var testType=document.getElementById('qr-test-type')?document.getElementById('qr-test-type').value:'compaction';
    var castDate=document.getElementById('qr-cast-date')?document.getElementById('qr-cast-date').value:new Date().toISOString().slice(0,10);
    var grade=document.getElementById('qr-grade')?document.getElementById('qr-grade').value:'';
    var specimen={id:'QR-'+Date.now(),sampleId:sampleId,testType:testType,castDate:castDate,grade:grade,status:'created',createdAt:new Date().toISOString(),createdBy:currentUser?currentUser.uid:'guest'};
    qrSpecimens.push(specimen);
    db.collection('qr_specimens').add(specimen).then(function(docRef){
        specimen.firestoreId=docRef.id;
        addQRToTable(specimen);
        generateQRCode(specimen);
    }).catch(function(e){
        addQRToTable(specimen);
    });
}

function generateQRCode(specimen){
    var qrData='SmartLab:'+specimen.id+'|Sample:'+specimen.sampleId+'|Type:'+specimen.testType+'|Date:'+specimen.castDate;
    var container=document.getElementById('qr-code-display');
    if(!container){return;}
    container.innerHTML='';
    var img=document.createElement('img');
    img.src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+encodeURIComponent(qrData);
    img.alt='QR Code - '+specimen.sampleId;
    img.style.border='8px solid white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
    var label=document.createElement('p');
    label.style.cssText='font-weight:700;margin-top:8px;color:var(--text);';
    label.textContent=specimen.sampleId+' ('+specimen.testType+')';
    container.appendChild(img);
    container.appendChild(label);
}

function addQRToTable(specimen){
    var tbody=document.getElementById('qr-list-body');
    if(!tbody)return;
    var tr=document.createElement('tr');
    var statusColors={'created':'#f59e0b','tested':'#16a34a','archived':'#64748b'};
    tr.innerHTML='<td style="font-weight:600;">'+specimen.sampleId+'</td><td>'+specimen.testType+'</td><td>'+specimen.castDate+'</td><td><span style="color:'+(statusColors[specimen.status]||'#64748b')+';font-weight:600;">'+specimen.status+'</span></td><td><button onclick="generateQRCode(qrSpecimens.find(function(s){return s.id==='+JSON.stringify(specimen.id)+';}))" style="background:var(--primary);color:white;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;">Print QR</button></td>';
    tbody.appendChild(tr);
}

async function loadQRList(){
    try{
        var snap=await db.collection('qr_specimens').get();
        var tbody=document.getElementById('qr-list-body');
        if(!tbody||snap.empty)return;
        tbody.innerHTML='';
        var rows=[];snap.forEach(function(doc){var s=doc.data();s.firestoreId=doc.id;rows.push(s);});
        rows.sort(function(a,b){return (b.createdAt&&b.createdAt.seconds||0)-(a.createdAt&&a.createdAt.seconds||0);});
        rows.slice(0,50).forEach(function(s){qrSpecimens.push(s);addQRToTable(s);});
    }catch(e){console.error('loadQRList error:',e);showToast('Failed to load specimens: '+e.message,'error');}
}

// ================================================================
// BREAK SCHEDULE GENERATOR
// ================================================================
var breakSchedule=[];

function generateBreakSchedule(){
    var castDate=document.getElementById('bs-cast-date')?document.getElementById('bs-cast-date').value:'';
    var concreteGrade=document.getElementById('bs-concrete-grade')?document.getElementById('bs-concrete-grade').value:'C30';
    var mixId=document.getElementById('bs-mix-id')?document.getElementById('bs-mix-id').value:'MIX-001';
    if(!castDate){alert('Enter cast date');return;}
    var cast=new Date(castDate+'T00:00:00');
    var breaks=[
        {age:'1 day',days:1,specimen:'Cylinder 150x300'},
        {age:'3 days',days:3,specimen:'Cylinder 150x300'},
        {age:'7 days',days:7,specimen:'Cylinder 150x300'},
        {age:'14 days',days:14,specimen:'Cylinder 150x300'},
        {age:'28 days',days:28,specimen:'Cylinder 150x300'},
        {age:'56 days',days:56,specimen:'Cylinder 150x300'},
        {age:'90 days',days:90,specimen:'Cylinder 150x300'}
    ];
    breakSchedule=[];
    var tbody=document.getElementById('bs-schedule-body');
    if(!tbody)return;
    tbody.innerHTML='';
    var today=new Date();
    breaks.forEach(function(b){
        var breakDate=new Date(cast);
        breakDate.setDate(breakDate.getDate()+b.days);
        var daysUntil=Math.ceil((breakDate-today)/(1000*60*60*24));
        var isPast=daysUntil<0;
        var isDue=daysUntil===0;
        var status=isPast?'done':(isDue?'due':'pending');
        var row={age:b.age,days:b.days,date:breakDate.toISOString().slice(0,10),specimen:b.specimen,mixId:mixId,grade:concreteGrade,status:status};
        breakSchedule.push(row);
        var tr=document.createElement('tr');
        var statusBadge=status==='done'?'<span style="color:#16a34a;font-weight:700;">✅ Done</span>':(status==='due'?'<span style="color:#f59e0b;font-weight:700;">⚠️ Due Today</span>':'<span style="color:#64748b;">⏳ '+daysUntil+' days</span>');
        tr.innerHTML='<td style="font-weight:600;">'+b.age+'</td><td>'+row.date+'</td><td>'+b.specimen+'</td><td>'+statusBadge+'</td>';
        tbody.appendChild(tr);
    });
    document.getElementById('bs-results-panel').style.display='block';

    db.collection('break_schedules').add({mixId:mixId,concreteGrade:concreteGrade,castDate:castDate,schedule:breakSchedule,userId:currentUser?currentUser.uid:'guest',createdAt:firebase.firestore.FieldValue.serverTimestamp()}).catch(function(){});
}

function loadBreakSchedules(){
    try{
        db.collection('break_schedules').where('userId','==',currentUser?currentUser.uid:'guest').get().then(function(snap){
            if(snap.empty)return;
            var tbody=document.getElementById('bs-history-body');
            if(!tbody)return;
            tbody.innerHTML='';
            var rows=[];snap.forEach(function(doc){var s=doc.data();rows.push(s);});
            rows.sort(function(a,b){return (b.createdAt&&b.createdAt.seconds||0)-(a.createdAt&&a.createdAt.seconds||0);});
            rows.slice(0,10).forEach(function(s){
                var tr=document.createElement('tr');
                tr.innerHTML='<td>'+s.mixId+'</td><td>'+s.concreteGrade+'</td><td>'+s.castDate+'</td><td>'+(s.schedule?s.schedule.length+' breaks':'--')+'</td>';
                tbody.appendChild(tr);
            });
        });
    }catch(e){console.error('loadBreakSchedules error:',e);showToast('Failed to load schedules: '+e.message,'error');}
}
