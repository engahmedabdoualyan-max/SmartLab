function generateCBRPDF(){
    if(cbrReadings.length===0)return;
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
    doc.setFontSize(20);doc.setFont(undefined,'bold');
    doc.text('SmartLab - CBR Test Report',105,18,{align:'center'});
    doc.setFontSize(11);doc.setFont(undefined,'normal');
    doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
    doc.line(15,30,195,30);
    var y=38;
    doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
    doc.setFont(undefined,'normal');
    doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
    doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
    doc.text('Piston Area: '+document.getElementById('cbr_inp_piston_area').value+' mm²',195,y,{align:'right'});y+=8;
    doc.line(15,y,195,y);y+=6;
    doc.setFont(undefined,'bold');doc.text('Penetration Data',195,y,{align:'right'});y+=6;
    var hdrs=['#','Pen. mm','Load N','Press. kPa','CBR %'];var cx=[195,170,150,130,110];
    doc.setFontSize(8);for(var h=0;h<hdrs.length;h++)doc.text(hdrs[h],cx[h],y,{align:'right'});
    y+=1;doc.line(15,y,195,y);y+=4;
    doc.setFont(undefined,'normal');
    for(var i=0;i<cbrReadings.length;i++){
        var r=cbrReadings[i];
        doc.text(String(r.index),cx[0],y,{align:'right'});
        doc.text(String(r.penetration),cx[1],y,{align:'right'});
        doc.text(String(r.load),cx[2],y,{align:'right'});
        doc.text(String(r.pressure),cx[3],y,{align:'right'});
        doc.text(String(r.cbr),cx[4],y,{align:'right'});
        y+=4;if(y>270){doc.addPage();y=20;}
    }
    y+=4;doc.line(15,y,195,y);y+=6;
    doc.setFontSize(11);doc.setFont(undefined,'bold');doc.text('Final Results',195,y,{align:'right'});y+=6;
    doc.setFont(undefined,'normal');
    doc.text('CBR Value: '+document.getElementById('cbr-val-ratio').textContent,195,y,{align:'right'});y+=5;
    doc.text('Max Load: '+document.getElementById('cbr-val-load').textContent+' N',195,y,{align:'right'});y+=5;
    doc.text('Max Penetration: '+document.getElementById('cbr-val-pen').textContent+' mm',195,y,{align:'right'});
    doc.setFontSize(7);doc.setTextColor(150);
    doc.text('Fimto Soft | info@fimtosoft.com | SmartLab v1.3.0',105,285,{align:'center'});
    doc.save('SmartLAP_CBR_'+new Date().toISOString().slice(0,10)+'.pdf');
}

