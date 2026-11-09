import { KEEP_GEOMETRY, type CuratedPrompt } from './types.ts'

export const PRESENTATION_PROMPTS: CuratedPrompt[] = [
  {
    id: 'mercury-project-statement',
    type: 'TEXT',
    title: { en: 'Project description in 50 / 150 / 300 words', tr: '50 / 150 / 300 kelimelik proje açıklama metni' },
    description: {
      en: 'Writes the project text for websites, competitions and award entries in three lengths, without empty “archispeak”.',
      tr: 'Web sitesi, yarışma ve ödül başvuruları için proje metnini üç uzunlukta yazar; içi boş “mimar jargonu” olmadan.',
    },
    tags: ['Writing', 'Portfolio', 'Competition'],
    content: `Write project descriptions for [PROJECT_NAME], a [TYPE] in [LOCATION], completed/designed [YEAR], [AREA] m², client [CLIENT_TYPE].
Facts: site & context [CONTEXT]; main idea [IDEA]; key design moves [MOVES]; materials [MATERIALS]; sustainability features [SUSTAINABILITY]; team [TEAM].

Deliver 3 versions: 50 words (caption), 150 words (website), 300 words (award/competition).
Rules: concrete and specific; every sentence must contain a fact or a reason; no clichés such as "dialogue between inside and outside", "harmony with nature" unless explained with a real design move; present tense; [LANGUAGE] (also give an English version if Turkish).`,
  },
  {
    id: 'mercury-competition-board',
    type: 'TEXT',
    title: { en: 'Competition board layout & text plan (A0/A1)', tr: 'Yarışma paftası yerleşimi ve metin planı (A0/A1)' },
    description: {
      en: 'Plans the story, hierarchy and grid of your boards: which drawing goes where, how big, and the text for each block.',
      tr: 'Paftalarının hikâyesini, hiyerarşisini ve gridini planlar: hangi çizim nereye, hangi boyutta ve her blok için metin.',
    },
    tags: ['Competition', 'Boards', 'Layout'],
    content: `Competition: [COMPETITION_NAME], brief summary [BRIEF], jury priorities [JURY_FOCUS], board format [FORMAT, e.g. 2 × A1 landscape], anonymity rules [RULES].
My material: [MATERIAL, e.g. hero render, 3 plans, 1 long section, site plan 1:500, 4 diagrams, 2 interior renders].

1. The story in 3 sentences the jury should get in 30 seconds.
2. Board-by-board layout on a [GRID, e.g. 6-column] grid: block position, size (columns × rows), content, scale.
3. Reading order and visual hierarchy (what is largest and why), color/graphic rules.
4. Headline, subheadings and the text for each block (max [WORD_LIMIT] words total).
5. What to cut if space is tight, and a final checklist against the brief requirements.`,
  },
  {
    id: 'mercury-portfolio-case-study',
    type: 'TEXT',
    title: { en: 'Portfolio case study for job applications', tr: 'İş başvurusu için portfolyo vaka çalışması' },
    description: {
      en: 'Structures a project page that shows your role, process and skills (software, detailing, coordination) to hiring offices.',
      tr: 'İşe alım yapan ofislere rolünü, sürecini ve becerilerini (yazılım, detay, koordinasyon) gösteren bir proje sayfası kurgular.',
    },
    tags: ['Portfolio', 'Career', 'Writing'],
    content: `I am applying to [OFFICE_TYPE, e.g. a mid-size practice focused on housing] for a [ROLE] position. Help me build a portfolio case study for [PROJECT].
My role and tasks: [ROLE_DETAILS]. Tools used: [TOOLS, e.g. AutoCAD, Revit, Rhino, Enscape]. Available images: [IMAGES].

Deliver:
1. Page sequence (spread by spread) with which image goes where and why.
2. Short texts: project summary, problem, my contribution, process, outcome (with numbers if possible).
3. Captions that state scale, software and my role for each drawing.
4. What to remove or add to match this office's work, and 3 interview questions this page may trigger with suggested answers.`,
  },
  {
    id: 'mercury-client-presentation',
    type: 'TEXT',
    title: { en: 'Client presentation script & objection handling', tr: 'Müşteri sunum akışı ve itirazlara cevap' },
    description: {
      en: 'Builds the slide flow and talking points for a design presentation, plus answers to likely client objections (cost, time, taste).',
      tr: 'Tasarım sunumu için slayt akışı ve konuşma notları hazırlar; olası itirazlara (maliyet, süre, zevk) cevaplar ekler.',
    },
    tags: ['Presentation', 'Client', 'Communication'],
    content: `I present [STAGE, e.g. the concept design] of [PROJECT] to [AUDIENCE, e.g. a family client | a developer's board | municipality committee] in [DURATION] minutes.
Key decisions I need from them: [DECISIONS]. Material available: [MATERIAL].

1. Slide-by-slide flow (title, visual, 2–3 talking points, time).
2. How to open (their goals first) and how to close (clear decision request).
3. Plain-language explanations for technical topics ([TECHNICAL_TOPICS]).
4. Likely objections and calm, specific answers (budget, schedule, style, regulations, neighbours).
5. A one-page leave-behind summary.`,
  },
  {
    id: 'mercury-project-social-post',
    type: 'TEXT',
    title: { en: 'Social media posts for an architecture project', tr: 'Bir mimarlık projesi için sosyal medya gönderileri' },
    description: {
      en: 'Instagram carousel, LinkedIn post and short video captions for the same project, with image order and hashtags.',
      tr: 'Aynı proje için Instagram karuseli, LinkedIn gönderisi ve kısa video metinleri; görsel sırası ve hashtag’lerle.',
    },
    tags: ['Social media', 'Marketing', 'Instagram', 'LinkedIn'],
    content: `Project: [PROJECT] ([TYPE], [LOCATION], [STATUS e.g. completed | under construction | competition entry]). Key facts: [FACTS]. Images: [IMAGE_LIST]. Office voice: [VOICE, e.g. calm, precise, no hype].

Create:
1. Instagram carousel (8–10 slides): image order + on-slide text (max 8 words each) + caption (max 120 words) + 10 relevant hashtags (mix of broad and niche, Turkish and English if useful).
2. LinkedIn post (150–200 words) focused on the problem solved and the team/consultants (tag placeholders).
3. Three captions for a 15-second reel/video with a hook in the first line.
Avoid clichés and exaggerated claims; credit photographers [PHOTOGRAPHER].`,
  },
  {
    id: 'mercury-diagram-set',
    type: 'TEXT',
    title: { en: 'Diagram set planner: what to draw to explain the design', tr: 'Diyagram seti planlayıcı: tasarımı anlatmak için ne çizmeli' },
    description: {
      en: 'Proposes the 8–12 diagrams that best explain your project, with graphic style rules so they read as one family.',
      tr: 'Projeni en iyi anlatan 8–12 diyagramı ve hepsinin bir aile gibi okunması için grafik stil kurallarını önerir.',
    },
    tags: ['Diagrams', 'Presentation', 'Graphics'],
    content: `Project: [PROJECT_SUMMARY]. Main design moves: [MOVES]. Audience: [AUDIENCE].

1. Propose 8–12 diagrams (e.g. site forces, massing evolution steps, program distribution, circulation, structure, daylight/ventilation, phasing, public/private gradient) — for each: purpose, view type (axo, plan, section, step sequence), what to show, what to leave out.
2. Order them as a narrative.
3. Graphic system: line weights, a 4–5 color palette with HEX codes, fonts, arrow and label style, background.
4. For 3 key diagrams, write an image-generation prompt to get a first draft I can redraw.`,
  },
  {
    id: 'mercury-board-image',
    type: 'IMAGE',
    title: { en: 'Presentation board mock-up from your drawings', tr: 'Çizimlerinden sunum paftası taslak görseli' },
    description: {
      en: 'Composes your attached render, plan and section into a clean board layout to test hierarchy before doing it in InDesign/Illustrator.',
      tr: 'Ekli render, plan ve kesitini temiz bir pafta düzenine yerleştirir; InDesign/Illustrator’da yapmadan önce hiyerarşiyi test edersin.',
    },
    tags: ['Boards', 'Layout', 'Presentation'],
    content: `Compose the attached images ([IMAGES, e.g. 1 hero render, 1 floor plan, 1 section, 1 site plan]) into an architectural presentation board.

${KEEP_GEOMETRY}

Format: [FORMAT, e.g. A1 portrait], [GRID, e.g. 6-column] grid with consistent margins and gutters.
Hierarchy: hero render largest at the top, drawings below at consistent scale, generous white space.
Graphics: [STYLE, e.g. Swiss minimal, off-white background, thin black rules], title "[PROJECT_TITLE]" in a clean sans-serif, short placeholder text blocks (lorem-free: use the real headings [HEADINGS]).
Do not redraw or alter the drawings themselves; only place, scale proportionally and crop them.`,
  },
]
