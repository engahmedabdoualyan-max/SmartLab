/* ------------------------------------------------------------------ *
 *  firmware.ts — the deliverable source, authored once, served twice:
 *  rendered in the annotated code viewer AND downloadable as .ino
 * ------------------------------------------------------------------ */

export interface FirmwareSection {
  id: string;
  title: string;
  brief: string;
  code: string;
}

const S0_HEADER = `/*******************************************************************************
 *  FILE    : pzt_emi_monitor.ino
 *  PROJECT : smartLAB — Structural Health Monitoring (SHM) node
 *  MCU     : ESP32-WROOM-32 (Arduino core >= 3.x, Espressif board package)
 *  SENSOR  : Piezoelectric PZT patch — "smart aggregate" cast into concrete
 *  METHOD  : Electromechanical Impedance (EMI). Logarithmic admittance sweep
 *            1 kHz -> 500 kHz, peak-hold resonance search, RMSD damage index.
 *  UPLINK  : HTTPS POST -> https://fimtosoft.com/api/v1/telemetry  @ 1.0 Hz
 *  RULES   : Strictly non-blocking. millis()/micros() cooperative scheduler.
 *            ZERO delay() / delayMicroseconds() calls in this translation unit.
 *
 *  SENSING CIRCUIT — single-supply voltage divider (PZT behaves as |Z(f)|):
 *
 *      GPIO25 (LEDC sweep) ---- Rs = 1k0 ----+---- PZT patch ---- GND
 *                                            |
 *                                            +---- GPIO36 (ADC1_CH0, 11 dB)
 *
 *      Vp  = peak voltage at divider mid-point        (burst-sampled, 12-bit)
 *      |Z| = Rs * Vp / (Vexc - Vp)                    (divider inversion)
 *      G   = 1 / |Z|  [uS]        R = |Z| [kOhm]      (magnitude estimate)
 *      F   = argmax |Z^-1| across sweep               (series resonance)
 ******************************************************************************/

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>`;

const S1_CONFIG = `/* ═══════════════════════ 1 · USER CONFIGURATION ═══════════════════════ */
static const char *WIFI_SSID     = "smartLAB-BENCH-2";
static const char *WIFI_PASSWORD = "CHANGE-ME-32-CHAR-WPA2-PSK";

/* smartLAB cloud backend — fixed by integration spec */
static const char *API_ENDPOINT  = "https://fimtosoft.com";
static const char *API_PATH      = "/api/v1/telemetry";

/* Paste the backend root CA (PEM) to enable certificate-pinned TLS.
 * nullptr -> setInsecure() is used: acceptable on the bench, NOT in the
 * field. Production units must ship with the pinned CA below. */
static const char *API_ROOT_CA   = nullptr;

/* ═══════════════════════ 2 · PIN MAP (ESP32-WROOM-32) ══════════════════ */
static const gpio_num_t PIN_PZT_SENSE = GPIO_NUM_36; // ADC1_CH0, divider tap
static const gpio_num_t PIN_EXCITE    = GPIO_NUM_25; // LEDC ch.0 sweep drive
static const gpio_num_t PIN_LED_LINK  = GPIO_NUM_2;  // Wi-Fi / heartbeat LED
static const gpio_num_t PIN_LED_FAULT = GPIO_NUM_4;  // CRUSH latch indicator

/* ═══════════════════════ 3 · SWEEP & SAMPLING ══════════════════════════ */
constexpr float    F_START_KHZ        = 1.0f;   // sweep lower edge
constexpr float    F_STOP_KHZ         = 500.0f; // sweep upper edge
constexpr uint8_t  SWEEP_STEPS        = 96;     // log-spaced dwell points
constexpr uint32_t DWELL_MS           = 3;      // excitation time per step
constexpr uint32_t SAMPLE_INTERVAL_US = 12;     // burst cadence ~= 83 kS/s
constexpr uint16_t SAMPLES_PER_DWELL  = 200;    // fits inside a 3 ms dwell
constexpr float    V_EXC_MV           = 3300.0f;// LEDC rail-to-rail swing
constexpr float    R_SERIES_OHM       = 1000.0f;// Rs, divider sense leg
constexpr float    ADC_VREF_MV        = 3300.0f;
constexpr uint16_t ADC_FULL_SCALE     = 4095;   // 12-bit

/* ═══════════════════ 4 · TELEMETRY & CONNECTIVITY ══════════════════════ */
constexpr uint32_t TELEMETRY_PERIOD_MS = 1000;  // POST cadence (spec: 1 Hz)
constexpr uint32_t WIFI_WATCH_MS       = 5000;  // link re-check cadence
constexpr uint16_t HTTP_TIMEOUT_MS     = 2200;  // hard cap — loop stays fluid
constexpr uint8_t  RETRY_SLOTS         = 4;     // offline spool depth

/* ═══════════════ 5 · FAILURE SIGNATURE — CONCRETE CRUSH ════════════════ *
 *  Ultimate-compressive-strength event seen through the patch:
 *  (a) a short-circuit voltage spike  > CRUSH_SPIKE_COUNTS (950), then
 *  (b) an open-circuit collapse to the noise floor within CRUSH_CONFIRM_MS.
 *  The latch fires immediately, excitation is cut, and a fault packet is
 *  queued ahead of schedule. Cleared only by operator serial command 'r'.  */
constexpr uint16_t CRUSH_SPIKE_COUNTS = 950;
constexpr uint16_t OPEN_LINE_COUNTS   = 12;
constexpr uint32_t CRUSH_CONFIRM_MS   = 30;`;

