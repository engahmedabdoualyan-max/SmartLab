/* ============================================================
   smartLAB — Soil & Roads Standards Library Data
   ============================================================ */

const ORG_LABELS = { aashto: 'AASHTO', astm: 'ASTM', bs: 'BS', ecp: 'ECP' };
const ORG_CLASSES = { aashto: 'org-aashto', astm: 'org-astm', bs: 'org-bs', ecp: 'org-ecp' };

const CATEGORIES = [
    { id: 'all', label: 'All Standards' },
    { id: 'strength', label: 'Strength / CBR' },
    { id: 'compaction', label: 'Compaction' },
    { id: 'classification', label: 'Classification' },
    { id: 'moisture', label: 'Moisture / Water' },
    { id: 'pavement', label: 'Pavement Design' },
    { id: 'aggregates', label: 'Aggregates' },
    { id: 'earthwork', label: 'Earthwork / Site' }
];

const STANDARDS = [
    { code: 'AASHTO T 193', title: 'California Bearing Ratio', org: 'aashto', categories: ['strength'], tags: ['CBR', 'bearing ratio', 'subgrade', 'soaked'], desc: 'Standard CBR test. Soaked and unsoaked conditions. Plunger at 1.27 mm/min. Results at 2.54 mm and 5.08 mm penetration.', year: 2016 },
    { code: 'AASHTO T 180', title: 'Moisture-Density Relations of Soils', org: 'aashto', categories: ['compaction'], tags: ['Proctor', 'compaction', 'MDD', 'OMC'], desc: 'Laboratory compaction (Modified Proctor). 4.54 kg rammer, 457 mm drop, 25 blows/layer, 5 layers. Determines MDD and OMC.', year: 2018 },
    { code: 'AASHTO T 99', title: 'Moisture-Density Relations (Standard Proctor)', org: 'aashto', categories: ['compaction'], tags: ['Proctor', 'standard', 'compaction', 'MDD'], desc: 'Standard Proctor compaction. 2.49 kg rammer, 305 mm drop, 25 blows/layer, 3 layers. Lighter energy than T 180.', year: 2018 },
    { code: 'AASHTO T 265', title: 'Laboratory Determination of Moisture Content', org: 'aashto', categories: ['moisture'], tags: ['moisture content', 'oven dry', 'water content'], desc: 'Oven-dry method for determining soil moisture content. 110 ± 5 °C for 12-24 hours.', year: 2016 },
    { code: 'AASHTO T 310', title: 'In-Place Density of Soil Using Nuclear Gauge', org: 'aashto', categories: ['earthwork'], tags: ['nuclear gauge', 'field density', 'compaction QC'], desc: 'In-situ density using nuclear backscatter or direct transmission. Correlation with D1556 needed.', year: 2019 },
    { code: 'AASHTO T 274', title: 'Frictional Characteristics of Compacted Soils', org: 'aashto', categories: ['strength'], tags: ['friction angle', 'shear strength', 'direct shear'], desc: 'Direct shear test for determining internal friction angle of compacted soils.', year: 2018 },
    { code: 'AASHTO M 145', title: 'Classification of Soils and Soil-Aggregate Mixtures', org: 'aashto', categories: ['classification'], tags: ['AASHTO classification', 'A-1', 'A-2', 'A-6', 'group index'], desc: 'AASHTO soil classification system. Groups A-1 through A-7 with Group Index calculation.', year: 2017 },
    { code: 'AASHTO T 88', title: 'Particle Size Analysis of Soils', org: 'aashto', categories: ['classification'], tags: ['grain size', 'sieve analysis', 'hydrometer', 'gradation'], desc: 'Combined sieve and hydrometer analysis for particle size distribution.', year: 2018 },
    { code: 'AASHTO T 89', title: 'Liquid Limit of Soils', org: 'aashto', categories: ['classification'], tags: ['Atterberg', 'liquid limit', 'LL', 'Casagrande'], desc: 'Casagrande cup method for liquid limit determination.', year: 2018 },
    { code: 'AASHTO T 90', title: 'Plastic Limit and Plasticity Index of Soils', org: 'aashto', categories: ['classification'], tags: ['Atterberg', 'plastic limit', 'PI', 'plasticity'], desc: 'Plastic limit and plasticity index determination.', year: 2018 },
    { code: 'ASTM D1883', title: 'CBR of Laboratory-Compacted Soils', org: 'astm', categories: ['strength'], tags: ['CBR', 'bearing ratio', 'penetration', 'subgrade'], desc: 'Laboratory CBR test. Standard plunger area 3 in², loading rate 1.27 mm/min. Soaked 96 hours.', year: 2021 },
    { code: 'ASTM D698', title: 'Compaction Characteristics of Soil Using Standard Effort', org: 'astm', categories: ['compaction'], tags: ['standard Proctor', 'MDD', 'OMC', 'compaction curve'], desc: 'Standard effort compaction (Standard Proctor). 2.5 kg rammer, 305 mm drop. Defines laboratory maximum dry density.', year: 2012 },
    { code: 'ASTM D1557', title: 'Compaction Characteristics Using Modified Effort', org: 'astm', categories: ['compaction'], tags: ['Modified Proctor', 'MDD', 'OMC', 'high energy'], desc: 'Modified effort compaction (Modified Proctor). 4.54 kg rammer, 457 mm drop. For heavy traffic pavements.', year: 2020 },
    { code: 'ASTM D6913', title: 'Particle Size Distribution (Sieve Analysis)', org: 'astm', categories: ['classification'], tags: ['sieve analysis', 'gradation', 'grain size', 'sieves'], desc: 'Sieve analysis for determining particle size distribution of soils. Wet and dry sieving.', year: 2022 },
    { code: 'ASTM D4318', title: 'Liquid Limit, Plastic Limit, and Plasticity Index', org: 'astm', categories: ['classification'], tags: ['Atterberg limits', 'LL', 'PL', 'PI', 'Casagrande'], desc: 'Atterberg limits using Casagrande cup (LL) and rolling thread (PL). Defines PI = LL - PL.', year: 2017 },
    { code: 'ASTM D2487', title: 'Classification of Soils for Engineering Purposes', org: 'astm', categories: ['classification'], tags: ['USCS', 'classification', 'GL', 'GW', 'SC', 'MH'], desc: 'Unified Soil Classification System (USCS). Dual symbols for border cases. Flow chart based.', year: 2017 },
    { code: 'ASTM D1556', title: 'Density by Sand Replacement Method', org: 'astm', categories: ['earthwork'], tags: ['sand cone', 'field density', 'compaction QC', 'excavation'], desc: 'Sand cone method for in-situ density. Sand calibration against standard hole.', year: 2019 },
    { code: 'ASTM D2216', title: 'Moisture Content of Soil by Oven Drying', org: 'astm', categories: ['moisture'], tags: ['moisture content', 'oven dry', 'water content', 'wet basis'], desc: 'Oven drying at 110 ± 5 °C for not less than 12 hours. Standard moisture content method.', year: 2019 },
    { code: 'ASTM D854', title: 'Specific Gravity of Soils', org: 'astm', categories: ['classification'], tags: ['specific gravity', 'Gs', 'pycnometer', 'density'], desc: 'Specific gravity of soil solids using pycnometer. Typical values: 2.60-2.80.', year: 2020 },
    { code: 'ASTM D2167', title: 'Density and Unit Weight by the Rubber Balloon Method', org: 'astm', categories: ['earthwork'], tags: ['rubber balloon', 'field density', 'compaction'], desc: 'Rubber balloon method for determining in-place density. Good for fine-grained soils.', year: 2020 },
    { code: 'ASTM D4767', title: 'Consolidated Undrained Triaxial Compression Test', org: 'astm', categories: ['strength'], tags: ['triaxial', 'CU test', 'shear strength', 'c', 'phi'], desc: 'CU triaxial test for effective stress shear strength parameters (c, phi).', year: 2020 },
    { code: 'ASTM D2850', title: 'Unconsolidated-Undrained Triaxial Compression Test', org: 'astm', categories: ['strength'], tags: ['UU test', 'triaxial', 'undrained', 'Su'], desc: 'UU triaxial test for undrained shear strength (Su). Quick test for saturated clays.', year: 2015 },
    { code: 'BS 1377-4', title: 'Compaction Tests', org: 'bs', categories: ['compaction'], tags: ['Proctor', 'compaction', 'UK', 'rammer'], desc: 'British Standard for soil compaction tests. Defines standard and heavy compaction energy levels.', year: 2020 },
    { code: 'BS 1377-2', title: 'Classification Tests', org: 'bs', categories: ['classification'], tags: ['Atterberg', 'sieve', 'classification', 'UK'], desc: 'British Standard for soil classification including Atterberg limits, particle size, and linear shrinkage.', year: 1990 },
    { code: 'BS 1377-3', title: 'Chemical and Electro-Chemical Tests', org: 'bs', categories: ['earthwork'], tags: ['chemical', 'pH', 'sulfate', 'organic'], desc: 'Chemical tests on soils including pH, sulfate content, and organic matter.', year: 1990 },
    { code: 'BS 5930', title: 'Code of Practice for Ground Investigation', org: 'bs', categories: ['earthwork'], tags: ['ground investigation', 'borehole', 'SPT', 'site investigation'], desc: 'UK code of practice for ground investigation. SPT, CPT, borehole logging, and reporting.', year: 2015 },
    { code: 'ECP 2', title: 'Code of Practice for Soil Investigation', org: 'ecp', categories: ['earthwork'], tags: ['Egypt', 'site investigation', 'borehole', 'SPT'], desc: 'Egyptian Code of Practice for soil investigation and site exploration requirements.', year: 2016 },
    { code: 'AASHTO 1993', title: 'Guide for Design of Pavement Structures', org: 'aashto', categories: ['pavement'], tags: ['pavement design', 'structural number', 'SN', 'layered'], desc: 'AASHTO 1993 flexible and rigid pavement design method using SN and serviceability concept.', year: 1993 }
];
