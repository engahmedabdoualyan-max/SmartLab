import type { Dict } from "./types";

export const fr: Dict = {
  code: "fr",
  native: "Français",
  flag: "🇫🇷",
  dir: "ltr",

  ui: {
    guide: "Guide complet",
    firmware: "Firmware",
    print: "Imprimer / PDF",
    back: "Retour au guide",
    copy: "Copier le code",
    copied: "Code copié ✓",
    download: "Télécharger",
    downloading: "Téléchargement de",
    notes: "Notes rapides",
    warning: "Avertissement",
    viewCode: "Voir le code et télécharger →",
    language: "Langue",
  },

  brand: { name: "CUBE CCT-150", sub: "CONCRETE CRUSH TESTER" },

  nav: ["Principe", "Composants", "Câblage", "Mécanique", "Calculs", "Modèles", "Étalonnage", "Sécurité"],

  hero: {
    badge: "ARDUINO UNO · HX711 · CAPTEUR 50T",
    t1: "Testeur d'écrasement",
    t2: "de cubes de béton",
    lead:
      "Une conception pratique qui transforme une presse hydraulique en instrument de mesure numérique : lecture de la force en kilonewtons (kN), calcul de la résistance à la compression en mégapascals (MPa) et détection automatique de la rupture.",
    bComponents: "Voir les composants",
    bCode: "Code Arduino",
    bPrint: "Imprimer / PDF",
    disclaimer:
      "Conception pédagogique / expérimentale — non valable pour des résultats officiels sans étalonnage et certification par un organisme compétent.",
    stats: ["Surface d'un cube de 150 mm", "Résolution du HX711", "Capacité du capteur", "Facteur de contrainte du cube"],
  },

  sim: {
    pwr: "PWR",
    run: "RUN",
    alarm: "ALARM",
    bar: "BARRE DE FORCE",
    force: "Force kN",
    peak: "Pic kN",
    stress: "Contrainte MPa",
    time: "Temps s",
    start: "▶ Lancer l'essai",
    tare: "TARE",
  },

  sec: {
    idea: "Principe de fonctionnement",
    components: "Liste des composants",
    componentsIntro:
      "Liste complète de chaque pièce avec sa fonction et ses caractéristiques conseillées. Choisissez toujours un capteur dont la capacité dépasse la charge maximale de la presse.",
    wiring: "Câblage électrique",
    wiringIntro:
      "Toutes les connexions se font sur la logique 5 V de l'Arduino. Consultez les tableaux, puis le schéma complet.",
    mechanical: "Montage mécanique",
    mechanicalIntro:
      "L'ordre des pièces dans le chemin de charge fait toute la précision — une charge inclinée ou décentrée fausse la lecture et peut détruire le capteur.",
    math: "Calculs d'ingénierie",
    mathIntro: "Trois équations seulement séparent la lecture brute du HX711 de la résistance finale.",
    models: "Deux modèles : avec et sans écran",
    modelsIntro: "Exactement le même circuit — seul le firmware change. Choisissez selon votre méthode de travail.",
    calibration: "Étalonnage",
    safety: "Sécurité",
  },

  idea: {
    p1:
      "Le dispositif place un capteur de force industriel dans le chemin de charge, entre le vérin de la presse hydraulique et le cube de béton. Sous la compression, le capteur convertit la force en un signal électrique de quelques millivolts seulement.",
    p2:
      "Ce signal est amplifié et numérisé en 24 bits par le module HX711. L'Arduino lit ensuite les données et en déduit quatre grandeurs essentielles :",
    outputs: [
      { t: "Force instantanée", d: "kN" },
      { t: "Charge maximale", d: "Peak Load" },
      { t: "Contrainte de rupture", d: "MPa" },
      { t: "Détection de rupture", d: "chute brutale" },
    ],
    caption: "L'instant de la rupture : la force s'effondre juste après le pic — le dispositif enregistre alors la valeur Peak.",
    blockTitle: "Chemin du signal — schéma bloc",
    blocks: [
      { n: "Presse hydraulique", d: "source de force" },
      { n: "Cube de béton", d: "éprouvette 150×150" },
      { n: "Capteur de force", d: "force → signal mV" },
      { n: "HX711", d: "amplification et CAN" },
      { n: "Arduino Uno", d: "calcul kN et MPa" },
      { n: "LCD / Série", d: "affichage ou CSV" },
    ],
  },

  comps: [
    {
      local: "Capteur de force industriel (compression)",
      role: "Convertit la force mécanique appliquée au cube de béton en un signal électrique faible, proportionnel à la charge.",
      specs: [
        "Type : compression / galette",
        "Capacité : 50 t ou 100 t selon la presse",
        "Sortie : environ 2 mV/V",
        "Précision : 0,05 % PE ou mieux",
        "Alimentation : 5 V à 12 V selon la fiche technique",
        "Corps : acier inoxydable ou allié",
      ],
      note: "N'utilisez jamais un capteur de 5 kg ou 20 kg — les charges du béton sont bien supérieures. Vérifiez que la charge maximale de la presse reste sous la capacité du capteur, prévu pour la compression et non la seule traction.",
    },
    {
      local: "Amplificateur et convertisseur de signal",
      role: "Amplifie le signal du pont de jauges et le convertit en données numériques 24 bits lisibles par l'Arduino.",
      specs: [
        "CAN 24 bits",
        "Compatible pont de jauges",
        "Alimentation : 2,7 V à 5 V",
        "Cadence : 10 SPS ou 80 SPS",
        "Broches : E+, E-, A+, A-, VCC, GND, DT, SCK",
      ],
    },
    {
      local: "Microcontrôleur principal",
      role: "Lit le HX711, calcule force et contrainte, détecte la rupture et pilote l'écran et le buzzer.",
      specs: [
        "MCU : ATmega328P",
        "Tension : 5 V",
        "Broches numériques : 14",
        "Broches analogiques : 6",
        "Convient aux deux modèles",
      ],
    },
    {
      local: "Écran d'affichage",
      role: "Affiche force, contrainte et charge maximale directement sur la machine, sans ordinateur.",
      specs: ["16 caractères × 2 lignes", "Interface I2C", "Adresse courante : 0x27 ou 0x3F", "Câblage : VCC, GND, SDA, SCL"],
    },
    {
      local: "Bouton de tare",
      role: "Bouton momentané qui remet la lecture à zéro avant chaque essai et lance un nouveau cycle.",
      specs: ["Momentané, normalement ouvert", "Sert à la fonction tare", "Câblé entre D4 et GND", "Dans le code : INPUT_PULLUP"],
    },
    {
      local: "Buzzer d'alarme",
      role: "Émet une alarme sonore nette à l'instant où le cube cède et où la charge chute brutalement.",
      specs: ["Type : buzzer actif", "Tension : 5 V", "Relié à la broche D5", "Se déclenche automatiquement"],
    },
    {
      local: "Alimentation",
      role: "Alimentation stable et régulée pour tout le circuit — sa stabilité conditionne celle des lectures.",
      specs: ["Tension : 5 V", "Courant : 2 A ou plus", "Préférez une source régulée", "Éloignez les sources de bruit"],
    },
    {
      local: "Presse hydraulique",
      role: "La source de force : elle applique une charge croissante sur le cube jusqu'à la rupture.",
      specs: [
        "Capacité : 50 t ou plus selon l'usage",
        "Bâti solide et rigide",
        "Plateaux durs et plans",
        "Carter de protection recommandé",
      ],
    },
  ],

  wiring: {
    tables: [
      {
        title: "Capteur vers HX711",
        note: "Les couleurs des fils varient d'un fabricant à l'autre : consultez toujours la fiche technique du capteur avant de câbler.",
        cols: ["Fil du capteur", "Fonction", "HX711"],
        rows: [
          ["Rouge (souvent)", "Excitation +", "E+"],
          ["Noir (souvent)", "Excitation -", "E-"],
          ["Vert (souvent)", "Signal +", "A+"],
          ["Blanc (souvent)", "Signal -", "A-"],
        ],
      },
      {
        title: "HX711 vers Arduino",
        cols: ["HX711", "Fonction", "Arduino"],
        rows: [
          ["VCC", "alimentation", "5V"],
          ["GND", "masse", "GND"],
          ["DT / DOUT", "données", "D3"],
          ["SCK / CLK", "horloge", "D2"],
        ],
      },
      {
        title: "LCD I2C vers Arduino",
        cols: ["LCD I2C", "Fonction", "Arduino Uno"],
        rows: [
          ["VCC", "alimentation", "5V"],
          ["GND", "masse", "GND"],
          ["SDA", "données I2C", "A4"],
          ["SCL", "horloge I2C", "A5"],
        ],
      },
      {
        title: "Bouton et buzzer",
        cols: ["Pièce", "Borne", "Arduino"],
        rows: [
          ["Bouton", "borne 1", "D4"],
          ["Bouton", "borne 2", "GND"],
          ["Buzzer", "+", "D5"],
          ["Buzzer", "-", "GND"],
        ],
      },
    ],
    diagramTitle: "Schéma de câblage complet",
    keyLabel: "Légende des fils :",
    keys: [
      "Alim + / E+",
      "Masse GND / E-",
      "Signal A+",
      "Signal A-",
      "DT → D3",
      "SCK → D2",
      "SDA → A4",
      "SCL → A5",
      "Bouton → D4",
      "Buzzer → D5",
    ],
    diag: {
      loadCell: "Capteur 50 t",
      amp: "Amplificateur de capteur",
      mcu: "Contrôleur principal",
      lcd: "Écran",
      tare: "Bouton tare → D4",
      buzzer: "Buzzer 5 V → D5",
      psu: "5V ⎓ 2A PSU",
      psuSub: "alimente tout le circuit",
    },
  },

  mech: {
    stackTitle: "Chemin de charge, de haut en bas",
    steps: [
      "Vérin de la presse hydraulique",
      "Capteur de force industriel",
      "Rotule sphérique (si disponible)",
      "Plateau de charge supérieur dur",
      "Cube de béton",
      "Plateau de charge inférieur dur",
      "Base de la presse",
    ],
    pointsTitle: "Points clés du montage",
    points: [
      "La charge doit être parfaitement centrée sur le capteur.",
      "Ne chargez jamais le capteur de biais ou latéralement.",
      "Utilisez des plateaux durs, plans et rectifiés.",
      "Protégez le capteur et les câbles des éclats.",
      "Une rotule sphérique répartit mieux la charge.",
      "Installez un carter tout autour de la zone d'écrasement.",
    ],
    diag: {
      ram: "Vérin de la presse",
      cell: "Capteur industriel",
      seat: "Rotule sphérique (si possible)",
      top: "Plateau supérieur dur",
      cube: "Cube de béton 150 mm",
      bottom: "Plateau inférieur dur",
      base: "Base de la presse",
      force: "sens de la charge",
      shield: "Carter — zone d'écrasement",
    },
  },

  math: {
    formulas: [
      { t: "Section (cube de 150 mm)", f: "Area = 150 × 150 = 22500 mm²" },
      { t: "Conversion masse → force", f: "Force(kN) = Mass(kg) × 9.80665 / 1000" },
      { t: "Calcul de la contrainte", f: "Stress(MPa) = Force(kN) × 1000 / Area(mm²)" },
    ],
    exTitle: "Exemple résolu",
    calcTitle: "Calculateur rapide de contrainte",
    calcSub: "Essayez : saisissez l'arête du cube et la charge maximale mesurée.",
    edge: "Arête du cube (mm)",
    peak: "Charge maximale (kN)",
    gradeNote:
      "La classe indiquée est une estimation pédagogique — la classification officielle exige des procédures et normes certifiées (ASTM C39, BS EN 12390…).",
  },

  models: {
    m1: "Modèle 1 : avec écran LCD",
    f1: [
      "Fonctionne sans ordinateur",
      "Affiche la force en kN",
      "Affiche la contrainte en MPa",
      "Affiche la charge maximale",
      "Alarme sonore à la rupture",
    ],
    m2: "Modèle 2 : sans écran",
    f2: [
      "Transmet les données par USB série",
      "Idéal pour l'enregistrement",
      "Données copiables dans Excel",
      "Sortie CSV prête à l'emploi",
    ],
    btn: "Voir le code et télécharger →",
  },

  calib: {
    steps: [
      "Mettez sous tension sans aucune charge sur le capteur.",
      "Appuyez sur le bouton Tare pour remettre à zéro.",
      "Appliquez une charge de valeur connue.",
      "Ajustez calibration_factor dans le code jusqu'à faire correspondre la lecture à la charge connue.",
      "Répétez avec plusieurs charges pour vérifier la linéarité.",
      "Idéalement, étalonnez un capteur 50/100 t sur une machine d'étalonnage certifiée.",
    ],
    warnT: "Avertissement important",
    warnText:
      "Un étalonnage avec de très petits poids ne donne pas une précision suffisante sur une plage de 50 ou 100 tonnes. Plus la charge d'étalonnage approche la plage réelle, plus les lectures sont fiables.",
  },

  safety: {
    eyebrow: "Sécurité d'abord — à lire avant de construire",
    title: "Sécurité",
    main:
      "L'écrasement de cubes de béton est extrêmement dangereux : des éclats peuvent être projetés à grande vitesse au moment de la rupture. Respectez chaque consigne sans exception.",
    rules: [
      "Portez lunettes de protection et gants pendant tout l'essai.",
      "Ne vous placez jamais face à la zone d'écrasement.",
      "Utilisez un carter métallique ou un acrylique épais.",
      "Centrez précisément le cube dans la zone de charge.",
      "Ne dépassez jamais la capacité du capteur.",
      "Ne dépassez jamais la capacité de la presse.",
      "Coupez l'alimentation avant toute modification du câblage.",
      "Éloignez les câbles du capteur de la zone d'écrasement.",
      "Projet pédagogique / expérimental — non valable pour des essais officiels sans étalonnage et certification.",
    ],
  },

  footer: {
    about:
      "Un guide pratique et ouvert pour transformer une presse hydraulique en instrument numérique de mesure de la résistance du béton avec Arduino, HX711 et un capteur industriel.",
    sectionsT: "Sections du guide",
    sourcesT: "Images et sources",
    sourcesText:
      "Les photos de composants sont des images produits illustratives créées spécialement pour ce guide ; elles représentent les pièces réelles par leur forme et leur fonction. Les noms et marques appartiennent à leurs propriétaires.",
    disclaimer:
      "⚠ Projet pédagogique / expérimental — ce n'est pas un instrument d'essai officiel sans étalonnage et certification par un organisme compétent.",
  },

  fw: {
    badge: "FIRMWARE · ARDUINO UNO · C++",
    t1: "Code Arduino pour le",
    t2: "testeur d'écrasement du béton",
    lead:
      "Firmware complet en deux versions : une pilotant un écran LCD 16x2, une autre diffusant des données CSV sur le port série. Copiez le code ou téléchargez le fichier .ino prêt à l'emploi.",
    libsT: "Bibliothèques requises",
    libs: [
      { by: "Bogdan Necula", desc: "Lit l'amplificateur HX711 et convertit les valeurs brutes en unités, avec fonctions de tare." },
      { by: "Frank de Brabander", desc: "Pilote un écran LCD 16x2 en I2C avec quatre fils seulement. Requise pour le modèle 1." },
      { by: "incluse dans l'IDE Arduino", desc: "Bibliothèque I2C de base — aucune installation, fournie avec l'environnement." },
    ],
    installT: "Installation depuis l'IDE Arduino",
    installS1: "Ouvrez le gestionnaire de bibliothèques :",
    installS2: "Recherchez et installez les deux bibliothèques :",
    pinT: "Récapitulatif des broches (commun aux deux modèles)",
    pins: ["HX711 DT (DOUT)", "HX711 SCK (CLK)", "Bouton de tare", "Buzzer (+)", "LCD SDA", "LCD SCL", "Alimentation"],
    bT: "Fichier 1 : le modèle LCD",
    cT: "Fichier 2 : le modèle série",
    d1: "Affiche F / P / S sur un LCD 16x2 avec alarme sonore à la rupture",
    n1: [
      "Changez l'adresse lcd(0x27,...) en 0x3F si rien ne s'affiche — utilisez un scanner I2C.",
      "Ajustez calibration_factor après un étalonnage réel sur charge connue.",
      "Détection de rupture : force sous 85 % du pic après dépassement de 20 kN.",
    ],
    d2: "Diffuse du CSV par USB à 9600 bauds — prêt à coller dans Excel",
    n2: [
      "Ouvrez le moniteur série à 9600 bauds et choisissez Newline.",
      "Collez les lignes dans Excel ou Google Sheets pour tracer la courbe.",
      "Le bouton de tare démarre un nouvel essai et remet pic et temps à zéro.",
    ],
    uploadT: "Téléverser le code sur l'Arduino",
    uploadSteps: [
      "Installez les bibliothèques requises (étape ci-dessus).",
      "Reliez l'Arduino Uno à l'ordinateur par un câble USB.",
      "Dans l'IDE : Tools → Board → Arduino Uno.",
      "Choisissez le bon port dans Tools → Port.",
      "Collez le code (ou ouvrez le .ino) puis appuyez sur Upload ⬆.",
      "Pour le modèle 2, ouvrez le moniteur série à 9600 bauds pour voir le CSV.",
    ],
    beforeT: "Avant le premier essai",
    beforeText:
      "Ne laissez aucune charge sur le capteur pendant le téléversement et la mise à zéro : le code exécute scale.tare() automatiquement, et toute charge présente deviendrait un faux zéro.",
    csvT: "Structure des données CSV",
    backBtn: "← Retour au câblage et aux calculs",
  },
};