const S2_STATE = `/* ═══════════════════════ 6 · NODE STATE MODEL ══════════════════════════ */
enum class NodeState : uint8_t { BOOT, WIFI_CONNECT, ACTIVE, CRUSHED };

/* Cloud schema admits exactly two statuses; pre-link states report ACTIVE
 * because the specimen is healthy — the radio is not the structure. */
static const char *statusLabel(NodeState s) {
  return (s == NodeState::CRUSHED) ? "CRUSHED" : "ACTIVE";
}

struct SweepEngine {
  float    freqKHz[SWEEP_STEPS];               // pre-computed log table
  uint8_t  step         = 0;                   // current dwell index
  uint16_t sample       = 0;                   // samples taken this dwell
  uint16_t frameMin     = ADC_FULL_SCALE;      // burst peak detector
  uint16_t frameMax     = 0;
  uint32_t nextSampleUS = 0;                   // micros() scheduler stamp
  uint32_t dwellEndMS   = 0;                   // millis() scheduler stamp
  uint8_t  exciteBits   = 0;                   // live LEDC resolution

  float    peakMV        = 0.0f;               // best amplitude this sweep
  float    peakFreqKHz   = 0.0f;               // resonant frequency (F)
  float    lastFreqKHz   = F_START_KHZ;        // held across sweeps
  float    signatureMV[SWEEP_STEPS] = { 0 };   // admittance profile |G(f)|

  float    baselineMV[SWEEP_STEPS]  = { 0 };   // first-sweep reference
  bool     baselineValid = false;
  float    damageIndex   = 0.0f;               // RMSD vs baseline, percent
};

struct FaultLatch {
  bool     armed       = false;                // spike seen, awaiting drop
  uint32_t spikeAtMS   = 0;
  uint8_t  openFrames  = 0;                    // consecutive dead dwells
  bool     latched     = false;
  uint32_t latchedAtMS = 0;
};

struct RetrySlot { bool pending = false; String body; };

struct TelemetryCtl {
  uint32_t nextRunMS = 0;                      // 0 => fire on first loop
  uint32_t backoffMS = TELEMETRY_PERIOD_MS;    // 1s nominal, doubles offline
};

/* Latest processed reading, published once per dwell boundary */
struct Reading {
  float peakMV       = 0.0f;                   // G source term [mV]
  float conductUS    = 0.0f;                   // G [uS]
  float resistanceK  = 0.0f;                   // R [kOhm]
  float resonantKHz  = 0.0f;                   // F [kHz]
  uint16_t peakCounts= 0;
};

/* ── globals ─────────────────────────────────────────────────────────── */
static SweepEngine  sweep;
static FaultLatch   fault;
static TelemetryCtl telemetry;
static Reading      latest;
static RetrySlot    retryRing[RETRY_SLOTS];
static NodeState    state = NodeState::BOOT;
static char         sessionId[16] = "PZT-??????";
static uint32_t     wifiNextMS    = 0;
static uint32_t     ledNextMS     = 0;
static bool         ledOn         = false;

RTC_DATA_ATTR static uint32_t bootCount = 0;   // survives deep sleep`;

const S3_EXCITE = `/* ═══════════════════ 7 · EXCITATION — LEDC SWEEP DRIVE ═════════════════ *
 *  The APB clock feeds the LEDC timer at 80 MHz, so the maximum toggle
 *  rate is 80e6 / 2^bits. Resolution is therefore re-negotiated per band:
 *  fine PWM (13-bit) at 1 kHz, coarse (7-bit) at 500 kHz. ledcWriteTone()
 *  retunes the divider without a glitch when the band has not changed.   */
static uint8_t ledcBitsFor(uint32_t hz) {
  uint8_t bits = 6;
  while (bits < 13 && (80000000UL >> (bits + 1)) >= hz) bits++;
  return bits;                                  // leaves >= 2x head-room
}

static void setExciteKHz(float khz) {
  const uint32_t hz  = (uint32_t)(khz * 1000.0f);
  const uint8_t  bits = ledcBitsFor(hz);
  if (bits != sweep.exciteBits) {
    ledcAttach((uint8_t)PIN_EXCITE, hz, bits);  // core 3.x: re-map channel
    sweep.exciteBits = bits;
  } else {
    ledcWriteTone((uint8_t)PIN_EXCITE, hz);     // glitch-free retune
  }
  ledcWrite((uint8_t)PIN_EXCITE, 1u << (bits - 1)); // 50 % duty
}

static void exciteOff() {
  ledcDetach((uint8_t)PIN_EXCITE);              // release the pin
  pinMode((uint8_t)PIN_EXCITE, OUTPUT);
  digitalWrite((uint8_t)PIN_EXCITE, LOW);
}`;

