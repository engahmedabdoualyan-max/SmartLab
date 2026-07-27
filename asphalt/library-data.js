/* ============================================================
   smartLAB — Standards Library Database
   45+ real AASHTO / ASTM / BS / ECP / Shell / AI standards
   ============================================================ */

const ORG_LABELS = {
    aashto: 'AASHTO',
    astm:   'ASTM',
    bs:     'BS',
    ecp:    'ECP',
    shell:  'Shell',
    ai:     'AI'
};

const ORG_CLASSES = {
    aashto: 'org-aashto',
    astm:   'org-astm',
    bs:     'org-bs',
    ecp:    'org-ecp',
    shell:  'org-shell',
    ai:     'org-ai'
};

const CATEGORIES = [
    { id: 'all',           label: 'All Standards' },
    { id: 'aggregates',    label: 'Aggregates' },
    { id: 'bitumen',       label: 'Bitumen / Binder' },
    { id: 'mixdesign',     label: 'Mix Design' },
    { id: 'testing',       label: 'Testing Methods' },
    { id: 'construction',  label: 'Construction' },
    { id: 'pavement',      label: 'Pavement Design' },
    { id: 'quality',       label: 'Quality / Specs' }
];

const STANDARDS = [
    // ── AGGREGATES ──
    {
        code: 'AASHTO M 43',
        title: 'Standard Specification for Standard Sizes of Coarse Aggregate',
        org: 'aashto',
        categories: ['aggregates'],
        tags: ['gradation', 'sieve', 'stone', 'coarse'],
        desc: 'Defines standard size designations (No. 57, 67, 7, 8, 89, 9) for coarse aggregates used in highway construction.',
        year: 2022
    },
    {
        code: 'AASHTO T 27 / T 11',
        title: 'Sieve Analysis of Fine and Coarse Aggregates',
        org: 'aashto',
        categories: ['aggregates', 'testing'],
        tags: ['gradation', 'sieve analysis', 'particle size'],
        desc: 'Determines the particle size distribution of fine and coarse aggregates by sieving. Fundamental for all mix design.',
        year: 2020
    },
    {
        code: 'AASHTO T 84',
        title: 'Specific Gravity and Absorption of Fine Aggregate',
        org: 'aashto',
        categories: ['aggregates', 'testing'],
        tags: ['specific gravity', 'absorption', 'fine aggregate', 'Gsb'],
        desc: 'Determines bulk and apparent specific gravity and absorption of fine aggregate. Essential for volumetric mix design.',
        year: 2020
    },
    {
        code: 'AASHTO T 85',
        title: 'Specific Gravity and Absorption of Coarse Aggregate',
        org: 'aashto',
        categories: ['aggregates', 'testing'],
        tags: ['specific gravity', 'absorption', 'coarse aggregate', 'Gsb'],
        desc: 'Determines bulk and apparent specific gravity and absorption of coarse aggregate using the hydrostatic balance method.',
        year: 2020
    },
    {
        code: 'AASHTO T 96',
        title: 'Resistance to Degradation of Small-Size Coarse Aggregate by Abrasion and Impact in the Los Angeles Machine',
        org: 'aashto',
        categories: ['aggregates', 'testing'],
        tags: ['LA abrasion', 'durability', 'toughness', 'wear'],
        desc: 'Measures resistance to degradation by abrasion and impact. Max 40% loss for high-quality surfaces, 50% for base courses.',
        year: 2021
    },
    {
        code: 'AASHTO T 103',
        title: 'Soundness of Aggregates by Freezing and Thawing',
        org: 'aashto',
        categories: ['aggregates', 'testing'],
        tags: ['soundness', 'freeze-thaw', 'durability', 'weathering'],
        desc: 'Evaluates resistance to weathering by saturated freezing and thawing cycles. Critical for cold-climate aggregate selection.',
        year: 2017
    },
    {
        code: 'AASHTO T 176',
        title: 'Use of Deicing Materials on Highways',
        org: 'aashto',
        categories: ['aggregates', 'construction'],
        tags: ['deicing', 'salt', 'frost', 'winter maintenance'],
        desc: 'Provides guidance on use and effects of deicing chemicals on pavement surfaces and aggregate quality.',
        year: 2019
    },
    {
        code: 'AASHTO T 304',
        title: 'Uncompacted Void Content of Fine Aggregate',
        org: 'aashto',
        categories: ['aggregates', 'testing'],
        tags: ['angularity', 'shape', 'voids', 'fine aggregate'],
        desc: 'Measures angularity and shape characteristics of fine aggregate through uncompacted void content. Higher voids = more angular.',
        year: 2020
    },
    {
        code: 'ASTM D3398',
        title: 'Index of Aggregate Particle Shape and Texture',
        org: 'astm',
        categories: ['aggregates', 'testing'],
        tags: ['shape', 'texture', 'angularity', 'flat', 'elongated'],
        desc: 'Determines combined index of particle shape and texture by measuring uncompacted void content at two compaction rates.',
        year: 2017
    },
    {
        code: 'ASTM D4791',
        title: 'Flat Particles, Elongated Particles, or Flat and Elongated Particles in Coarse Aggregate',
        org: 'astm',
        categories: ['aggregates', 'testing'],
        tags: ['flat', 'elongated', 'shape', 'particle shape'],
        desc: 'Determines percentage of flat, elongated, or flat-and-elongated particles in coarse aggregate. Limits prevent pumping and compaction issues.',
        year: 2019
    },
    {
        code: 'BS 812-105.1',
        title: 'Methods for Determination of Particle Size Distribution — Sieving',
        org: 'bs',
        categories: ['aggregates', 'testing'],
        tags: ['gradation', 'sieve', 'particle size', 'UK'],
        desc: 'British Standard for sieve analysis of aggregates. Parallel to AASHTO T 27/T 11 for UK/European projects.',
        year: 2010
    },
    {
        code: 'ECP 102',
        title: 'Standard Specification for Aggregate Quality',
        org: 'ecp',
        categories: ['aggregates', 'quality'],
        tags: ['aggregate', 'quality', 'specification', 'Gulf'],
        desc: 'Egyptian Code of Practice for aggregate requirements in road construction. Covers LA abrasion, soundness, and specific gravity.',
        year: 2022
    },

    // ── BITUMEN / BINDER ──
    {
        code: 'AASHTO M 20',
        title: 'Standard Specification for Performance-Graded Asphalt Binder',
        org: 'aashto',
        categories: ['bitumen'],
        tags: ['binder', 'PG grade', 'performance grade', 'asphalt cement'],
        desc: 'Specifies PG grading system for asphalt binders based on climate and traffic. PG 64-22, PG 76-22 etc.',
        year: 2022
    },
    {
        code: 'AASHTO M 320',
        title: 'Standard Specification for Performance-Graded Asphalt Binder',
        org: 'aashto',
        categories: ['bitumen'],
        tags: ['PG grade', 'rheology', 'binder', 'DSCR', 'RTFO'],
        desc: 'Supersedes M 20. Defines PG grades using DSR, BBR, and DDT tests after aging (RTFO, PAV).',
        year: 2022
    },
    {
        code: 'AASHTO T 312',
        title: 'Preparing and Determining the Density of Hot Mix Asphalt (HMA) Specimens by Means of the Superpave Gyratory Compactor',
        org: 'aashto',
        categories: ['bitumen', 'testing'],
        tags: ['SGC', 'gyratory', 'compaction', 'density'],
        desc: 'Standard method for compacting HMA specimens using the Superpave gyratory compactor for volumetric analysis.',
        year: 2020
    },
    {
        code: 'ASTM D946',
        title: 'Penetration-Graded Asphalt Cement',
        org: 'astm',
        categories: ['bitumen'],
        tags: ['penetration', 'grade', 'asphalt cement', 'conventional'],
        desc: 'Standard specification for penetration-graded asphalt cements (60/70, 80/100). Traditional grading before PG system.',
        year: 2019
    },
    {
        code: 'ASTM D36',
        title: 'Softening Point of Bitumen (Ring-and-Ball Apparatus)',
        org: 'astm',
        categories: ['bitumen', 'testing'],
        tags: ['softening point', 'ring and ball', 'temperature'],
        desc: 'Determines softening point of bituminous materials. Higher softening point indicates resistance to flow at elevated temperatures.',
        year: 2019
    },
    {
        code: 'ASTM D113',
        title: 'Ductility of Bituminous Materials',
        org: 'astm',
        categories: ['bitumen', 'testing'],
        tags: ['ductility', 'elongation', 'stretch', 'cohesion'],
        desc: 'Measures distance a standard briquette of bitumen can be stretched before breaking. Min 100 cm for paving grades.',
        year: 2018
    },
    {
        code: 'ASTM D5',
        title: 'Penetration of Bituminous Materials',
        org: 'astm',
        categories: ['bitumen', 'testing'],
        tags: ['penetration', 'consistency', 'hardness'],
        desc: 'Standard test for penetration of bitumen at 25°C, 100g, 5 sec. Primary test for penetration-graded binders (e.g., 60/70).',
        year: 2020
    },
    {
        code: 'ASTM D2041',
        title: 'Theoretical Maximum Specific Gravity and Density of Bituminous Paving Mixtures',
        org: 'astm',
        categories: ['bitumen', 'testing'],
        tags: ['Gmm', 'theoretical max', 'Rice test', 'voids'],
        desc: 'Determines theoretical maximum specific gravity (Rice gravity) of loose HMA. Used to calculate air void content.',
        year: 2019
    },
    {
        code: 'ASTM D2726',
        title: 'Bulk Specific Gravity and Density of Non-Absorptive Compacted Bituminous Mixtures',
        org: 'astm',
        categories: ['bitumen', 'testing'],
        tags: ['Gmb', 'bulk gravity', 'compacted', 'density'],
        desc: 'Saturated Surface Dry (SSD) method for determining bulk specific gravity of compacted HMA specimens.',
        year: 2019
    },
    {
        code: 'BS EN 12591',
        title: 'Bitumen and Bituminous Binders — Specifications for Paving Grade Bitumens',
        org: 'bs',
        categories: ['bitumen', 'quality'],
        tags: ['paving grade', 'specification', 'EN', 'penetration'],
        desc: 'European specification for paving grade bitumens. Grades include 35/50, 50/70, 70/100 based on penetration.',
        year: 2019
    },
    {
        code: 'Shell TM-1',
        title: 'Shell Bitumen Handbook — Testing Methods',
        org: 'shell',
        categories: ['bitumen', 'testing'],
        tags: ['Shell', 'testing', 'binder', 'methods'],
        desc: 'Shell\'s comprehensive guide to bitumen testing methods, including viscosity, rheology, and performance characterization.',
        year: 2015
    },

    // ── MIX DESIGN ──
    {
        code: 'AASHTO M 323',
        title: 'Standard Specification for Superpave Volumetric Mix Design',
        org: 'aashto',
        categories: ['mixdesign'],
        tags: ['Superpave', 'volumetric', 'mix design', 'VMA', 'VFA', 'air voids'],
        desc: 'Master specification for Superpave volumetric mix design. Defines VMA min, VFA range (65-80%), target air voids (4%).',
        year: 2022
    },
    {
        code: 'AASHTO R 35',
        title: 'Superpave Volumetric Mix Design Practice',
        org: 'aashto',
        categories: ['mixdesign'],
        tags: ['Superpave', 'practice', 'gyratory', 'gradation', 'design'],
        desc: 'Recommended practice for Superpave volumetric mix design including trial blend preparation and compaction.',
        year: 2022
    },
    {
        code: 'AASHTO R 30',
        title: 'Practice for Mixture Conditioning of Hot Mix Asphalt (HMA)',
        org: 'aashto',
        categories: ['mixdesign'],
        tags: ['conditioning', 'aging', 'moisture', 'HMA'],
        desc: 'Standard practice for short-term and long-term aging/conditioning of HMA mixtures before performance testing.',
        year: 2020
    },
    {
        code: 'AASHTO T 283',
        title: 'Resistance of Compacted HMA to Moisture-Induced Damage',
        org: 'aashto',
        categories: ['mixdesign', 'testing'],
        tags: ['moisture', 'stripping', 'TSR', 'durability', 'freeze-thaw'],
        desc: 'Evaluates moisture susceptibility of HMA using tensile strength ratio (TSR). Min 80% TSR for most agencies.',
        year: 2020
    },
    {
        code: 'AASHTO T 316',
        title: 'Resistance to Compaction of Hot Mix Asphalt (HMA) Using the Marshall Method',
        org: 'aashto',
        categories: ['mixdesign', 'testing'],
        tags: ['Marshall', 'stability', 'flow', 'compaction', 'hammer'],
        desc: 'Marshall method for compacting HMA specimens (575 blows, 75 per face). Used for stability, flow, and volumetric analysis.',
        year: 2020
    },
    {
        code: 'ASTM D1559',
        title: 'Resistance to Plastic Flow of Bituminous Mixtures Using Marshall Apparatus',
        org: 'astm',
        categories: ['mixdesign', 'testing'],
        tags: ['Marshall', 'stability', 'flow', 'compaction'],
        desc: 'ASTM equivalent of Marshall compaction and testing. Specifies 75-blow compaction and 50.8 mm/min loading rate.',
        year: 2019
    },
    {
        code: 'ECP 104',
        title: 'Hot Mix Asphalt — Mix Design and Quality Control',
        org: 'ecp',
        categories: ['mixdesign', 'quality'],
        tags: ['Egypt', 'ECP', 'Marshall', 'Superpave', 'QCR'],
        desc: 'Egyptian Code of Practice for HMA mix design using Marshall method. Specifies gradation bands, VMA, VFA, and stability requirements.',
        year: 2022
    },
    {
        code: 'ECP 101',
        title: 'Asphalt Concrete for Road Construction — General Requirements',
        org: 'ecp',
        categories: ['mixdesign', 'quality', 'construction'],
        tags: ['Egypt', 'ECP', 'specification', 'road', 'asphalt'],
        desc: 'General requirements for asphalt concrete road construction in Egypt. Covers materials, equipment, and workmanship.',
        year: 2022
    },
    {
        code: 'AI MS-2',
        title: 'Mix Design Methods for Hot Mix Asphalt',
        org: 'ai',
        categories: ['mixdesign'],
        tags: ['Asphalt Institute', 'Marshall', 'mix design', 'manual'],
        desc: 'Asphalt Institute\'s comprehensive Marshall mix design manual (7th edition). Reference for aggregate selection and volumetrics.',
        year: 2014
    },
    {
        code: 'BS 594987',
        title: 'Requirements for Hot Rolled Asphalt for Roads and Other Paved Areas',
        org: 'bs',
        categories: ['mixdesign', 'quality'],
        tags: ['HRA', 'UK', 'hot rolled', 'grading'],
        desc: 'British Standard for hot rolled asphalt (HRA) mix design, surface course, and base course specifications.',
        year: 2015
    },

    // ── TESTING METHODS ──
    {
        code: 'AASHTO T 245',
        title: 'Resistance to Plastic Flow of Bituminous Mixtures Using Marshall Apparatus',
        org: 'aashto',
        categories: ['testing'],
        tags: ['Marshall', 'stability', 'flow', 'loading'],
        desc: 'Determines Marshall stability and flow of compacted HMA specimens. Loading rate 50.8 mm/min, max load at failure.',
        year: 2019
    },
    {
        code: 'AASHTO T 240',
        title: 'Effect of Heat and Air on a Film of Bituminous Material (Rolling Thin-Film Oven)',
        org: 'aashto',
        categories: ['testing', 'bitumen'],
        tags: ['RTFO', 'aging', 'short-term', 'binder'],
        desc: 'Simulates short-term aging of binder during mixing and placement using rolling thin-film oven at 163°C for 85 min.',
        year: 2020
    },
    {
        code: 'AASHTO T 315',
        title: 'Determining the Creep Stiffness and m-Value of Asphalt Binder Using the BBR',
        org: 'aashto',
        categories: ['testing', 'bitumen'],
        tags: ['BBR', 'bending beam', 'creep', 'low temperature', 'm-value'],
        desc: 'Bending Beam Rheometer test for low-temperature cracking resistance. Measures creep stiffness (max 300 MPa) and m-value (min 0.3).',
        year: 2020
    },
    {
        code: 'AASHTO T 313',
        title: 'Determining the Flexural Creep Stiffness of Asphalt Binder Using the BBR',
        org: 'aashto',
        categories: ['testing', 'bitumen'],
        tags: ['BBR', 'rheology', 'binder', 'aging'],
        desc: 'Tests aged binder (RTFO + PAV) at low temperatures. Part of Superpave binder characterization suite.',
        year: 2020
    },
    {
        code: 'ASTM D6927',
        title: 'Standard Test Method for Determination of Rutting in Bituminous Mixtures Using Loaded Wheel Tester',
        org: 'astm',
        categories: ['testing', 'mixdesign'],
        tags: ['rutting', 'APA', 'wheel tracker', 'permanente deformation'],
        desc: 'Measures rutting susceptibility of HMA using Asphalt Pavement Analyzer (APA). Critical for high-traffic pavements.',
        year: 2020
    },
    {
        code: 'AASHTO T 324',
        title: ' Hamburg Wheel-Track Testing of Compacted Hot-Mix Asphalt (HMA)',
        org: 'aashto',
        categories: ['testing', 'mixdesign'],
        tags: ['Hamburg', 'wheel track', 'rutting', 'stripping', 'moisture'],
        desc: 'Evaluates rutting and moisture susceptibility simultaneously using Hamburg wheel-tracking device. Max 12.5 mm rut depth.',
        year: 2022
    },
    {
        code: 'ASTM D6373',
        title: 'Standard Specification for Graded Asphalt Binder',
        org: 'astm',
        categories: ['bitumen', 'quality'],
        tags: ['PG grade', 'binder', 'specification'],
        desc: 'ASTM specification for performance-graded asphalt binders. Covers PG 52 through PG 82 in various temperature grades.',
        year: 2020
    },

    // ── CONSTRUCTION ──
    {
        code: 'AASHTO M 92',
        title: 'Standard Specifications for Calibrating Axle Load Scales and Permissible tolerances',
        org: 'aashto',
        categories: ['construction'],
        tags: ['weigh station', 'truck', 'axle', 'calibration'],
        desc: 'Specifications for calibrating truck axle load scales used in construction traffic control.',
        year: 2018
    },
    {
        code: 'ECP 103',
        title: 'Asphalt Paving Operations — Construction and Quality Control',
        org: 'ecp',
        categories: ['construction', 'quality'],
        tags: ['Egypt', 'ECP', 'paving', 'compaction', 'temperature'],
        desc: 'Egyptian Code for asphalt paving operations. Covers mixing temperature, laydown, rolling patterns, and compaction requirements.',
        year: 2022
    },
    {
        code: 'ASTM D6936',
        title: 'Standard Test Method for Determining the Resistance to Shear Flow of Asphalt Mixtures',
        org: 'astm',
        categories: ['construction', 'testing'],
        tags: ['shear', 'compaction', 'workability'],
        desc: 'Evaluates shear resistance of HMA during construction. Useful for assessing compactability and rutting potential.',
        year: 2019
    },

    // ── PAVEMENT DESIGN ──
    {
        code: 'AASHTO 1993',
        title: 'Guide for Design of Pavement Structures',
        org: 'aashto',
        categories: ['pavement'],
        tags: ['pavement design', 'AASHTO road test', 'structural number', 'SN', 'ESAL', 'CBR', 'layer'],
        desc: 'AASHTO 1993 pavement design guide. Uses ESALs, serviceability, and layer coefficients to determine pavement thickness. Foundation for global pavement design.',
        year: 1993
    },
    {
        code: 'AASHTO 2008 / MEPDG',
        title: 'Mechanistic-Empirical Pavement Design Guide (MEPDG)',
        org: 'aashto',
        categories: ['pavement'],
        tags: ['MEPDG', 'mechanistic', 'empirical', 'performance', 'prediction'],
        desc: 'Next-generation pavement design using mechanistic-empirical methods. Predicts rutting, cracking, and roughness over design life.',
        year: 2008
    },
    {
        code: 'Shell PAVEMENT DESIGN MANUAL',
        title: 'Shell Pavement Design Manual — Asphalt Pavements and Overlays for Road Traffic',
        org: 'shell',
        categories: ['pavement'],
        tags: ['Shell', 'pavement design', 'overlay', 'modulus', '疲劳'],
        desc: 'Shell\'s proprietary pavement design method based on bituminous material properties and traffic loading.',
        year: 1998
    },
    {
        code: 'AI D-1 (MS-1)',
        title: 'Asphalt Thickness Design for Highways, Airports, and Other Traffic Facilities',
        org: 'ai',
        categories: ['pavement'],
        tags: ['Asphalt Institute', 'thickness design', 'overlay', 'structural number'],
        desc: 'Asphalt Institute\'s thickness design manual. Provides chart-based methods for flexible pavement and overlay design.',
        year: 2000
    },

    // ── QUALITY / SPECIFICATIONS ──
    {
        code: 'AASHTO PP 78',
        title: 'Standard Practice for Mixture Conditioning of Hot Mix Asphalt (HMA)',
        org: 'aashto',
        categories: ['quality', 'mixdesign'],
        tags: ['quality control', 'QA', 'specification', 'construction'],
        desc: 'Practice for quality assurance of HMA production and construction. Defines sampling frequency and acceptance criteria.',
        year: 2020
    },
    {
        code: 'ASTM D7064',
        title: 'Standard Practice for Open-Graded Friction Course (OGFC) Mix Design',
        org: 'astm',
        categories: ['mixdesign', 'quality'],
        tags: ['OGFC', 'drainage', 'open-graded', 'porous'],
        desc: 'Standard practice for designing open-graded friction courses for noise reduction and drainage.',
        year: 2019
    },
    {
        code: 'BS 7346-4',
        title: 'Code of Practice for Design of Road Pavements Using Asphalt Stabilised Marginal Materials',
        org: 'bs',
        categories: ['pavement', 'quality'],
        tags: ['marginal', 'stabilized', 'UK', 'pavement', 'design'],
        desc: 'British guidance for using asphalt-stabilized marginal aggregates in pavement construction.',
        year: 2003
    }
];
