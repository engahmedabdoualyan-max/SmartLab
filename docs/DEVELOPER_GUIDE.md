# SmartLAP Developer Guide

> Contributing to SmartLAP — Dynamic Lab Automation System

## Architecture Overview

SmartLAP is a **client-side single-page application** with no backend server. All logic runs in the browser.

```
┌─────────────────────────────────────────────┐
│                  Browser (SPA)               │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ HTML/CSS │  │ JS Logic │  │ Service   │ │
│  │ (views)  │  │ (tests)  │  │ Worker    │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│        │             │              │        │
│  ┌─────▼─────────────▼──────────────▼─────┐ │
│  │          Firebase SDK (compat)          │ │
│  │    Auth  │  Firestore  │  Storage       │ │
│  └────────────────────────────────────────┘ │
│        │                                     │
│  ┌─────▼──────────────────────────────────┐ │
│  │     Hardware Layer                      │ │
│  │  Web Serial │ Web Bluetooth │ WebSocket │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
         │                    │
    ┌────▼────┐         ┌────▼────┐
    │ Arduino │         │ Firebase│
    │ (ESP32) │         │ Cloud   │
    └─────────┘         └─────────┘
```

**Key technologies:**
- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework)
- **Database:** Cloud Firestore (firebase 10.12.0 compat SDK)
- **Auth:** Firebase Authentication
- **Hardware:** Web Serial API, Web Bluetooth API, WebSocket
- **PDF:** jsPDF 2.5.1
- **Charts:** Chart.js 4.4.0
- **AI Chat:** Google Gemini 2.0 Flash API
- **PWA:** Service Worker + Web App Manifest
- **Hosting:** Vercel (static)

---

## Project Structure

```
smartLAP/
├── index.html                 # Single HTML file (all screens)
├── css/
│   └── style.css              # All styles (CSS variables, responsive)
├── js/
│   ├── firebase-config.js     # Firebase initialization
│   ├── auth.js                # Login, register, Google, guest auth
│   ├── navigation.js          # Screen routing, domain/test loading, AI team
│   ├── app.js                 # Statistics dashboard, service worker reg
│   ├── serial.js              # Web Serial, Bluetooth, WebSocket, commands
│   ├── compaction.js          # Proctor compaction test logic
│   ├── cbr.js                 # CBR test logic + chart
│   ├── slump.js               # Digital slump test
│   ├── maturity.js            # Concrete maturity test
│   ├── marshall.js            # Marshall stability test
│   ├── compressive.js         # Compressive strength test
│   ├── sieve.js               # Sieve analysis
│   ├── atterberg.js           # Atterberg limits
│   ├── bitumen.js             # Bitumen photo-tester
│   ├── penetration.js         # Penetration test
│   ├── ductility.js           # Ductility test
│   ├── air.js                 # Air content test
│   ├── straightedge.js        # Road roughness test
│   ├── pdf.js                 # PDF generation (all tests)
│   ├── qr.js                  # QR code / sample tracking
│   ├── ml.js                  # ML prediction engine
│   ├── analytics.js           # Anomaly detection, agency selector
│   ├── fab.js                 # Floating action button menu + modals
│   └── i18n.js                # 7-language internationalization
├── firmware/
│   ├── smartlap_compaction.ino
│   ├── smartlap_cbr.ino
│   ├── smartlap_slump.ino
│   ├── smartlap_maturity.ino
│   ├── smartlap_marshall.ino
│   ├── smartlap_bitumen.ino
│   └── smartlap_straightedge.ino
├── tests/
│   ├── calculations.test.js   # Unit tests for calculation functions
│   └── run.js                 # Node.js test runner
├── docs/                      # Documentation
├── sw.js                      # Service worker (offline caching)
├── manifest.json              # PWA manifest
├── offline.html               # Offline fallback page
├── 404.html                   # Custom 404 page
├── vercel.json                # Vercel deployment config
├── robots.txt                 # SEO
├── sitemap.xml                # SEO
└── README.md
```

---

## Development Setup

### Prerequisites

- **Chrome or Edge 89+** (for Web Serial API)
- **Node.js** (for running tests)
- A Firebase project (free tier works)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd smartLAP
   ```

2. **Serve locally** (any static server works):
   ```bash
   # Option A: Python
   python3 -m http.server 8000

   # Option B: Node
   npx serve .

   # Option C: PHP
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

