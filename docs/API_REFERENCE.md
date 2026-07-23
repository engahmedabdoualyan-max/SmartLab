# SmartLAP API Reference

> Version 1.0.0 — Firestore-backed Client API

## Overview

SmartLAP is a **single-page application (SPA)** that communicates directly with **Cloud Firestore** from the browser. There is no traditional REST server. All data operations go through the Firebase JavaScript SDK (`firebase/firestore-compat`). This document describes the Firestore collections, their schemas, and the client-side functions that read/write them.

The "API" is effectively the **Firestore data model** plus the **client-side service functions** defined across `js/*.js`.

---

## Authentication

SmartLAP uses **Firebase Authentication** with the following sign-in methods:

| Method | Function | Firebase SDK Call |
|---|---|---|
| Email/Password (Login) | `doLogin()` | `auth.signInWithEmailAndPassword(email, pass)` |
| Email/Password (Register) | `doRegister()` | `auth.createUserWithEmailAndPassword(email, pass)` |
| Google OAuth | `doGoogleLogin()` | `auth.signInWithPopup(provider)` |
| Anonymous / Guest | `doGuestLogin()` | `auth.signInAnonymously()` |
| Password Reset | `doForgotPassword()` | `auth.sendPasswordResetEmail(email)` |

### Auth State

The global `currentUser` variable is set via `auth.onAuthStateChanged()`. All Firestore writes include `userId: currentUser.uid` for traceability.

### User Profile Document

On registration or first Google sign-in, a user profile is created:

```
Collection: users
Document ID: {uid}
{
  name: string,
  email: string,
  role: "engineer",    // default for new users
  createdAt: Timestamp
}
```

---

## Firestore Collections

### 1. `domains`

Laboratory departments/sections.

```json
{
  "name": "قسم الطرق والتربة",
  "description": "اختبارات الطرق والتربة",
  "order": 1
}
```

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name (Arabic or English) |
| `description` | string | Short description |
| `order` | number | Sort order |

**Client function:** `loadDomains()` in `js/navigation.js`

---

### 2. `tests`

Tests available within each domain.

```json
{
  "name": "اختبار الدمك",
  "domainId": "<domain-doc-id>",
  "order": 1,
  "type": "compaction",
  "config": { "inputs": [] }
}
```

| Field | Type | Description |
|---|---|---|
| `name` | string | Test display name |
| `domainId` | string | Reference to parent domain |
| `order` | number | Sort order within domain |
| `type` | string | Internal test type key |
| `config` | object | Input configuration |

**Supported test types:** `compaction`, `cbr`, `slump`, `maturity`, `marshall`, `bitumen`, `penetration`, `straightedge`, `moisture`, `atterberg`, `sieve`, `compressive`, `ductility`, `air`

**Client function:** `selectDomain(domain)` queries `db.collection('tests').where('domainId', '==', domain.id)`

---

### 3. `sessions`

Test session records. Each completed test generates a session document.

```json
{
  "testId": "<test-doc-id>",
  "domainId": "<domain-doc-id>",
  "domainName": "قسم الطرق والتربة",
  "testName": "اختبار الدمك",
  "engineerInputs": {
    "hammer_weight": 2.5,
    "mold_volume": 0.001,
    "target_strikes": 25,
    "target_ratio": 95,
    "ref_weight": 2.15
  },
  "strikes": [
    {
      "index": 1,
      "moisture": 12.5,
      "force": 245.00,
      "wetDensity": 24974.52,
      "dryDensity": 22201.35,
      "time": "10:32:15 AM"
    }
  ],
  "results": {
    "strikes_count": 25,
    "target_strikes": 25,
    "max_dry_density": 22201.35,
    "optimum_moisture": 12.5,
    "average_moisture": 11.8,
    "average_force": 235.40,
    "max_force": 310.50,
    "reference_density": 2150,
    "compaction_ratio": 1032.62,
    "hammer_weight": 2.5,
    "mold_volume": 0.001,
    "status": "PASS"
  },
  "userId": "<firebase-uid>",
  "createdAt": Timestamp
}
```

| Field | Type | Description |
|---|---|---|
| `testId` | string | Reference to test definition |
| `domainId` | string | Reference to domain |
| `domainName` | string | Domain name (denormalized) |
| `testName` | string | Test name (denormalized) |
| `engineerInputs` | object | Parameters set before test |
| `strikes` | array | Raw reading data |
| `readings` | array | CBR/other reading data (alternative key) |
| `results` | object | Computed final results |
| `userId` | string | UID of the user who ran the test |
| `createdAt` | Timestamp | Server timestamp |

**Client functions:**
- Compaction: `calculateFinalResults()` → `db.collection('sessions').add(...)`
- CBR: `calculateCBRResults()` → `db.collection('sessions').add(...)`
- Other tests: `saveTestSession(type, results)` → `db.collection('sessions').add(...)`

---

### 4. `anomalies`

AI anomaly detection logs.

```json
{
  "metric": "force",
  "anomalies": ["outlier", "spike"],
  "value": 520.5,
  "mean": 245.3,
  "stddev": 32.1,
  "testId": "<test-doc-id>",
  "userId": "<firebase-uid>",
  "createdAt": Timestamp
}
```

**Client function:** `logAnomaly()` in `js/analytics.js`

---

### 5. `users`

User profiles (created on registration).

```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@company.com",
  "role": "engineer",
  "createdAt": Timestamp
}
```

**Client function:** Written during `doRegister()` and `doGoogleLogin()` in `js/auth.js`

---

## Client-Side API Functions

### Domains & Tests

