# SmartLab User Guide / دليل المستخدم

**Version 1.0.0 — Fimto Soft**

---

## 1. Introduction / مقدمة

**SmartLab** (Smart Laboratory Automation Platform) is an open dynamic lab automation system for civil engineering. It replaces bulky, expensive lab equipment with a smart web interface and affordable electronic sensors. Engineers can perform compaction, moisture, concrete, and asphalt testing with real-time data monitoring and automated PDF reporting.

**SmartLab** هو نظام أتمتة مختبرات ديناميكي مفتوح للهندسة المدنية. يستبدل أجهزة المختبرات التقليدية الضخمة بواجهة ويب ذكية وحساسات إلكترونية منخفضة التكلفة. يمكن للمهندسين إجراء اختبارات الدمك والرطوبة والخرسانة والأسفلت مع مراقبة البيانات لحظياً وتقارير PDF آلية.

**Key Capabilities:**
- Real-time sensor monitoring via USB/Serial, LAN, or Bluetooth
- AI-powered engineering assistant and anomaly detection
- Multi-language interface (7 languages)
- Cloud sync via Firebase
- PWA — works offline, installable on mobile/desktop
- PDF report generation with jsPDF
- QR specimen tracking and break schedule generation

---

## 2. Getting Started / البدء

### Authentication Options / خيارات تسجيل الدخول

SmartLab offers multiple ways to sign in:

| Method | Description |
|--------|-------------|
| **Google Sign-In** | Click "Sign in with Google" — uses your Google account |
| **Email & Password** | Register with your email, then log in |
| **Guest** | Click "Continue as Guest →" for instant read-only access |

**الطرق المتاحة:**

| الطريقة | الوصف |
|---------|-------|
| **تسجيل الدخول بجوجل** | انقر على "الدخول بجوجل" — يستخدم حساب جوجل الخاص بك |
| **البريد الإلكتروني وكلمة المرور** | سجّل باستخدام بريدك الإلكتروني ثم ادخل |
| **الدخول كزائر** | انقر على "الدخول كزائر →" لدخول فوري للعرض فقط |

### Language Selection / اختيار اللغة

SmartLab supports **7 languages**. Change the language at any time using the language selector dropdown in the app header:

| Language | Locale |
|----------|--------|
| English | `en` |
| العربية (Arabic) | `ar` |
| 中文 (Chinese) | `zh` |
| Deutsch (German) | `de` |
| Français (French) | `fr` |
| 日本語 (Japanese) | `ja` |
| Русский (Russian) | `ru` |

When Arabic is selected, the interface switches to RTL (right-to-left) layout automatically.

يدعم SmartLab **7 لغات**. غيّر اللغة في أي وقت من قائمة اختيار اللغة في رأس التطبيق. عند اختيار العربية، تتحول الواجهة تلقائياً إلى اتجاه RTL (من اليمين لليسار).

### Language Selector Location

Look for a dropdown labelled with the current language code (e.g., `EN`, `AR`) in the top-right area of the app header after logging in.

ابحث عن قائمة منسدلة تحمل رمز اللغة الحالي (مثل `EN`، `AR`) في أعلى يمين رأس التطبيق بعد تسجيل الدخول.

---

## 3. Domain Selection / اختيار التخصص

After authentication, you are prompted to **Choose Your Domain**. SmartLab has three engineering departments:

| Domain / التخصص | Icon | Tests / الاختبارات |
|-----------------|------|-------------------|
| **Roads & Soil** / الطرق والتربة | 🛣️ | Compaction, CBR, Straightedge, Atterberg Limits, Sieve Analysis, Specific Gravity, Permeability, Water Absorption, Direct Shear |
| **Concrete** / الخرسانة | 🏗️ | Slump Test, Concrete Maturity, Compressive Strength, Flexural Strength, Split Tensile |
| **Asphalt** / الأسفلت | 🛤️ | Marshall Test, Bitumen Photo-Tester, Penetration, Ductility, Softening Point, Viscosity |

To select a domain, click on its card. The dashboard will display all available tests for that department.

لاختيار تخصص، انقر على بطاقته. ستعرض لوحة التحكم جميع الاختبارات المتاحة لذلك القسم.

---

## 4. Running a Test / تشغيل اختبار

Each test follows a similar workflow. This section uses the **Compaction (Proctor)** test as an example.

### 4.1 Connection Options / خيارات الاتصال

Before starting a test, select a **Connection Type** from the Hardware Connection panel:

| Option | Mode | Description |
|--------|------|-------------|
| 🔌 **USB / Serial** | Hardware | Connect Arduino/ESP32 via USB cable. Uses Web Serial API — browser will prompt you to select the port. |
| 🌐 **LAN / Network** | Hardware | Enter the device IP address (e.g., `192.168.1.50`). The device must run a WebSocket server. |
| 📡 **Bluetooth** | Hardware | Click "Scan & Pair Bluetooth" to discover nearby BLE devices running SmartLab firmware. |
| ✏️ **Manual Mode** | Manual | Enter values (moisture %, force N, etc.) by hand — no hardware needed. |
| 🧪 **Demo Mode** | Simulation | Simulates sensor data for testing the interface without physical hardware. |