4. **Configure Firebase:**
   - Edit `js/firebase-config.js` with your Firebase project credentials
   - Enable Authentication methods in Firebase Console
   - Set up Firestore security rules

### No Build Step

SmartLAP uses vanilla JavaScript with no transpilation, bundling, or build process. All files are served directly. CDN dependencies are loaded in `index.html`:

```html
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

---

## Code Style

### JavaScript Conventions

- **No framework:** Pure vanilla ES5-compatible JavaScript
- **Function declarations:** `function name() { ... }` and `async function name() { ... }`
- **Variable declarations:** `var` (not `let`/`const`) for broad compatibility
- **Naming:** camelCase for functions and variables
- **Globals:** Used for state (`currentDomain`, `currentTest`, `isTesting`, etc.)
- **String concatenation:** `+` operator (no template literals)
- **DOM manipulation:** `document.getElementById()`, `document.createElement()`
- **Async:** `async/await` for Firestore operations
- **Error handling:** `try/catch` with `showToast()` for user-facing errors

### Example Pattern

```javascript
async function loadHistory() {
    if (!currentTest) return;
    try {
        var snap = await db.collection('sessions')
            .where('testId', '==', currentTest.id).get();
        var tbody = document.getElementById('history-body');
        if (snap.empty) return;
        tbody.innerHTML = '';
        var rows = [];
        snap.forEach(function(doc) { rows.push(doc.data()); });
        rows.sort(function(a, b) {
            return (b.createdAt && b.createdAt.seconds || 0) -
                   (a.createdAt && a.createdAt.seconds || 0);
        });
        rows.slice(0, 10).forEach(function(s) {
            // render row...
        });
    } catch(e) {
        console.error('loadHistory error:', e);
        showToast('Failed to load history: ' + e.message, 'error');
    }
}
```

### HTML Conventions

- **Screens:** Each major view is a `<div id="screen-XXX" class="screen">`
- **i18n:** Use `data-i18n="key"` attributes for translatable text
- **Accessibility:** `role`, `aria-label`, `tabindex` on interactive elements
- **RTL support:** `body[data-dir="rtl"]` selectors

### CSS Conventions

- **CSS Variables:** Defined in `:root` for theming
- **BEM-like naming:** `.card-header`, `.result-row`, `.stat-card`
- **Responsive:** `@media(max-width:XXX)` breakpoints
- **RTL:** `body[data-dir="rtl"]` directional overrides

---

## Adding a New Test

### Step 1: Define the Test Type

Add the test to `seedDomains()` in `js/navigation.js`:

```javascript
tb.set(db.collection('tests').doc(), {
    name: 'My New Test',
    domainId: did,           // parent domain ID
    order: 7,                // sort order
    type: 'mynewtest',       // unique type key
    config: { inputs: [] }
});
```

### Step 2: Create the JavaScript Module

Create `js/mynewtest.js`:

```javascript
// ================================================================
// MY NEW TEST
// ================================================================
var myReadings = [], myIsTesting = false;

function openMyNewTest(test) {
    myReadings = [];
    myIsTesting = false;
    currentSessionId = null;
    showScreen('mynewtest');
    document.getElementById('mnt-page-title').textContent = test.name;
    // Reset UI elements...
}

async function startMyNewTest() {
    var conn = document.getElementById('mnt-com-port-select').value;
    if (!conn) { alert('Select connection first'); return; }
    myReadings = [];
    myIsTesting = true;
    // Update UI...
    if (conn === 'demo') {
        runMyNewTestDemo();
    } else {
        if (!serialPort) { var ok = await connectSerial(); if (!ok) return; }
        await sendSerialCommand('START');
        startSerialStream();
    }
}

function processMyNewReading(value1, value2) {
    if (!myIsTesting) return;
    var reading = { index: myReadings.length + 1, v1: value1, v2: value2, time: new Date().toLocaleTimeString() };
    myReadings.push(reading);
    // Update live display...
    // Update log table...
}

