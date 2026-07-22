// ================================================================
// SERIAL / CONNECTION
// ================================================================
function onConnTypeChange() {
    var sel = document.getElementById('com-port-select').value;
    connType = sel;
    document.getElementById('lan-config').style.display = sel === 'lan' ? 'block' : 'none';
    document.getElementById('bt-config').style.display = sel === 'bluetooth' ? 'block' : 'none';
    document.getElementById('manual-config').style.display = sel === 'manual' ? 'block' : 'none';
    document.getElementById('conn-status-area').style.display = (sel === 'lan' || sel === 'bluetooth') ? 'none' : 'block';
    document.getElementById('btn-manual-strike').style.display = 'none';
    if (sel === 'manual') {
        document.getElementById('conn-status-area').style.display = 'none';
    }
}

function serialLog(text,type){var con=document.getElementById('serial-console');if(con.style.display==='none')con.style.display='block';var now=new Date().toLocaleTimeString('en-US');var cls=type==='rx'?'rx':(type==='tx'?'tx':'');con.innerHTML+='<div class="serial-line"><span class="ts">['+now+']</span> <span class="'+cls+'">'+text+'</span></div>';con.scrollTop=con.scrollHeight;}

async function connectSerial(){
    if(!navigator.serial){
        var msg = currentLang === 'ar' ? 'البروزر لا يدعم Web Serial' : 'Web Serial not supported in this browser';
        document.getElementById('serial-text').textContent = msg;
        return false;
    }
    try{
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({baudRate:9600});
        document.getElementById('serial-dot').className = 'status-dot connected';
        var msg = currentLang === 'ar' ? 'متصل' : 'Connected';
        document.getElementById('serial-text').textContent = msg;
        serialLog('Port opened','tx');
        return true;
    }catch(e){
        document.getElementById('serial-text').textContent = 'Failed: ' + e.message;
        return false;
    }
}

async function connectLAN() {
    var ip = document.getElementById('lan-ip-input').value.trim();
    var port = document.getElementById('lan-port-input').value || '80';
    if (!ip) {
        var msg = currentLang === 'ar' ? 'أدخل عنوان IP' : 'Enter device IP address';
        alert(msg);
        return false;
    }
    var dot = document.getElementById('lan-dot');
    var txt = document.getElementById('lan-status-text');
    dot.className = 'status-dot scanning';
    txt.textContent = currentLang === 'ar' ? 'جاري الاتصال...' : 'Connecting...';
    try {
        var wsUrl = 'ws://' + ip + ':' + port + '/smartlap';
        lanSocket = new WebSocket(wsUrl);
        return new Promise(function(resolve) {
            lanSocket.onopen = function() {
                dot.className = 'status-dot connected';
                txt.textContent = currentLang === 'ar' ? 'متصل بـ ' + ip : 'Connected to ' + ip;
                serialLog('LAN connected: ' + ip + ':' + port, 'tx');
                resolve(true);
            };
            lanSocket.onmessage = function(evt) {
                var line = evt.data.trim();
                if (line) handleSerialLine(line);
            };
            lanSocket.onerror = function() {
                dot.className = 'status-dot disconnected';
                txt.textContent = currentLang === 'ar' ? 'خطأ في الاتصال' : 'Connection failed';
                resolve(false);
            };
            lanSocket.onclose = function() {
                dot.className = 'status-dot disconnected';
                txt.textContent = currentLang === 'ar' ? 'تم إغلاق الاتصال' : 'Disconnected';
            };
            setTimeout(function() {
                if (dot.className.indexOf('scanning') !== -1) {
                    dot.className = 'status-dot disconnected';
                    txt.textContent = currentLang === 'ar' ? 'انتهت مهلة الاتصال' : 'Connection timeout';
                    lanSocket.close();
                    resolve(false);
                }
            }, 5000);
        });
    } catch(e) {
        dot.className = 'status-dot disconnected';
        txt.textContent = 'Error: ' + e.message;
        return false;
    }
}