const S4_SWEEP = `/* ═══════════════ 8 · EMI SWEEP — NON-BLOCKING BURST SAMPLER ════════════ *
 *  Two nested schedulers, both timestamp-based:
 *    outer: millis() — one dwell per DWELL_MS, advances the sweep table
 *    inner: micros() — one ADC conversion per SAMPLE_INTERVAL_US, so a
 *           200-sample burst completes in 2.4 ms inside each 3 ms dwell.
 *  loop() never waits; it only services whichever deadline has expired.  */
static void beginDwell(uint32_t nowMS) {
  sweep.sample       = 0;
  sweep.frameMin     = ADC_FULL_SCALE;
  sweep.frameMax     = 0;
  sweep.nextSampleUS = micros() + SAMPLE_INTERVAL_US;
  sweep.dwellEndMS   = nowMS + DWELL_MS;
  setExciteKHz(sweep.freqKHz[sweep.step]);
}

static void finishDwell(uint32_t nowMS);        // forward decl (§9/§10)

static void taskSweep(uint32_t nowMS) {
  if (state == NodeState::CRUSHED) return;      // signature frozen at fault

  /* dwell expired -> fold frame statistics and advance the table */
  if (sweep.sample >= SAMPLES_PER_DWELL || nowMS >= sweep.dwellEndMS) {
    finishDwell(nowMS);
    return;
  }
  /* inner scheduler: release exactly one ADC conversion per interval */
  const uint32_t nowUS = micros();
  if ((int32_t)(nowUS - sweep.nextSampleUS) >= 0) {
    const uint16_t raw = analogRead((uint8_t)PIN_PZT_SENSE);
    if (raw < sweep.frameMin) sweep.frameMin = raw;
    if (raw > sweep.frameMax) sweep.frameMax = raw;
    sweep.sample++;
    sweep.nextSampleUS += SAMPLE_INTERVAL_US;   // drift-free re-arm
  }
}`;

const S5_EMI = `/* ═══════════════ 9 · EMI MATH — PEAK-HOLD, R, G, F, RMSD ═══════════════ */
static void evaluateFault(uint32_t nowMS, uint16_t ppCounts); /* fwd — §10 */

static float countsToMV(uint16_t counts) {
  return ((float)counts / (float)ADC_FULL_SCALE) * ADC_VREF_MV;
}

/* Divider inversion:  Vp = Vexc * Z / (Rs + Z)   =>   Z = Rs*Vp/(Vexc-Vp) */
static float impedanceKOhm(float vpMV) {
  const float denom = V_EXC_MV - vpMV;
  if (denom <= 25.0f) return 10000.0f;          // open-line sentinel (>10M)
  return (R_SERIES_OHM * vpMV / denom) / 1000.0f;
}

/* Root-mean-square deviation of |G(f)| vs the baseline signature —
 * the canonical EMI damage metric. 0 % = pristine, grows with cracking. */
static float computeDamageRMSD() {
  if (!sweep.baselineValid) {
    memcpy(sweep.baselineMV, sweep.signatureMV, sizeof(sweep.baselineMV));
    sweep.baselineValid = true;
    return 0.0f;
  }
  float num = 0.0f, den = 0.0f;
  for (uint8_t i = 0; i < SWEEP_STEPS; i++) {
    const float d = sweep.signatureMV[i] - sweep.baselineMV[i];
    num += d * d;
    den += sweep.baselineMV[i] * sweep.baselineMV[i];
  }
  return (den > 0.0f) ? sqrtf(num / den) * 100.0f : 0.0f;
}

static void finishDwell(uint32_t nowMS) {
  const uint16_t ppCounts = sweep.frameMax - sweep.frameMin; // Vpp, counts
  const float    vpMV     = countsToMV(ppCounts) * 0.5f;     // peak amplitude

  /* peak-hold across the whole sweep: resonance search for F */
  sweep.signatureMV[sweep.step] = vpMV;
  if (vpMV > sweep.peakMV) {
    sweep.peakMV      = vpMV;
    sweep.peakFreqKHz = sweep.freqKHz[sweep.step];
  }

  evaluateFault(nowMS, ppCounts);               // §10 — failure signature

  latest.peakCounts  = ppCounts;
  latest.peakMV      = vpMV;
  latest.resistanceK = impedanceKOhm(vpMV);
  latest.conductUS   = (latest.resistanceK > 0.001f)
                           ? 1000.0f / latest.resistanceK : 0.0f;

  /* advance the sweep table (log-spaced: f[i] = f0 * (f1/f0)^(i/N-1)) */
  sweep.step++;
  if (sweep.step >= SWEEP_STEPS) {              // full sweep complete
    sweep.lastFreqKHz  = sweep.peakFreqKHz;
    latest.resonantKHz = sweep.peakFreqKHz;    // F locked for this cycle
    sweep.damageIndex  = computeDamageRMSD();
    sweep.step         = 0;
    sweep.peakMV       = 0.0f;
    Serial.printf("[sweep] F=%.1f kHz  G=%.0f uS  R=%.3f kOhm  RMSD=%.1f%%\\n",
                  latest.resonantKHz, latest.conductUS,
                  latest.resistanceK, sweep.damageIndex);
  }
  beginDwell(nowMS);
}`;

const S6_FAULT = `/* ═══════════════ 10 · FAILURE DETECTOR — PEAK-HOLD LATCH ═══════════════ *
 *  Armed by a spike >= 950 counts; confirmed by three consecutive dead
 *  dwells (open circuit) inside the 30 ms window. On latch: excitation is
 *  cut, the fault LED lights, CONCRETE_CRUSHED is flagged, and a fault
 *  packet is forced to the front of the telemetry queue.                */
static void latchCrush(uint32_t nowMS) {
  fault.latched    = true;
  fault.latchedAtMS = nowMS;
  state            = NodeState::CRUSHED;
  exciteOff();                                  // protect the patch driver
  digitalWrite((uint8_t)PIN_LED_FAULT, HIGH);   // hard latch indicator
  telemetry.nextRunMS = 0;                      // fire POST on next loop()
  latest.resistanceK  = 10000.0f;               // open-circuit sentinel
  latest.conductUS    = 0.0f;
  Serial.printf("[FAULT] CONCRETE_CRUSHED latched @ t=%lu ms — spike->open"
                " signature confirmed. Excitation disabled.\\n",
                (unsigned long)nowMS);
}

static void evaluateFault(uint32_t nowMS, uint16_t ppCounts) {
  if (fault.latched) return;

  if (ppCounts >= CRUSH_SPIKE_COUNTS) {         // (a) the spike
    fault.armed     = true;
    fault.spikeAtMS = nowMS;
    fault.openFrames = 0;
    return;
  }
  if (!fault.armed) return;

  if (ppCounts <= OPEN_LINE_COUNTS) {           // (b) the collapse
    fault.openFrames++;
    if (fault.openFrames >= 3 &&
        (nowMS - fault.spikeAtMS) <= CRUSH_CONFIRM_MS) {
      latchCrush(nowMS);
    }
  } else if ((nowMS - fault.spikeAtMS) > CRUSH_CONFIRM_MS) {
    fault.armed = false;                        // transient — disarm
  }
}

static void resetFault() {                      // operator serial command 'r'
  if (!fault.latched) return;
  fault = FaultLatch();
  sweep.step = 0; sweep.peakMV = 0.0f;
  state = NodeState::ACTIVE;
  digitalWrite((uint8_t)PIN_LED_FAULT, LOW);
  beginDwell(millis());
  Serial.println("[node] fault cleared — new specimen armed");
}`;