| الخيار | الوضع | الوصف |
|--------|-------|-------|
| 🔌 USB / Serial | هاردوير | وصل Arduino/ESP32 بكابل USB. يستخدم Web Serial API — سيطلب المتصفح اختيار المنفذ. |
| 🌐 LAN / Network | هاردوير | أدخل عنوان IP للجهاز (مثال `192.168.1.50`). يجب أن يشغل الجهاز خادم WebSocket. |
| 📡 Bluetooth | هاردوير | انقر على "مسح وإقران Bluetooth" لاكتشاف أجهزة BLE القريبة. |
| ✏️ الإدخال اليدوي | يدوي | أدخل القيم (نسبة الرطوبة، القوة N...) يدوياً — لا حاجة لهاردوير. |
| 🧪 وضع المحاكاة | محاكاة | يحاكي بيانات الحساسات لاختبار الواجهة بدون هاردوير فعلي. |

### 4.2 Entering Parameters / إدخال المعاملات

Fill in the **Engineer Inputs** panel:

| Parameter | Example | Description |
|-----------|---------|-------------|
| Hammer Weight (kg) | `2.5` | Weight of the compaction hammer |
| Mold Volume (m³) | `0.001` | Volume of the compaction mold |
| Reference Weight (kg) | — | Reference weight for density calculation |
| Target Strikes | `25` | Number of strikes per layer |
| Target Ratio (%) | `95` | Target compaction ratio |
| Agency / Standard | ASTM / AASHTO / BS | Select your applicable standard |

املأ لوحة **مدخلات المهندس** بالمعاملات المناسبة للاختبار.

### 4.3 Starting & Stopping / البدء والإيقاف

Click **▶ Start Test** to begin. The system will start collecting data from the selected connection source. Click **⏹ Stop** to end the test manually, or the test will stop automatically after reaching the target strikes.

انقر على **▶ بدء الاختبار** للبدء. سيجمع النظام البيانات من مصدر الاتصال المختار. انقر على **⏹ إيقاف** لإنهاء الاختبار يدوياً، أو سيتوقف تلقائياً بعد الوصول للعدد المستهدف.

### 4.4 Live Data Monitoring / مراقبة البيانات الحية

During a test, you can monitor:

- **Strike counter** — live gauge showing strikes completed
- **Moisture (%)** — current moisture reading
- **Force (N)** — current force reading
- **Avg Force (N)** — average force across strikes
- **Dry Density (kg/m³)** — calculated dry density
- **Strike Log** — detailed table of each strike
- **Target / Ratio** — progress toward target

During tests with hardware support, a **LIVE** indicator appears. For demo mode, an orange banner shows *"Demo mode — simulated data"*.

أثناء الاختبار، يمكنك مراقبة عدد الضربات، الرطوبة، القوة، الكثافة الجافة، وسجل الضربات المفصل. يظهر مؤشر **مباشر** عند استخدام الهاردوير، وشعار برتقالي في وضع المحاكاة.

---

## 5. Results & Reports / النتائج والتقارير

### Viewing Results / عرض النتائج

After completing a test (either automatically or manually stopped), the **Results** panel displays:

- Final compaction ratio (%)
- Maximum dry density (kg/m³)
- Optimal moisture content (%)
- Achievement ratio bar chart
- Anomaly detection alerts (if any)

### Downloading PDF Reports / تحميل تقارير PDF

Click **📄 Download PDF** to generate a professional lab report. The PDF includes:

- Test type, date, and session ID
- Engineer input parameters
- Strike log table
- Final results with calculated values
- Achievement chart
- Company branding (Fimto Soft)

Each test type has its own PDF generator (e.g., `generateCBRPDF()`, `generateMatPDF()`, `generateCompPDF()`).

انقر على **📄 تحميل التقرير** لإنشاء تقرير مختبر احترافي بصيغة PDF. يشمل التقرير نوع الاختبار والتاريخ ومعاملات الإدخال وسجل الضربات والنتائج النهائية.

### History / الاختبارات السابقة

The **History** table shows previous tests for the current domain, including date, status (Pass/Fail), and key result (density, CBR %, etc.). Data is synced to Firebase Firestore for persistence across sessions.

يعرض جدول **الاختبارات السابقة** الاختبارات السابقة للتخصص الحالي مع التاريخ والحالة والنتيجة. تتم مزامنة البيانات مع Firebase Firestore.

---

## 6. Features / الميزات

### Hardware Integration / التكامل مع الهاردوير

SmartLab supports the following sensors and modules:

