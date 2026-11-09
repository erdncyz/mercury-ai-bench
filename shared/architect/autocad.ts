import type { CuratedPrompt } from './types.ts'

const CAD_CONTEXT = `My setup: [AUTOCAD_VERSION, e.g. AutoCAD 2025 | AutoCAD LT 2025 | BricsCAD V24], interface language [LANGUAGE, e.g. Turkish], units [UNITS, e.g. centimeters], drawing scale [SCALE, e.g. 1:100].`

export const AUTOCAD_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-autolisp-generator',
    type: 'TEXT',
    title: { en: 'AutoLISP routine generator (with load & test steps)', tr: 'AutoLISP rutini üretici (yükleme ve test adımlarıyla)' },
    description: {
      en: 'Describe a repetitive drafting task; get a commented, safe AutoLISP command plus how to load it with APPLOAD and test it.',
      tr: 'Tekrarlayan bir çizim işini anlat; yorumlu, güvenli bir AutoLISP komutu ve APPLOAD ile yükleyip test etme adımlarını al.',
    },
    tags: ['AutoCAD', 'AutoLISP', 'Automation'],
    content: `You are a senior AutoCAD CAD manager and AutoLISP developer.
${CAD_CONTEXT}

Task to automate: [TASK, e.g. select closed polylines on layer A-AREA, write each area in m² as MTEXT at its centroid on layer A-AREA-TXT, 2.5 mm high at plot scale].

Write one AutoLISP file that:
- Defines a command c:[COMMAND_NAME] and works on a user selection (ssget with a sensible filter).
- Saves and restores system variables it changes (OSMODE, CMDECHO, CLAYER…) and uses an *error* handler so the drawing is never left in a broken state.
- Wraps changes in a single UNDO group so one U reverts everything.
- Creates missing layers/text styles instead of failing; never erases user data unless asked.
- Is commented line by line in plain English and avoids features not supported in [AUTOCAD_VERSION] (note: LT 2024+ supports AutoLISP but not ObjectARX/.NET).

After the code: 1) how to load it (APPLOAD / Startup Suite), 2) a 3-step test on a sample drawing, 3) known limitations.`,
  },
  {
    id: 'mercury-autocad-command-coach',
    type: 'TEXT',
    title: { en: 'AutoCAD command coach: “how do I…?” step by step', tr: 'AutoCAD komut koçu: “nasıl yaparım?” adım adım' },
    description: {
      en: 'Explains the fastest command sequence for any drafting goal, with English/localized command names, aliases and common pitfalls.',
      tr: 'Her çizim hedefi için en hızlı komut sırasını, İngilizce/Türkçe komut adları, kısayollar ve sık hatalarla anlatır.',
    },
    tags: ['AutoCAD', 'Commands', 'Learning'],
    content: `Act as an expert AutoCAD instructor. ${CAD_CONTEXT}

Goal: [GOAL, e.g. offset all exterior walls 5 cm for insulation and clean the corners | create a viewport at 1:50 for the stair detail].

Answer with:
1. The fastest method as numbered steps. For each command give the global name with underscore (e.g. _OFFSET), its alias, and the localized name if my interface is not English.
2. Exact prompts AutoCAD will show and what to type/click.
3. One alternative method and when it is better.
4. Pitfalls (e.g. wrong layer current, annotative scale mismatch, OSNAP interfering) and how to check the result.
Keep it concise; no generic advice.`,
  },
  {
    id: 'mercury-layer-standard',
    type: 'TEXT',
    title: { en: 'Office layer standard + LISP that creates the layers', tr: 'Ofis katman (layer) standardı + katmanları oluşturan LISP' },
    description: {
      en: 'Designs a layer list (AIA / ISO 13567 style) with colors, linetypes and lineweights, then outputs a routine that builds it in one click.',
      tr: 'Renk, çizgi tipi ve kalınlıklarıyla bir katman listesi (AIA / ISO 13567 tarzı) tasarlar, ardından tek tıkla kuran bir rutin üretir.',
    },
    tags: ['AutoCAD', 'Layers', 'CAD standards', 'AutoLISP'],
    content: `You are a CAD standards manager for an architecture office. ${CAD_CONTEXT}

Design a layer standard for [PROJECT_TYPE, e.g. residential projects, permit + construction drawings] based on [STANDARD, e.g. AIA CAD Layer Guidelines | ISO 13567 | our office prefix scheme: [PREFIX]].

Deliver:
1. A table: layer name | description | color (ACI) | linetype | lineweight | plot yes/no | typical objects. Cover walls (new/existing/demolition), doors, windows, stairs, furniture, dimensions, text, hatches, grids, structure, MEP references, viewports, title block.
2. Rules for naming new layers and for existing/new/demolition phases.
3. An AutoLISP routine c:MAKELAYERS that creates every layer with those properties (load linetypes if missing, skip existing layers without changing them).
4. A short checklist to clean a received drawing into this standard (LAYTRANS mapping suggestions).`,
  },
  {
    id: 'mercury-autocad-script-batch',
    type: 'TEXT',
    title: { en: 'Batch .scr script: plot, purge or update many DWGs', tr: 'Toplu .scr script: çok sayıda DWG’yi çıktı al, temizle, güncelle' },
    description: {
      en: 'Builds an AutoCAD script file (and the batch runner) to repeat the same operations across a folder of drawings.',
      tr: 'Bir klasördeki tüm çizimlerde aynı işlemleri tekrarlayan AutoCAD script dosyasını (ve çalıştırıcıyı) hazırlar.',
    },
    tags: ['AutoCAD', 'Script', 'Batch', 'Plotting'],
    content: `${CAD_CONTEXT}
I need to run the same operations on [COUNT] DWG files in [FOLDER].

Operations, in order: [OPERATIONS, e.g. -PURGE all, AUDIT fix yes, set all layouts to page setup "A3-PDF", plot every layout to PDF in the same folder, QSAVE].

Write:
1. A .scr file using command-line versions of commands (with leading hyphen where needed), one command per line, correct blank lines/Enters, FILEDIA 0 at start and 1 at the end.
2. A way to run it over all files: [RUNNER, e.g. ScriptPro | a Windows .bat with accoreconsole.exe | Publish] with exact syntax.
3. A dry-run plan to test on 2 copies first, and how to read errors from the log.
Mention any command that behaves differently in AutoCAD LT or in non-English versions (use underscore global names).`,
  },
  {
    id: 'mercury-ezdxf-python',
    type: 'TEXT',
    title: { en: 'Python + ezdxf: read or generate DXF drawings', tr: 'Python + ezdxf: DXF çizimlerini oku veya üret' },
    description: {
      en: 'Writes a Python script that extracts data from (or draws into) a DXF — room areas, block counts, coordinates — without opening AutoCAD.',
      tr: 'AutoCAD’i açmadan bir DXF’ten veri çeken (veya içine çizen) Python script’i yazar — oda alanları, blok sayıları, koordinatlar.',
    },
    tags: ['Python', 'ezdxf', 'DXF', 'Automation'],
    content: `Write a Python 3 script using the ezdxf library (only ezdxf + standard library, optionally openpyxl for Excel).

Input: [INPUT, e.g. plan.dxf exported from AutoCAD (DXF R2018), units = cm].
Goal: [GOAL, e.g. for every closed LWPOLYLINE on layer "A-AREA", find the MTEXT/TEXT inside it on layer "A-ROOM-NAME", compute the area in m², and export room name, area, perimeter and centroid to rooms.xlsx | draw a 6 m structural grid with bubbles A–F / 1–8 on layer S-GRID].

Requirements:
- Handle units correctly ($INSUNITS) and both LWPOLYLINE and POLYLINE; ignore entities on frozen/off layers if asked.
- Clear CLI usage (argparse), helpful errors for missing layers.
- Print a summary table at the end.
- Comment non-obvious geometry steps (point-in-polygon, bulges/arcs).
Then show how to install (pip install ezdxf openpyxl) and run it.`,
  },
  {
    id: 'mercury-area-schedule',
    type: 'TEXT',
    title: { en: 'Area schedule from closed polylines (net/gross, by floor)', tr: 'Kapalı polyline’lardan alan tablosu (net/brüt, kat bazında)' },
    description: {
      en: 'Paste exported polyline data or use the LISP it writes; get a clean room/area table with net, gross and common-area totals.',
      tr: 'Dışa aktardığın polyline verisini yapıştır ya da üretilen LISP’i kullan; net, brüt ve ortak alan toplamlı temiz bir alan tablosu al.',
    },
    tags: ['AutoCAD', 'Areas', 'Schedule', 'Excel'],
    content: `${CAD_CONTEXT}
I want an area schedule for [PROJECT] with [FLOORS] floors.

Part 1 — extraction: write an AutoLISP command c:AREAEXPORT that lets me pick closed polylines, asks for (or reads from text inside) the room name and floor, and writes a CSV: floor; unit; room; area_m2; perimeter_m. Use [DECIMAL_SEPARATOR, e.g. comma] as decimal separator.

Part 2 — schedule: once I paste the CSV below, return:
- a table per unit with net area per room and unit total,
- gross area per floor (using [GROSS_RULE, e.g. outer face of exterior walls + half of party walls]),
- common areas and their allocation share per unit,
- totals and a check that net + walls + common = gross (flag differences > 1%).
Follow [AREA_STANDARD, e.g. TS 12376 / RICS IPMS / local practice] and state the rule you applied.

CSV:
[PASTE_CSV_HERE]`,
  },
  {
    id: 'mercury-dynamic-block',
    type: 'TEXT',
    title: { en: 'Dynamic block designer (doors, windows, furniture)', tr: 'Dinamik blok tasarımcısı (kapı, pencere, mobilya)' },
    description: {
      en: 'Plans the parameters, actions, visibility states and lookup tables of a dynamic block, then walks you through building it in the Block Editor.',
      tr: 'Bir dinamik bloğun parametre, eylem, görünürlük durumları ve arama tablolarını planlar; ardından Blok Düzenleyicide kurmayı adım adım anlatır.',
    },
    tags: ['AutoCAD', 'Dynamic blocks', 'Library'],
    content: `${CAD_CONTEXT}
Design a dynamic block for: [ELEMENT, e.g. interior door — widths 70/80/90/100 cm, wall thickness 10–25 cm, swing left/right, in/out, with frame].

Provide:
1. Geometry to draw (with dimensions) and the insertion point.
2. Parameters and actions table: parameter type | name | values/increments | linked action | objects in the action selection set.
3. Visibility states / flip states / lookup table rows, with exact property names.
4. Attributes to add for schedules ([ATTRIBUTES, e.g. TYPE, WIDTH, HEIGHT, FIRE_RATING]).
5. Step-by-step build order in the Block Editor (BEDIT) and a test checklist (TESTBLOCK).
6. How to keep it on the right layers and make it annotative-safe.`,
  },
  {
    id: 'mercury-dwg-cleanup',
    type: 'TEXT',
    title: { en: 'Received DWG cleanup & audit checklist', tr: 'Gelen DWG için temizlik ve denetim kontrol listesi' },
    description: {
      en: 'A ready routine to fix heavy, broken or messy drawings from consultants: units, scale, xrefs, fonts, proxies, layers.',
      tr: 'Danışmanlardan gelen ağır, bozuk veya dağınık çizimleri düzeltmek için hazır rutin: birim, ölçek, xref, font, proxy, katman.',
    },
    tags: ['AutoCAD', 'Cleanup', 'Audit', 'Xref'],
    content: `${CAD_CONTEXT}
I received [FILE_DESCRIPTION, e.g. a 45 MB survey + architectural DWG from a consultant] and it is [SYMPTOMS, e.g. slow, wrong units, missing fonts, text shows as ???, xrefs not found, coordinates far from origin].

Give me an ordered cleanup procedure:
1. Safety: copy/eTransmit first, what to record (UNITS, INSUNITS, coordinates of a known point).
2. Diagnostics commands and what each output means (AUDIT, -PURGE, OVERKILL, -SCALELISTEDIT reset, XREF palette, FONT substitution file, proxy objects).
3. Fixes for each symptom above, with exact commands and options.
4. Moving to a shared coordinate system / site origin without breaking xref alignment.
5. Final checks before using it as an xref in my set, and a short report I can send back to the consultant.`,
  },
  {
    id: 'mercury-plot-setup',
    type: 'TEXT',
    title: { en: 'Plot setup: page setups, CTB/STB pen table, viewport scales', tr: 'Çıktı ayarları: sayfa düzeni, CTB/STB kalem tablosu, viewport ölçekleri' },
    description: {
      en: 'Defines consistent sheet sizes, lineweights per scale and a pen table so 1:50, 1:100 and 1:500 sheets plot correctly.',
      tr: '1:50, 1:100 ve 1:500 paftaların doğru çıkması için tutarlı pafta boyutları, ölçeğe göre çizgi kalınlıkları ve kalem tablosu tanımlar.',
    },
    tags: ['AutoCAD', 'Plotting', 'CTB', 'Layouts'],
    content: `${CAD_CONTEXT}
Office output: [SHEETS, e.g. A1 and A3 PDF, plus A0 for site plans]; plot style mode [MODE, e.g. color-dependent CTB | named STB].

Deliver:
1. Page setups to create (name, device, paper size, plot area, scale 1:1 on layouts, style table) and how to import them to every drawing (PSETUPIN).
2. A pen table: color/style → lineweight (mm) → screening/gray for each element class (cut walls, beyond, furniture, hatch, dimensions, text, grid, existing, demolition).
3. Recommended lineweight adjustments between 1:50, 1:100, 1:200 and 1:500.
4. Annotative text/dimension heights per scale (plotted 2.5/3.5/5 mm) and the viewport scale list to keep.
5. A pre-plot checklist (LWDISPLAY, PSLTSCALE, MSLTSCALE, background masks, transparency, PDF layers on).`,
  },
  {
    id: 'mercury-annotation-styles',
    type: 'TEXT',
    title: { en: 'Dimension, text & multileader styles for architecture', tr: 'Mimari için ölçü, yazı ve çoklu çıkış çizgisi (mleader) stilleri' },
    description: {
      en: 'Exact DIMSTYLE / STYLE / MLEADERSTYLE settings (annotative) for your units, scales and office look, plus a LISP to create them.',
      tr: 'Birimlerine, ölçeklerine ve ofis stiline göre tam DIMSTYLE / STYLE / MLEADERSTYLE ayarları (annotative) ve bunları oluşturan LISP.',
    },
    tags: ['AutoCAD', 'Dimensions', 'Annotation', 'Styles'],
    content: `${CAD_CONTEXT}
Create annotation standards for architectural drawings: plans/sections at [SCALES, e.g. 1:50 and 1:100], details at [DETAIL_SCALES, e.g. 1:5, 1:10, 1:20].

Specify:
1. Text styles: font ([FONT, e.g. Arial / ISOCPEUR]), plotted heights for titles, labels, notes; width factor.
2. Dimension style(s): architectural ticks vs arrows, extension line offsets, text placement, unit format and precision for [UNITS], suppression of zeros, annotative on. List each DIMVAR changed and its value.
3. Multileader style for material callouts and level markers.
4. Level/elevation symbol and section/detail callout conventions.
5. An AutoLISP routine that creates all of these if missing. Explain how annotative scaling interacts with viewports so text plots at the same size.`,
  },
  {
    id: 'mercury-excel-to-autocad',
    type: 'TEXT',
    title: { en: 'Excel/CSV → AutoCAD: schedules, coordinates, survey points', tr: 'Excel/CSV → AutoCAD: tablolar, koordinatlar, ölçüm noktaları' },
    description: {
      en: 'Bring door/window schedules, room lists or survey coordinates from Excel into AutoCAD as tables, points or blocks.',
      tr: 'Kapı/pencere listelerini, oda listelerini veya ölçüm koordinatlarını Excel’den AutoCAD’e tablo, nokta veya blok olarak aktar.',
    },
    tags: ['AutoCAD', 'Excel', 'Survey', 'Schedules'],
    content: `${CAD_CONTEXT}
I have this data in Excel/CSV: [DATA_DESCRIPTION, e.g. door schedule with columns Mark, Width, Height, Type, Fire rating | survey points with Point No, X (East), Y (North), Z, Code].

Goal: [GOAL, e.g. a linked AutoCAD table that updates from Excel | insert a block "SURVEY_PT" at each coordinate with attributes No/Z/Code on layer V-SURV].

Explain the best method for my version (DATALINK / TABLE from data link / Data Extraction / a LISP that reads CSV) and then give:
- exact steps or the full AutoLISP code (CSV parsing with my delimiter [DELIMITER] and decimal separator [DECIMAL]),
- coordinate system notes ([CRS, e.g. ITRF96 / TM30 — Easting/Northing order]) so points do not land mirrored or far from origin,
- a verification step (compare 3 known points).
Sample rows:
[PASTE_SAMPLE_ROWS]`,
  },
  {
    id: 'mercury-autocad-troubleshoot',
    type: 'TEXT',
    title: { en: 'AutoCAD error & weird-behaviour troubleshooter', tr: 'AutoCAD hata ve garip davranış çözücü' },
    description: {
      en: 'Paste the error message or describe the symptom; get likely causes ranked by probability and the exact fix for each.',
      tr: 'Hata mesajını yapıştır veya belirtiyi anlat; olasılık sırasına göre muhtemel nedenleri ve her biri için kesin çözümü al.',
    },
    tags: ['AutoCAD', 'Troubleshooting', 'Support'],
    content: `${CAD_CONTEXT}
Problem: [SYMPTOM, e.g. hatch disappears when zooming | OSNAP snaps to wrong points | "Unhandled exception" when plotting | dimensions show 0.00 | file opens as read-only].
What I already tried: [TRIED].
When it started / what changed: [CHANGES, e.g. after receiving consultant xref, after update to 2025.1].

Respond with:
1. Top causes ranked by likelihood with one-line reasoning each.
2. For each cause: a quick test to confirm it, then the exact fix (commands, system variables with values, settings paths).
3. If nothing works: how to collect diagnostics (AUDIT/RECOVER, safe mode /safemode, reset settings) without losing my profile.
Ask me one clarifying question only if the answer depends on it.`,
  },
  {
    id: 'mercury-drawing-qa-review',
    type: 'TEXT',
    title: { en: 'Drawing QA review of a plotted PDF sheet', tr: 'Çıktı alınmış PDF paftanın kalite kontrolü (QA)' },
    description: {
      en: 'Attach a sheet; a vision model checks dimensions, labels, consistency and annotation errors like a senior reviewer before issue.',
      tr: 'Paftayı ekle; görsel destekli model, yayından önce kıdemli bir kontrolör gibi ölçü, etiket, tutarlılık ve notasyon hatalarını denetler.',
    },
    tags: ['QA', 'Drawing review', 'Vision', 'PDF'],
    content: `You are a senior architect doing a QA check on the attached drawing sheet ([SHEET, e.g. A-101 Ground floor plan, 1:100, permit set]) before it is issued.

Check and report, citing the location on the sheet (grid/zone or room name):
1. Missing or inconsistent dimensions (strings that don't add up, overall vs partial), missing levels, unlabeled rooms.
2. Door/window tags missing or inconsistent with the schedule [SCHEDULE_IF_ANY].
3. Section/elevation/detail callouts that point to sheets not in the index [INDEX_IF_ANY].
4. North arrow, scale bar, title block fields, revision cloud and revision table consistency.
5. Graphic issues: overlapping text, unreadable line weights, hatches hiding text, wrong layer colors in print.
6. Plausibility: stair rise/run, corridor and door widths, wet-area adjacency, structural grid continuity.
Return a table: # | severity (blocker/major/minor) | location | issue | suggested fix. Do not guess values you cannot read; mark them "illegible".`,
  },
  {
    id: 'mercury-raster-to-cad',
    type: 'TEXT',
    title: { en: 'Scanned plan / photo of a drawing → AutoCAD redraw plan', tr: 'Taranmış plan / çizim fotoğrafından AutoCAD’de yeniden çizim planı' },
    description: {
      en: 'Reads an old scanned plan and returns a scaled coordinate list and drawing order so you can redraw it in AutoCAD quickly.',
      tr: 'Eski taranmış bir planı okuyup ölçekli koordinat listesi ve çizim sırası verir; AutoCAD’de hızla yeniden çizebilirsin.',
    },
    tags: ['AutoCAD', 'Scan', 'Redraw', 'Vision'],
    content: `The attached image is a [SOURCE, e.g. scanned 1:100 municipal archive plan | phone photo of a hand drawing] that I need to redraw in AutoCAD. ${CAD_CONTEXT}

1. Read every dimension you can; state the scale you infer and how (scale bar, a known dimension such as [KNOWN_DIMENSION]).
2. Return the outline of the exterior walls as an ordered list of X,Y coordinates in [UNITS] starting at the bottom-left corner (0,0), then interior walls, openings (position along wall + width) and stairs.
3. Mark every value you estimated (not read) with "~" and list them separately for me to verify on site.
4. Give the fastest AutoCAD workflow to redraw it: IMAGEATTACH + SCALE with reference, ALIGN for skew, then PLINE with the coordinates, OFFSET for wall thickness, layer list.
5. Optionally output an AutoLISP command c:REDRAWPLAN that draws the exterior outline from the coordinate list.`,
  },
]