const S7_UPLINK = `/* ═══════════════════ 11 · UPLINK — smartLAB CLOUD API ══════════════════ */
static String buildPacket() {
  JsonDocument doc;                              // ArduinoJson v7
  doc["session_id"]   = sessionId;
  doc["voltage_peak"] = roundf(latest.peakMV * 10.0f) / 10.0f; // mV
  doc["resistance"]   = roundf(latest.resistanceK * 1000.0f) / 1000.0f; // kOhm
  doc["frequency"]    = roundf(latest.resonantKHz * 10.0f) / 10.0f; // kHz
  doc["conductance"]  = roundf(latest.conductUS);                    // uS
  doc["damage_index"] = roundf(sweep.damageIndex * 10.0f) / 10.0f;   // %RMSD
  doc["rssi"]         = WiFi.RSSI();
  doc["uptime_s"]     = (uint32_t)(millis() / 1000u);
  doc["status"]       = statusLabel(state);
  if (state == NodeState::CRUSHED) {
    doc["fault"]      = "CONCRETE_CRUSHED";
    doc["fault_t_ms"] = fault.latchedAtMS;
  }
  String out;
  serializeJson(doc, out);
  return out;
}

static bool postPacket(const String &body) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClientSecure tls;
  if (API_ROOT_CA != nullptr) tls.setCACert(API_ROOT_CA); // pinned TLS
  else                        tls.setInsecure();          // bench only

  HTTPClient http;
  String url = String(API_ENDPOINT) + API_PATH;
  if (!http.begin(tls, url)) return false;

  http.setTimeout(HTTP_TIMEOUT_MS);              // bounded — never stalls loop
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Node-Id",  sessionId);
  http.addHeader("X-Protocol", "smartlab-shm/2.4");

  const int code = http.POST(body);
  const bool ok  = (code == 200 || code == 201 || code == 202);
  Serial.printf("[post] %s -> HTTP %d (%u B)\\n",
                ok ? "OK" : "FAIL", code, (unsigned)body.length());
  http.end();
  return ok;
}

/* Offline spool: failed bodies are held (max 4) and drained oldest-first
 * the moment the link returns, so no crush event is ever lost. */
static void spoolPacket(const String &body) {
  for (uint8_t i = 0; i < RETRY_SLOTS; i++) {
    if (!retryRing[i].pending) { retryRing[i] = { true, body }; return; }
  }
  retryRing[0] = { true, body };                 // ring-full: drop oldest
}

static void taskTelemetry(uint32_t nowMS) {
  if (nowMS < telemetry.nextRunMS) return;       // cadence gate: 1000 ms

  /* drain offline spool before the live frame */
  for (uint8_t i = 0; i < RETRY_SLOTS; i++) {
    RetrySlot &s = retryRing[i];
    if (!s.pending) continue;
    if (postPacket(s.body)) s.pending = false;
    else break;                                  // still offline — keep spool
  }

  const String body = buildPacket();
  if (postPacket(body)) {
    telemetry.backoffMS = TELEMETRY_PERIOD_MS;   // healthy: back to 1 Hz
  } else {
    telemetry.backoffMS = min(telemetry.backoffMS * 2, (uint32_t)8000);
    spoolPacket(body);                           // retry after reconnect
  }
  telemetry.nextRunMS = nowMS + telemetry.backoffMS;
}`;

const S8_WIFI = `/* ═══════════════════ 12 · CONNECTIVITY — EVENT-DRIVEN WIFI ═════════════ */
static void onWiFiEvent(WiFiEvent_t event) {
  switch (event) {
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      state = NodeState::ACTIVE;
      Serial.printf("[wifi] link up — IP %s  RSSI %d dBm\\n",
                    WiFi.localIP().toString().c_str(), WiFi.RSSI());
      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("[wifi] link down — watchdog will retry");
      break;
    default: break;
  }
}

static void wifiBegin() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(false);                  // we own the retry policy
  WiFi.onEvent(onWiFiEvent);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  state = NodeState::WIFI_CONNECT;
}

/* Watchdog cadence: if the link is down, ask the stack to re-associate.
 * Never blocks — WiFi.reconnect() returns immediately. */
static void taskWifi(uint32_t nowMS) {
  if (nowMS < wifiNextMS) return;
  wifiNextMS = nowMS + WIFI_WATCH_MS;
  if (WiFi.status() != WL_CONNECTED) WiFi.reconnect();
}`;

