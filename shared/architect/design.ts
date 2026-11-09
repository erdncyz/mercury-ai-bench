import type { CuratedPrompt } from './types.ts'

export const DESIGN_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-client-brief',
    type: 'TEXT',
    title: { en: 'Client interview → design brief', tr: 'Müşteri görüşmesinden tasarım brief’i' },
    description: {
      en: 'Turns messy meeting notes into a structured brief, and lists the questions you still need to ask.',
      tr: 'Dağınık toplantı notlarını yapılandırılmış bir brief’e çevirir ve hâlâ sorman gereken soruları listeler.',
    },
    tags: ['Brief', 'Client', 'Programming'],
    content: `You are an experienced architect. Below are my raw notes from a client meeting about [PROJECT, e.g. a family house on a sloping plot].

Produce a design brief with:
1. Project summary (one paragraph) and the client's top 5 priorities in their own words.
2. Users and daily scenarios (who lives/works there, routines, guests, pets, future changes).
3. Functional requirements and a first room list with indicative sizes.
4. Site, budget ([BUDGET]), timeline and regulatory constraints mentioned.
5. Aesthetic references and dislikes.
6. Contradictions or risks you detect (e.g. budget vs area, wishes vs zoning).
7. Questions I must ask in the next meeting, ordered by impact on the design.
Notes:
[PASTE_NOTES]`,
  },
  {
    id: 'mercury-space-program',
    type: 'TEXT',
    title: { en: 'Space program & area schedule (ihtiyaç programı)', tr: 'İhtiyaç programı ve alan tablosu' },
    description: {
      en: 'Builds a room-by-room program with net areas, circulation/wall factors and gross totals checked against your plot limits.',
      tr: 'Net alanlar, dolaşım/duvar katsayıları ve brüt toplamlarla oda oda ihtiyaç programı kurar; arsa sınırlarınla karşılaştırır.',
    },
    tags: ['Program', 'Areas', 'Feasibility'],
    content: `Create a space program for [BUILDING_TYPE, e.g. a 120-student kindergarten | a 3-bedroom villa with home office].
Inputs: users [USERS], special requirements [REQUIREMENTS], plot area [PLOT_AREA] m², max floor area ratio [FAR_OR_EMSAL], max footprint ratio [TAKS], max floors/height [HEIGHT_LIMIT].

Output:
1. Table: zone | room | quantity | net m² each | total net m² | adjacency needs | daylight need | notes.
2. Circulation and wall/structure factors with reasoning (e.g. +18% circulation, +10% walls) → gross area.
3. Check gross area and footprint against the plot limits; if over, propose 2 ways to fit (cut, stack, basement).
4. A simple adjacency matrix (must / should / avoid) for the main rooms.
Use benchmark sizes from [STANDARD_OR_REGION] and label them as typical, not mandatory.`,
  },
  {
    id: 'mercury-site-analysis',
    type: 'TEXT',
    title: { en: 'Site analysis: climate, sun, wind, access, views', tr: 'Arsa analizi: iklim, güneş, rüzgâr, erişim, manzara' },
    description: {
      en: 'Structured site analysis from location and photos, with diagram ideas for your analysis board.',
      tr: 'Konum ve fotoğraflardan yapılandırılmış arsa analizi; analiz paftan için diyagram önerileriyle.',
    },
    tags: ['Site analysis', 'Climate', 'Diagrams'],
    content: `Help me analyse a site for [PROJECT].
Location: [CITY / COORDINATES], plot size and shape: [PLOT], slope: [SLOPE], neighbours: [NEIGHBOURS], streets: [STREETS]. Photos attached (optional).

Cover:
1. Climate summary for this location (climate zone, temperature ranges, rainfall, prevailing winds by season) — say where the data would come from (e.g. EnergyPlus weather file, local meteorological service) and flag uncertainty.
2. Sun path implications: best orientation for living spaces, overheating risk facades, winter sun access.
3. Access & mobility (vehicle, pedestrian, service), noise sources, privacy and overlooking.
4. Views and landmarks worth framing; nuisances to screen.
5. Opportunities & constraints list, and 3 design moves that respond directly to them.
6. A list of 6 analysis diagrams to draw with what each should show.`,
  },
  {
    id: 'mercury-concept-directions',
    type: 'TEXT',
    title: { en: 'Five concept directions with narrative & diagrams', tr: 'Anlatı ve diyagramlarıyla beş konsept yönü' },
    description: {
      en: 'Generates distinct design concepts (not variations of one idea), each with a big idea, form strategy and diagram list.',
      tr: 'Birbirinden gerçekten farklı tasarım konseptleri üretir (tek fikrin varyasyonları değil); her biri için ana fikir, form stratejisi ve diyagram listesi.',
    },
    tags: ['Concept', 'Ideation', 'Narrative'],
    content: `Project: [PROJECT], site summary: [SITE_SUMMARY], program: [PROGRAM_SUMMARY], client values: [VALUES], budget level: [BUDGET_LEVEL].

Propose 5 genuinely different concept directions. For each:
- Name and one-sentence big idea.
- Form & massing strategy (how it sits on the site), organisation of the plan, section idea.
- Materiality and atmosphere.
- How it answers the site and the program; main risk or weakness.
- 3 diagrams that would explain it and a prompt-ready description for a quick concept image.
Finish with a comparison table (site response, flexibility, cost risk, buildability, client fit) scored 1–5 and your recommendation.`,
  },
  {
    id: 'mercury-design-jury',
    type: 'TEXT',
    title: { en: 'Design jury / crit on your plans and renders', tr: 'Planların ve render’ların için tasarım jürisi / kritik' },
    description: {
      en: 'Upload your boards or drawings; get an honest studio-style critique with priorities, like a jury review.',
      tr: 'Paftalarını veya çizimlerini yükle; jüri değerlendirmesi gibi öncelikli ve dürüst bir atölye kritiği al.',
    },
    tags: ['Critique', 'Jury', 'Students', 'Vision'],
    content: `Act as a jury of three: a practising architect, a structural engineer and a sustainability consultant. Review the attached [MATERIAL, e.g. plans, sections and 2 renders] for [PROJECT] at stage [STAGE, e.g. concept | schematic | final studio review].

Each juror gives:
- What works (be specific, refer to drawings).
- The 3 most important problems (function, circulation, structure logic, daylight, envelope, code, representation).
- One question they would ask in the review.
Then consolidated: top 5 actions ranked by impact for the next [TIME_AVAILABLE, e.g. 2 weeks], and quick wins for the presentation itself. Be direct but constructive; do not invent details you cannot see.`,
  },
  {
    id: 'mercury-massing-options',
    type: 'TEXT',
    title: { en: 'Massing options & zoning capacity check', tr: 'Kütle alternatifleri ve imar kapasitesi kontrolü' },
    description: {
      en: 'Compares 3–4 massing strategies for a plot with buildable area, floors, unit counts and trade-offs.',
      tr: 'Bir arsa için 3–4 kütle stratejisini inşaat alanı, kat sayısı, bağımsız bölüm sayısı ve artı/eksileriyle karşılaştırır.',
    },
    tags: ['Massing', 'Feasibility', 'Zoning'],
    content: `Plot: [PLOT_AREA] m², dimensions [DIMENSIONS], frontage [FRONTAGE]. Zoning: footprint ratio (TAKS) [TAKS], floor area ratio (KAKS/emsal) [KAKS], max height/floors [HEIGHT], setbacks front/side/rear [SETBACKS], parking rule [PARKING_RULE].
Target program: [PROGRAM, e.g. max number of 2+1 apartments of ~95 m² gross].

1. Compute the buildable envelope: max footprint, max total floor area, floors, and show the arithmetic.
2. Propose 3–4 massing options (e.g. single bar, L-shape, two blocks, podium + tower) with: footprint, floors, gross area, efficiency (net/gross), unit mix and count, parking count, daylight/privacy notes, cost risk.
3. Summary table and recommendation.
State clearly which rules are assumptions and must be checked against the local plan notes. Do not exceed the given limits.`,
  },
  {
    id: 'mercury-passive-design',
    type: 'TEXT',
    title: { en: 'Passive & sustainable design strategy for the climate', tr: 'İklime göre pasif ve sürdürülebilir tasarım stratejisi' },
    description: {
      en: 'Climate-specific envelope, shading, ventilation and energy strategies with rough performance targets.',
      tr: 'İklime özgü kabuk, gölgeleme, havalandırma ve enerji stratejileri; yaklaşık performans hedefleriyle.',
    },
    tags: ['Sustainability', 'Passive design', 'Energy'],
    content: `Building: [BUILDING, e.g. 2-storey house, 180 m²] in [LOCATION] (climate: [CLIMATE_IF_KNOWN]). Ambition: [AMBITION, e.g. nearly zero energy | Passivhaus-like | LEED/BREEAM credits].

Recommend, specific to this climate:
1. Orientation, form factor and window-to-wall ratio per facade.
2. Envelope targets (U-values for wall/roof/floor/windows) and airtightness — reference [ENERGY_CODE, e.g. TS 825 for Türkiye] and say which values are minimums vs good practice.
3. Shading per facade (fixed, movable, vegetation) with sizing logic.
4. Natural ventilation strategy (cross, stack, night purge) and thermal mass use.
5. Systems: heat pump, solar PV/thermal sizing rule of thumb, rainwater/greywater.
6. Material choices with lower embodied carbon.
7. A short "first 5 decisions" list for the design team.`,
  },
  {
    id: 'mercury-plan-layout-alternatives',
    type: 'TEXT',
    title: { en: 'Plan layout alternatives from an adjacency diagram', tr: 'İlişki şemasından plan yerleşim alternatifleri' },
    description: {
      en: 'Takes your room list, adjacencies and envelope and proposes zoned layouts you can sketch, with pros and cons.',
      tr: 'Oda listesi, ilişkiler ve sınırları alır; çizebileceğin bölgelenmiş yerleşim önerileri sunar, artı ve eksileriyle.',
    },
    tags: ['Floor plan', 'Layout', 'Adjacency'],
    content: `Envelope: [ENVELOPE, e.g. rectangle 12 m × 9 m, entrance on the north, garden and views to the south, stair must be inside]. Floors: [FLOORS].
Rooms and target areas: [ROOM_LIST].
Adjacencies: [ADJACENCIES, e.g. kitchen next to dining and service door; master bedroom away from street; guest WC near entrance].

Propose 3 layout alternatives. For each:
- Zoning description (public/private/service), circulation spine, wet-area stacking.
- A simple text grid sketch (rows/columns with room codes) at 1 cell = [CELL_SIZE, e.g. 1.5 m] so I can redraw it.
- Approximate room dimensions that meet the areas.
- Strengths, weaknesses, and furniture-fit check for the critical rooms.
Recommend one and explain what to test next in the drawing.`,
  },
  {
    id: 'mercury-architecture-tutor',
    type: 'TEXT',
    title: { en: 'Architecture tutor for students (explain + exercise)', tr: 'Mimarlık öğrencileri için eğitmen (anlatım + alıştırma)' },
    description: {
      en: 'Explains any topic — structure, history, building physics, drawing conventions — at your level, then gives a short exercise and checks your answer.',
      tr: 'Strüktür, tarih, yapı fiziği, çizim kuralları gibi her konuyu seviyene göre anlatır; kısa bir alıştırma verip cevabını kontrol eder.',
    },
    tags: ['Education', 'Students', 'Tutor'],
    content: `You are a patient architecture tutor. I am a [LEVEL, e.g. 2nd-year architecture student] and I want to understand [TOPIC, e.g. how to read and draw a wall section | load paths in a frame structure | Le Corbusier's five points | condensation risk].

1. Explain it in clear steps with one real building example and one everyday analogy.
2. Show the typical mistakes students make with it.
3. Give me a short exercise (drawing or calculation) with clear inputs.
4. When I reply with my answer, check it, point out errors kindly and give the correct reasoning.
Keep the language [LANGUAGE, e.g. Turkish] and use correct technical terms with the English term in parentheses.`,
  },
]
