import { KEEP_GEOMETRY, type CuratedPrompt } from './types.ts'

export const INTERIOR_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-furniture-layout',
    type: 'TEXT',
    title: { en: 'Furniture layout options for a room from the plan', tr: 'Plandan bir oda için mobilya yerleşim alternatifleri' },
    description: {
      en: 'Reads the room’s dimensions, doors and windows and proposes 3 layouts with clearances you can draw directly in CAD.',
      tr: 'Odanın ölçülerini, kapı ve pencerelerini okur; CAD’de doğrudan çizebileceğin, boşluk ölçüleri verilmiş 3 yerleşim önerir.',
    },
    tags: ['Interior', 'Furniture', 'Layout', 'Vision'],
    content: `Using the attached plan, design furniture layouts for the room "[ROOM]" ([DIMENSIONS_IF_KNOWN]). Users and needs: [NEEDS, e.g. family of 4, TV + reading corner, 6-person dining].

${KEEP_GEOMETRY}

Give 3 layout options. For each:
- Furniture list with real dimensions (W × D cm) and positions measured from a named wall/corner.
- Circulation and clearances (main path ≥ [MIN_PATH, e.g. 90] cm, around dining table, in front of storage, door swing free).
- Views, daylight, TV glare and conversation distances considered.
- Pros/cons; which one suits [PRIORITY] best.
Then list what to draw in AutoCAD (blocks needed) for the chosen option.`,
  },
  {
    id: 'mercury-material-palette',
    type: 'TEXT',
    title: { en: 'Material & color palette with codes and suppliers to check', tr: 'Kodlarıyla malzeme ve renk paleti (kontrol edilecek tedarikçilerle)' },
    description: {
      en: 'Builds a coherent finish schedule (floor, wall, joinery, metal, textile) with RAL/NCS codes and budget alternatives.',
      tr: 'RAL/NCS kodları ve bütçe alternatifleriyle tutarlı bir kaplama listesi (zemin, duvar, doğrama, metal, tekstil) oluşturur.',
    },
    tags: ['Interior', 'Materials', 'Colors', 'Finish schedule'],
    content: `Create a material and color palette for [SPACE, e.g. a 90 m² apartment | a specialty coffee shop] in style [STYLE], mood [MOOD], budget [BUDGET_LEVEL], light conditions [LIGHT, e.g. north-facing, low daylight].

Deliver:
1. Palette concept in 3 sentences.
2. Finish schedule table: element | material | finish/texture | color code (NCS or RAL, plus HEX for screens) | durability/maintenance note | budget alternative.
3. Rules: ratio of dominant/secondary/accent, where wood tones repeat, metal finish consistency.
4. Compatibility checks (slip resistance for wet floors, cleanability, acoustic absorption needs).
5. A short moodboard image prompt describing the palette.
Do not invent product names; describe products generically and say what to ask suppliers.`,
  },
  {
    id: 'mercury-kitchen-layout',
    type: 'TEXT',
    title: { en: 'Kitchen layout & cabinet plan from plan dimensions', tr: 'Plan ölçülerinden mutfak yerleşimi ve dolap planı' },
    description: {
      en: 'Work triangle, module widths, appliance positions and services — output ready for a cabinet maker’s elevation drawing.',
      tr: 'Çalışma üçgeni, modül genişlikleri, cihaz konumları ve tesisat — dolapçının görünüş çizimine hazır çıktı.',
    },
    tags: ['Interior', 'Kitchen', 'Joinery'],
    content: `Kitchen: walls [WALL_LENGTHS] cm, ceiling [HEIGHT] cm, window [WINDOW_POSITION], door [DOOR_POSITION], existing water/drain/gas/vent positions [SERVICES]. Users: [USERS], cooking habits [HABITS]. Appliances: [APPLIANCES, e.g. 60 cm oven column, 60 cm induction, 60 cm dishwasher, 70 cm fridge].

1. Propose the best layout type (L, U, galley, island/peninsula) and an alternative, with the work-triangle distances.
2. Module plan per wall: list modules left to right with widths (standard 30/40/45/50/60/80/90 cm), fillers, corner solutions, tall units.
3. Heights: worktop, upper cabinets, hood, outlets; clearance in front of island/dishwasher.
4. Electrical outlet and lighting positions.
5. A cutting list-style summary per wall for the cabinet maker and points to verify on site.`,
  },
  {
    id: 'mercury-lighting-plan',
    type: 'TEXT',
    title: { en: 'Lighting design plan (lux, layers, fixtures, circuits)', tr: 'Aydınlatma tasarım planı (lüks, katmanlar, armatürler, devreler)' },
    description: {
      en: 'Layered lighting for each room — ambient, task, accent — with target lux, color temperature, fixture counts and switching.',
      tr: 'Her oda için katmanlı aydınlatma — genel, görev, vurgu — hedef lüks, renk sıcaklığı, armatür sayısı ve anahtarlama.',
    },
    tags: ['Interior', 'Lighting', 'Electrical'],
    content: `Design the lighting for [SPACE] with rooms [ROOMS_WITH_SIZES], ceiling heights [HEIGHTS], ceiling type [CEILING, e.g. suspended plasterboard allows recessed fixtures]. Style/mood: [MOOD].

For each room:
- Target illuminance (lux) for ambient and tasks per [STANDARD, e.g. EN 12464-1] and CRI/CCT choices.
- Layers: ambient / task / accent / decorative — fixture type, beam angle, quantity and approximate spacing (rule-of-thumb lumen calculation shown).
- Switching/dimming groups and scenes; smart control options.
- Glare and reflection notes (screens, glossy surfaces).
Finish with a fixture schedule table (type | description | lumen | W | CCT | qty | location) and what to coordinate with the electrical engineer.`,
  },
  {
    id: 'mercury-moodboard-image',
    type: 'IMAGE',
    title: { en: 'Interior moodboard image from a palette & style', tr: 'Palet ve stilden iç mekân moodboard görseli' },
    description: {
      en: 'A clean, editorial moodboard with material samples, furniture and color swatches to align taste with the client.',
      tr: 'Müşteriyle zevk birliği sağlamak için malzeme numuneleri, mobilya ve renk örnekleriyle temiz, editoryal bir moodboard.',
    },
    tags: ['Interior', 'Moodboard', 'Client'],
    content: `Create an interior design moodboard for [SPACE] in [STYLE] style.

Composition: flat-lay on [BACKGROUND, e.g. warm off-white paper], top-down view, soft natural daylight, editorial magazine look.
Include: material samples [MATERIALS, e.g. oak veneer, travertine, bouclé fabric, brushed brass, lime-wash plaster], 3–4 furniture cut-outs [FURNITURE], one lighting fixture, a plant, and 5 color swatch chips arranged in a row ([COLORS with HEX if known]).
Balanced asymmetric layout with breathing space; realistic textures and shadows; no brand logos; no text except optional swatch codes.
Output: [ASPECT, e.g. 4:5], high resolution.`,
  },
  {
    id: 'mercury-virtual-staging',
    type: 'IMAGE',
    title: { en: 'Virtual staging: furnish an empty room photo', tr: 'Sanal dekorasyon: boş oda fotoğrafını döşe' },
    description: {
      en: 'Furnishes an empty or under-construction room photo while keeping walls, windows and perspective exactly the same.',
      tr: 'Boş veya inşaatı süren oda fotoğrafını; duvarlar, pencereler ve perspektif aynen kalacak şekilde döşer.',
    },
    tags: ['Interior', 'Virtual staging', 'Real estate'],
    content: `Virtually stage the attached photo of an empty [ROOM_TYPE].

Keep exactly: camera angle, lens, walls, ceiling, windows, doors, floor material ([CHANGE_FLOOR: keep | replace with ...]), radiators/sockets, and the view through the windows.
Add: furniture and decor in [STYLE] style for [TARGET_BUYER], realistic scale relative to doors (≈ 2.1 m) and window sills; rug, lighting, art, plants.
Lighting must match the existing daylight direction; add soft contact shadows.
Do not hide structural defects or change room size (honest real-estate staging). Output: same resolution and framing as the original.`,
  },
  {
    id: 'mercury-bathroom-layout',
    type: 'TEXT',
    title: { en: 'Bathroom / wet-area layout with clearances & services', tr: 'Banyo / ıslak hacim yerleşimi (boşluk ölçüleri ve tesisatla)' },
    description: {
      en: 'Fits fixtures into tight bathrooms with correct clearances, drainage falls, waterproofing and accessible options.',
      tr: 'Dar banyolara armatürleri doğru boşluk ölçüleri, eğimler, su yalıtımı ve erişilebilir seçeneklerle yerleştirir.',
    },
    tags: ['Interior', 'Bathroom', 'Wet areas'],
    content: `Bathroom: internal dimensions [DIMENSIONS] cm, door [DOOR_POSITION_AND_WIDTH], window [WINDOW], shaft/stack position [SHAFT], floor build-up available [FLOOR_DEPTH] cm. Wanted: [FIXTURES, e.g. walk-in shower 90×120, wall-hung WC, double vanity, washing machine].

1. 2–3 layout options with fixture positions (distances from walls) and clearances in front of each fixture.
2. Drainage: shower drain type (linear/point), required falls, pipe routes to the stack, wall-hung WC frame depth.
3. Waterproofing zones and upstand heights, ventilation requirement.
4. Accessible/age-friendly variant (turning circle, grab bar positions) if space allows.
5. Recommended tile layout direction and setting-out point to avoid thin cuts.`,
  },
]