const S10_INFLUX = `/* ═══════════ 14 · TIME-SERIES SINK — InfluxDB 3 (Cloud Serverless) ══════ *
 *  The 1 Hz JSON POST above is the *operational* channel. This is the
 *  *analytical* channel: the full 96-bin admittance sweep, written as
 *  line protocol so InfluxDB can answer SQL over the frequency axis.
 *
 *  Three things make this correct rather than merely working:
 *
 *  1. NTP FIRST. Line protocol carries an explicit nanosecond
 *     timestamp. An ESP32 boots at epoch 0, so writing before NTP
 *     lands files every point in 1970 and silently corrupts every
 *     time-range query afterwards. We refuse to write until synced.
 *
 *  2. BATCHING. 96 bins as 96 requests would take ~30 s and thrash the
 *     radio. One request carrying 96 newline-separated lines is a
 *     single TLS handshake and finishes in well under a second.
 *
 *  3. WRITE-ONLY TOKEN. This constant is readable by anyone with the
 *     board in hand — assume it is public. Scope it to write on one
 *     bucket. Never flash an All-Access token onto a field device.
 ------------------------------------------------------------------------ */

#include <time.h>

/* ── endpoint ─────────────────────────────────────────────────────────── *
 *  ⚠  Use your REGION host. Plain "influxdata.com" is the marketing web
 *     site — it resolves, serves HTML, and will NEVER accept a write.
 *     A POST there returns 404/405 and the board will log a silent fail.
 *
 *     Find yours: InfluxDB Cloud UI → top-right org menu → the URL bar.
 *       US East (Virginia) : us-east-1-1.aws.cloud2.influxdata.com
 *       EU (Frankfurt)     : eu-central-1-1.aws.cloud2.influxdata.com   */
static const char *INFLUX_HOST   = "us-east-1-1.aws.cloud2.influxdata.com";
static const char *INFLUX_ORG    = "saudi";
static const char *INFLUX_BUCKET = "pzt_sensor_data";

/* WRITE-ONLY token, scoped to INFLUX_BUCKET only.
 * Anyone holding this board can dump flash and read this string, so it
 * must never be an All-Access token. Write scope means a leak costs you
 * junk data — not deletion of the whole bucket.                        */
static const char *INFLUX_TOKEN  = "PASTE_esp32-write_TOKEN_HERE";

/* InfluxDB 3 keeps the v2 write endpoint for compatibility. */
static const char *NTP_1 = "pool.ntp.org";
static const char *NTP_2 = "time.nist.gov";

/* ── batching budget ──────────────────────────────────────────────────── *
 *  A full line is ~190 B once the two new engineering fields are added.
 *  96 × 190 ≈ 18 kB. An ESP32 has ~320 kB DRAM but TLS alone reserves
 *  ~40 kB for its record buffers, so we must not let the String grow
 *  unbounded. Two protections:
 *    · LP_RESERVE pre-allocates once, avoiding heap fragmentation from
 *      repeated String reallocation inside the 96-iteration loop.
 *    · LP_CHUNK_BINS splits the sweep into TLS-sized batches if the
 *      board is memory-tight. 96 fits in one POST on a WROOM-32; set
 *      this to 48 on an ESP32-C3 or if you add more fields.           */
constexpr size_t   LP_RESERVE     = 20480;  // 20 kB — 96 lines × ~190 B + slack
constexpr uint8_t  LP_CHUNK_BINS  = 96;     // bins per POST (96 = single batch)
constexpr uint32_t INFLUX_TIMEOUT = 8000;   // ms — a sweep body is large

static bool     s_timeSynced   = false;
static uint32_t s_sweepId      = 0;
static uint32_t s_influxOk     = 0;
static uint32_t s_influxFail   = 0;

/* ── NTP: non-blocking readiness probe ────────────────────────────────── */
static void influxBeginTimeSync() {
  configTime(0, 0, NTP_1, NTP_2);   // UTC; line protocol is always UTC
}

static bool influxTimeReady() {
  if (s_timeSynced) return true;
  time_t now = time(nullptr);
  if (now > 1700000000) {           // sanity: past Nov-2023
    s_timeSynced = true;
    Serial.printf("[influx] NTP locked — epoch %ld\\n", (long)now);
  }
  return s_timeSynced;
}

/** Nanosecond wall clock. gettimeofday gives µs; scale to ns. */
static uint64_t epochNanos() {
  struct timeval tv;
  gettimeofday(&tv, nullptr);
  return (uint64_t)tv.tv_sec * 1000000000ULL + (uint64_t)tv.tv_usec * 1000ULL;
}

/* ══ ENGINEERING FIELDS — specimen age and derived strength ═══════════ *
 *
 *  test_age_days
 *    Age of the concrete specimen at the instant of the sweep. Cast
 *    time is written once to NVS when the operator registers the
 *    specimen; age is then (now − castEpoch) in fractional days so
 *    early-age tests (4 h, 8 h) keep sub-day resolution instead of
 *    truncating to 0.
 *
 *  calculated_strength_mpa
 *    On-device estimate so the value is bound to the reading even if
 *    the cloud is unreachable. Two independent terms, blended:
 *      · conductance term — G at the resonant peak scales with the
 *        stiffness the patch is coupled into
 *      · maturity term — Plowman's log law fc(t) = A·ln(t) + B
 *    The dashboard recomputes this with operator-tuned A/B; the device
 *    value is the field reference that the lab report cites.
 * --------------------------------------------------------------------- */
#include <nvs_flash.h>
#include <Preferences.h>

static Preferences s_prefs;
static uint32_t    s_castEpoch = 0;     // seconds; 0 = unregistered

/* Plowman coefficients — must match the dashboard calibration panel. */
constexpr float PLOWMAN_A = 8.4f;       // MPa per ln(day)
constexpr float PLOWMAN_B = 12.1f;      // MPa intercept
constexpr float G_TO_MPA  = 0.0092f;    // µS → MPa feed-forward gain

static void loadCastEpoch() {
  s_prefs.begin("smartlab", true);      // read-only
  s_castEpoch = s_prefs.getUInt("cast_epoch", 0);
  s_prefs.end();
}

/** Operator command 'c' stamps cast time = now. */
static void stampCastEpoch() {
  if (!influxTimeReady()) {
    Serial.println("[age] refused — NTP not locked, epoch would be wrong");
    return;
  }
  s_castEpoch = (uint32_t)time(nullptr);
  s_prefs.begin("smartlab", false);
  s_prefs.putUInt("cast_epoch", s_castEpoch);
  s_prefs.end();
  Serial.printf("[age] cast epoch stamped: %lu\\n", (unsigned long)s_castEpoch);
}

/** Fractional days since cast. Returns 0 when unregistered. */
static float testAgeDays() {
  if (s_castEpoch == 0 || !s_timeSynced) return 0.0f;
  const uint32_t now = (uint32_t)time(nullptr);
  if (now <= s_castEpoch) return 0.0f;
  return (float)(now - s_castEpoch) / 86400.0f;
}

/** On-device compressive strength estimate, MPa. */
static float calculatedStrengthMPa() {
  const float age = testAgeDays();
  /* Below ~1 h the log term is meaningless — report conductance only. */
  const float maturity = (age > 0.04f)
      ? (PLOWMAN_A * logf(age) + PLOWMAN_B)
      : 0.0f;
  const float fromG = latest.conductanceUS * G_TO_MPA;
  if (maturity <= 0.0f) return fmaxf(fromG, 0.0f);
  return fmaxf(fromG * 0.62f + maturity * 0.38f, 0.0f);
}

/* ── line protocol assembly ───────────────────────────────────────────── *
 *  One line per frequency bin. Tags are indexed by InfluxDB (cheap to
 *  filter on); fields are the measurements themselves.
 *
 *    emi_sweep,session_id=..,specimen_id=..,badge=..
 *      freq_khz=..,conductance_us=..,…,
 *      test_age_days=..,calculated_strength_mpa=..  <ns-timestamp>
 *
 *  binFrom / binTo let the caller slice the sweep into TLS-sized
 *  batches without duplicating the formatting logic.
 * --------------------------------------------------------------------- */
static String influxBuildSweepBody(const char *specimenId,
                                   const char *badge,
                                   uint8_t binFrom,
                                   uint8_t binTo) {
  String body;
  body.reserve(LP_RESERVE);

  /* One timestamp for the whole sweep: every bin belongs to the same
   * physical measurement event, so they must share an instant. Giving
   * each bin its own now() would smear one sweep across milliseconds
   * and break "GROUP BY sweep_id" reconstruction on the query side. */
  const uint64_t ts  = epochNanos();
  const float    age = testAgeDays();
  const float    mpa = calculatedStrengthMPa();

  for (uint8_t i = binFrom; i < binTo && i < SWEEP_STEPS; i++) {
    const float f = sweep.freqKHz[i];
    const float g = sweep.signatureMV[i] > 0.0f
                      ? 1000.0f / impedanceKOhm(sweep.signatureMV[i])
                      : 0.0f;

    body += "emi_sweep,session_id=";      body += sessionId;
    body += ",specimen_id=";              body += specimenId;
    body += ",badge=";                    body += badge;
    body += " freq_khz=";                 body += String(f, 3);
    body += ",conductance_us=";           body += String(g, 3);
    body += ",resistance_kohm=";          body += String(latest.resistanceK, 4);
    body += ",voltage_mv=";               body += String(latest.peakMV, 2);
    body += ",res_freq_khz=";             body += String(latest.resonantKHz, 3);
    body += ",damage_rmsd=";              body += String(sweep.damageIndex, 3);
    body += ",temp_c=";                   body += String(coreTempC, 2);
    body += ",hydration_pct=";            body += String(hydrationPct, 2);
    /* ── the two engineering fields ── */
    body += ",test_age_days=";            body += String(age, 4);
    body += ",calculated_strength_mpa=";  body += String(mpa, 3);
    body += ",sweep_id=";                 body += String(s_sweepId); body += "i";
    body += " ";                          body += String((unsigned long long)ts);
    if (i + 1 < binTo && i + 1 < SWEEP_STEPS) body += "\\n";
  }
  return body;
}

/* ── batched write ────────────────────────────────────────────────────── *
 *  The AD5933 impedance engine fills sweep.signatureMV[] bin by bin as
 *  its internal DDS steps through the range. We do NOT transmit during
 *  that acquisition: a POST between bins would stall the I²C state
 *  machine and corrupt the settling time of the next point.
 *
 *  Instead the completed 96-bin frame is serialised once and shipped in
 *  a single TLS session. One handshake, one round trip, ~18 kB body.
 *  Compare with per-bin writes: 96 handshakes ≈ 30 s and a guaranteed
 *  watchdog reset.
 * --------------------------------------------------------------------- */
static bool influxPostChunk(const String &body) {
  WiFiClientSecure tls;
  if (API_ROOT_CA != nullptr) tls.setCACert(API_ROOT_CA);
  else                        tls.setInsecure();   // bench only

  String url = String("https://") + INFLUX_HOST +
               "/api/v2/write?org="    + INFLUX_ORG +
               "&bucket="              + INFLUX_BUCKET +
               "&precision=ns";

  HTTPClient http;
  if (!http.begin(tls, url)) return false;
  http.setTimeout(INFLUX_TIMEOUT);
  http.addHeader("Authorization", String("Token ") + INFLUX_TOKEN);
  http.addHeader("Content-Type", "text/plain; charset=utf-8");

  const int  code = http.POST(body);
  const bool ok   = (code == 204);   // Influx answers 204 No Content

  if (!ok) {
    /* 401 → bad/absent token · 404 → wrong host or bucket
     * 422 → malformed line protocol (usually a NaN slipping into a field) */
    Serial.printf("[influx] POST failed — HTTP %d : %s\\n",
                  code, http.getString().c_str());
  }
  http.end();
  return ok;
}

static bool influxWriteSweep(const char *specimenId, const char *badge) {
  if (WiFi.status() != WL_CONNECTED) return false;
  if (!influxTimeReady()) {
    Serial.println("[influx] write deferred — NTP not locked yet");
    return false;
  }

  s_sweepId++;                       // one id per physical sweep frame
  bool     allOk = true;
  uint32_t bytes = 0;
  uint8_t  posts = 0;

  for (uint8_t from = 0; from < SWEEP_STEPS; from += LP_CHUNK_BINS) {
    const uint8_t to = (uint8_t)min<int>(from + LP_CHUNK_BINS, SWEEP_STEPS);
    const String  body = influxBuildSweepBody(specimenId, badge, from, to);
    bytes += body.length();
    posts++;
    if (!influxPostChunk(body)) { allOk = false; break; }
  }

  if (allOk) {
    s_influxOk++;
    Serial.printf("[influx] sweep #%lu OK — %u bins in %u POST(s), %lu B "
                  "| age %.3f d | fc %.2f MPa\\n",
                  (unsigned long)s_sweepId, SWEEP_STEPS, posts,
                  (unsigned long)bytes, testAgeDays(), calculatedStrengthMPa());
  } else {
    s_influxFail++;
  }
  return allOk;
}

/* Call once per completed sweep, from finishSweep(). Non-blocking in the
 * sense that it never spins: the HTTP timeout bounds the worst case and
 * the sweep scheduler simply misses at most one dwell. */
static void influxOnSweepComplete() {
  static uint32_t everyNth = 0;
  if ((++everyNth % 4) != 0) return;   // 1 write per 4 sweeps ≈ 1/s of data
  influxWriteSweep("SP-001",
    onboardCertified ? "PROPRIETARY_CERTIFIED" : "GENERIC_RAW");
}

/* ── boot hook ────────────────────────────────────────────────────────── *
 *  Call from setup(), after WiFi.begin() and before the first sweep:
 *      influxBeginTimeSync();
 *      loadCastEpoch();
 *  Then in taskSerial() add the cast-stamp command:
 *      else if (c == 'c') stampCastEpoch();
 *
 *  Field procedure: pour the specimen, embed the patch, power the node,
 *  press 'c' once. Every sweep from that moment carries a true age and
 *  a strength estimate anchored to it.
 * --------------------------------------------------------------------- */

/* ── verification: what a single emitted line looks like ──────────────── *
 *
 * emi_sweep,session_id=PZT-9F3A2C,specimen_id=SP-001,badge=PROPRIETARY_CERTIFIED
 *   freq_khz=241.667,conductance_us=3994.512,resistance_kohm=0.2503,
 *   voltage_mv=660.80,res_freq_khz=241.667,damage_rmsd=4.812,
 *   temp_c=31.44,hydration_pct=68.20,
 *   test_age_days=7.2431,calculated_strength_mpa=34.117,
 *   sweep_id=412i 1748592000123456789
 *
 * Confirm arrival with:
 *   SELECT time, freq_khz, conductance_us,
 *          test_age_days, calculated_strength_mpa
 *   FROM "emi_sweep"
 *   WHERE session_id = 'PZT-9F3A2C'
 *     AND time >= now() - INTERVAL '10 minutes'
 *   ORDER BY time DESC LIMIT 5
 * --------------------------------------------------------------------- */`;