function calculateMyNewResults() {
    if (myReadings.length === 0) return;
    var results = {
        // computed values...
        status: passed ? 'PASS' : 'FAIL'
    };
    db.collection('sessions').add({
        testId: currentTest.id,
        domainId: currentDomain ? currentDomain.id : '',
        domainName: currentDomain ? currentDomain.name : '',
        testName: currentTest.name,
        readings: myReadings,
        results: results,
        userId: currentUser ? currentUser.uid : 'guest',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function(docRef) {
        currentSessionId = docRef.id;
        displayMyNewResults(results);
    });
}
```

### Step 3: Add HTML Screen

Add to `index.html`:

```html
<div id="screen-mynewtest" class="screen">
    <header class="app-header">
        <!-- standard header with back button -->
    </header>
    <main class="test-content fade-in">
        <h2 id="mnt-page-title">My New Test</h2>
        <!-- Connection selector, live data, log, results panels -->
    </main>
</div>
```

### Step 4: Route the Test

In `js/navigation.js`, add to `openTest()`:

```javascript
if (test.type === 'mynewtest') { openMyNewTest(test); return; }
```

### Step 5: Add Serial Handler

In `js/serial.js`, add to `handleSerialLine()`:

```javascript
} else if (currentTest && currentTest.type === 'mynewtest') {
    processMyNewReading(v1, v2);
}
```

### Step 6: Include the Script

Add to `index.html` before `</body>`:

```html
<script src="js/mynewtest.js"></script>
```

### Step 7: Add PDF Generation

Add to `js/pdf.js`:

```javascript
function generateMyNewTestPDF() {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    // Build PDF document...
    doc.save('SmartLAP_MyNewTest_' + new Date().toISOString().slice(0, 10) + '.pdf');
}
```

### Step 8: Add i18n Keys

Add translations to `js/i18n.js` for all 7 languages.

---

## Firmware Development

### Board Requirements

- **Arduino Uno/Nano** or **ESP32**
- **9600 baud** serial, 8N1 configuration
- Libraries depend on sensors used (HX711, OneWire, Wire, etc.)

### Firmware Template

Every SmartLAP firmware follows this pattern:

```cpp
#include "HX711.h"  // if using load cell

#define CALIBRATION_FACTOR 420.0

bool testing = false;

void setup() {
    Serial.begin(9600);
    // Initialize sensors...
    Serial.println("SmartLAP:READY");
}

void handleCommand(String cmd) {
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START")      { testing = true;  Serial.println("SmartLAP:STARTED"); }
    else if (cmd == "STOP")  { testing = false; Serial.println("SmartLAP:STOPPED"); }
    else if (cmd == "TARE")  { /* tare sensors */ Serial.println("SmartLAP:TARED"); }
    else if (cmd == "STATUS"){ Serial.println(testing ? "SmartLAP:TESTING" : "SmartLAP:IDLE"); }
}

