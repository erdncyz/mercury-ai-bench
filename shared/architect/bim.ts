import type { CuratedPrompt } from './types.ts'

export const BIM_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-plan-reader',
    type: 'TEXT',
    title: {
      en: 'Read a floor plan → room schedule + dimensions (JSON) for 3D modeling',
      tr: 'Kat planını oku → 3D modelleme için oda listesi ve ölçüler (JSON)',
    },
    description: {
      en: 'Use with a vision LLM (GPT, Claude, Gemini): extracts rooms, areas, walls and openings from the drawing into structured data you can feed to SketchUp, Blender or Revit.',
      tr: 'Görsel okuyabilen bir LLM ile kullan (GPT, Claude, Gemini): çizimdeki oda, alan, duvar ve boşlukları SketchUp, Blender veya Revit’e aktarılabilir yapılandırılmış veriye çevirir.',
    },
    tags: ['Floor plan', 'JSON', 'Vision', 'BIM'],
    content: `You are an architect reading the attached 2D floor plan (exported from [SOFTWARE, e.g. AutoCAD]). Scale: [SCALE, e.g. 1:100, dimensions in cm].

Extract the geometry needed to rebuild it in 3D and return ONLY valid JSON:
{
  "units": "m",
  "levels": [{ "name": "Ground floor", "elevation": 0, "height": 0 }],
  "rooms": [{ "name": "", "area_m2": 0, "polygon": [[0, 0]] }],
  "walls": [{ "start": [0, 0], "end": [0, 0], "thickness": 0, "type": "exterior|interior" }],
  "openings": [{ "kind": "door|window", "wall_index": 0, "offset_from_start": 0, "width": 0, "height": 0, "sill": 0 }],
  "stairs": [],
  "notes": []
}

Rules:
- Use the dimension lines when present; when you must estimate, add a note saying which value is estimated and why.
- Origin (0,0) = bottom-left corner of the outer wall; x to the right, y up.
- Do not invent rooms or openings that are not on the drawing.
- After the JSON, list anything ambiguous I should confirm before modeling.`,
  },
  {
    id: 'mercury-plan-to-blender',
    type: 'TEXT',
    title: {
      en: 'Floor plan data → Blender Python script that builds the 3D model',
      tr: 'Plan verisinden 3D modeli kuran Blender Python script’i',
    },
    description: {
      en: 'Pair with the plan-reader JSON: an LLM writes a Blender script that extrudes walls, cuts openings and adds floors so you get an editable 3D model in minutes.',
      tr: 'Plan okuma JSON’u ile birlikte kullan: LLM duvarları yükselten, boşlukları açan ve döşemeleri ekleyen bir Blender script’i yazar; dakikalar içinde düzenlenebilir 3D model elde edersin.',
    },
    tags: ['Blender', 'Python', '2D → 3D', 'Automation'],
    content: `Write a single Blender [BLENDER_VERSION, e.g. 4.2] Python script that builds a 3D model from the floor plan JSON below.

Requirements:
- Create a collection per level; walls as mesh boxes with the given thickness and [WALL_HEIGHT] height.
- Cut door and window openings with Boolean (DIFFERENCE) modifiers, then apply them.
- Add a floor slab ([SLAB_THICKNESS, e.g. 0.2 m]) under each room polygon and name it after the room.
- Assign simple materials: exterior walls, interior walls, floor, glass (for windows add a thin glass pane).
- Units in meters; clean up (recalculate normals, remove doubles); keep the script idempotent (delete previously generated objects first).
- Print a short summary (wall count, room areas) at the end.
- Use only bpy and the standard library; comment non-obvious steps.

Floor plan JSON:
[PASTE_JSON_HERE]`,
  },
  {
    id: 'mercury-dynamo-graph',
    type: 'TEXT',
    title: { en: 'Revit Dynamo graph designer', tr: 'Revit Dynamo grafiği tasarımcısı' },
    description: {
      en: 'Describe a Revit chore; get the node-by-node Dynamo graph (or a Python node) to automate it, with test steps.',
      tr: 'Bir Revit angaryasını anlat; onu otomatikleştiren düğüm düğüm Dynamo grafiğini (veya Python düğümünü) test adımlarıyla al.',
    },
    tags: ['Revit', 'Dynamo', 'Automation', 'BIM'],
    content: `You are a BIM automation specialist. Revit [REVIT_VERSION, e.g. 2025] with Dynamo [DYNAMO_VERSION], packages allowed: [PACKAGES, e.g. none | Clockwork, archi-lab].

Automate: [TASK, e.g. renumber rooms per level following a drawn model line path | place a sheet for every room with a plan view cropped to the room | copy room finishes from an Excel sheet into room parameters].

Give:
1. The graph as an ordered node list: node name (package) → inputs → output, grouped by purpose; note list lacing/levels where it matters.
2. Where a Python node is simpler, the full CPython3 code using the Revit API with a Transaction, plus imports.
3. Required parameters/shared parameters and their types.
4. How to test safely on a detached copy and how to run it via Dynamo Player.
5. Edge cases (unplaced/redundant rooms, linked models, worksharing ownership).`,
  },
  {
    id: 'mercury-pyrevit-script',
    type: 'TEXT',
    title: { en: 'pyRevit / Revit API Python tool', tr: 'pyRevit / Revit API Python aracı' },
    description: {
      en: 'Writes a pyRevit button script (with UI form if needed) for batch tasks such as sheets, views, parameters and exports.',
      tr: 'Pafta, görünüş, parametre ve dışa aktarım gibi toplu işler için pyRevit buton script’i (gerekirse arayüz formuyla) yazar.',
    },
    tags: ['Revit', 'pyRevit', 'Python', 'BIM'],
    content: `Write a pyRevit tool (script.py + bundle.yaml) for Revit [REVIT_VERSION].

Function: [TASK, e.g. batch-create sheets from an Excel list (number, name, title block) and place the matching views | export all sheets in a selected set to PDF + DWG with our naming rule [NAMING_RULE]].

Requirements:
- Use pyrevit.forms for user input (select from list, file picker), pyrevit.revit / DB API for model access.
- One Transaction (or TransactionGroup) with a meaningful name; roll back on error and show a forms.alert with the reason.
- Never modify elements owned by other users in a workshared model; report them instead.
- Output a summary (created / skipped / failed) via pyrevit.output.
- Compatible with IronPython 2.7 and CPython engines if possible; state which you used.
Include folder structure for the extension (MyTools.extension/MyTools.tab/Panel.panel/Tool.pushbutton/).`,
  },
  {
    id: 'mercury-revit-family-plan',
    type: 'TEXT',
    title: { en: 'Revit family planner: parameters, reference planes, types', tr: 'Revit family planlayıcı: parametreler, referans düzlemleri, tipler' },
    description: {
      en: 'Plans a robust parametric family (window, casework, furniture) before you model it — avoiding families that break when flexed.',
      tr: 'Modellemeden önce sağlam bir parametrik family (pencere, dolap, mobilya) planlar — esnetince bozulan family’lerden kurtarır.',
    },
    tags: ['Revit', 'Families', 'Parametric', 'BIM'],
    content: `Plan a Revit family for: [ELEMENT, e.g. aluminium casement window, 1–3 sashes, sill/head detail, inside/outside reveal].
Template: [TEMPLATE, e.g. Window.rft]. LOD target: [LOD, e.g. LOD 300 for permit, LOD 350 for construction].

Deliver:
1. Reference planes with names and which are "strong references".
2. Parameters table: name | type/instance | discipline/type of parameter | formula | default | shared? (for schedules/IFC: [IFC_PROPERTIES]).
3. Type catalog rows (or type list) for standard sizes [SIZES].
4. Nested families and visibility rules for coarse/medium/fine and plan/elevation symbolic lines.
5. Flex test matrix (min/max values) and common failure points to avoid (over-constraining, locking to geometry instead of planes).`,
  },
  {
    id: 'mercury-bim-execution-plan',
    type: 'TEXT',
    title: { en: 'BIM Execution Plan (BEP) draft', tr: 'BIM Uygulama Planı (BEP) taslağı' },
    description: {
      en: 'Drafts a project BEP aligned with ISO 19650: roles, LOIN/LOD by stage, naming, CDE workflow, coordination and deliverables.',
      tr: 'ISO 19650 ile uyumlu proje BEP taslağı: roller, aşamalara göre LOIN/LOD, isimlendirme, CDE iş akışı, koordinasyon ve teslimler.',
    },
    tags: ['BIM', 'ISO 19650', 'BEP', 'Coordination'],
    content: `Draft a BIM Execution Plan for:
Project: [PROJECT, e.g. 8-storey mixed-use building, 12,000 m²], client requirements (EIR/AIR summary): [EIR], disciplines and software: [TEAM_SOFTWARE, e.g. Architecture Revit, Structure Tekla, MEP Revit, coordination Navisworks/Solibri], CDE: [CDE, e.g. ACC / BIMcollab / SharePoint].

Sections:
1. Project info, BIM goals and uses (with priority).
2. Roles & responsibilities matrix (appointing party, lead appointed party, task teams, BIM coordinator).
3. Level of information need per stage [STAGES, e.g. concept, permit, tender, construction, as-built].
4. File/model naming convention (ISO 19650 fields) with examples, coordinates & shared origin, units.
5. Model breakdown (per discipline/zone/level), federation strategy, IFC export settings.
6. Coordination: clash rules, tolerances, meeting cadence, issue (BCF) workflow.
7. Deliverables schedule and QA checks before each information exchange.
Keep it as a fill-in document with tables; mark assumptions.`,
  },
  {
    id: 'mercury-clash-triage',
    type: 'TEXT',
    title: { en: 'Clash detection report triage (Navisworks / Solibri / IFC)', tr: 'Çakışma raporu ayıklama (Navisworks / Solibri / IFC)' },
    description: {
      en: 'Paste an exported clash list; get it grouped into real problems vs noise, with owner, priority and suggested fix per group.',
      tr: 'Dışa aktarılan çakışma listesini yapıştır; gerçek sorunlar ve gürültü olarak gruplanmış, sorumlu, öncelik ve önerilen çözümle birlikte al.',
    },
    tags: ['BIM', 'Clash detection', 'Coordination', 'IFC'],
    content: `You are a BIM coordinator. Below is a clash report export from [TOOL] between [MODEL_A] and [MODEL_B] (columns: [COLUMNS]).

1. Group the clashes into issues (same root cause / same elements / same location) — I want issues, not 1,000 rows.
2. Classify each group: real hard clash | clearance/soft clash | modeling error | tolerance noise | duplicate. Suggest rule/tolerance changes to remove the noise next run.
3. For real issues: discipline owner, priority (with reason: cost/schedule/safety), and a concrete resolution option (reroute, resize opening, move by X mm, request sleeve).
4. Output a BCF-ready table: issue title | location (level/grid) | elements | owner | priority | proposed action | due [DATE].
Report:
[PASTE_REPORT]`,
  },
  {
    id: 'mercury-grasshopper-facade',
    type: 'TEXT',
    title: { en: 'Grasshopper / Rhino Python parametric facade', tr: 'Grasshopper / Rhino Python ile parametrik cephe' },
    description: {
      en: 'Generates the Grasshopper definition logic or a GhPython/Rhino.Python script for louvers, panels or perforations driven by sun or views.',
      tr: 'Güneşe veya manzaraya göre değişen panjur, panel veya delikli cephe için Grasshopper mantığını ya da GhPython/Rhino.Python script’ini üretir.',
    },
    tags: ['Grasshopper', 'Rhino', 'Parametric', 'Facade'],
    content: `Rhino [RHINO_VERSION, e.g. 8] + Grasshopper. Plugins allowed: [PLUGINS, e.g. none | Ladybug, Pufferfish].

Design a parametric facade system: [SYSTEM, e.g. vertical aluminium fins on the west facade whose rotation follows the summer afternoon sun | perforated panels whose hole size maps an image or a view-importance attractor].
Base geometry: [BASE, e.g. a planar facade surface 30 m × 18 m, floor-to-floor 3.6 m, module 0.6 m].
Constraints: [CONSTRAINTS, e.g. fin depth 30–60 cm, max 3 unique panel types for cost, min 25% openness].

Provide:
1. The definition as ordered components with inputs/outputs and data-tree handling (graft/flatten/path mapper).
2. A GhPython (Python 3 in Rhino 8) component implementing the core logic, commented.
3. Outputs to bake: geometry layers, panel IDs, a CSV schedule of unique types and counts for fabrication.
4. How to evaluate performance quickly (Ladybug direct sun hours or a simple view analysis) and what to tweak.`,
  },
  {
    id: 'mercury-cad-to-revit-migration',
    type: 'TEXT',
    title: { en: 'AutoCAD → Revit migration plan for a project', tr: 'Bir projeyi AutoCAD’den Revit’e taşıma planı' },
    description: {
      en: 'Step-by-step plan to rebuild a DWG-based project in Revit: cleaning DWGs, levels/grids, linking vs importing, family mapping.',
      tr: 'DWG tabanlı bir projeyi Revit’te yeniden kurmak için adım adım plan: DWG temizliği, kot/aks, link mi import mu, family eşleştirme.',
    },
    tags: ['AutoCAD', 'Revit', 'Migration', 'BIM'],
    content: `We have [PROJECT, e.g. a 5-storey residential building] fully drawn in AutoCAD (plans per floor, sections, elevations, site plan, units [UNITS]). We need it in Revit [REVIT_VERSION] for [PURPOSE, e.g. construction documents + quantity takeoff].

Write a migration plan:
1. DWG preparation: what to purge/flatten, which layers to keep per view, setting a shared origin, unit checks.
2. Revit setup: template, project base point vs survey point, levels and grids derived from sections/plans (how to place accurately).
3. Link vs import per DWG, view-specific settings, and how to trace walls/floors efficiently (Pick Lines, wall types first).
4. Mapping table: CAD element/layer → Revit category/family/type to create ([KEY_ELEMENTS]).
5. Order of work by discipline and level, QA checkpoints (overlay compare), and a realistic effort estimate in person-days with assumptions.
6. What to keep as 2D drafting views instead of modeling.`,
  },
  {
    id: 'mercury-room-data-sheet',
    type: 'TEXT',
    title: { en: 'Room data sheets from the space program', tr: 'İhtiyaç programından oda veri föyleri (room data sheet)' },
    description: {
      en: 'Builds per-room requirement sheets (finishes, MEP, equipment, acoustics) you can map to Revit room parameters.',
      tr: 'Revit oda parametrelerine eşlenebilen oda bazlı gereksinim föyleri (kaplama, mekanik/elektrik, ekipman, akustik) hazırlar.',
    },
    tags: ['BIM', 'Room data', 'Briefing', 'Revit'],
    content: `Project type: [TYPE, e.g. primary school | outpatient clinic | office fit-out]. Rooms: [ROOM_LIST_OR_PROGRAM].

For each room type produce a room data sheet:
- Identity: code, name, quantity, net area target, occupancy.
- Architecture: floor/wall/ceiling finishes, ceiling height, door width & hardware, glazing/daylight need, privacy.
- Environment: temperature/humidity range, ventilation (air changes or l/s/person), acoustics (target dB / RT), lighting (lux, glare class).
- Services: power outlets, data, water/drainage, medical gas or special services.
- Equipment & furniture list (fixed / loose).
- Accessibility and safety notes.
Then give a CSV with one row per room type and columns named so they can be imported as Revit room parameters ([PARAMETER_PREFIX]_...). Mark values that are typical assumptions vs required by [STANDARD].`,
  },
]
