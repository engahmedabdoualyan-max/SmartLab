export interface CompT {
  local: string;
  role: string;
  specs: string[];
  note?: string;
}

export interface TableT {
  title: string;
  note?: string;
  cols: [string, string, string];
  rows: string[][];
}

export interface Dict {
  code: string;
  native: string;
  flag: string;
  dir: "ltr" | "rtl";

  ui: {
    guide: string;
    firmware: string;
    print: string;
    back: string;
    copy: string;
    copied: string;
    download: string;
    downloading: string;
    notes: string;
    warning: string;
    viewCode: string;
    language: string;
  };

  brand: { name: string; sub: string };

  nav: string[]; // 8 section labels

  hero: {
    badge: string;
    t1: string;
    t2: string;
    lead: string;
    bComponents: string;
    bCode: string;
    bPrint: string;
    disclaimer: string;
    stats: string[]; // 4 labels
  };

  sim: {
    pwr: string;
    run: string;
    alarm: string;
    bar: string;
    force: string;
    peak: string;
    stress: string;
    time: string;
    start: string;
    tare: string;
  };

  sec: {
    idea: string;
    components: string;
    componentsIntro: string;
    wiring: string;
    wiringIntro: string;
    mechanical: string;
    mechanicalIntro: string;
    math: string;
    mathIntro: string;
    models: string;
    modelsIntro: string;
    calibration: string;
    safety: string;
  };

  idea: {
    p1: string;
    p2: string;
    outputs: { t: string; d: string }[]; // 4
    caption: string;
    blockTitle: string;
    blocks: { n: string; d: string }[]; // 6
  };

  comps: CompT[]; // 8

  wiring: {
    tables: TableT[]; // 4
    diagramTitle: string;
    keyLabel: string;
    keys: string[]; // 10
    diag: {
      loadCell: string;
      amp: string;
      mcu: string;
      lcd: string;
      tare: string;
      buzzer: string;
      psu: string;
      psuSub: string;
    };
  };

  mech: {
    stackTitle: string;
    steps: string[]; // 7
    pointsTitle: string;
    points: string[]; // 6
    diag: {
      ram: string;
      cell: string;
      seat: string;
      top: string;
      cube: string;
      bottom: string;
      base: string;
      force: string;
      shield: string;
    };
  };

  math: {
    formulas: { t: string; f: string }[]; // 3
    exTitle: string;
    calcTitle: string;
    calcSub: string;
    edge: string;
    peak: string;
    gradeNote: string;
  };

  models: {
    m1: string;
    f1: string[]; // 5
    m2: string;
    f2: string[]; // 4
    btn: string;
  };

  calib: {
    steps: string[]; // 6
    warnT: string;
    warnText: string;
  };

  safety: {
    eyebrow: string;
    title: string;
    main: string;
    rules: string[]; // 9
  };

  footer: {
    about: string;
    sectionsT: string;
    sourcesT: string;
    sourcesText: string;
    disclaimer: string;
  };

  fw: {
    badge: string;
    t1: string;
    t2: string;
    lead: string;
    libsT: string;
    libs: { by: string; desc: string }[]; // 3
    installT: string;
    installS1: string;
    installS2: string;
    pinT: string;
    pins: string[]; // 7
    bT: string;
    cT: string;
    d1: string;
    n1: string[]; // 3
    d2: string;
    n2: string[]; // 3
    uploadT: string;
    uploadSteps: string[]; // 6
    beforeT: string;
    beforeText: string;
    csvT: string;
    backBtn: string;
  };
}
