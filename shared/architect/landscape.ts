import { KEEP_GEOMETRY, type CuratedPrompt } from './types.ts'

export const LANDSCAPE_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-landscape-plan-render',
    type: 'IMAGE',
    title: { en: 'Landscape plan → 3D garden / courtyard render', tr: 'Peyzaj planından 3D bahçe / avlu render’ı' },
    description: {
      en: 'Turns a 2D landscape or site plan into an eye-level or aerial render with real paving, planting and water features.',
      tr: '2D peyzaj veya vaziyet planını gerçek kaplama, bitkilendirme ve su öğeleriyle göz hizasında ya da kuşbakışı render’a çevirir.',
    },
    tags: ['Landscape', 'Render', '2D → 3D', 'Garden'],
    content: `Convert the attached 2D landscape plan into a [VIEW, e.g. eye-level view from the terrace looking south | 45° aerial] render.

${KEEP_GEOMETRY}
- Paths, paving areas, lawn, planting beds, trees, water features, walls and furniture stay where the plan shows them.

Planting by plan symbol/legend: [PLANT_MAPPING, e.g. large circles = olive trees, hatched beds = lavender and rosemary, dotted = ornamental grasses].
Materials: [PAVING, e.g. light granite setts, decking, gravel]. Season: [SEASON]. Climate/region: [REGION, e.g. Aegean coast].
Light: [LIGHT]. People: [PEOPLE, e.g. a few using the space].
Output: [ASPECT], photoreal, no text.`,
  },
  {
    id: 'mercury-planting-plan',
    type: 'TEXT',
    title: { en: 'Planting plan & species list for the climate', tr: 'İklime uygun bitkilendirme planı ve tür listesi' },
    description: {
      en: 'Species, spacing, quantities and maintenance for each bed — climate-appropriate, low-water options first.',
      tr: 'Her yatak için tür, aralık, adet ve bakım — iklime uygun, az su isteyen seçenekler öncelikli.',
    },
    tags: ['Landscape', 'Planting', 'Sustainability'],
    content: `Create a planting plan for [SITE, e.g. a 400 m² residential garden] in [LOCATION/CLIMATE, e.g. Izmir, hot-summer Mediterranean]. Areas: [BEDS_WITH_SIZES_AND_SUN_EXPOSURE]. Goals: [GOALS, e.g. low water, year-round interest, privacy screen to the east, pollinators]. Soil: [SOIL]. Maintenance level: [MAINTENANCE].

Deliver:
1. Planting concept and layers (trees, shrubs, perennials, groundcover).
2. Species table: botanical name | common name (Turkish/English) | size at maturity | spacing | quantity per bed | sun/water needs | flowering season | notes (toxicity, allergens, invasive risk).
3. Seasonal interest calendar.
4. Irrigation zones (drip vs none) and mulching.
Only recommend species suitable for the stated climate; flag any that may be invasive locally.`,
  },
  {
    id: 'mercury-urban-analysis',
    type: 'TEXT',
    title: { en: 'Urban analysis of a neighbourhood (figure-ground, mobility, uses)', tr: 'Bir mahallenin kentsel analizi (doluluk-boşluk, ulaşım, kullanımlar)' },
    description: {
      en: 'A structured urban study plan with the maps to draw, data sources and key questions — for studios and urban design projects.',
      tr: 'Atölyeler ve kentsel tasarım projeleri için çizilecek haritalar, veri kaynakları ve temel sorularla yapılandırılmış kentsel çalışma planı.',
    },
    tags: ['Urban design', 'Analysis', 'Mapping'],
    content: `Study area: [AREA, e.g. 800 m radius around Kadıköy pier] for a project about [PROJECT_FOCUS].

1. Analysis layers to map, each with purpose, data source (OpenStreetMap, municipal open data, satellite imagery, site survey) and what to look for: figure-ground, land use, building heights, public space network, green/blue infrastructure, mobility (walking, cycling, transit stops, car/parking), noise, heritage, demographics.
2. Site survey plan: times of day, counting methods, photo/interview checklist.
3. Synthesis: how to turn findings into an issues/opportunities map and 3–5 design principles.
4. Suggested graphic style for the analysis sheets.
Flag any data that may be outdated and must be verified on site.`,
  },
  {
    id: 'mercury-streetscape-before-after',
    type: 'IMAGE',
    title: { en: 'Streetscape before/after: redesign a real street photo', tr: 'Sokak önce/sonra: gerçek bir sokak fotoğrafını yeniden tasarla' },
    description: {
      en: 'Shows a pedestrian-friendly redesign (trees, bike lanes, wider pavements) on the same street photo for participatory meetings.',
      tr: 'Katılımcı toplantılar için aynı sokak fotoğrafı üzerinde yaya dostu bir yeniden tasarım (ağaç, bisiklet yolu, geniş kaldırım) gösterir.',
    },
    tags: ['Urban design', 'Streetscape', 'Before/after'],
    content: `Redesign the street in the attached photo. Keep the buildings, their facades, the camera position, perspective and time of day exactly the same.

Changes: [CHANGES, e.g. remove on-street parking on the left; widen the pavement to 4 m with permeable paving; add a 2 m protected bike lane; plant a row of plane trees every 8 m; add benches, bike racks and rain gardens; one car lane each way].
Population: [PEOPLE, e.g. people walking, cycling, sitting at café tables; realistic and diverse].
Style: photoreal, believable materials and street furniture typical for [CITY/COUNTRY].
Output: same framing as the original so the two can be shown side by side.`,
  },
  {
    id: 'mercury-public-space-brief',
    type: 'TEXT',
    title: { en: 'Public square / courtyard design brief & program', tr: 'Meydan / avlu tasarımı için brief ve program' },
    description: {
      en: 'Defines users, activities by time of day, microclimate, materials and maintenance for a square, park or courtyard.',
      tr: 'Bir meydan, park veya avlu için kullanıcıları, günün saatine göre etkinlikleri, mikro iklimi, malzemeleri ve bakımı tanımlar.',
    },
    tags: ['Urban design', 'Public space', 'Landscape'],
    content: `Space: [SPACE, e.g. 2,500 m² square in front of a municipal library], context [CONTEXT], climate [CLIMATE], budget [BUDGET_LEVEL].

Write a design brief:
1. User groups and activities by time of day / week / season (markets, events, play, rest), with conflicts to resolve.
2. Zoning proposal and capacities (seating count, event area, play area).
3. Microclimate strategy: shade (tree canopy %, pergolas), wind, water, heat island mitigation.
4. Materials and furniture with durability/maintenance criteria; accessibility and safety (lighting levels, sightlines).
5. Water management (permeable surfaces, rain gardens) and planting principles.
6. Success indicators to measure after opening.`,
  },
]