| Sensor | Interface | Application |
|--------|-----------|-------------|
| ⚖️ **HX711 Load Cell** | 24-bit ADC | Compaction force, CBR load, Marshall stability (±0.1 N resolution) |
| 💧 **Capacitive Soil Moisture v1.2/v2.0** | Analog | Soil moisture 0–100% |
| 📡 **Ultrasonic HC-SR04** | Digital | Digital slump test, settlement monitoring (2–400 cm, ±3 mm) |
| 🧭 **MPU6050 IMU** | I²C | Road roughness, inclinometer |
| 🌡️ **DS18B20 Temperature** | OneWire | Concrete maturity monitoring (±0.5°C) |
| 📏 **LVDT Displacement** | Analog | Marshall test displacement (±25 mm) |

Arduino/ESP32 firmware is available in the `firmware/` directory.

يتكامل SmartLab مع حساسات HX711، رطوبة التربة، الموجات فوق الصوتية، MPU6050، DS18B20، و LVDT. يوجد برامج الثابتة (Firmware) للأردوينو و ESP32 في مجلد `firmware/`.

### AI Predictions / توقعات الذكاء الاصطناعي

SmartLab includes a machine learning module (`ml.js`) that provides:

- **AI Predictions** — predicted vs actual values for compaction, Marshall, and compressive strength tests
- **Anomaly Detection** — real-time detection of abnormal readings during testing (statistical deviation from mean)
- **AI Engineering Team** — 5 intelligent agents available via chat for hardware, lab testing, programming, project management, and research support

يتضمن SmartLab وحدة تعلم آلي توفر توقعات AI، كشف الحالات الشاذة، وفريق مساعدين أذكياء للدعم الفني.

### Multi-Language / تعدد اللغات

Full interface in 7 languages: English, العربية, 中文, Deutsch, Français, 日本語, Русский. Language changes apply immediately without page reload.

الواجهة كاملة بـ 7 لغات. تتغير اللغة فوراً دون إعادة تحميل الصفحة.

### PWA (Progressive Web App)

SmartLab is a Progressive Web App:
- Installable on mobile and desktop home screens
- Works offline with cached assets (`sw.js`, `offline.html`)
- Fast load times and responsive design
- `manifest.json` configured with app icons and theme color

يمكن تثبيت SmartLab كتطبيق على شاشة الرئيسية للهاتف أو سطح المكتب ويعمل بدون إنترنت.

### Firebase Sync / المزامنة مع Firebase

- **Authentication:** Firebase Auth (Google, Email/Password, Anonymous)
- **Database:** Firestore stores session history, test results, and user data
- **Real-time:** Stats dashboard reflects data across all users

يستخدم SmartLab Firebase للمصادقة، تخزين نتائج الاختبارات، وإحصائيات لوحة التحكم.

### Additional Tools / أدوات إضافية

- **QR Specimen Tracking** — Generate QR codes for concrete specimens (casting → curing → testing → reporting)
- **Break Schedule Generator** — Auto-calculate break dates for concrete specimens (1, 3, 7, 14, 28, 56, 90 days)
- **Dynamic Test Engine** — Create custom test parameters and run with manual or hardware mode
- **Document Viewer** — View reference documents within the app
- **Firmware Downloader** — Download Arduino/ESP32 firmware directly
- **Equipment Calibration Manager** — Track calibration status of lab equipment

---

## 7. Support / الدعم

### Contact Information / معلومات الاتصال

| Channel | Details |
|---------|---------|
| **Email** | [info@fimtosoft.com](mailto:info@fimtosoft.com) |
| **Egypt Office** | [01001006627](tel:01001006627) |
| **Saudi Arabia Office** | [0500439617](tel:0500439617) |
| **Website** | [fimtosoft.com](https://fimtosoft.com) |
| **WhatsApp** | [+20 100 100 6627](https://wa.me/201001006627) |

| وسيلة الاتصال | التفاصيل |
|---------------|----------|
| **البريد الإلكتروني** | [info@fimtosoft.com](mailto:info@fimtosoft.com) |
| **مكتب مصر** | [01001006627](tel:01001006627) |
| **مكتب السعودية** | [0500439617](tel:0500439617) |
| **الموقع الإلكتروني** | [fimtosoft.com](https://fimtosoft.com) |
| **واتساب** | [+20 100 100 6627](https://wa.me/201001006627) |

### Reporting Issues / الإبلاغ عن مشكلات

If you encounter a bug or have a feature request:

1. Open the **FAB menu** (✦ button, bottom-right corner)
2. Select **📞 Contact Support**
3. Choose your preferred contact method (Email, WhatsApp, or phone)
4. Include:
   - SmartLab version (v1.0.0)
   - Browser and OS details
   - Steps to reproduce the issue
   - Screenshots if applicable

Or reach out directly to the Fimto Soft engineering team via the AI chat — select any of the 5 AI agents for immediate technical assistance.

للابتعاث عن مشكلة أو طلب ميزة جديدة، استخدم قائمة FAB (زر ✦) واختر "📞 اتصل بالدعم". يمكنك أيضاً التواصل مع فريق الدعم الهندسي عبر الدردشة بالذكاء الاصطناعي.

---

*SmartLab v1.0.0 — Fimto Soft © 2025*
*Documentation generated by Farida — Documentation Specialist*

*For developer documentation, see [`API_REFERENCE.md`](API_REFERENCE.md) and [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md).*