const S9_LOOP = `/* ═══════════════════ 13 · LIFECYCLE — setup() / loop() ═════════════════ */
static void buildSessionId() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  snprintf(sessionId, sizeof(sessionId), "PZT-%02X%02X%02X",
           mac[3], mac[4], mac[5]);
}

/* Operator console — drained non-blocking, one char per pass:
 *   r : clear CRUSH latch (new specimen)   b : re-capture baseline
 *   i : print node identity + last reading                                  */
static void taskSerial() {
  while (Serial.available()) {
    const char c = (char)Serial.read();
    if (c == 'r') resetFault();
    else if (c == 'b') { sweep.baselineValid = false;
                         Serial.println("[node] baseline will re-capture"); }
    else if (c == 'i') {
      Serial.printf("[node] %s boot#%lu state=%s F=%.1fkHz R=%.3fkOhm\\n",
                    sessionId, (unsigned long)bootCount,
                    statusLabel(state), latest.resonantKHz,
                    latest.resistanceK);
    }
  }
}

static void taskLeds(uint32_t nowMS) {
  const uint32_t period = (state == NodeState::ACTIVE) ? 600 : 150;
  if (nowMS < ledNextMS) return;
  ledNextMS = nowMS + period;
  ledOn = !ledOn;
  digitalWrite((uint8_t)PIN_LED_LINK, ledOn ? HIGH : LOW);
}

void setup() {
  Serial.begin(921600);
  bootCount++;

  /* analog front-end: 12-bit, full 0-3.3 V range on the divider tap */
  analogReadResolution(12);
  analogSetPinAttenuation((uint8_t)PIN_PZT_SENSE, ADC_11db);

  pinMode((uint8_t)PIN_LED_LINK,  OUTPUT);
  pinMode((uint8_t)PIN_LED_FAULT, OUTPUT);

  /* logarithmic sweep table: 1 kHz -> 500 kHz in 96 geometric steps */
  const float ratio = powf(F_STOP_KHZ / F_START_KHZ,
                           1.0f / (float)(SWEEP_STEPS - 1));
  for (uint8_t i = 0; i < SWEEP_STEPS; i++) {
    sweep.freqKHz[i] = F_START_KHZ * powf(ratio, (float)i);
  }

  buildSessionId();
  wifiBegin();
  beginDwell(millis());

  Serial.println("===============================================");
  Serial.printf (" smartLAB SHM node — pzt_emi_monitor v2.4.1\\n");
  Serial.printf (" session %s · boot #%lu · sweep %u steps\\n",
                 sessionId, (unsigned long)bootCount, SWEEP_STEPS);
  Serial.println("===============================================");
}

void loop() {
  const uint32_t nowMS = millis();

  taskSerial();           /* operator console            — chars as they come */
  taskWifi(nowMS);        /* link watchdog               — every 5 s          */
  taskSweep(nowMS);       /* EMI burst sampler + dwells  — 12 us inner cadence */
  taskTelemetry(nowMS);   /* HTTPS POST to smartLAB      — every 1000 ms      */
  taskLeds(nowMS);        /* heartbeat / fault indicator — 150/600 ms         */
}
/* ═══════════════════════════ END OF FIRMWARE ═══════════════════════════ */`;

