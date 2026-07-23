# Direct Shear Test Module — Implementation Checklist

- [x] Plan approved
- [x] 1. CREATE `js/direct_shear.js` — brand new module (compaction.js formatting)
- [x] 2. EDIT `js/serial.js` — add `processDSReading()` routing in `handleSerialLine()`
- [x] 3. EDIT `js/navigation.js` — add `openDirectShear()` dispatch in `openTest()` + seed data
- [x] 4. EDIT `index.html` — add `#screen-direct_shear` HTML markup + script tag

## ESP32 Firmware (provided in chat)
- [ ] Provide complete Arduino C++ firmware code for:
  - 1 Load Cell (HX711)
  - 2 LVDT Displacement Sensors
  - JSON packet streaming via Web Serial API