| Function | File | Description |
|---|---|---|
| `loadDomains()` | `js/navigation.js` | Fetches all domains, seeds if empty |
| `seedDomains()` | `js/navigation.js` | Creates 3 default domains and their tests |
| `selectDomain(domain)` | `js/navigation.js` | Loads tests for a domain |
| `openTest(test)` | `js/navigation.js` | Routes to the correct test UI |

### Test Execution (Compaction)

| Function | File | Description |
|---|---|---|
| `startTest()` | `js/compaction.js` | Begins a compaction test session |
| `stopTest()` | `js/compaction.js` | Stops and calculates final results |
| `tareScale()` | `js/compaction.js` | Sends TARE command to hardware |
| `processStrike(moisture, force)` | `js/compaction.js` | Processes a single reading |
| `calculateFinalResults()` | `js/compaction.js` | Computes MDD, OMC, ratio, saves session |
| `displayResults(results)` | `js/compaction.js` | Renders results panel |
| `loadHistory()` | `js/compaction.js` | Loads past sessions for current test |

### Test Execution (CBR)

| Function | File | Description |
|---|---|---|
| `startCBRTest()` | `js/cbr.js` | Begins a CBR test |
| `stopCBRTest()` | `js/cbr.js` | Stops and calculates CBR results |
| `processCBRReading(pen, load)` | `js/cbr.js` | Processes a single CBR reading |
| `calculateCBRResults()` | `js/cbr.js` | Computes CBR at 2.5mm and 5.0mm |
| `loadCBRHistory()` | `js/cbr.js` | Loads past CBR sessions |

### Statistics

| Function | File | Description |
|---|---|---|
| `loadStats()` | `js/app.js` | Aggregates all sessions for dashboard |
| `logAnomaly()` | `js/analytics.js` | Logs sensor anomalies |
| `detectAnomaly(value, metric)` | `js/analytics.js` | Z-score based anomaly detection |

### PDF Generation

| Function | File | Description |
|---|---|---|
| `generatePDF()` | `js/pdf.js` | Compaction test PDF report |
| `generateCBRPDF()` | `js/pdf.js` | CBR test PDF report |
| `generateCompPDF()` | `js/pdf.js` | Compressive strength PDF |
| `generateSlumpPDF()` | `js/pdf.js` | Slump test PDF |

### ML Predictions

| Function | File | Description |
|---|---|---|
| `SmartLAPML.predictConcreteStrength(params)` | `js/ml.js` | Predicts concrete strength |
| `SmartLAPML.predictMoistureContent(params)` | `js/ml.js` | Predicts OMC and MDD |
| `SmartLAPML.predictMarshallStability(params)` | `js/ml.js` | Predicts Marshall stability/flow |

---

## Data Flow

```
Browser (SPA)
  │
  ├── Firebase Auth ─── email, Google, anonymous
  │
  ├── Firestore ─────── domains, tests, sessions, anomalies, users
  │
  ├── Web Serial API ── COM port (9600 baud)
  │   Web Bluetooth ─── BT SPP (0000FFE0 service)
  │   WebSocket ─────── LAN (ws://ip:port/smartlap)
  │
  ├── jsPDF ─────────── PDF report generation
  ├── Chart.js ──────── Live data charts
  └── Gemini API ────── AI chat assistant
```

---

## Error Handling

All Firestore operations are wrapped in `try/catch` blocks. Errors are displayed via `showToast(message, 'error')`:

```javascript
try {
    var snap = await db.collection('sessions').get();
} catch(e) {
    showToast('Failed to load data: ' + e.message, 'error');
}
```

### Common Error Patterns

| Error | Cause | Resolution |
|---|---|---|
| `Permission denied` | Firestore security rules | Check rules in Firebase Console |
| `Failed to load` | Network / offline | Service worker provides offline fallback |
| `auth/user-not-found` | Wrong email | Verify email address |
| `auth/wrong-password` | Wrong password | Use password reset |
| `auth/too-many-requests` | Rate limited | Wait and retry |
| `Web Serial not supported` | Browser incompatibility | Use Chrome/Edge 89+ |

---

## Rate Limiting

Firestore enforces quotas on the Spark (free) plan:

| Operation | Daily Limit |
|---|---|
| Document reads | 50,000 |
| Document writes | 20,000 |
| Document deletes | 20,000 |
| Storage | 1 GiB |

For production, upgrade to the Blaze plan. The service worker caches static assets to reduce unnecessary network requests.

---

## Real-Time Updates

Firestore supports real-time listeners. To subscribe to live session updates:

```javascript
db.collection('sessions')
  .where('testId', '==', testId)
  .orderBy('createdAt', 'desc')
  .onSnapshot(function(snap) {
      snap.docChanges().forEach(function(change) {
          if (change.type === 'added') {
              // New session created
          }
      });
  });
```

The statistics dashboard (`loadStats()`) performs a one-shot `get()` on each load. For production, consider converting to `onSnapshot` for live updates.

---

## Agency/Standard Selector

Tests support multiple engineering standards via the `agencyStandards` lookup in `js/analytics.js`:

| Agency | Compaction | CBR | Slump | Maturity | Marshall | Penetration | Bitumen |
|---|---|---|---|---|---|---|---|
| ASTM | D698/D1557 | D1883 | C143/C143M | C1074 | D6927 | D5 | D2041 |
| AASHTO | T99/T180 | T193 | T119 | — | T245 | T49 | T228 |
| BS | 1377 Part 4 | 1377 Part 9 | 1881 Part 102 | EN 12390 | EN 12697-34 | EN 1426 | EN 12591 |

The selected agency is stored in `currentAgency` and displayed via `setAgency(agency)`.