async function connectBluetooth() {
    var dot = document.getElementById('bt-dot');
    var txt = document.getElementById('bt-status-text');
    if (!navigator.bluetooth) {
        var msg = currentLang === 'ar' ? 'البروزر لا يدعم Bluetooth' : 'Web Bluetooth not supported';
        txt.textContent = msg;
        return false;
    }
    try {
        dot.className = 'status-dot scanning';
        txt.textContent = currentLang === 'ar' ? 'جاري البحث...' : 'Scanning...';
        btDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
        });
        txt.textContent = currentLang === 'ar' ? 'جاري الاتصال...' : 'Connecting...';
        var server = await btDevice.gatt.connect();
        var service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        btCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        await btCharacteristic.startNotifications();
        btCharacteristic.addEventListener('characteristicvaluechanged', function(event) {
            var decoder = new TextDecoder();
            var text = decoder.decode(event.target.value);
            var lines = text.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line) handleSerialLine(line);
            }
        });
        dot.className = 'status-dot connected';
        txt.textContent = btDevice.name || (currentLang === 'ar' ? 'متصل بالبلوتوث' : 'BT Connected');
        serialLog('Bluetooth connected: ' + (btDevice.name || 'device'), 'tx');
        return true;
    } catch(e) {
        dot.className = 'status-dot disconnected';
        txt.textContent = e.name === 'NotFoundError' 
            ? (currentLang === 'ar' ? 'لم يتم اختيار جهاز' : 'No device selected')
            : 'Error: ' + e.message;
        return false;
    }
}

function submitManualStrike() {
    if (!isTesting) return;
    var m = parseFloat(document.getElementById('manual-moisture').value);
    var f = parseFloat(document.getElementById('manual-force').value);
    if (isNaN(m) || isNaN(f)) {
        var msg = currentLang === 'ar' ? 'أدخل الرطوبة والقوة' : 'Enter moisture and force values';
        alert(msg);
        return;
    }
    processStrike(m, f);
    document.getElementById('manual-moisture').value = '';
    document.getElementById('manual-force').value = '';
    document.getElementById('manual-moisture').focus();
}

function sendLanCommand(cmd) {
    if (lanSocket && lanSocket.readyState === WebSocket.OPEN) {
        lanSocket.send(cmd);
        serialLog('→ ' + cmd, 'tx');
    }
}
function sendBtCommand(cmd) {
    if (btCharacteristic) {
        var enc = new TextEncoder();
        btCharacteristic.writeValue(enc.encode(cmd + '\n'));
        serialLog('→ ' + cmd, 'tx');
    }
}