void loop() {
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        handleCommand(cmd);
    }
    if (testing) {
        // Read sensors, output CSV
        Serial.print(value1, 2);
        Serial.print(",");
        Serial.println(value2, 2);
        delay(800);
    }
}
```

See `firmware/` directory for complete implementations.

---

## SmartLAP Protocol

The serial protocol between firmware and browser:

| Direction | Message | Meaning |
|---|---|---|
| Firmware → Browser | `SmartLAP:READY` | Device initialized, ready for commands |
| Browser → Firmware | `START\n` | Begin data streaming |
| Firmware → Browser | `SmartLAP:STARTED` | Streaming acknowledged |
| Browser → Firmware | `STOP\n` | Stop data streaming |
| Firmware → Browser | `SmartLAP:STOPPED` | Streaming stopped |
| Browser → Firmware | `TARE\n` | Zero the sensors |
| Firmware → Browser | `SmartLAP:TARED` | Tare complete |
| Browser → Firmware | `STATUS\n` | Query state |
| Firmware → Browser | `SmartLAP:TESTING` or `SmartLAP:IDLE` | Current state |
| Firmware → Browser | `value1,value2,...\n` | CSV sensor data |

See [FIRMWARE_PROTOCOL.md](./FIRMWARE_PROTOCOL.md) for complete specification.

---

## Testing

### Running Tests

```bash
node tests/run.js
```

### Test Structure

Tests are in `tests/calculations.test.js` using a custom lightweight framework:

```javascript
describe('Suite Name', function() {
    it('Test description', function() {
        var result = myFunction(input);
        assertClose(result, expected, tolerance);
    });
});
```

### Available Assertions

| Function | Description |
|---|---|
| `assertClose(actual, expected, tolerance)` | Approximate equality |
| `assertEqual(actual, expected)` | Strict equality |
| `assertTrue(val, msg)` | Truthy check |
| `assertFalse(val, msg)` | Falsy check |

### Test Coverage

Current test suites:
1. **Compaction Calculations** — Wet/dry density, compaction ratio
2. **CBR Calculations** — CBR at 2.5mm/5.0mm, pressure, final result
3. **Maturity Calculations** — Nurse-Saul, Arrhenius, strength estimation
4. **Compressive Strength** — Stress, area calculations
5. **Sieve Analysis** — Percent retained/passing, Cu, Cc
6. **Atterberg Limits** — PI, plasticity classification, USCS

---

## Deployment

### Vercel Configuration

`vercel.json` configures:

```json
{
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ],
    "headers": [
        {
            "source": "/(.*)",
            "headers": [
                { "key": "X-Content-Type-Options", "value": "nosniff" },
                { "key": "X-Frame-Options", "value": "DENY" },
                { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
            ]
        },
        {
            "source": "/css/(.*)",
            "headers": [
                { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
            ]
        }
    ]
}
```

### Deploy Steps

1. Push to GitHub repository
2. Connect repository to Vercel
3. Vercel auto-deploys on push to `main`
4. All routes rewrite to `index.html` (SPA routing)
5. CSS is cached aggressively (immutable)

### Service Worker

`sw.js` implements offline support:
- Caches app shell (`index.html`, `style.css`, `manifest.json`)
- Caches CDN assets (Firebase, jsPDF, Chart.js)
- Serves `offline.html` for document requests when offline
- Network-first for Firestore API calls

---

## Security

### RBAC Roles

| Role | Permissions |
|---|---|
| `admin` | Full access, user management, settings |
| `manager` | View all sessions, export data, manage domains |
| `engineer` | Run tests, view own sessions, generate PDFs |
| `viewer` | Read-only access to dashboards |

Default role for new users: `engineer`

### Audit Trail

All sessions are stored with:
- `userId` — Firebase UID of the operator
- `createdAt` — Server timestamp (tamper-proof)
- `domainName`, `testName` — Denormalized for audit queries

### API Token Management

Firebase handles token management automatically:
- JWT tokens issued on sign-in
- Tokens refresh automatically
- Tokens are invalidated on sign-out
- Anonymous sessions have limited Firestore access

### Input Validation

- Email validated with regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password minimum 6 characters
- Numeric inputs parsed with `parseFloat()`/`parseInt()`
- Sensor values validated for NaN and range

### Session Management

- Auth state persists via `localStorage`
- `auth.onAuthStateChanged()` drives screen transitions
- Sign-out clears all auth state
- No concurrent session limits enforced client-side

### Firestore Security Rules

Recommended rules (set in Firebase Console):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /sessions/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if false;
    }
    match /domains/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /tests/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## i18n (Internationalization)

SmartLAP supports **7 languages**: English, Arabic, Chinese, German, French, Japanese, Russian.

### Adding a Translation

1. Add a key to `I18N.en` in `js/i18n.js`
2. Add the same key to all other language blocks
3. Use `data-i18n="key"` in HTML or `t.key` in JavaScript

### RTL Support

Arabic triggers RTL layout:
```javascript
var isRtl = (lang === 'ar');
document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
```

CSS uses `body[data-dir="rtl"]` selectors for directional overrides.

---

## AI Chat Integration

SmartLAP includes 5 AI engineering assistants powered by **Google Gemini 2.0 Flash**:

| Agent | System Prompt Focus |
|---|---|
| Hardware Engineer | Arduino/ESP32, sensors, circuit design |
| Lab Test Engineer | Soil mechanics, ASTM/BS standards |
| Project Manager | Sprint planning, task management |
| Software Developer | JavaScript, Firebase, Web Serial |
| Research Analyst | Competitor analysis, feature recommendations |

Chat is implemented in `navigation.js` → `sendChat()` which calls the Gemini API directly from the browser.
