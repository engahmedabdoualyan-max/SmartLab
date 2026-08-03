import type { Dict } from "./types";

export const de: Dict = {
  code: "de",
  native: "Deutsch",
  flag: "🇩🇪",
  dir: "ltr",

  ui: {
    guide: "Vollständige Anleitung",
    firmware: "Firmware",
    print: "Drucken / PDF",
    back: "Zurück zur Anleitung",
    copy: "Code kopieren",
    copied: "Code kopiert ✓",
    download: "Herunterladen",
    downloading: "Lade herunter:",
    notes: "Kurze Hinweise",
    warning: "Warnung",
    viewCode: "Code ansehen & laden →",
    language: "Sprache",
  },

  brand: { name: "WÜRFEL CCT-150", sub: "CONCRETE CRUSH TESTER" },

  nav: ["Prinzip", "Bauteile", "Verdrahtung", "Mechanik", "Berechnung", "Modelle", "Kalibrierung", "Sicherheit"],

  hero: {
    badge: "ARDUINO UNO · HX711 · WÄGEZELLE 50T",
    t1: "Prüfgerät zum Zerdrücken",
    t2: "von Betonwürfeln",
    lead:
      "Ein praxisnaher Aufbau, der eine Hydraulikpresse in ein digitales Messgerät verwandelt: Die Kraft wird in Kilonewton (kN) angezeigt, die Druckfestigkeit in Megapascal (MPa) berechnet und der Bruchmoment automatisch erkannt.",
    bComponents: "Bauteile ansehen",
    bCode: "Arduino-Code",
    bPrint: "Drucken / PDF",
    disclaimer:
      "Lehr- und Versuchsaufbau — ohne Kalibrierung und Zertifizierung durch eine Fachstelle nicht für offizielle Ergebnisse geeignet.",
    stats: ["Fläche eines 150-mm-Würfels", "Auflösung des HX711", "Kapazität der Wägezelle", "Spannungsfaktor des Würfels"],
  },

  sim: {
    pwr: "PWR",
    run: "RUN",
    alarm: "ALARM",
    bar: "KRAFTBALKEN",
    force: "Kraft kN",
    peak: "Spitze kN",
    stress: "Spannung MPa",
    time: "Zeit s",
    start: "▶ Prüfung starten",
    tare: "TARA",
  },

  sec: {
    idea: "Funktionsprinzip",
    components: "Stückliste",
    componentsIntro:
      "Vollständige Liste aller Teile mit Funktion und empfohlenen Daten. Wählen Sie die Wägezelle stets so, dass ihre Kapazität über der Höchstlast der Presse liegt.",
    wiring: "Elektrische Verdrahtung",
    wiringIntro:
      "Alle Verbindungen laufen über die 5-V-Logik des Arduino. Erst die Tabellen, dann der vollständige Schaltplan.",
    mechanical: "Mechanischer Aufbau",
    mechanicalIntro:
      "Die Reihenfolge im Kraftfluss entscheidet über die Genauigkeit — schiefe oder außermittige Last verfälscht die Messung und kann die Zelle zerstören.",
    math: "Technische Berechnungen",
    mathIntro: "Nur drei Gleichungen trennen den Rohwert des HX711 von der endgültigen Druckfestigkeit.",
    models: "Zwei Modelle: mit und ohne Display",
    modelsIntro: "Exakt dieselbe Schaltung — nur die Firmware unterscheidet sich. Wählen Sie nach Ihrer Arbeitsweise.",
    calibration: "Kalibrierung",
    safety: "Sicherheit",
  },

  idea: {
    p1:
      "Eine industrielle Wägezelle sitzt im Kraftfluss zwischen dem Pressenstempel und dem Betonwürfel. Beim Zusammendrücken wandelt die Zelle die Kraft in ein schwaches elektrisches Signal von wenigen Millivolt um.",
    p2:
      "Dieses Signal wird vom HX711-Modul verstärkt und mit 24 Bit digitalisiert. Der Arduino liest die Daten und leitet daraus vier Kernwerte ab:",
    outputs: [
      { t: "Momentane Kraft", d: "kN" },
      { t: "Höchstlast", d: "Peak Load" },
      { t: "Bruchspannung", d: "MPa" },
      { t: "Brucherkennung", d: "plötzlicher Abfall" },
    ],
    caption: "Der Bruchmoment: Die Kraft bricht direkt nach dem Maximum ein — genau dann speichert das Gerät den Peak-Wert.",
    blockTitle: "Signalweg — Blockschaltbild",
    blocks: [
      { n: "Hydraulikpresse", d: "Kraftquelle" },
      { n: "Betonwürfel", d: "Probe 150×150" },
      { n: "Wägezelle", d: "Kraft → mV-Signal" },
      { n: "HX711", d: "verstärken & digitalisieren" },
      { n: "Arduino Uno", d: "kN und MPa berechnen" },
      { n: "LCD / Seriell", d: "Anzeige oder CSV" },
    ],
  },

  comps: [
    {
      local: "Industrielle Druck-Wägezelle",
      role: "Wandelt die auf den Betonwürfel wirkende Kraft in ein schwaches, lastproportionales elektrisches Signal um.",
      specs: [
        "Typ: Druck / Pancake",
        "Kapazität: 50 t oder 100 t je nach Presse",
        "Ausgang: etwa 2 mV/V",
        "Genauigkeit: 0,05 % FS oder besser",
        "Speisung: 5 V bis 12 V laut Datenblatt",
        "Körper: Edel- oder legierter Stahl",
      ],
      note: "Niemals eine 5-kg- oder 20-kg-Zelle verwenden — Betonlasten sind weit größer. Die Höchstlast der Presse muss unter der Zellenkapazität liegen, und die Zelle muss für Druck ausgelegt sein, nicht nur für Zug.",
    },
    {
      local: "Verstärker und Signalwandler",
      role: "Verstärkt das Brückensignal der Wägezelle und wandelt es in 24-Bit-Digitaldaten für den Arduino.",
      specs: [
        "24-Bit-ADC",
        "Für Wägezellenbrücken geeignet",
        "Betriebsspannung: 2,7 V bis 5 V",
        "Abtastrate: 10 SPS oder 80 SPS",
        "Anschlüsse: E+, E-, A+, A-, VCC, GND, DT, SCK",
      ],
    },
    {
      local: "Hauptmikrocontroller",
      role: "Liest den HX711, berechnet Kraft und Spannung, erkennt den Bruch und steuert Display und Summer.",
      specs: ["MCU: ATmega328P", "Betriebsspannung: 5 V", "Digitalpins: 14", "Analogpins: 6", "Für beide Modelle geeignet"],
    },
    {
      local: "Anzeigedisplay",
      role: "Zeigt Kraft, Spannung und Höchstlast direkt am Gerät an — ganz ohne Computer.",
      specs: ["16 Zeichen × 2 Zeilen", "I2C-Schnittstelle", "Übliche Adresse: 0x27 oder 0x3F", "Anschluss: VCC, GND, SDA, SCL"],
    },
    {
      local: "Tara-Taster",
      role: "Tastschalter, der vor jeder Prüfung die Anzeige nullt und einen neuen Messzyklus startet.",
      specs: ["Tastend, Schließer", "Für die Tara-Funktion", "Zwischen D4 und GND", "Im Code: INPUT_PULLUP"],
    },
    {
      local: "Alarmsummer",
      role: "Gibt in dem Moment ein deutliches akustisches Signal, in dem der Würfel bricht und die Last einbricht.",
      specs: ["Typ: aktiver Summer", "Spannung: 5 V", "An Pin D5", "Löst automatisch aus"],
    },
    {
      local: "Netzteil",
      role: "Stabile, geregelte Versorgung der gesamten Schaltung — ihre Stabilität bestimmt die Messstabilität.",
      specs: ["Spannung: 5 V", "Strom: 2 A oder mehr", "Geregelte Quelle bevorzugen", "Von Störquellen fernhalten"],
    },
    {
      local: "Hydraulikpresse",
      role: "Die Kraftquelle: Sie belastet den Würfel steigend bis zum Bruch.",
      specs: [
        "Kapazität: 50 t oder mehr je nach Anwendung",
        "Kräftiger, steifer Rahmen",
        "Harte, ebene Druckplatten",
        "Schutzabdeckung empfohlen",
      ],
    },
  ],

  wiring: {
    tables: [
      {
        title: "Wägezelle an HX711",
        note: "Die Aderfarben unterscheiden sich je nach Hersteller — prüfen Sie vor dem Verdrahten immer das Datenblatt der Zelle.",
        cols: ["Ader der Zelle", "Funktion", "HX711"],
        rows: [
          ["Rot (meist)", "Excitation +", "E+"],
          ["Schwarz (meist)", "Excitation -", "E-"],
          ["Grün (meist)", "Signal +", "A+"],
          ["Weiß (meist)", "Signal -", "A-"],
        ],
      },
      {
        title: "HX711 an Arduino",
        cols: ["HX711", "Funktion", "Arduino"],
        rows: [
          ["VCC", "Versorgung", "5V"],
          ["GND", "Masse", "GND"],
          ["DT / DOUT", "Daten", "D3"],
          ["SCK / CLK", "Takt", "D2"],
        ],
      },
      {
        title: "I2C-LCD an Arduino",
        cols: ["LCD I2C", "Funktion", "Arduino Uno"],
        rows: [
          ["VCC", "Versorgung", "5V"],
          ["GND", "Masse", "GND"],
          ["SDA", "I2C-Daten", "A4"],
          ["SCL", "I2C-Takt", "A5"],
        ],
      },
      {
        title: "Taster und Summer",
        cols: ["Bauteil", "Anschluss", "Arduino"],
        rows: [
          ["Taster", "Anschluss 1", "D4"],
          ["Taster", "Anschluss 2", "GND"],
          ["Summer", "+", "D5"],
          ["Summer", "-", "GND"],
        ],
      },
    ],
    diagramTitle: "Vollständiger Schaltplan",
    keyLabel: "Aderfarben:",
    keys: [
      "Versorgung + / E+",
      "Masse GND / E-",
      "Signal A+",
      "Signal A-",
      "DT → D3",
      "SCK → D2",
      "SDA → A4",
      "SCL → A5",
      "Taster → D4",
      "Summer → D5",
    ],
    diag: {
      loadCell: "Wägezelle 50 t",
      amp: "Wägezellenverstärker",
      mcu: "Hauptcontroller",
      lcd: "Display",
      tare: "Tara-Taster → D4",
      buzzer: "Summer 5 V → D5",
      psu: "5V ⎓ 2A PSU",
      psuSub: "versorgt die ganze Schaltung",
    },
  },

  mech: {
    stackTitle: "Kraftfluss von oben nach unten",
    steps: [
      "Stempel der Hydraulikpresse",
      "Industrielle Wägezelle",
      "Kalotte / Kugelsitz (falls vorhanden)",
      "Harte obere Druckplatte",
      "Betonwürfel",
      "Harte untere Druckplatte",
      "Pressenbasis",
    ],
    pointsTitle: "Wichtige Montagepunkte",
    points: [
      "Die Last muss exakt mittig auf der Zelle stehen.",
      "Niemals schräg oder seitlich belasten.",
      "Harte, ebene, geschliffene Druckplatten verwenden.",
      "Sensor und Kabel vor Splittern schützen.",
      "Ein Kugelsitz verteilt die Last besser.",
      "Rundum eine Schutzabdeckung anbringen.",
    ],
    diag: {
      ram: "Pressenstempel",
      cell: "Industrielle Wägezelle",
      seat: "Kugelsitz (wenn möglich)",
      top: "Harte obere Platte",
      cube: "Betonwürfel 150 mm",
      bottom: "Harte untere Platte",
      base: "Pressenbasis",
      force: "Lastrichtung",
      shield: "Schutz — Bruchzone",
    },
  },

  math: {
    formulas: [
      { t: "Querschnittsfläche (150-mm-Würfel)", f: "Area = 150 × 150 = 22500 mm²" },
      { t: "Masse in Kraft umrechnen", f: "Force(kN) = Mass(kg) × 9.80665 / 1000" },
      { t: "Spannung berechnen", f: "Stress(MPa) = Force(kN) × 1000 / Area(mm²)" },
    ],
    exTitle: "Rechenbeispiel",
    calcTitle: "Schneller Spannungsrechner",
    calcSub: "Probieren Sie es: Kantenlänge und gemessene Höchstlast eingeben.",
    edge: "Würfelkante (mm)",
    peak: "Höchstlast (kN)",
    gradeNote:
      "Die angezeigte Festigkeitsklasse ist eine Lehrschätzung — die offizielle Einstufung erfordert zertifizierte Verfahren und Normen (z. B. ASTM C39 / BS EN 12390).",
  },

  models: {
    m1: "Modell 1: mit LCD",
    f1: [
      "Arbeitet ohne Computer",
      "Zeigt die Live-Kraft in kN",
      "Zeigt die Spannung in MPa",
      "Zeigt die Höchstlast",
      "Akustischer Alarm beim Bruch",
    ],
    m2: "Modell 2: ohne Display",
    f2: [
      "Sendet Daten über USB seriell",
      "Ideal zur Datenaufzeichnung",
      "Daten lassen sich in Excel einfügen",
      "Fertige CSV-Ausgabe",
    ],
    btn: "Code ansehen & laden →",
  },

  calib: {
    steps: [
      "Gerät ohne Last auf der Zelle einschalten.",
      "Tara-Taster drücken, um die Anzeige zu nullen.",
      "Eine Last mit bekanntem Wert aufbringen.",
      "calibration_factor im Arduino-Code anpassen, bis der Messwert der bekannten Last entspricht.",
      "Mit mehreren Lasten wiederholen, um die Linearität zu prüfen.",
      "Eine 50/100-t-Zelle idealerweise auf einer zertifizierten Kalibriermaschine abgleichen.",
    ],
    warnT: "Wichtiger Hinweis",
    warnText:
      "Eine Kalibrierung mit sehr kleinen Gewichten liefert über 50 oder 100 Tonnen keine ausreichende Genauigkeit. Je näher die Kalibrierlast am realen Arbeitsbereich liegt, desto zuverlässiger die Messwerte.",
  },

  safety: {
    eyebrow: "Sicherheit zuerst — vor dem Aufbau lesen",
    title: "Sicherheit",
    main:
      "Das Zerdrücken von Betonwürfeln ist äußerst gefährlich; beim Bruch können Splitter mit hoher Geschwindigkeit wegfliegen. Befolgen Sie jede Anweisung ausnahmslos.",
    rules: [
      "Während der gesamten Prüfung Schutzbrille und Handschuhe tragen.",
      "Niemals vor der Bruchzone stehen.",
      "Metallschutz oder dickes Acrylglas verwenden.",
      "Den Würfel exakt mittig platzieren.",
      "Die Kapazität der Wägezelle nie überschreiten.",
      "Die Kapazität der Presse nie überschreiten.",
      "Vor Änderungen an der Verdrahtung Strom abschalten.",
      "Die Zellenkabel aus der Bruchzone fernhalten.",
      "Lehr- und Versuchsprojekt — ohne Kalibrierung und Zertifizierung nicht für offizielle Prüfungen gültig.",
    ],
  },

  footer: {
    about:
      "Ein offener, praxisnaher Leitfaden, um eine Hydraulikpresse mit Arduino, HX711 und industrieller Wägezelle in ein digitales Messgerät für die Betondruckfestigkeit zu verwandeln.",
    sectionsT: "Abschnitte",
    sourcesT: "Bilder & Quellen",
    sourcesText:
      "Die Bauteilfotos sind illustrative Produktbilder, die eigens für diesen Leitfaden erstellt wurden; sie geben die realen Teile in Form und Funktion wieder. Produktnamen und Marken gehören ihren Inhabern.",
    disclaimer:
      "⚠ Lehr- und Versuchsprojekt — ohne Kalibrierung und Zertifizierung durch eine Fachstelle kein offizielles Prüfgerät.",
  },

  fw: {
    badge: "FIRMWARE · ARDUINO UNO · C++",
    t1: "Arduino-Code für das",
    t2: "Beton-Bruchprüfgerät",
    lead:
      "Vollständige Firmware in zwei Varianten: eine mit 16x2-LCD, eine mit CSV-Ausgabe über die serielle Schnittstelle. Code kopieren oder als fertige .ino-Datei herunterladen.",
    libsT: "Benötigte Bibliotheken",
    libs: [
      { by: "Bogdan Necula", desc: "Liest den HX711-Verstärker und rechnet Rohwerte in skalierte Einheiten um, inklusive Tara-Funktionen." },
      { by: "Frank de Brabander", desc: "Steuert ein 16x2-LCD über I2C mit nur vier Adern. Nur für das erste Modell nötig." },
      { by: "in der Arduino-IDE enthalten", desc: "Die I2C-Basisbibliothek — keine Installation nötig, sie gehört zur Umgebung." },
    ],
    installT: "Installation über die Arduino-IDE",
    installS1: "Bibliotheksverwaltung im Menü öffnen:",
    installS2: "Beide Bibliotheken suchen und installieren:",
    pinT: "Pin-Übersicht für beide Modelle",
    pins: ["HX711 DT (DOUT)", "HX711 SCK (CLK)", "Tara-Taster", "Summer (+)", "LCD SDA", "LCD SCL", "Versorgung"],
    bT: "Datei 1: das LCD-Modell",
    cT: "Datei 2: das serielle Modell",
    d1: "Zeigt F / P / S auf einem 16x2-LCD mit akustischem Alarm beim Bruch",
    n1: [
      "Adresse lcd(0x27,...) auf 0x3F ändern, falls nichts erscheint — I2C-Scanner nutzen.",
      "calibration_factor nach einer echten Kalibrierung mit bekannter Last anpassen.",
      "Brucherkennung: Kraft fällt unter 85 % des Maximums, nachdem 20 kN überschritten wurden.",
    ],
    d2: "Sendet CSV über USB mit 9600 Baud — direkt für Excel geeignet",
    n2: [
      "Seriellen Monitor mit 9600 Baud öffnen und Newline wählen.",
      "Zeilen direkt in Excel oder Google Sheets einfügen und Kurve zeichnen.",
      "Der Tara-Taster startet eine neue Prüfung und setzt Spitze und Zeit zurück.",
    ],
    uploadT: "Code auf den Arduino übertragen",
    uploadSteps: [
      "Benötigte Bibliotheken über den Library Manager installieren (Schritt oben).",
      "Arduino Uno per USB-Kabel mit dem Computer verbinden.",
      "In der IDE wählen: Tools → Board → Arduino Uno.",
      "Den richtigen Port unter Tools → Port auswählen.",
      "Code einfügen (oder .ino öffnen) und Upload ⬆ drücken.",
      "Für Modell 2 den seriellen Monitor mit 9600 Baud öffnen.",
    ],
    beforeT: "Vor dem ersten Lauf",
    beforeText:
      "Während des Uploads und der Nullung darf keine Last auf der Zelle liegen — der Code führt scale.tare() automatisch aus, und jede vorhandene Last wird zum falschen Nullpunkt.",
    csvT: "Aufbau der CSV-Daten",
    backBtn: "← Zurück zu Verdrahtung und Berechnung",
  },
};