export const FIRMWARE_SECTIONS: FirmwareSection[] = [
  {
    id: "header",
    title: "Header & Sensing Circuit",
    brief: "Method statement, divider topology, and the zero-blocking contract.",
    code: S0_HEADER,
  },
  {
    id: "config",
    title: "Configuration · Pins · Sweep · Failure Thresholds",
    brief: "Every tunable in one place — WiFi, API, ADC cadence, crush signature.",
    code: S1_CONFIG,
  },
  {
    id: "state",
    title: "State Model & Engine Structs",
    brief: "Node FSM, sweep engine, fault latch, retry spool, live reading.",
    code: S2_STATE,
  },
  {
    id: "excite",
    title: "Excitation — LEDC Sweep Drive",
    brief: "Band-adaptive PWM resolution, 1 kHz → 500 kHz glitch-free retune.",
    code: S3_EXCITE,
  },
  {
    id: "sweep",
    title: "Non-Blocking Burst Sampler",
    brief: "Nested millis()/micros() schedulers — ≈83 kS/s without ever waiting.",
    code: S4_SWEEP,
  },
  {
    id: "emi",
    title: "EMI Math — R, G, F, RMSD Damage Index",
    brief: "Divider inversion for |Z|, peak-hold resonance search, damage metric.",
    code: S5_EMI,
  },
  {
    id: "fault",
    title: "Failure Detector — CONCRETE_CRUSHED Latch",
    brief: "Spike ≥ 950 → open-line collapse within 30 ms → immediate latch.",
    code: S6_FAULT,
  },
  {
    id: "uplink",
    title: "Uplink — JSON Packet, TLS POST, Retry Spool",
    brief: "ArduinoJson v7 packet, bounded HTTPS, 1→2→4→8 s backoff, spool.",
    code: S7_UPLINK,
  },
  {
    id: "wifi",
    title: "Connectivity — Event-Driven WiFi",
    brief: "STA events, owned retry policy, non-blocking 5 s watchdog.",
    code: S8_WIFI,
  },
  {
    id: "loop",
    title: "Lifecycle — setup() & Cooperative loop()",
    brief: "Boot sequence, serial operator console, and the five-task scheduler.",
    code: S9_LOOP,
  },
  {
    id: "influx",
    title: "Time-Series Sink — InfluxDB 3 Cloud Serverless",
    brief: "NTP-gated writes, batched line protocol, TLS, write-only token.",
    code: S10_INFLUX,
  },
];

