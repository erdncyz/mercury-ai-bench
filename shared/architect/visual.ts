import { KEEP_GEOMETRY, type CuratedPrompt } from './types.ts'

export const VISUAL_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-plan-to-exterior',
    type: 'IMAGE',
    title: {
      en: 'AutoCAD floor plan → photoreal 3D exterior render',
      tr: 'AutoCAD kat planından fotogerçekçi 3D dış cephe render’ı',
    },
    description: {
      en: 'Upload a 2D plan (PNG/PDF export from AutoCAD, Revit or ArchiCAD) and get an eye-level exterior visualization that keeps the footprint, openings and proportions intact.',
      tr: '2D planı (AutoCAD, Revit veya ArchiCAD’den PNG/PDF) yükle; ayak izini, boşlukları ve oranları koruyan göz hizasında bir dış cephe görseli al.',
    },
    tags: ['AutoCAD', 'Floor plan', '2D → 3D', 'Exterior'],
    content: `You are an architectural visualization artist. Convert the attached 2D floor plan into a photorealistic 3D exterior render of the same building.

${KEEP_GEOMETRY}

Building:
- Type: [BUILDING_TYPE, e.g. two-storey detached house]
- Floors: [NUMBER_OF_FLOORS], floor-to-floor height [HEIGHT, e.g. 3.0 m]
- Roof: [ROOF, e.g. flat roof with 60 cm parapet / 30° gable roof with clay tiles]
- Facade materials: [MATERIALS, e.g. white render, oak cladding, anthracite aluminium window frames]
- Context: [SITE, e.g. suburban plot with lawn, low concrete wall, two olive trees]

Camera: eye level (1.6 m), [VIEW, e.g. 3/4 view from the south-west corner], 24–28 mm lens, verticals perfectly straight (two-point perspective).
Light: [TIME, e.g. late-afternoon golden hour], soft realistic shadows, physically based materials, subtle global illumination.
Output: [ASPECT, e.g. 16:9], high resolution, no text, no watermark, no people unless requested, architectural photography style.`,
  },
  {
    id: 'mercury-plan-to-isometric',
    type: 'IMAGE',
    title: {
      en: 'Floor plan → 3D isometric cutaway (dollhouse view)',
      tr: 'Kat planından 3D izometrik kesit (maket / dollhouse görünümü)',
    },
    description: {
      en: 'Extrudes the plan into a roofless isometric model with furniture so clients can read the layout at a glance — ideal for presentations and listings.',
      tr: 'Planı çatısız, mobilyalı izometrik bir modele dönüştürür; müşteri yerleşimi tek bakışta anlar — sunum ve ilanlar için ideal.',
    },
    tags: ['Floor plan', 'Isometric', '2D → 3D', 'Presentation'],
    content: `Turn the attached 2D floor plan into a 3D isometric cutaway ("dollhouse") view.

${KEEP_GEOMETRY}

Model:
- Extrude walls to [WALL_HEIGHT, e.g. 2.8 m]; cut the model horizontally at about 1.2 m so the interior is visible; no roof or ceiling.
- Floor finishes per room: [FINISHES, e.g. oak parquet in living areas, light grey tiles in wet areas].
- Furnish each room according to its label on the plan ([STYLE, e.g. Scandinavian minimal]); keep circulation paths clear and furniture to realistic scale.
- Show door swings as open doors and windows as glass with thin frames.

Camera: true isometric (30°), viewed from the [CORNER, e.g. south-east] corner, whole plan visible with a small margin.
Look: clean architectural model render, soft ambient occlusion, neutral white background, [COLOR_ACCENT] accent color, no labels unless asked (if asked, add room names in a clean sans-serif).
Output: [ASPECT, e.g. 1:1], high resolution.`,
  },
  {
    id: 'mercury-plan-to-interior',
    type: 'IMAGE',
    title: {
      en: 'Floor plan → photoreal interior render of one room',
      tr: 'Kat planından tek bir odanın fotogerçekçi iç mekân render’ı',
    },
    description: {
      en: 'Point at a room on the plan and pick a camera spot; the model renders that space with the real window and door positions.',
      tr: 'Plandaki bir odayı ve kamera noktasını seç; model o mekânı gerçek pencere ve kapı konumlarıyla render eder.',
    },
    tags: ['Floor plan', 'Interior', '2D → 3D', 'Render'],
    content: `Using the attached floor plan, render a photorealistic interior view of the room labelled "[ROOM_NAME]".

${KEEP_GEOMETRY}

Camera: standing at [CAMERA_POSITION, e.g. the entrance door of the room], 1.5 m high, looking towards [DIRECTION, e.g. the window wall], 20–24 mm lens, straight verticals.
Room: ceiling height [HEIGHT, e.g. 2.8 m]; daylight enters only through the windows shown on the plan.
Design: [STYLE, e.g. warm modern], materials [MATERIALS, e.g. microcement floor, walnut joinery, linen curtains], furniture [FURNITURE_LIST], lighting [LIGHTING, e.g. linear pendant + hidden LED cove].
Mood: [TIME, e.g. bright overcast morning], realistic exposure, physically based materials, no text or watermark.
Output: [ASPECT, e.g. 3:2], high resolution, interior photography style.`,
  },
  {
    id: 'mercury-elevation-to-render',
    type: 'IMAGE',
    title: {
      en: 'Elevation / facade drawing → photoreal facade render',
      tr: 'Görünüş (cephe) çiziminden fotogerçekçi cephe render’ı',
    },
    description: {
      en: 'Upload an AutoCAD elevation; the facade is rendered head-on with real materials while openings, levels and heights stay exactly as drawn.',
      tr: 'AutoCAD görünüşünü yükle; cephe gerçek malzemelerle karşıdan render edilir, boşluklar, kotlar ve yükseklikler çizimdeki gibi kalır.',
    },
    tags: ['Elevation', 'Facade', 'AutoCAD', 'Render'],
    content: `Convert the attached 2D elevation drawing into a photorealistic frontal facade render.

${KEEP_GEOMETRY}
- Keep floor levels (±0.00, +3.00 …), parapet and ridge heights, and the rhythm of openings exactly as drawn.

Materials (map hatches to materials): [HATCH_MAPPING, e.g. diagonal hatch = travertine cladding, solid grey = anthracite metal panel, dotted = exposed concrete].
Glazing: [GLASS, e.g. low-iron glass with slim black frames], subtle realistic reflections of [SURROUNDINGS].
Camera: orthographic-like frontal view (long lens, ~85 mm, centered), no perspective distortion.
Light: [LIGHT, e.g. soft sun from upper left at 45°] with crisp shadows from balconies and reveals.
Foreground: [FOREGROUND, e.g. pavement and low planting], sky [SKY, e.g. clear pale blue].
Output: [ASPECT], high resolution, no text, no dimension lines.`,
  },
  {
    id: 'mercury-sketch-to-render',
    type: 'IMAGE',
    title: {
      en: 'Hand sketch / CAD line drawing → render that keeps the lines',
      tr: 'El eskizi / CAD çizgi çiziminden çizgileri koruyan render',
    },
    description: {
      en: 'For concept sketches and perspective line drawings: adds materials, light and context without redesigning the massing.',
      tr: 'Konsept eskizleri ve perspektif çizgi çizimleri için: kütleyi yeniden tasarlamadan malzeme, ışık ve çevre ekler.',
    },
    tags: ['Sketch', 'Line drawing', 'Concept', 'Render'],
    content: `Render the attached architectural sketch / line drawing as a [STYLE, e.g. photorealistic | soft watercolor | competition-board] image.

Rules:
- Follow the existing lines exactly: same massing, same perspective and vanishing points, same window grid; do not redesign or "improve" the building.
- Interpret ambiguous strokes conservatively (prefer simple, buildable geometry).

Materials: [MATERIALS]. Context: [CONTEXT, e.g. Mediterranean coastal street, stone paving, pine trees].
Light and mood: [LIGHT, e.g. warm dusk with interior lights on].
People/cars: [ENTOURAGE, e.g. a few blurred pedestrians for scale | none].
Output: same framing and aspect ratio as the sketch, high resolution, no text.`,
  },
  {
    id: 'mercury-site-plan-to-aerial',
    type: 'IMAGE',
    title: {
      en: 'Site plan → 3D aerial masterplan view',
      tr: 'Vaziyet planından 3D kuşbakışı master plan görseli',
    },
    description: {
      en: 'Turns a 2D site/masterplan into a bird’s-eye 3D view with buildings, landscaping and roads in their true positions.',
      tr: '2D vaziyet / master planı; binalar, peyzaj ve yollar gerçek konumlarında olacak şekilde kuşbakışı 3D görsele çevirir.',
    },
    tags: ['Site plan', 'Masterplan', 'Aerial', '2D → 3D'],
    content: `Convert the attached 2D site plan into a 3D aerial (bird's-eye) visualization.

${KEEP_GEOMETRY}
- Building footprints, roads, parking, paths and green areas must stay where the plan shows them.

Heights: [HEIGHTS, e.g. Block A 5 floors, Block B 3 floors, ~3.1 m per floor]; roofs [ROOFS].
Landscape: [LANDSCAPE, e.g. lawns, deciduous trees along roads, playground in the courtyard].
Surroundings: [SURROUNDINGS, e.g. low-density neighbourhood in light grey massing].
Camera: aerial 3/4 view at ~45°, from the [DIRECTION] side, whole site in frame.
Look: [STYLE, e.g. clean photoreal daylight | white massing model with colored landscape].
Output: [ASPECT, e.g. 16:9], high resolution, no labels unless requested.`,
  },
  {
    id: 'mercury-section-to-perspective',
    type: 'IMAGE',
    title: {
      en: 'Building section → perspective section render',
      tr: 'Kesit çiziminden perspektif kesit render’ı',
    },
    description: {
      en: 'Turns a 2D section (A-A) into a one-point perspective section that shows the spaces, levels and people inside — a classic competition image.',
      tr: '2D kesiti (A-A) mekânları, kotları ve içindeki insanları gösteren tek kaçışlı perspektif kesite dönüştürür — klasik yarışma görseli.',
    },
    tags: ['Section', 'Perspective', '2D → 3D', 'Competition'],
    content: `Convert the attached 2D building section into a one-point perspective section render.

${KEEP_GEOMETRY}
- Keep every floor level, slab thickness, ceiling height, stair and roof profile exactly as drawn.

Cut plane: render the cut elements (walls, slabs, ground) as a solid [CUT_COLOR, e.g. charcoal] poché; everything behind the cut is seen in perspective with depth [DEPTH, e.g. 8 m].
Spaces: furnish and populate each space according to its use ([USES, e.g. lobby, studios, roof terrace]), people to scale.
Ground: show the soil layer and foundations [SHOW_FOUNDATIONS: yes/no]; landscape on both sides.
Style: [STYLE, e.g. soft photoreal with slightly desaturated colors | flat collage style].
Output: [ASPECT, e.g. 3:1 panoramic], high resolution, no text.`,
  },
  {
    id: 'mercury-massing-to-render',
    type: 'IMAGE',
    title: {
      en: 'SketchUp / Rhino massing screenshot → photoreal render',
      tr: 'SketchUp / Rhino kütle ekran görüntüsünden fotogerçekçi render',
    },
    description: {
      en: 'Upload a grey/clay viewport screenshot; the model adds materials, sky and context while the camera and the massing stay identical.',
      tr: 'Gri/kil görünümlü viewport ekran görüntüsünü yükle; kamera ve kütle aynı kalırken malzeme, gökyüzü ve çevre eklenir.',
    },
    tags: ['SketchUp', 'Rhino', 'Massing', 'Render'],
    content: `The attached image is a [SOFTWARE, e.g. SketchUp | Rhino | Revit] viewport screenshot of my design. Produce a photorealistic render of exactly this view.

Rules:
- Identical camera, framing, perspective and building silhouette; do not add floors, balconies, openings or roof elements that are not modeled.
- Every surface keeps its shape; only replace grey/clay shading with real materials.

Materials by color in the screenshot: [MAPPING, e.g. white = light limestone, blue = glazing, brown = timber louvers, green = planted roof].
Context: [CONTEXT, e.g. dense European street, neighbours as neutral buildings].
Light: [LIGHT, e.g. overcast soft daylight | low winter sun]. Entourage: [ENTOURAGE].
Output: same aspect ratio as the screenshot, high resolution, no watermark.`,
  },
  {
    id: 'mercury-photomontage',
    type: 'IMAGE',
    title: {
      en: 'Photomontage: place the proposed building into a real site photo',
      tr: 'Fotomontaj: önerilen binayı gerçek arsa fotoğrafına yerleştir',
    },
    description: {
      en: 'Attach a site photo and your plan/elevation; get a believable before/after view for clients, neighbours or permit files.',
      tr: 'Arsa fotoğrafını ve plan/görünüşünü ekle; müşteri, komşular veya ruhsat dosyası için inandırıcı bir önce/sonra görseli al.',
    },
    tags: ['Photomontage', 'Site photo', 'Before/after', 'Permit'],
    content: `Image 1 is a real photo of the empty site. Image 2 is my [DRAWING, e.g. ground floor plan + south elevation] of the proposed building.

Insert the proposed building into Image 1:
- Respect the photo's camera, horizon line, vanishing points, lens distortion, lighting direction and time of day.
- Position: [POSITION, e.g. on the vacant plot between the red-roofed house and the cypress trees], set back [SETBACK] from the street.
- Height: [FLOORS] floors, about [TOTAL_HEIGHT] m — scale it against known objects in the photo (doors ≈ 2.1 m, cars ≈ 1.5 m).
- Facade, openings and roof as in Image 2; materials [MATERIALS].
- Keep everything else in the photo untouched (neighbours, trees, sky, street). Add realistic contact shadows and reflections.
Output: same resolution and framing as Image 1, photographic, no text.`,
  },
  {
    id: 'mercury-day-night-variants',
    type: 'IMAGE',
    title: {
      en: 'One render → day, dusk and night variants',
      tr: 'Tek render’dan gündüz, alacakaranlık ve gece varyasyonları',
    },
    description: {
      en: 'Re-lights an existing render without changing the architecture — handy for presentation boards and marketing.',
      tr: 'Mimariyi değiştirmeden mevcut render’ı yeniden ışıklandırır — sunum paftaları ve pazarlama için pratik.',
    },
    tags: ['Render', 'Lighting', 'Variants', 'Marketing'],
    content: `Edit the attached architectural render. Keep the building, camera, composition, materials and landscaping pixel-faithful; change only lighting and atmosphere.

Produce [COUNT, e.g. 3] variants:
1. [VARIANT_1, e.g. bright clear midday, crisp shadows]
2. [VARIANT_2, e.g. blue hour dusk, warm interior lights on, soft facade uplights]
3. [VARIANT_3, e.g. night, moonlit sky, illuminated windows with lived-in interiors, street lamps]

Interior lighting color temperature: [CCT, e.g. 3000 K]. Exterior lighting concept: [LIGHTING_CONCEPT].
Weather: [WEATHER, e.g. dry | light rain with wet reflective pavement].
Output: each variant as a separate image, same size as the original, no text.`,
  },
  {
    id: 'mercury-material-options',
    type: 'IMAGE',
    title: {
      en: 'Facade material options grid (same view, different materials)',
      tr: 'Cephe malzeme seçenekleri ızgarası (aynı açı, farklı malzemeler)',
    },
    description: {
      en: 'Compare 4 facade options side by side from one render or elevation — perfect for client decisions.',
      tr: 'Tek render veya görünüşten 4 cephe seçeneğini yan yana karşılaştır — müşteri kararları için ideal.',
    },
    tags: ['Facade', 'Materials', 'Options', 'Client'],
    content: `Using the attached render/elevation, create a 2×2 comparison grid of the same view with four facade material options. Geometry, camera, glazing layout and landscaping must be identical in all four.

Options:
A. [OPTION_A, e.g. white mineral render + oak window frames]
B. [OPTION_B, e.g. dark brick in Flemish bond + bronze frames]
C. [OPTION_C, e.g. vertical larch cladding + black aluminium]
D. [OPTION_D, e.g. travertine panels + champagne anodized aluminium]

Same light ([LIGHT]) in all panels so materials are comparable. Thin white gutters between panels; small label A/B/C/D in the bottom-left corner of each panel.
Output: [ASPECT, e.g. 1:1], high resolution.`,
  },
  {
    id: 'mercury-exploded-axo',
    type: 'IMAGE',
    title: {
      en: 'Floor plans → exploded axonometric diagram',
      tr: 'Kat planlarından patlatılmış aksonometrik diyagram',
    },
    description: {
      en: 'Stacks each level as a separated layer to explain circulation, programme and structure in one graphic.',
      tr: 'Her katı ayrık bir katman olarak üst üste dizer; dolaşımı, programı ve strüktürü tek grafikte anlatır.',
    },
    tags: ['Axonometric', 'Diagram', 'Floor plans', 'Presentation'],
    content: `Using the attached floor plans ([LEVELS, e.g. ground, first, roof]), draw an exploded axonometric diagram of the building.

${KEEP_GEOMETRY}

- Levels stacked vertically with [GAP, e.g. generous] gaps, aligned on the same vertical axis; thin dashed lines link the corners between levels.
- Color code by programme: [PROGRAMME_COLORS, e.g. living = warm sand, sleeping = soft blue, wet areas = teal, circulation = coral].
- Show vertical circulation (stairs/lift) highlighted through all levels.
- Optional layers: [EXTRA_LAYERS, e.g. structure grid on top, roof/PV layer, site base].
Style: clean vector-like diagram, white background, light line work, subtle shadows, no perspective (true axonometric 30°/30°).
Labels: [LABELS: none | short programme names in sans-serif].`,
  },
  {
    id: 'mercury-presentation-plan',
    type: 'IMAGE',
    title: {
      en: 'AutoCAD line plan → colored presentation floor plan',
      tr: 'AutoCAD çizgi planından renkli sunum planı',
    },
    description: {
      en: 'Gives a black-and-white CAD plan floor textures, furniture, shadows and planting — ready for brochures and listings.',
      tr: 'Siyah-beyaz CAD planına zemin dokuları, mobilya, gölge ve bitki ekler — broşür ve ilanlar için hazır.',
    },
    tags: ['AutoCAD', 'Floor plan', 'Presentation', 'Real estate'],
    content: `Turn the attached black-and-white AutoCAD floor plan into a top-down colored presentation plan.

${KEEP_GEOMETRY}

- Walls: solid [WALL_COLOR, e.g. dark grey] fill; doors with swing arcs; windows as thin double lines.
- Floor textures per room: [FINISHES, e.g. light oak herringbone in living/bedrooms, large-format stone tiles in kitchen and bathrooms, decking on terraces].
- Furniture in plan view, drawn to scale and matched to each room's label ([STYLE]).
- Soft drop shadows from walls and furniture (light from top-left), outdoor planting around the perimeter.
- Room names and areas: [LABELS, e.g. keep names and m² in a clean sans-serif | no text].
Output: orthographic top view, [ASPECT], high resolution, white background.`,
  },
  {
    id: 'mercury-render-to-walkthrough',
    type: 'VIDEO',
    title: {
      en: 'Still render → short architectural fly-through video',
      tr: 'Durağan render’dan kısa mimari uçuş / yürüyüş videosu',
    },
    description: {
      en: 'For image-to-video models (Veo, Kling, Runway, Sora): slow, stable camera moves that never morph the building.',
      tr: 'Görselden videoya modeller için (Veo, Kling, Runway, Sora): binayı asla bozmayan yavaş ve stabil kamera hareketleri.',
    },
    tags: ['Video', 'Fly-through', 'Image-to-video', 'Marketing'],
    content: `Animate the attached architectural render into a [DURATION, e.g. 8]-second video.

Camera: [MOVE, e.g. slow dolly-in towards the entrance | gentle 20° orbit to the right | slow crane-up revealing the roof terrace], constant speed, no shake, no cuts.
Architecture must remain rigid and unchanged: no morphing walls, no extra floors, windows and mullions stay straight and aligned.
Life: subtle natural motion only — [MOTION, e.g. trees swaying lightly, a few pedestrians walking, clouds drifting, water rippling].
Light: same as the still image ([LIGHT]); no flicker.
Format: [ASPECT, e.g. 16:9], 24 fps, cinematic architectural film look, no text, no music.`,
  },
]
