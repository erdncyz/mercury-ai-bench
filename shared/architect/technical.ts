import { VERIFY_REGULATIONS, type CuratedPrompt } from './types.ts'

export const TECHNICAL_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-zoning-check',
    type: 'TEXT',
    title: { en: 'Zoning compliance check (TAKS, KAKS/emsal, setbacks, height)', tr: 'İmar uygunluk kontrolü (TAKS, KAKS/emsal, çekme mesafeleri, yükseklik)' },
    description: {
      en: 'Checks your project figures against zoning parameters with transparent calculations and a list of items to verify.',
      tr: 'Proje değerlerini imar parametreleriyle karşılaştırır; hesapları açıkça gösterir ve doğrulanacak maddeleri listeler.',
    },
    tags: ['Zoning', 'İmar', 'Compliance'],
    content: `You are a permit consultant. ${VERIFY_REGULATIONS}

Plot: area [PLOT_AREA] m² (after road/park deductions: [NET_PLOT_AREA]), zoning: [ZONING_STATUS, e.g. ayrık nizam, 4 kat, TAKS 0.40, KAKS 1.60], front/side/rear setbacks [SETBACKS], max height [HEIGHT].
My design: footprint [FOOTPRINT] m², floor areas per level [FLOOR_AREAS], basements [BASEMENTS], balconies/terraces [BALCONIES], building height [BUILDING_HEIGHT] m, distances to boundaries [DISTANCES].

1. Compute TAKS and KAKS/emsal as the rules count them (which areas are excluded/included, e.g. balconies, stair shafts, basements, technical spaces) — show each step.
2. Compare with the limits → pass/fail table with margin.
3. Check setbacks and height, and parking requirement [PARKING_RULE].
4. If anything fails, propose the smallest design change to comply.`,
  },
  {
    id: 'mercury-fire-egress-check',
    type: 'TEXT',
    title: { en: 'Fire safety & escape route check from a plan', tr: 'Plandan yangın güvenliği ve kaçış yolu kontrolü' },
    description: {
      en: 'Reviews occupant load, exit count, travel distances, stair/door widths and compartments against your fire code.',
      tr: 'Kullanıcı yükü, çıkış sayısı, kaçış mesafeleri, merdiven/kapı genişlikleri ve kompartımanları yangın yönetmeliğine göre inceler.',
    },
    tags: ['Fire safety', 'Egress', 'Compliance', 'Vision'],
    content: `You are a fire safety engineer reviewing the attached plan(s). ${VERIFY_REGULATIONS.replace('Planlı Alanlar İmar Yönetmeliği + local plan notes', 'Binaların Yangından Korunması Hakkında Yönetmelik')}

Building: [USE, e.g. office], floors [FLOORS], height [HEIGHT] m, sprinklers [SPRINKLERS: yes/no], floor area per level [AREA] m².

1. Occupant load per floor (state the factor per m² you use and its source clause).
2. Required number of exits and minimum exit/stair/door/corridor widths vs what the drawing shows.
3. Travel distances (single direction and to nearest exit) measured on the plan — show which path you measured.
4. Stair type requirements (protected/pressurized, smoke lobby), dead-end corridors, door swing direction.
5. Fire compartments and shafts that need fire-rated separation.
Return a findings table (item | requirement | design | status | fix) and a list of values I must confirm.`,
  },
  {
    id: 'mercury-accessibility-check',
    type: 'TEXT',
    title: { en: 'Accessibility review (TS 9111 / ADA / local standard)', tr: 'Erişilebilirlik incelemesi (TS 9111 / ADA / yerel standart)' },
    description: {
      en: 'Checks ramps, door clearances, turning circles, accessible WCs, parking and wayfinding on your drawings.',
      tr: 'Rampalar, kapı açıklıkları, dönüş çemberleri, engelli WC’ler, otopark ve yön bulmayı çizimler üzerinden kontrol eder.',
    },
    tags: ['Accessibility', 'TS 9111', 'Universal design'],
    content: `Review the attached drawings for accessibility according to [STANDARD, e.g. TS 9111 | ADA 2010 Standards | local accessibility regulation]. ${VERIFY_REGULATIONS}

Check and quote dimensions you can read:
- Accessible route from street/parking to entrance: slopes, ramp length/landings, handrails, level changes.
- Doors: clear width, maneuvering space, thresholds, hardware.
- Lift: car size, door width, controls.
- Accessible WC/bathroom: turning circle, grab bars, fixtures heights, door swing.
- Corridors and turning spaces, counters/reception, seating spaces.
- Parking ratio and bay dimensions, tactile/visual wayfinding.
Output a checklist table with pass / fail / cannot verify, and practical fixes ranked by cost.`,
  },
  {
    id: 'mercury-specification-writer',
    type: 'TEXT',
    title: { en: 'Technical specification writer (şartname) per work item', tr: 'İş kalemi bazında teknik şartname yazıcı' },
    description: {
      en: 'Writes clear spec clauses: materials, standards, execution, tolerances, testing and acceptance — in your format.',
      tr: 'Malzeme, standart, uygulama, tolerans, test ve kabul içeren net şartname maddeleri yazar — senin formatında.',
    },
    tags: ['Specifications', 'Şartname', 'Construction'],
    content: `Write a technical specification section for: [WORK_ITEM, e.g. ETICS external thermal insulation with 8 cm stone wool | aluminium curtain wall | epoxy floor coating in parking].
Project context: [PROJECT_CONTEXT]. Format: [FORMAT, e.g. CSI MasterFormat 3-part (General / Products / Execution) | Turkish özel teknik şartname maddeleri].

Include:
1. Scope and related sections.
2. Reference standards (EN/TS/ASTM) — only real, commonly used ones; mark any you are unsure of.
3. Product requirements with performance values ([PERFORMANCE_TARGETS]) and acceptable equivalents ("or equal" rules).
4. Submittals and mock-ups.
5. Execution: substrate preparation, installation steps, tolerances, protection, weather limits.
6. Testing, inspection and acceptance criteria; warranty.
7. Measurement and payment unit (for the bill of quantities).
Language: [LANGUAGE]. Use "shall" style, no marketing language.`,
  },
  {
    id: 'mercury-quantity-takeoff',
    type: 'TEXT',
    title: { en: 'Quantity takeoff (metraj) from plans and sections', tr: 'Plan ve kesitlerden metraj (keşif) çıkarma' },
    description: {
      en: 'Builds a structured takeoff with formulas you can audit — walls, plaster, paint, flooring, openings deducted.',
      tr: 'Denetlenebilir formüllerle yapılandırılmış metraj hazırlar — duvar, sıva, boya, döşeme, boşluk düşümleriyle.',
    },
    tags: ['Metraj', 'Quantities', 'Cost'],
    content: `Prepare a quantity takeoff for [SCOPE, e.g. interior finishes of the ground floor | masonry and plaster for the whole building] from the attached drawings / the dimensions below.
Measurement rules: [RULES, e.g. Turkish Bayındırlık metraj usulleri | NRM2 | deduct openings > 0.25 m² only].

For each item give: item code (if [UNIT_PRICE_BOOK] provided), description, unit, a formula line showing dimensions (e.g. 2 × (4.20 + 3.60) × 2.80 − door 0.90 × 2.10), quantity.
Group by trade and room/level; add subtotals. List every dimension you assumed or could not read separately.
Finally export the table as CSV (semicolon-separated, decimal comma) so I can paste it into Excel.
Dimensions / notes:
[PASTE_DIMENSIONS_OR_ATTACH_DRAWINGS]`,
  },
  {
    id: 'mercury-cost-estimate',
    type: 'TEXT',
    title: { en: 'Early cost estimate (yaklaşık maliyet) with ranges', tr: 'Aralıklarla erken aşama yaklaşık maliyet' },
    description: {
      en: 'Elemental cost plan from areas and specification level, with low/likely/high ranges and the biggest cost drivers.',
      tr: 'Alanlar ve şartname seviyesinden elemanter maliyet planı; düşük/olası/yüksek aralıklar ve en büyük maliyet kalemleriyle.',
    },
    tags: ['Cost', 'Budget', 'Feasibility'],
    content: `Estimate construction cost for [PROJECT, e.g. 4-storey reinforced-concrete residential building, 2,400 m² gross, 1 basement] in [LOCATION] at [DATE/QUARTER] prices, currency [CURRENCY].
Specification level: [SPEC_LEVEL, e.g. mid-range finishes, aluminium windows, heat pump]. Reference unit costs available: [REFERENCE, e.g. official yapı yaklaşık birim maliyetleri for the year | my recent tender prices: ...].

1. Elemental breakdown (substructure, frame, envelope, roof, internal walls, finishes, MEP, lifts, external works, preliminaries, contingency) with cost/m² and totals.
2. Low / likely / high range and the assumptions behind each.
3. Top 5 cost drivers and value-engineering options with estimated savings.
4. Clearly state that unit prices must be validated with current local data; never present invented prices as official.`,
  },
  {
    id: 'mercury-wall-section-detail',
    type: 'TEXT',
    title: { en: 'Wall/roof build-up & detail checker (U-value, condensation)', tr: 'Duvar/çatı katmanları ve detay kontrolü (U değeri, yoğuşma)' },
    description: {
      en: 'Calculates U-values layer by layer, checks condensation risk and continuity of insulation, waterproofing and airtightness at junctions.',
      tr: 'U değerini katman katman hesaplar; yoğuşma riskini ve birleşim noktalarında yalıtım, su yalıtımı ve hava sızdırmazlığı sürekliliğini kontrol eder.',
    },
    tags: ['Details', 'U-value', 'TS 825', 'Building physics'],
    content: `Check this build-up for [ELEMENT, e.g. external wall | flat roof terrace | ground slab] in climate zone [ZONE] under [ENERGY_CODE, e.g. TS 825].
Layers from inside to outside (material, thickness, λ if known): [LAYERS].

1. U-value calculation table (R per layer incl. Rsi/Rse) and comparison with the required limit — cite the limit you use and flag if you are unsure it is current.
2. Simple Glaser-type condensation risk assessment for [INDOOR/OUTDOOR CONDITIONS]; recommend vapour control placement.
3. Junction review for [JUNCTIONS, e.g. window head/sill, slab edge, parapet, balcony]: thermal bridges, waterproofing laps/upstands, drainage, airtightness line continuity.
4. Improved build-up option(s) with thickness changes.`,
  },
  {
    id: 'mercury-rfi-writer',
    type: 'TEXT',
    title: { en: 'RFI / site query & response writer', tr: 'RFI / şantiye sorusu ve cevap yazıcı' },
    description: {
      en: 'Writes precise RFIs (or architect responses) with references to drawings, options and impact on cost and schedule.',
      tr: 'Çizim referansları, seçenekler ve maliyet/süre etkisiyle net RFI’lar (veya mimar cevapları) yazar.',
    },
    tags: ['Construction', 'RFI', 'Site'],
    content: `Write a [TYPE: RFI from contractor | architect's response] for project [PROJECT].
Issue: [ISSUE, e.g. beam B12 conflicts with the window head height on drawing A-301 rev C; structural drawing S-201 rev B shows beam depth 60 cm].
References: [DRAWINGS_SPECS], photos: [PHOTOS_IF_ANY]. Deadline that affects the site: [DATE].

Structure: subject line, reference numbers, clear description of the conflict, question(s) answerable with one decision, proposed options (with sketch description), impact on cost/time/other trades, required response date, attachments list.
Tone: neutral, factual, contract-aware (no admission of liability). Language: [LANGUAGE].`,
  },
  {
    id: 'mercury-site-meeting-minutes',
    type: 'TEXT',
    title: { en: 'Site meeting minutes & action log from notes', tr: 'Notlardan şantiye toplantı tutanağı ve aksiyon listesi' },
    description: {
      en: 'Turns rough notes or a transcript into formal minutes with decisions, owners, due dates and open issues carried forward.',
      tr: 'Kaba notları veya transkripti kararlar, sorumlular, tarihler ve devreden açık konularla resmî tutanağa çevirir.',
    },
    tags: ['Construction', 'Minutes', 'Project management'],
    content: `Convert these notes into site meeting minutes for [PROJECT], meeting #[NUMBER] on [DATE] at [PLACE]. Attendees: [ATTENDEES with company/role].

Format:
1. Header (project, meeting no., date, attendees, distribution).
2. Progress per trade/zone vs programme (% and delays with reasons).
3. Decisions taken (numbered, unambiguous).
4. Action items table: no. | action | owner (company) | due date | status — carry forward open items from last time: [PREVIOUS_OPEN_ITEMS].
5. Health & safety, quality issues, design queries/RFIs status, variations.
6. Next meeting date.
Keep the language [LANGUAGE], formal, no speculation; mark anything unclear in the notes with [?].
Notes:
[PASTE_NOTES]`,
  },
  {
    id: 'mercury-permit-checklist',
    type: 'TEXT',
    title: { en: 'Building permit submission checklist', tr: 'Yapı ruhsatı başvuru kontrol listesi' },
    description: {
      en: 'Lists the drawings, reports and approvals typically needed for a permit in your municipality, with a sheet-by-sheet content check.',
      tr: 'Belediyende ruhsat için genellikle gereken çizim, rapor ve onayları paftaların içerik kontrolüyle birlikte listeler.',
    },
    tags: ['Permit', 'Ruhsat', 'Documentation'],
    content: `Prepare a building permit submission checklist for [PROJECT_TYPE] in [MUNICIPALITY / COUNTRY]. ${VERIFY_REGULATIONS}

Include:
1. Documents usually required before design submission (title deed, zoning status/imar durumu, site survey/aplikasyon, soil report…).
2. Architectural drawing set with required content per sheet (site plan, floor plans, sections, elevations, roof plan, area calculations, parking) and scale.
3. Engineering projects and reports (structural, mechanical, electrical, energy performance, fire, acoustics, landscaping) and who signs them.
4. Approvals from other institutions that may apply ([SPECIAL_CONDITIONS, e.g. heritage area, coastline, airport height limits]).
5. Common rejection reasons and how to avoid them.
Present as a checklist I can tick, grouped by responsible party.`,
  },
  {
    id: 'mercury-drawing-index',
    type: 'TEXT',
    title: { en: 'Drawing set index & sheet numbering system', tr: 'Pafta listesi ve pafta numaralandırma sistemi' },
    description: {
      en: 'Builds the full sheet list for a stage (permit, tender, construction) with a consistent numbering system and revision log.',
      tr: 'Bir aşama (ruhsat, ihale, uygulama) için tutarlı numaralandırma ve revizyon kaydıyla eksiksiz pafta listesi hazırlar.',
    },
    tags: ['Documentation', 'Sheets', 'Construction drawings'],
    content: `Create a drawing index for [PROJECT, e.g. 6-storey residential with 1 basement] at stage [STAGE, e.g. construction documents].
Numbering standard: [STANDARD, e.g. US National CAD Standard (A-101…) | ISO 19650 container naming | our office: PRJ-DISC-TYPE-NNN].

Deliver:
1. Sheet list grouped by series (general, site, plans, elevations, sections, enlarged plans, details, schedules) with number, title, scale, paper size.
2. Which details/enlarged plans are typically needed for this building type so nothing is forgotten (stairs, wet areas, facade, roof, thresholds, lifts, parking ramps).
3. Revision table format and transmittal template.
4. CSV export of the index (number;title;scale;size;rev) to drive sheet creation in AutoCAD Sheet Set Manager or Revit.`,
  },
]