// ================================================================
// PDF
// ================================================================
function generatePDF(){if(strikes.length===0)return;var jsPDF=window.jspdf.jsPDF;var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});doc.setFontSize(20);doc.setFont(undefined,'bold');doc.text('SmartLab - Compaction Test Report',105,18,{align:'center'});doc.setFontSize(11);doc.setFont(undefined,'normal');doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});doc.line(15,30,195,30);var y=38;doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;doc.setFont(undefined,'normal');doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;doc.text('Hammer: '+hammerWeight+' kg | Mold: '+moldVolume+' m3',195,y,{align:'right'});y+=5;doc.text('Target: '+targetStrikes+' strikes | Ratio: '+targetRatio+'%',195,y,{align:'right'});y+=8;doc.line(15,y,195,y);y+=6;doc.setFont(undefined,'bold');doc.text('Strike Data',195,y,{align:'right'});y+=6;var hdrs=['#','Moisture%','Force(N)','Wet Den.','Dry Den.','Time'];var cx=[195,175,155,135,115,95];doc.setFontSize(8);for(var h=0;h<hdrs.length;h++)doc.text(hdrs[h],cx[h],y,{align:'right'});y+=1;doc.line(15,y,195,y);y+=4;doc.setFont(undefined,'normal');for(var i=0;i<strikes.length;i++){var s=strikes[i];doc.text(String(s.index),cx[0],y,{align:'right'});doc.text(String(s.moisture),cx[1],y,{align:'right'});doc.text(String(s.force),cx[2],y,{align:'right'});doc.text(String(s.wetDensity),cx[3],y,{align:'right'});doc.text(String(s.dryDensity),cx[4],y,{align:'right'});doc.text(s.time,cx[5],y,{align:'right'});y+=4;if(y>270){doc.addPage();y=20;}}y+=4;doc.line(15,y,195,y);y+=6;doc.setFontSize(11);doc.setFont(undefined,'bold');doc.text('Final Results',195,y,{align:'right'});y+=6;doc.setFont(undefined,'normal');var rl=['Strikes','Max Dry Density','Optimum Moisture%','Avg Moisture%','Avg Force(N)','Max Force(N)','Reference Density','Compaction Ratio%','Status'];var rv=[strikes.length,strikes[strikes.length-1].dryDensity,strikes[strikes.length-1].moisture,Math.round(tm()*100)/100,Math.round(tf()/strikes.length*100)/100,mf(),Math.round((parseFloat(document.getElementById('inp_ref_weight').value)||0)/moldVolume*100)/100,results_compRatio(),results_compRatio()>=targetRatio?'PASS':'FAIL'];for(var r=0;r<rl.length;r++){doc.text(rl[r]+': '+rv[r],195,y,{align:'right'});y+=5;}doc.setFontSize(7);doc.setTextColor(150);doc.text('Fimto Soft | info@fimtosoft.com | SmartLab v1.3.0',105,285,{align:'center'});doc.save('SmartLAP_Report_'+new Date().toISOString().slice(0,10)+'.pdf');function tm(){var s=0;for(var i=0;i<strikes.length;i++)s+=strikes[i].moisture;return s/strikes.length;}function tf(){var s=0;for(var i=0;i<strikes.length;i++)s+=strikes[i].force;return s;}function mf(){var m=0;for(var i=0;i<strikes.length;i++)if(strikes[i].force>m)m=strikes[i].force;return m;}function results_compRatio(){var rw=parseFloat(document.getElementById('inp_ref_weight').value)||0;var rd=rw>0?rw/moldVolume:0;var mdd=0;for(var i=0;i<strikes.length;i++)if(strikes[i].dryDensity>mdd)mdd=strikes[i].dryDensity;return rd>0?Math.round(mdd/rd*100*100)/100:0;}}
function generateCompPDF(){
    if(!compState.peakStress)return;
    try{var jsPDF=window.jspdf.jsPDF;var doc=new jsPDF();
    doc.setFontSize(18);doc.text('SmartLAP — Compressive Strength Report',20,20);
    doc.setFontSize(10);doc.text('Generated: '+new Date().toLocaleString(),20,28);
    doc.setFontSize(12);doc.text('Sample: '+(document.getElementById('comp-sample-id').value||'N/A'),20,40);
    doc.text('Specimen: '+document.getElementById('comp-specimen-type').value,20,48);
    doc.text('Age: '+document.getElementById('comp-age').value+' days',20,56);
    doc.text('Peak Force: '+compState.peakForce.toFixed(1)+' kN',20,64);
    doc.text('Compressive Strength: '+compState.peakStress.toFixed(1)+' MPa',20,72);
    doc.text('Status: '+(compState.peakStress>=25?'PASS':'FAIL'),20,80);
    doc.setFontSize(8);doc.text('SmartLab v1.3.0 — Fimto Soft',20,280);
    doc.save('Compressive_Strength_Report.pdf');}catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Slump Test
// ================================================================
function generateSlumpPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Slump Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Standard: '+(document.getElementById('agency-select-slump').value||'ASTM')+' C143',195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Parameters',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Cone Height: '+document.getElementById('slump_inp_height').value+' mm',195,y,{align:'right'});y+=5;
        doc.text('Target Slump: '+document.getElementById('slump_inp_target').value+' mm',195,y,{align:'right'});y+=5;
        doc.text('Tolerance: +/- '+document.getElementById('slump_inp_tolerance').value+' mm',195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Slump Value: '+document.getElementById('slump-val-slump').textContent+' mm',195,y,{align:'right'});y+=5;
        doc.text('Deviation: '+document.getElementById('slump-val-dev').textContent+' mm',195,y,{align:'right'});y+=5;
        doc.text('Status: '+document.getElementById('slump-val-status').textContent,195,y,{align:'right'});y+=10;
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Slump_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Maturity Test
// ================================================================
function generateMatPDF(){
    if(matReadings.length===0)return;
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Maturity Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Mix ID: '+document.getElementById('mat_inp_mixid').value,195,y,{align:'right'});y+=5;
        doc.text('Cement: '+document.getElementById('mat_inp_cement').value+' | W/C: '+document.getElementById('mat_inp_wcr').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Readings Log',195,y,{align:'right'});y+=6;
        var hdrs=['#','Time(h)','Temp(C)','Maturity','Strength(MPa)'];var cx=[195,170,150,130,110];
        doc.setFontSize(8);for(var h=0;h<hdrs.length;h++)doc.text(hdrs[h],cx[h],y,{align:'right'});
        y+=1;doc.line(15,y,195,y);y+=4;
        doc.setFont(undefined,'normal');
        for(var i=0;i<matReadings.length;i++){
            var r=matReadings[i];
            doc.text(String(r.index),cx[0],y,{align:'right'});
            doc.text(String(r.hours),cx[1],y,{align:'right'});
            doc.text(String(r.temp),cx[2],y,{align:'right'});
            doc.text(String(r.maturity),cx[3],y,{align:'right'});
            doc.text(String(r.strength),cx[4],y,{align:'right'});
            y+=4;if(y>270){doc.addPage();y=20;}
        }
        y+=4;doc.line(15,y,195,y);y+=6;
        doc.setFontSize(11);doc.setFont(undefined,'bold');doc.text('Final Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        var last=matReadings[matReadings.length-1];
        doc.text('Final Strength: '+last.strength+' MPa',195,y,{align:'right'});y+=5;
        doc.text('Max Maturity: '+last.maturity+' C*h',195,y,{align:'right'});y+=5;
        doc.text('Target: '+document.getElementById('mat_inp_target').value+' MPa',195,y,{align:'right'});y+=5;
        doc.text('Elapsed: '+last.hours+' hours',195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Maturity_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Marshall Test
// ================================================================
function generateMarPDF(){
    if(marData.length===0)return;
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Marshall Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Specimen #'+document.getElementById('mar_inp_specimen').value,195,y,{align:'right'});y+=5;
        doc.text('Dia: '+document.getElementById('mar_inp_diameter').value+' mm | Ht: '+document.getElementById('mar_inp_height').value+' mm',195,y,{align:'right'});y+=5;
        doc.text('Rate: '+document.getElementById('mar_inp_rate').value+' mm/min',195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        var maxLoad=Math.max.apply(null,marData.map(function(r){return r.load;}));
        var flowAtMax=marData[marData.length-1].flow;
        var stab=Math.round(maxLoad*0.92);
        doc.text('Stability: '+stab+' N',195,y,{align:'right'});y+=5;
        doc.text('Flow: '+flowAtMax+' x 0.25mm',195,y,{align:'right'});y+=5;
        doc.text('Max Load: '+maxLoad.toFixed(0)+' N',195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Marshall_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Bitumen Test
// ================================================================
function generateBitPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Bitumen Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Sample ID: '+document.getElementById('bit_inp_sampleid').value,195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('bit_inp_grade').value,195,y,{align:'right'});y+=5;
        doc.text('Solvent Ratio: '+document.getElementById('bit_inp_solvent').value+'%',195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Light Intensity: '+document.getElementById('bit-val-light').textContent+' lux',195,y,{align:'right'});y+=5;
        doc.text('Transmission: '+document.getElementById('bit-val-trans').textContent+'%',195,y,{align:'right'});y+=5;
        doc.text('Purity Index: '+document.getElementById('bit-val-purity').textContent+'/100',195,y,{align:'right'});y+=5;
        doc.text('Status: '+document.getElementById('bit-val-status').textContent,195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Bitumen_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Penetration Test
// ================================================================
function generatePenPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Penetration Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Sample ID: '+document.getElementById('pen_inp_sampleid').value,195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('pen_inp_grade').value,195,y,{align:'right'});y+=5;
        doc.text('Temperature: '+document.getElementById('pen_inp_temp').value+' C',195,y,{align:'right'});y+=5;
        doc.text('Needle Load: '+document.getElementById('pen_inp_load').value+' g',195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Penetration: '+document.getElementById('pen-val-pen').textContent+' x 0.1mm',195,y,{align:'right'});y+=5;
        doc.text('Status: '+document.getElementById('pen-val-status').textContent,195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Penetration_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Atterberg Limits
// ================================================================
function generateAtterbergPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Atterberg Limits Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Sample ID: '+document.getElementById('atterberg-sample-id').value,195,y,{align:'right'});y+=5;
        doc.text('Soil Type: '+document.getElementById('atterberg-soil-type').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Readings Log',195,y,{align:'right'});y+=6;
        var hdrs=['#','Blows','Moisture%','Mode'];var cx=[195,170,150,130];
        doc.setFontSize(8);for(var h=0;h<hdrs.length;h++)doc.text(hdrs[h],cx[h],y,{align:'right'});
        y+=1;doc.line(15,y,195,y);y+=4;
        doc.setFont(undefined,'normal');
        for(var i=0;i<atterbergState.readings.length;i++){
            var r=atterbergState.readings[i];
            doc.text(String(i+1),cx[0],y,{align:'right'});
            doc.text(String(r.blows),cx[1],y,{align:'right'});
            doc.text(String(r.moisture.toFixed(1)),cx[2],y,{align:'right'});
            doc.text(r.mode,cx[3],y,{align:'right'});
            y+=4;if(y>270){doc.addPage();y=20;}
        }
        y+=4;doc.line(15,y,195,y);y+=6;
        doc.setFontSize(11);doc.setFont(undefined,'bold');doc.text('Final Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Liquid Limit (LL): '+atterbergState.ll.toFixed(1)+'%',195,y,{align:'right'});y+=5;
        doc.text('Plastic Limit (PL): '+atterbergState.pl.toFixed(1)+'%',195,y,{align:'right'});y+=5;
        doc.text('Plasticity Index (PI): '+atterbergState.pi.toFixed(1),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Atterberg_Limits_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Sieve Analysis
// ================================================================
function generateSievePDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Sieve Analysis Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Sample ID: '+document.getElementById('sieve-sample-id').value,195,y,{align:'right'});y+=5;
        doc.text('Total Mass: '+document.getElementById('sieve-total-mass').value+' g',195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('sieve-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Sieve Data',195,y,{align:'right'});y+=6;
        var hdrs=['Sieve(mm)','Mass(g)','%Retained','%Passing'];var cx=[195,170,150,130];
        doc.setFontSize(8);for(var h=0;h<hdrs.length;h++)doc.text(hdrs[h],cx[h],y,{align:'right'});
        y+=1;doc.line(15,y,195,y);y+=4;
        doc.setFont(undefined,'normal');
        var inputs=document.querySelectorAll('.sieve-mass');
        var retCells=document.querySelectorAll('.sieve-pct-ret');
        var passCells=document.querySelectorAll('.sieve-pct-pass');
        var sizes=['75.0','37.5','19.0','9.5','4.75','2.36','1.18','0.600','0.300','0.150','0.075'];
        for(var i=0;i<inputs.length&&i<sizes.length;i++){
            doc.text(sizes[i],cx[0],y,{align:'right'});
            doc.text(inputs[i].value,cx[1],y,{align:'right'});
            doc.text(retCells[i]?retCells[i].textContent:'0',cx[2],y,{align:'right'});
            doc.text(passCells[i]?passCells[i].textContent:'100',cx[3],y,{align:'right'});
            y+=4;if(y>270){doc.addPage();y=20;}
        }
        y+=4;doc.line(15,y,195,y);y+=6;
        doc.setFontSize(11);doc.setFont(undefined,'bold');doc.text('Classification',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        var resultsBody=document.getElementById('sieve-results-body');
        if(resultsBody){
            var rows=resultsBody.querySelectorAll('.result-row');
            for(var j=0;j<rows.length;j++){
                var label=rows[j].querySelector('.result-label');
                var value=rows[j].querySelector('.result-value');
                if(label&&value){doc.text(label.textContent+': '+value.textContent,195,y,{align:'right'});y+=5;}
            }
        }
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Sieve_Analysis_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Ductility Test
// ================================================================
function generateDuctPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Ductility Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Sample ID: '+document.getElementById('duct-sample-id').value,195,y,{align:'right'});y+=5;
        doc.text('Grade: '+document.getElementById('duct-grade').value,195,y,{align:'right'});y+=5;
        doc.text('Temperature: '+document.getElementById('duct-temp').value+' C',195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('duct-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        var ext=ductState.breakPoint||ductState.maxExtension;
        var pass=ext>=50;
        doc.text('Ductility: '+ext.toFixed(1)+' cm',195,y,{align:'right'});y+=5;
        doc.text('Status: '+(pass?'PASS':'FAIL'),195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Ductility_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Air Content Test
// ================================================================
function generateAirPDF(){
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Air Content Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Sample ID: '+document.getElementById('air-sample-id').value,195,y,{align:'right'});y+=5;
        doc.text('Method: '+document.getElementById('air-method').value,195,y,{align:'right'});y+=5;
        doc.text('Target: '+document.getElementById('air-target').value+'%',195,y,{align:'right'});y+=5;
        doc.text('Concrete Temp: '+document.getElementById('air-conc-temp').value+' C',195,y,{align:'right'});y+=5;
        doc.text('Standard: '+document.getElementById('air-standard').value,195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Air Content: '+document.getElementById('air-val-air').textContent+'%',195,y,{align:'right'});y+=5;
        doc.text('Pressure: '+document.getElementById('air-val-pressure').textContent+' psi',195,y,{align:'right'});y+=5;
        doc.text('Unit Weight: '+document.getElementById('air-val-uw').textContent+' kg/m3',195,y,{align:'right'});y+=5;
        doc.text('Status: '+document.getElementById('air-val-status').textContent,195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Air_Content_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
// ================================================================
// PDF — Straightedge Test
// ================================================================
function generateSEPDF(){
    if(seReadings.length===0)return;
    try{
        var jsPDF=window.jspdf.jsPDF;
        var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
        doc.setFontSize(20);doc.setFont(undefined,'bold');
        doc.text('SmartLab - Straightedge Test Report',105,18,{align:'center'});
        doc.setFontSize(11);doc.setFont(undefined,'normal');
        doc.text('Fimto Soft - Integrated Tech Solutions',105,26,{align:'center'});
        doc.line(15,30,195,30);
        var y=38;
        doc.setFont(undefined,'bold');doc.text('Test Information',195,y,{align:'right'});y+=7;
        doc.setFont(undefined,'normal');
        doc.text('Date: '+new Date().toLocaleString(),195,y,{align:'right'});y+=5;
        doc.text('Domain: '+(currentDomain?currentDomain.name:''),195,y,{align:'right'});y+=5;
        doc.text('Length: '+document.getElementById('se_inp_length').value+' m',195,y,{align:'right'});y+=5;
        doc.text('Tolerance: '+document.getElementById('se_inp_tolerance').value+' mm',195,y,{align:'right'});y+=5;
        doc.text('Interval: '+document.getElementById('se_inp_interval').value+' m',195,y,{align:'right'});y+=8;
        doc.line(15,y,195,y);y+=6;
        doc.setFont(undefined,'bold');doc.text('Readings Log',195,y,{align:'right'});y+=6;
        var hdrs=['#','Position(m)','Irreg(mm)','Inclination'];var cx=[195,170,150,130];
        doc.setFontSize(8);for(var h=0;h<hdrs.length;h++)doc.text(hdrs[h],cx[h],y,{align:'right'});
        y+=1;doc.line(15,y,195,y);y+=4;
        doc.setFont(undefined,'normal');
        for(var i=0;i<seReadings.length;i++){
            var r=seReadings[i];
            doc.text(String(r.index),cx[0],y,{align:'right'});
            doc.text(String(r.position),cx[1],y,{align:'right'});
            doc.text(String(r.irregularity),cx[2],y,{align:'right'});
            doc.text(String(r.inclination),cx[3],y,{align:'right'});
            y+=4;if(y>270){doc.addPage();y=20;}
        }
        y+=4;doc.line(15,y,195,y);y+=6;
        doc.setFontSize(11);doc.setFont(undefined,'bold');doc.text('Final Results',195,y,{align:'right'});y+=6;
        doc.setFont(undefined,'normal');
        doc.text('Status: '+document.getElementById('se-val-status').textContent,195,y,{align:'right'});y+=5;
        doc.text('Max Deviation: '+document.getElementById('se-val-maxdev').textContent+' mm',195,y,{align:'right'});
        doc.setFontSize(7);doc.setTextColor(150);
        doc.text('SmartLab v1.3.0 — Fimto Soft',105,285,{align:'center'});
        doc.save('Straightedge_Test_Report.pdf');
    }catch(e){alert('PDF error: '+e.message);}
}
