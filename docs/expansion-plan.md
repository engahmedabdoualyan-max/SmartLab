# SmartLAP Expansion Plan: 20 → 50+ Tests

## Current Tests (20)

| # | Screen ID | Test Name |
|---|-----------|-----------|
| 1 | compaction | Proctor Compaction (ASTM D698/D1557) |
| 2 | cbr | California Bearing Ratio (ASTM D1883) |
| 3 | straightedge | Straightedge Test (ASTM E1155) |
| 4 | atterberg | Atterberg Limits (ASTM D4318) |
| 5 | sieve | Sieve Analysis (ASTM D6913/D422) |
| 6 | specific_gravity | Specific Gravity (ASTM D854) |
| 7 | permeability | Permeability (ASTM D2434) |
| 8 | slump | Concrete Slump (ASTM C143) |
| 9 | maturity | Concrete Maturity (ASTM C1074) |
| 10 | flexural | Flexural Strength (ASTM C78) |
| 11 | split_tensile | Split Tensile (ASTM C496) |
| 12 | marshall | Marshall Test (ASTM D6927) |
| 13 | bitumen | Bitumen Content (ASTM D2172) |
| 14 | penetration | Penetration Test (ASTM D5) |
| 15 | ductility | Ductility Test (ASTM D113) |
| 16 | softening_point | Softening Point (ASTM D36) |
| 17 | viscosity | Viscosity Test (ASTM D4402) |
| 18 | water_absorption | Water Absorption (ASTM C642) |
| 19 | air | Air Content (ASTM C231) |
| 20 | dynamic | Dynamic Test Engine |

---

## Phase 1: Soil Tests (+10)

| # | Test | ASTM Standard | Priority |
|---|------|---------------|----------|
| 1 | USCS Soil Classification | D2487 | High |
| 2 | Hydrometer Analysis | D7928 | High |
| 3 | Shrinkage Limit | D427 | Medium |
| 4 | Unconfined Compression | D2166 | High |
| 5 | Triaxial Compression | D2850 | High |
| 6 | Direct Shear (repeated) | D3080 | High |
| 7 | Consolidation (Oedometer) | D2435 | Medium |
| 8 | Expansion Index | D4829 | Medium |
| 9 | Soil pH & Sulfate | D4972 | Low |
| 10 | Organic Content (LOI) | D2974 | Low |

## Phase 2: Concrete Tests (+10)

| # | Test | ASTM Standard | Priority |
|---|------|---------------|----------|
| 1 | Compressive Strength (Cylinder) | C39 | High |
| 2 | Air Content (Pressure) | C231 | High |
| 3 | Slump Flow | C1611 | Medium |
| 4 | Concrete Temperature | C1064 | High |
| 5 | Unit Weight & Yield | C138 | High |
| 6 | Chloride Penetration | C1202 | Medium |
| 7 | Rapid Chloride Migration | NT Build 492 | Low |
| 8 | Drying Shrinkage | C157 | Medium |
| 9 | Creep | C512 | Low |
| 10 | Modulus of Elasticity | C469 | Medium |

## Phase 3: Asphalt Tests (+5)

| # | Test | ASTM/AASHTO Standard | Priority |
|---|------|---------------------|----------|
| 1 | Rice Gravity (Gmm) | D2041 | High |
| 2 | Bulk Specific Gravity | D2726 | High |
| 3 | Indirect Tensile Strength | D6931 | Medium |
| 4 | Asphalt Content (Ignition) | D6307 | High |
| 5 | Rutting (Hamburg Wheel) | T324 | Low |

## Phase 4: Aggregate Tests (+5)

| # | Test | ASTM Standard | Priority |
|---|------|---------------|----------|
| 1 | Los Angeles Abrasion | C131/C535 | High |
| 2 | Soundness (Na/Mg Sulfate) | C88 | Medium |
| 3 | Flat & Elongated Particles | D4791 | Medium |
| 4 | Fine Aggregate Angularity | C1252 | Low |
| 5 | Sand Equivalent | D2419 | Medium |

---

## Priority Matrix

| Test | Priority | Effort | Impact |
|------|----------|--------|--------|
| USCS Classification | High | S | High |
| Hydrometer | High | M | High |
| Triaxial Compression | High | L | High |
| Compressive Strength (C39) | High | S | High |
| Concrete Temperature | High | S | Medium |
| Unit Weight & Yield | High | S | Medium |
| Rice Gravity (Gmm) | High | S | High |
| Bulk Specific Gravity | High | S | High |
| LA Abrasion | High | S | Medium |
| Indirect Tensile | Medium | M | Medium |
| Consolidation | Medium | L | Medium |
| Chloride Penetration | Medium | M | Medium |
| Hamburg Rutting | Low | L | Low |

## Implementation Notes

### File Naming
- Each test gets `js/<test_name>.js` for logic + `js/<test_name>-ui.js` for UI
- `tests/<test_name>.test.js` for unit tests
- HTML screen ID: `screen-<test_name>`

### Reusable Patterns
- **Data readings grid**: Copy from `permeability` screen (`.data-readings > .reading-card`)
- **Connection panel**: Copy from `compaction` (`.panel` with serial/demo/manual select)
- **Panel layout**: `.test-layout > .slide-up > .panel > .panel-header + .panel-body`
- **Result table**: Use `.result-table` styling from compaction
- **PDF export**: Call `generatePDF()` pattern from `pdf.js`

### Data Model
```js
{
  testId: 'triaxial',
  params: { confiningPressure: 100, strainRate: 0.5 },
  readings: [{ time: 0, load: 0, deformation: 0 }],
  results: { cohesion: 25, frictionAngle: 32 },
  standard: 'ASTM D2850'
}
```

### Test Migration Path
1. Copy existing similar test as template (e.g., `specific_gravity → hydrometer`)
2. Update constants and formulas
3. Add to navigation menu in `domains.js`
4. Write unit tests
5. Add PDF export