export const FULL_CODE = FIRMWARE_SECTIONS.map((s) => s.code).join("\n\n") + "\n";

export const FILE_NAME = "pzt_emi_monitor.ino";
export const FW_VERSION = "2.4.1";

/* ── static analysis, computed from the actual source ─────────────── */
const countMatches = (src: string, re: RegExp): number =>
  (src.match(re) || []).length;

export const FW_STATS = {
  lines: FULL_CODE.split("\n").length,
  bytes: new Blob([FULL_CODE]).size,
  delayCalls: countMatches(FULL_CODE, /\bdelay\s*\(/g),
  delayMicroCalls: countMatches(FULL_CODE, /\bdelayMicroseconds\s*\(/g),
  functions: countMatches(
    FULL_CODE,
    /^\s*(?:static\s+)?[\w:*&<>]+\s+\**(\w+)\s*\([^;]*\)\s*\{/gm
  ),
  sections: FIRMWARE_SECTIONS.length,
};

/* line offset of each section (for the viewer's TOC) */
export const SECTION_OFFSETS: number[] = (() => {
  const offsets: number[] = [];
  let line = 1;
  for (const s of FIRMWARE_SECTIONS) {
    offsets.push(line);
    line += s.code.split("\n").length + 2; // + blank separator line
  }
  return offsets;
})();
