import type { Dict } from "./types";

export const en: Dict = {
  code: "en",
  native: "English",
  flag: "🇬🇧",
  dir: "ltr",

  ui: {
    guide: "Full guide",
    firmware: "Firmware",
    print: "Print / Save PDF",
    back: "Back to the guide",
    copy: "Copy code",
    copied: "Code copied ✓",
    download: "Download",
    downloading: "Downloading",
    notes: "Quick notes",
    warning: "Warning",
    viewCode: "View code & download →",
    language: "Language",
  },

  brand: { name: "CUBE CCT-150", sub: "CONCRETE CRUSH TESTER" },

  nav: ["Concept", "Components", "Wiring", "Mechanics", "Calculations", "Models", "Calibration", "Safety"],

  hero: {
    badge: "ARDUINO UNO · HX711 · LOAD CELL 50T",
    t1: "Concrete Cube",
    t2: "Crushing Tester",
    lead:
      "A practical design that turns a hydraulic press into a digital measuring instrument: it reads force in kilonewtons (kN), computes compressive strength in megapascals (MPa), and detects the moment of failure automatically.",
    bComponents: "View components",
    bCode: "Arduino code",
    bPrint: "Print / Save PDF",
    disclaimer:
      "Educational / experimental design — not valid for official results until calibrated and certified by a qualified body.",
    stats: ["Area of a 150 mm cube", "HX711 converter resolution", "Load cell capacity", "Stress factor for the cube"],
  },

  sim: {
    pwr: "PWR",
    run: "RUN",
    alarm: "ALARM",
    bar: "FORCE BAR",
    force: "Force kN",
    peak: "Peak kN",
    stress: "Stress MPa",
    time: "Time s",
    start: "▶ Start test",
    tare: "TARE",
  },

  sec: {
    idea: "How the device works",
    components: "Bill of materials",
    componentsIntro:
      "A complete list of every part with its function and suggested specifications. Always pick a load cell whose capacity exceeds the maximum load the press can deliver.",
    wiring: "Electrical wiring",
    wiringIntro:
      "Every connection runs on the Arduino 5 V logic rails. Study the tables below, then the complete diagram.",
    mechanical: "Mechanical assembly",
    mechanicalIntro:
      "The order of parts in the load path is the secret to accuracy — any tilted or off-centre load gives a wrong reading and can destroy the cell.",
    math: "Engineering calculations",
    mathIntro:
      "Only three equations separate the raw HX711 reading from the final compressive strength value.",
    models: "Two models: with and without a display",
    modelsIntro: "Exactly the same circuit — only the firmware differs. Pick whichever suits your workflow.",
    calibration: "Calibration",
    safety: "Safety",
  },

  idea: {
    p1:
      "The device places an industrial load cell in the force path between the ram of the hydraulic press and the concrete cube. As the cube is compressed, the cell converts force into a weak electrical signal of only a few millivolts.",
    p2:
      "That signal is amplified and digitised at 24-bit resolution by the HX711 module. The Arduino then reads the data and derives four key outputs:",
    outputs: [
      { t: "Instantaneous force", d: "kN" },
      { t: "Maximum load", d: "Peak Load" },
      { t: "Crushing stress", d: "MPa" },
      { t: "Failure detection", d: "sudden drop" },
    ],
    caption: "The moment of failure: force collapses right after the peak — that is when the device stores the Peak value.",
    blockTitle: "Signal Path — Block Diagram",
    blocks: [
      { n: "Hydraulic press", d: "source of force" },
      { n: "Concrete cube", d: "150×150 specimen" },
      { n: "Load cell", d: "force → mV signal" },
      { n: "HX711", d: "amplify & digitise" },
      { n: "Arduino Uno", d: "compute kN & MPa" },
      { n: "LCD / Serial", d: "display or CSV" },
    ],
  },

  comps: [
    {
      local: "Industrial compression load cell",
      role: "Converts the mechanical force acting on the concrete cube into a weak electrical signal proportional to the load.",
      specs: [
        "Type: compression / pancake",
        "Capacity: 50 t or 100 t to suit the press",
        "Output: about 2 mV/V",
        "Accuracy: 0.05 % FS or better",
        "Supply: 5 V to 12 V per datasheet",
        "Body: stainless or alloy steel",
      ],
      note: "Never use a 5 kg or 20 kg cell — concrete loads are far larger. Make sure the press maximum is below the cell capacity and that the cell is rated for compression, not tension only.",
    },
    {
      local: "Load cell amplifier and converter",
      role: "Amplifies the bridge signal of the load cell and converts it into 24-bit digital data the Arduino can read.",
      specs: [
        "24-bit ADC",
        "Works with a load cell bridge",
        "Supply: 2.7 V to 5 V",
        "Sample rate: 10 SPS or 80 SPS",
        "Pins: E+, E-, A+, A-, VCC, GND, DT, SCK",
      ],
    },
    {
      local: "Main microcontroller",
      role: "Reads the HX711, calculates force and stress, detects failure and drives the display and buzzer.",
      specs: [
        "MCU: ATmega328P",
        "Operating voltage: 5 V",
        "Digital pins: 14",
        "Analog pins: 6",
        "Suits both firmware models",
      ],
    },
    {
      local: "Display screen",
      role: "Shows force, stress and peak load directly on the machine without any computer.",
      specs: ["16 characters × 2 lines", "I2C interface", "Common address: 0x27 or 0x3F", "Wiring: VCC, GND, SDA, SCL"],
    },
    {
      local: "Tare button",
      role: "A momentary switch that zeroes the reading before each test and starts a new measurement cycle.",
      specs: [
        "Momentary, normally open",
        "Used for the tare function",
        "Wired between D4 and GND",
        "In code: INPUT_PULLUP",
      ],
    },
    {
      local: "Alarm buzzer",
      role: "Gives a clear audible alarm the instant the cube collapses and the load drops sharply.",
      specs: ["Type: active buzzer", "Voltage: 5 V", "Connected to pin D5", "Triggers automatically on failure"],
    },
    {
      local: "Power supply",
      role: "Stable regulated power for the whole circuit — supply stability directly affects reading stability.",
      specs: ["Voltage: 5 V", "Current: 2 A or more", "Prefer a regulated supply", "Keep away from electrical noise"],
    },
    {
      local: "Hydraulic press",
      role: "The source of force: it applies an increasing load on the cube until failure.",
      specs: [
        "Capacity: 50 t or more as required",
        "Strong, rigid frame",
        "Hard flat loading platens",
        "A guard around the crushing zone is preferred",
      ],
    },
  ],

  wiring: {
    tables: [
      {
        title: "Load cell to HX711",
        note: "Load cell wire colours vary between manufacturers, so always check the cell datasheet before wiring.",
        cols: ["Cell wire", "Function", "HX711"],
        rows: [
          ["Red (usually)", "Excitation +", "E+"],
          ["Black (usually)", "Excitation -", "E-"],
          ["Green (usually)", "Signal +", "A+"],
          ["White (usually)", "Signal -", "A-"],
        ],
      },
      {
        title: "HX711 to Arduino",
        cols: ["HX711", "Function", "Arduino"],
        rows: [
          ["VCC", "power", "5V"],
          ["GND", "ground", "GND"],
          ["DT / DOUT", "data", "D3"],
          ["SCK / CLK", "clock", "D2"],
        ],
      },
      {
        title: "I2C LCD to Arduino",
        cols: ["LCD I2C", "Function", "Arduino Uno"],
        rows: [
          ["VCC", "power", "5V"],
          ["GND", "ground", "GND"],
          ["SDA", "I2C data", "A4"],
          ["SCL", "I2C clock", "A5"],
        ],
      },
      {
        title: "Button and buzzer",
        cols: ["Part", "Terminal", "Arduino"],
        rows: [
          ["Push button", "terminal 1", "D4"],
          ["Push button", "terminal 2", "GND"],
          ["Buzzer", "+", "D5"],
          ["Buzzer", "-", "GND"],
        ],
      },
    ],
    diagramTitle: "Complete wiring diagram",
    keyLabel: "Wire key:",
    keys: [
      "Power + / E+",
      "Ground GND / E-",
      "Signal A+",
      "Signal A-",
      "DT → D3",
      "SCK → D2",
      "SDA → A4",
      "SCL → A5",
      "Button → D4",
      "Buzzer → D5",
    ],
    diag: {
      loadCell: "Load cell 50 t",
      amp: "Load cell amplifier",
      mcu: "Main controller",
      lcd: "Display",
      tare: "Tare button → D4",
      buzzer: "Buzzer 5 V → D5",
      psu: "5V ⎓ 2A PSU",
      psuSub: "powers the whole circuit",
    },
  },

  mech: {
    stackTitle: "Load path, top to bottom",
    steps: [
      "Hydraulic press ram",
      "Industrial load cell",
      "Spherical seat (if available)",
      "Hard upper loading platen",
      "Concrete cube",
      "Hard lower loading platen",
      "Press base",
    ],
    pointsTitle: "Key assembly points",
    points: [
      "The load must be perfectly centred on the cell.",
      "Never load the cell with a tilted or side force.",
      "Use hard, flat, ground loading platens.",
      "Protect the sensor and cables from flying debris.",
      "A spherical seat is preferred to spread the load.",
      "Fit a guard fully around the crushing zone.",
    ],
    diag: {
      ram: "Hydraulic press ram",
      cell: "Industrial load cell",
      seat: "Spherical seat (if possible)",
      top: "Hard upper platen",
      cube: "Concrete cube 150 mm",
      bottom: "Hard lower platen",
      base: "Press base",
      force: "load direction",
      shield: "Guard — crushing zone",
    },
  },

  math: {
    formulas: [
      { t: "Cross-section area (150 mm cube)", f: "Area = 150 × 150 = 22500 mm²" },
      { t: "Converting mass to force", f: "Force(kN) = Mass(kg) × 9.80665 / 1000" },
      { t: "Calculating stress", f: "Stress(MPa) = Force(kN) × 1000 / Area(mm²)" },
    ],
    exTitle: "Worked example",
    calcTitle: "Quick stress calculator",
    calcSub: "Try it yourself: enter the cube edge and the measured peak load.",
    edge: "Cube edge (mm)",
    peak: "Peak load (kN)",
    gradeNote:
      "The grade shown is an educational estimate — official classification requires certified procedures and standards such as ASTM C39 or BS EN 12390.",
  },

  models: {
    m1: "Model one: with LCD",
    f1: [
      "Works without a computer",
      "Shows live force in kN",
      "Shows stress in MPa",
      "Shows the peak load",
      "Audible alarm on failure",
    ],
    m2: "Model two: no display",
    f2: [
      "Streams data over USB serial",
      "Ideal for data logging",
      "Data can be pasted into Excel",
      "Ready-to-use CSV output",
    ],
    btn: "View code & download →",
  },

  calib: {
    steps: [
      "Power the device with no load on the cell.",
      "Press the Tare button to zero the reading.",
      "Apply a load of known value on the cell.",
      "Adjust calibration_factor in the Arduino code until the reading matches the known load.",
      "Repeat with several loads to verify linearity.",
      "Ideally calibrate a 50/100 t cell using a certified calibration press or machine.",
    ],
    warnT: "Important notice",
    warnText:
      "Calibrating with very small weights does not give sufficient accuracy over a 50 or 100 tonne range. The closer the calibration load is to the real working range, the more reliable the readings.",
  },

  safety: {
    eyebrow: "Safety first — read before building",
    title: "Safety",
    main:
      "Crushing concrete cubes is extremely dangerous; fragments can fly at high speed at the moment of failure. Follow every instruction below without exception.",
    rules: [
      "Wear safety glasses and gloves throughout the test.",
      "Never stand in front of the crushing zone.",
      "Use a metal guard or thick acrylic shield.",
      "Centre the cube exactly in the loading area.",
      "Never exceed the load cell capacity.",
      "Never exceed the hydraulic press capacity.",
      "Disconnect power before changing any wiring.",
      "Route the cell cables away from the crushing zone.",
      "Educational / experimental project — not valid for official testing until calibrated and certified by a qualified body.",
    ],
  },

  footer: {
    about:
      "An open, practical guide to turning a hydraulic press into a digital instrument for concrete compressive strength using Arduino, HX711 and an industrial load cell.",
    sectionsT: "Guide sections",
    sourcesT: "Images & sources",
    sourcesText:
      "The component photographs in this guide are illustrative product images created specifically for the project; they represent the real parts in shape and function. Product names and trademarks belong to their owners.",
    disclaimer:
      "⚠ This project is educational / experimental — it is not an official testing instrument until calibrated and certified by a qualified body.",
  },

  fw: {
    badge: "FIRMWARE · ARDUINO UNO · C++",
    t1: "Arduino code for the",
    t2: "concrete crushing tester",
    lead:
      "Complete firmware in two versions: one driving a 16x2 LCD, and one streaming CSV data over the serial port. Copy the code or download it as a ready-made .ino file.",
    libsT: "Required libraries",
    libs: [
      {
        by: "Bogdan Necula",
        desc: "Reads the HX711 amplifier and converts raw values into scaled units, with built-in tare functions.",
      },
      {
        by: "Frank de Brabander",
        desc: "Drives a 16x2 LCD over I2C with only four wires. Required for the first model only.",
      },
      {
        by: "bundled with the Arduino IDE",
        desc: "The core I2C library — no installation needed, it ships with the Arduino environment.",
      },
    ],
    installT: "Installing from the Arduino IDE",
    installS1: "Open the library manager from the menu:",
    installS2: "Search for both libraries and install them:",
    pinT: "Pin summary shared by both models",
    pins: [
      "HX711 DT (DOUT)",
      "HX711 SCK (CLK)",
      "Tare button",
      "Buzzer (+)",
      "LCD SDA",
      "LCD SCL",
      "Power",
    ],
    bT: "File one: the LCD model",
    cT: "File two: the serial model",
    d1: "Shows F / P / S on a 16x2 LCD with an audible alarm on failure",
    n1: [
      "Change the address lcd(0x27,...) to 0x3F if nothing appears — run an I2C scanner to find it.",
      "Adjust calibration_factor after a real calibration against a known load.",
      "Failure detection: force dropping below 85 % of the peak once 20 kN has been exceeded.",
    ],
    d2: "Streams CSV over USB at 9600 baud — ready to paste into Excel",
    n2: [
      "Open the Serial Monitor at 9600 baud and select Newline for correct line breaks.",
      "Paste the rows straight into Excel or Google Sheets to plot the curve.",
      "The tare button starts a new test and resets peak and time to zero.",
    ],
    uploadT: "Uploading the code to the Arduino",
    uploadSteps: [
      "Install the required libraries from the Library Manager (step above).",
      "Connect the Arduino Uno to the computer with a USB cable.",
      "In the Arduino IDE choose: Tools → Board → Arduino Uno.",
      "Select the correct port under Tools → Port.",
      "Paste the code (or open the .ino file) and press Upload ⬆.",
      "For the second model open the Serial Monitor at 9600 baud to see the CSV data.",
    ],
    beforeT: "Before the first run",
    beforeText:
      "Do not leave any load on the cell during upload and zeroing — the code runs scale.tare() automatically, and any load present at that moment becomes a false zero.",
    csvT: "CSV data structure",
    backBtn: "← Back to wiring and calculations",
  },
};