async function startSerialStream(){if(!serialPort||!serialPort.readable)return;serialKeepReading=true;var decoder=new TextDecoder();var buffer='';while(serialPort.readable&&serialKeepReading){try{serialReader=serialPort.readable.getReader();while(serialKeepReading){var{value,done}=await serialReader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop();for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(line)handleSerialLine(line);}}}catch(e){if(serialKeepReading)serialLog('Error: '+e.message,'rx');}finally{try{if(serialReader)serialReader.releaseLock();}catch(e){console.error('Serial reader release error:',e);}}}}
function handleSerialLine(line){serialLog('← '+line,'rx');if(line.indexOf('SmartLAP:READY')===0){serialLog('Arduino ready','tx');return;}if(line.indexOf('SmartLAP:TARED')===0){serialLog('Tared','tx');return;}var parts=line.split(',');if(parts.length>=2){var v1=parseFloat(parts[0]),v2=parseFloat(parts[1]);if(isNaN(v1)||isNaN(v2))return;if(!isTesting)return;if(currentTest&&currentTest.type==='cbr'){processCBRReading(v1,v2);}else if(currentTest&&currentTest.type==='straightedge'){var v3=parts.length>=3?parseFloat(parts[2]):0;processSEReading(v1,v2,v3);}else if(currentTest&&currentTest.type==='maturity'){processMatSerial(v1);}else if(currentTest&&currentTest.type==='marshall'){var v3=parts.length>=3?parseFloat(parts[2]):0;var v4=parts.length>=4?parseFloat(parts[3]):v1;processMarReading(v2,v1,v3,v4);}else if(currentTest&&currentTest.type==='slump'){processSlumpSerial(v1);}else if(currentTest&&currentTest.type==='bitumen'){var v3=parts.length>=3?parseFloat(parts[2]):0;processBitSerial(v1,v2,v3);}else if(currentTest&&currentTest.type==='penetration'){processPenSerial(v1);}else{processStrike(v1,v2);}}}
function processSlumpSerial(dist){var h=parseFloat(document.getElementById('slump_inp_height').value)||305;var slump=Math.round(h-dist);document.getElementById('slump-val-dist').textContent=dist;document.getElementById('slump-val-slump').textContent=slump;var tol=parseFloat(document.getElementById('slump_inp_tolerance').value)||25;var target=parseFloat(document.getElementById('slump_inp_target').value)||100;var dev=Math.abs(slump-target);document.getElementById('slump-val-dev').textContent=dev;var ok=dev<=tol;document.getElementById('slump-val-status').textContent=ok?'✅ PASS':'❌ FAIL';document.getElementById('slump-results-panel').style.display='block';document.getElementById('slump-results-body').innerHTML='<div class="result-status '+(ok?'pass':'fail')+'">'+(ok?'✅':'❌')+' '+(ok?'PASS':'FAIL')+'</div><div class="result-row"><span class="result-label">Slump Value</span><span class="result-value">'+slump+' mm</span></div><div class="result-row"><span class="result-label">Target</span><span class="result-value">'+target+' mm</span></div><div class="result-row"><span class="result-label">Deviation</span><span class="result-value">'+dev+' mm</span></div><div class="result-row"><span class="result-label">Tolerance</span><span class="result-value">±'+tol+' mm</span></div>';}
function processMatSerial(tempC){var now=Date.now();if(!window._matStartTime)window._matStartTime=now;var hours=Math.round(((now-window._matStartTime)/3600000)*100)/100;if(hours<0.01)hours=0.25;var totalMat=(window._matTotalMat||0)+tempC*0.25;window._matTotalMat=totalMat;var strength=Math.round(30*(1-Math.exp(-0.02*totalMat))*100)/100;var target=parseFloat(document.getElementById('mat_inp_target').value)||30;var pct=Math.round(strength/target*100);document.getElementById('mat-val-temp').textContent=tempC+'°C';document.getElementById('mat-val-maturity').textContent=Math.round(totalMat);document.getElementById('mat-val-strength').textContent=strength;document.getElementById('mat-val-time').textContent=hours;processMatReading(hours,tempC,totalMat,strength,pct);}
function processBitSerial(lux,trans,purity){var pass=purity>=80;document.getElementById('bit-val-light').textContent=lux.toFixed(0);document.getElementById('bit-val-trans').textContent=trans.toFixed(2);document.getElementById('bit-val-purity').textContent=purity;document.getElementById('bit-val-status').textContent=pass?'✅ PASS':'❌ FAIL';document.getElementById('bit-val-status').style.color=pass?'#16a34a':'#ef4444';}
function stopSerial(){serialKeepReading=false;if(serialReader){try{serialReader.releaseLock();}catch(e){console.error('Serial release error:',e);}}}
async function sendSerialCommand(cmd){if(!serialPort||!serialPort.writable)return;try{var w=serialPort.writable.getWriter();var e=new TextEncoder();await w.write(e.encode(cmd+'\n'));w.releaseLock();serialLog('→ '+cmd,'tx');}catch(e){serialLog('Send error: '+e.message,'rx');}}
function sendHardwareCommand(cmd) {
    if (connType === 'browser-serial') sendSerialCommand(cmd);
    else if (connType === 'lan') sendLanCommand(cmd);
    else if (connType === 'bluetooth') sendBtCommand(cmd);
}
function stopAllConnections() {
    stopSerial();
    if (lanSocket) { try { lanSocket.close(); } catch(e){console.error('LAN socket close error:',e);} lanSocket = null; }
    if (btDevice && btDevice.gatt.connected) { try { btDevice.gatt.disconnect(); } catch(e){console.error('BT disconnect error:',e);} }
    btDevice = null; btCharacteristic = null;
}
