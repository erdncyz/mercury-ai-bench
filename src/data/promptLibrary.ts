import type { PromptItem } from '../../shared/prompts'
import type { LibraryCategoryId } from '../../shared/promptLibrary'

type Localized = { tr: string; en: string }
export interface LibraryCategory {
  id: LibraryCategoryId
  label: Localized
  description: Localized
  color: string
  symbol: string
  prompts: [string, string, string][]
}

// Original Mercury templates. Covers are editorial illustrations, not generated results.
export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  { id: 'photography', label: { tr: 'Fotoğraf & portre', en: 'Photography & portraits' }, description: { tr: 'Işık, kadraj ve karakter.', en: 'Light, framing and character.' }, color: '#edb586', symbol: 'portrait', prompts: [
    ['Sinematik sokak portresi', 'Cinematic street portrait', 'Create a cinematic street portrait of [SUBJECT] in [CITY]. Use a 50mm lens look, rainy pavement reflections, practical neon lighting and natural skin texture. Specify framing, color palette and a 4:5 composition.'],
    ['Editoryal moda çekimi', 'Editorial fashion shoot', 'Art-direct a fashion editorial for [COLLECTION]. Define a single location, three coordinated poses, fabric details, soft directional lighting and negative space for editorial layout. Output a coherent 3-image shot list and a generation prompt for each.'],
    ['Analog seyahat karesi', 'Analog travel photograph', 'Photograph [DESTINATION] as an intimate 35mm travel diary. Use subtle grain, restrained colors, believable midday light and a candid foreground subject. Avoid tourist clichés and heavy HDR.'],
    ['Doğal profesyonel portre', 'Natural professional headshot', 'Edit my attached portrait for a professional profile. Preserve identity, age, expression and skin texture. Use a neutral [BACKGROUND], soft window light and a chest-up crop. Remove only temporary distractions, without reshaping facial features.'],
    ['Makro doğa fotoğrafı', 'Macro nature photography', 'Create a macro photograph of [PLANT / INSECT] with visible microtexture, a coherent focal plane, soft natural backlight and a calm blurred habitat. Specify magnification, depth of field and a believable scale.'],
    ['Yemek fotoğrafı', 'Food photography', 'Create an appetizing editorial photograph of [DISH]. Specify ingredients, ceramic plate, side-window lighting and [ANGLE]. Keep textures realistic, styling minimal and the background suitable for a restaurant menu.'],
  ] },
  { id: 'products', label: { tr: 'Ürün & e-ticaret', en: 'Products & commerce' }, description: { tr: 'Vitrinden kampanya çekimine.', en: 'From storefront to campaign.' }, color: '#b9a4ed', symbol: 'product', prompts: [
    ['Stüdyo ürün çekimi', 'Studio product photograph', 'Create a studio photograph of [PRODUCT] on [BACKGROUND]. Preserve the supplied product shape, label and proportions. Use a large softbox, a grounded contact shadow and a clear hero angle. Leave room for a headline.'],
    ['Kozmetik kampanyası', 'Skincare campaign', 'Design a premium skincare campaign image for [PRODUCT]. Use translucent glass, water caustics and [BRAND COLOR]. Keep packaging legible and material reflections plausible. Deliver one hero composition in 4:5.'],
    ['Takı detay çekimi', 'Jewelry detail photograph', 'Photograph [JEWELRY] on a matte mineral surface. Show accurate metal finish, gemstone facets and scale. Use controlled highlights, macro detail and an uncluttered luxury editorial composition.'],
    ['Ürün açıklaması', 'Product description', 'Write a product page for [PRODUCT] using only these verified facts: [FACTS]. Include a benefit-led headline, short description, five feature bullets, specifications and three FAQs. Do not invent certifications, discounts or performance claims.'],
    ['E-ticaret görsel seti', 'Commerce image set', 'Plan six coherent listing images for [PRODUCT]: hero, scale, detail, use case, included items and care. For each give framing, props, lighting, aspect ratio and an image prompt. Keep product identity consistent across the set.'],
    ['Ambalaj konsepti', 'Packaging concept', 'Develop three packaging concepts for [PRODUCT] aimed at [AUDIENCE]. Define material, opening experience, typography hierarchy and production constraints. Provide a front/back layout brief and a realistic mockup prompt for each.'],
  ] },
  { id: 'architecture', label: { tr: 'Mimarlık & iç mekan', en: 'Architecture & interiors' }, description: { tr: 'Mekanı düşün, atmosferi kur.', en: 'Shape spaces and atmosphere.' }, color: '#8fc9c0', symbol: 'building', prompts: [
    ['Akdeniz avlulu ev', 'Mediterranean courtyard house', 'Visualize a Mediterranean courtyard house in [LOCATION]. Use local limestone, lime plaster, shaded arcades and drought-tolerant planting. Show a human-scale exterior at late afternoon with physically plausible sunlight.'],
    ['Japandi oturma odası', 'Japandi living room', 'Redesign the attached living room in Japandi style. Preserve walls, window positions and camera perspective. Use [BUDGET], warm oak, linen and concealed storage. Explain furniture placement before providing the image-edit prompt.'],
    ['Planı 3D mekana dönüştür', 'Floor plan to 3D interior', 'Use the attached floor plan as the source of truth. Preserve walls, doors, windows and room proportions; ask for missing scale. Create an eye-level interior visualization of [ROOM] with [MATERIALS]. Do not invent openings.'],
    ['Butik kafe tasarımı', 'Boutique café design', 'Create a concept for a [AREA] café in [CITY]. Organize customer flow, counter, accessible seating and service storage. Give a material palette, lighting strategy and an interior render prompt. Flag dimensions requiring site verification.'],
    ['Peyzaj ve bahçe', 'Landscape and garden', 'Design a low-maintenance garden for [CLIMATE / AREA]. Define sun exposure assumptions, paths, seating and water needs. Propose locally suitable planting to verify with a nursery and provide a seasonal visualization prompt.'],
    ['Mimari sunum paftası', 'Architectural presentation board', 'Lay out an architecture presentation board for [PROJECT]. Organize concept statement, site plan, floor plans, section and hero render in a clear reading order. Specify grid, scale labels, typography and a restrained material palette.'],
  ] },
  { id: 'illustration', label: { tr: 'İllüstrasyon & 3D', en: 'Illustration & 3D' }, description: { tr: 'Yeni dünyalar ve karakterler.', en: 'New worlds and characters.' }, color: '#f1b5cf', symbol: 'shapes', prompts: [
    ['İzometrik minyatür şehir', 'Isometric miniature city', 'Create an isometric miniature of [CITY / NEIGHBORHOOD]. Include three recognizable landmarks, small street details and a unified pastel material palette. Use orthographic perspective, soft ambient occlusion and a clean background.'],
    ['Çocuk kitabı sahnesi', 'Picture book scene', 'Illustrate [SCENE] for a picture book aimed at ages [AGE]. Define character appearance, expressive gesture and a warm gouache texture. Leave quiet space for text and keep the scene readable at a small size.'],
    ['Kil karakter tasarımı', 'Clay character design', 'Design an original clay-style character representing [IDEA]. Define silhouette, tactile surface, two signature accessories and a friendly expression. Provide front, side and three-quarter views with consistent proportions.'],
    ['Bilimkurgu çevre tasarımı', 'Science fiction environment', 'Paint a science-fiction environment in [SETTING]. Establish a clear focal point, believable infrastructure, atmospheric depth and tiny scale figures. Explain the environment story through objects, without text labels.'],
    ['Botanik poster', 'Botanical poster', 'Create a botanical illustration of [PLANT]. Show leaf structure, flower detail and a restrained paper texture. Arrange a main specimen and two magnified details with blank space for manually added labels.'],
    ['Oyun nesnesi koleksiyonu', 'Game prop collection', 'Design six game inventory props for [GAME WORLD]. Use a shared shape language, consistent three-quarter camera angle and readable rarity accents. Describe each prop and provide individual generation prompts on transparent backgrounds.'],
  ] },
  { id: 'video', label: { tr: 'Video & sinema', en: 'Video & cinema' }, description: { tr: 'Sahne, hareket ve hikaye.', en: 'Scenes, motion and story.' }, color: '#e9a291', symbol: 'film', prompts: [
    ['Sinematik açılış planı', 'Cinematic opening shot', 'Write an 8-second video prompt of [SCENE]. Define one continuous camera movement, subject action, foreground/background, time of day and lighting. Specify start and end frames, natural motion and no sudden cuts.'],
    ['Ürün reklam filmi', 'Product commercial', 'Storyboard a 15-second commercial for [PRODUCT]. Split into three shots with duration, lens, product action, transition and sound direction. Keep packaging consistent and distinguish visual generation prompts from voiceover.'],
    ['Dikey kısa video', 'Vertical short video', 'Create a 30-second vertical video script about [TOPIC] for [AUDIENCE]. Include a specific opening hook, visual demonstration, captions, timing and one clear call to action. Provide a shot-by-shot production table.'],
    ['Doğa belgeseli sahnesi', 'Nature documentary scene', 'Write a video generation prompt showing [ANIMAL] in its natural [HABITAT]. Use a patient documentary camera, plausible animal movement, ambient sound notes and a single behavior over 10 seconds. Avoid anthropomorphic actions.'],
    ['Stop-motion hikaye', 'Stop-motion story', 'Plan a 12-second stop-motion sequence using [MATERIALS]. Define a simple beginning, transformation and ending. Describe camera lock, frame cadence, consistent lighting and three keyframes.'],
    ['Müzik klibi görsel dünyası', 'Music video visual direction', 'Develop a visual treatment for a music video with [GENRE / MOOD]. Define palette, locations, recurring visual motif and five shots. Map each shot to a musical moment and provide camera and lighting directions.'],
  ] },
  { id: 'branding', label: { tr: 'Marka & grafik tasarım', en: 'Brand & graphic design' }, description: { tr: 'Kimlik, tipografi ve düzen.', en: 'Identity, typography and layout.' }, color: '#d7db92', symbol: 'shapes', prompts: [
    ['Marka kimliği briefi', 'Brand identity brief', 'Build a brand identity brief for [BRAND] serving [AUDIENCE]. Define positioning, tone of voice, distinctive visual cues, color roles and typography criteria. Present three design directions with reasons and applications.'],
    ['Logo keşif çalışması', 'Logo exploration', 'Explore three original logo concepts for [BRAND / SECTOR]. Explain symbol logic, silhouette and small-size legibility. Provide black-and-white image prompts and flag any generated lettering for manual refinement.'],
    ['Etkinlik afişi', 'Event poster', 'Design a poster layout for [EVENT]. Establish hierarchy for title, date, venue and booking details. Define grid, two type roles, a visual concept and print margins. Provide a visual prompt with blank areas for accurate text.'],
    ['Sosyal medya karuseli', 'Social carousel', 'Create a seven-slide carousel about [TOPIC]. Give each slide one idea, a headline under eight words, concise body copy and a visual direction. Finish with a useful action and maintain a consistent layout system.'],
    ['Sunum tasarım sistemi', 'Presentation design system', 'Develop a slide design system for [PRESENTATION]. Define title, comparison, chart, quote and closing layouts. Specify type scale, spacing, accessible colors and rules for evidence labels. Apply it to a five-slide outline.'],
    ['Editoryal kapak', 'Editorial cover', 'Art-direct a magazine cover about [THEME]. Define an unexpected central image, typographic hierarchy and deliberate negative space. Provide three distinct composition options and image prompts without generated cover text.'],
  ] },
  { id: 'software', label: { tr: 'Yazılım & geliştirme', en: 'Software & development' }, description: { tr: 'Fikirden çalışan ürüne.', en: 'From idea to working product.' }, color: '#91bdec', symbol: 'code', prompts: [
    ['Özellik geliştirme planı', 'Feature implementation plan', 'Plan implementation of [FEATURE] in [STACK]. First identify existing conventions and unclear requirements. List affected components, data flow, edge cases and acceptance criteria. Propose the smallest coherent change and a focused validation plan.'],
    ['Hata ayıklama ortağı', 'Debugging partner', 'Investigate this error: [ERROR / LOGS]. Context: [CODE / EXPECTED BEHAVIOR]. Separate observations from hypotheses, rank likely causes and propose a minimal reproduction. Explain the smallest fix and a regression check.'],
    ['API sözleşmesi', 'API contract', 'Design an API for [USE CASE]. Specify resources, request/response examples, validation, authentication assumptions, pagination, error format and idempotency. Include failure cases and a concise OpenAPI-style endpoint outline.'],
    ['Kod inceleme', 'Code review', 'Review [DIFF] for correctness, security and maintainability. For each actionable issue provide file/line, triggering input, impact and a concrete fix. Prioritize defects over stylistic preferences; state what you could not verify.'],
    ['Veritabanı modelleme', 'Database modeling', 'Model a relational database for [DOMAIN]. Describe entities, relationships, constraints and expected queries. Propose indexes tied to those queries and discuss migration, retention and transaction boundaries. Include sample SQL.'],
    ['Test senaryosu tasarımı', 'Test scenario design', 'Create a risk-based test plan for [FEATURE]. Cover core user journeys, invalid input, permissions, concurrency and recovery. Give test data, expected outcomes and the right test level. Avoid tests that only mirror implementation.'],
  ] },
  { id: 'ux', label: { tr: 'Web & kullanıcı deneyimi', en: 'Web & user experience' }, description: { tr: 'Akıcı ve anlaşılır arayüzler.', en: 'Clear, useful interfaces.' }, color: '#9ad6ba', symbol: 'layout', prompts: [
    ['Landing page briefi', 'Landing page brief', 'Design a landing page for [PRODUCT / AUDIENCE]. Define the primary conversion, information hierarchy, hero content, evidence and call to action. Provide responsive section layouts and realistic copy without invented testimonials.'],
    ['Dashboard tasarımı', 'Dashboard design', 'Design a dashboard for [ROLE] making [DECISION]. Choose five relevant metrics, appropriate chart types, filters and drill-down paths. Specify empty, loading, error and stale-data states plus a mobile layout.'],
    ['Kullanılabilirlik incelemesi', 'Usability review', 'Review [SCREEN / FLOW] for [USER GOAL]. Walk through it as a new user, identify concrete friction, rank by impact and suggest specific changes. Separate observed problems from assumptions requiring user testing.'],
    ['Onboarding akışı', 'Onboarding flow', 'Design an onboarding flow for [APP]. Ask only for information needed to reach [FIRST VALUE]. Specify steps, copy, progress, skip/back behavior and recovery paths. Include keyboard and screen-reader considerations.'],
    ['Arayüz metinleri', 'Interface microcopy', 'Write UI copy for [FLOW] in [LANGUAGE / TONE]. Include labels, helper text, validation errors, empty states and success messages. Explain what happened and the next action; keep action names consistent.'],
    ['Erişilebilirlik kontrolü', 'Accessibility review', 'Audit the supplied [HTML / SCREEN] for accessibility. Check semantics, keyboard flow, focus, labels, contrast and error announcements. Provide actionable fixes and clearly distinguish code checks from manual assistive-technology tests.'],
  ] },
  { id: 'marketing', label: { tr: 'Pazarlama & içerik', en: 'Marketing & content' }, description: { tr: 'Doğru kitleye doğru mesaj.', en: 'The right message for your audience.' }, color: '#e8b88f', symbol: 'chart', prompts: [
    ['30 günlük içerik takvimi', '30-day content calendar', 'Create a 30-day content calendar for [BRAND / CHANNEL]. Use [GOAL] and [AUDIENCE]. Organize by weekly theme and give format, hook, main message, call to action and production effort for each entry.'],
    ['SEO içerik briefi', 'SEO content brief', 'Build a content brief for [QUERY / AUDIENCE]. Define search intent, outline, questions, original evidence needed and internal link opportunities. Do not invent search volumes or claim to have checked rankings.'],
    ['E-posta serisi', 'Email sequence', 'Write a five-email welcome sequence for [PRODUCT]. Give subject line, preview text, body and one CTA per email. Progress from first value to a relevant next step. Avoid fabricated urgency and unsupported claims.'],
    ['Reklam metni varyasyonları', 'Ad copy variations', 'Write six ad concepts for [OFFER]. Use three distinct audience motivations and two treatments each. Include hook, supporting claim, CTA and visual direction. List the evidence needed to support each factual claim.'],
    ['LinkedIn uzmanlık yazısı', 'LinkedIn expertise post', 'Turn [EXPERIENCE / NOTES] into a LinkedIn post for [AUDIENCE]. Start with a concrete observation, explain the lesson and give a practical takeaway. Preserve my voice; do not invent results or anecdotes.'],
    ['Kampanya deney planı', 'Campaign experiment plan', 'Plan a marketing experiment for [HYPOTHESIS]. Define audience, control, single changed variable, primary metric, guardrails and stopping criteria. Explain what outcome would support or weaken the hypothesis.'],
  ] },
  { id: 'business', label: { tr: 'İş & girişim', en: 'Business & startups' }, description: { tr: 'Kararları somut adımlara çevir.', en: 'Turn decisions into actions.' }, color: '#b5bce8', symbol: 'chart', prompts: [
    ['İş fikri doğrulama', 'Business idea validation', 'Evaluate [BUSINESS IDEA] for [CUSTOMER]. Identify the core problem, existing alternatives, riskiest assumptions and five interview questions. Propose a low-cost validation experiment and explicit success/failure criteria.'],
    ['Ürün gereksinim dokümanı', 'Product requirements document', 'Write a PRD for [FEATURE]. Include problem, target users, desired outcome, user stories, acceptance criteria, exclusions, dependencies and rollout risks. Mark unknowns and suggest how to resolve them.'],
    ['Müşteri görüşmesi rehberi', 'Customer interview guide', 'Create a 30-minute discovery interview for [SEGMENT]. Ask about recent behavior, current workarounds, costs and decision-making. Avoid leading questions and pitching. Include follow-up probes and a synthesis template.'],
    ['Toplantıdan aksiyon çıkar', 'Meeting to action items', 'Transform [MEETING NOTES] into decisions, action items, open questions and context. Assign owners and deadlines only when explicitly stated. Mark missing owners and unresolved commitments without guessing.'],
    ['Teklif hazırlama', 'Proposal drafting', 'Draft a proposal for [CLIENT / PROJECT]. Include understanding of the problem, scope, deliverables, milestones, assumptions and acceptance process. Use [PRICE / TERMS] as supplied and list missing inputs.'],
    ['Rakip karşılaştırma çerçevesi', 'Competitor comparison framework', 'Build a competitor comparison for [PRODUCT / COMPETITORS] using [SOURCES]. Compare customer fit, workflow, pricing date and differentiators. Cite supplied evidence, mark unknowns and separate facts from interpretation.'],
  ] },
  { id: 'learning', label: { tr: 'Eğitim & araştırma', en: 'Learning & research' }, description: { tr: 'Anla, çalış ve keşfet.', en: 'Understand, practice and explore.' }, color: '#dfc88e', symbol: 'book', prompts: [
    ['Kişisel öğrenme rotası', 'Personal learning roadmap', 'Build a four-week study plan for [TOPIC] at [LEVEL] with [HOURS] per week. Define milestones, practice tasks, feedback loops and a final project. Adapt to [CONSTRAINTS] and include weekly self-assessment.'],
    ['Sokratik öğretmen', 'Socratic tutor', 'Tutor me on [TOPIC] using one question at a time. First assess my current understanding, then offer hints before solutions. Diagnose misconceptions, use concrete examples and end each section with a transfer problem.'],
    ['Makale okuma rehberi', 'Research paper reading guide', 'Analyze the supplied paper [PAPER TEXT]. Explain research question, method, sample, results and limitations. Distinguish authors’ claims from demonstrated evidence and identify questions the paper does not answer.'],
    ['Aralıklı tekrar kartları', 'Spaced repetition cards', 'Convert [NOTES] into 20 atomic flashcards. Each card should test one idea with an unambiguous question and concise answer. Add five application questions and avoid introducing facts absent from the notes.'],
    ['Dil pratiği partneri', 'Language practice partner', 'Practice [LANGUAGE] with me at [LEVEL] through [SCENARIO]. Take one conversational turn at a time. After my reply, correct the most important mistake, explain briefly and continue naturally.'],
    ['Araştırma planı', 'Research plan', 'Design a research plan for [QUESTION]. Define scope, key concepts, search queries, source quality criteria and a synthesis structure. List competing hypotheses and evidence that could distinguish them.'],
  ] },
  { id: 'writing', label: { tr: 'Yazarlık & günlük yaşam', en: 'Writing & everyday life' }, description: { tr: 'Düşüncelere biçim ver.', en: 'Give your ideas a shape.' }, color: '#d8afd8', symbol: 'book', prompts: [
    ['Kısa öykü atölyesi', 'Short story workshop', 'Develop a short story from [PREMISE]. Define a protagonist with a concrete desire, an obstacle and a consequential choice. Write a five-beat outline, then an opening scene in [VOICE] without explaining the entire backstory.'],
    ['Metin düzenleme', 'Text editing', 'Edit [TEXT] for clarity and flow while preserving my meaning and voice. Remove repetition, clarify vague claims and flag unsupported statements. Return the revised text plus a short explanation of substantive changes.'],
    ['Haftalık çalışma planı', 'Weekly work plan', 'Organize [TASKS] into a realistic weekly plan with [AVAILABLE HOURS]. Account for deadlines, energy and dependencies. Reserve buffer time, identify what to postpone and define a concrete next action for each priority.'],
    ['Seyahat planlama', 'Travel planning', 'Draft a [DAYS]-day itinerary for [DESTINATION] with [BUDGET / INTERESTS]. Cluster nearby activities and allow transit and rest time. Mark opening hours, prices and reservation details that need current verification.'],
    ['Portfolyo hikayesi', 'Portfolio case study', 'Turn [PROJECT NOTES] into a portfolio case study. Explain context, my role, constraints, decisions and outcomes using only supplied evidence. Suggest visuals for each section and flag missing measurements.'],
    ['Karmaşık konuyu sadeleştir', 'Explain a complex topic', 'Explain [TOPIC] to [AUDIENCE]. Start with a plain-language definition, use one accurate analogy and work through an example. Explain where the analogy breaks down and end with three comprehension questions.'],
  ] },
]

export function libraryItems(category: LibraryCategory, locale: 'en' | 'tr'): PromptItem[] {
  return category.prompts.map(([tr, en, content], index) => ({
    id: `library-${category.id}-${index}`, title: locale === 'tr' ? tr : en,
    description: locale === 'tr' ? `${category.label.tr} için uyarlanabilir hazır şablon.` : `An adaptable template for ${category.label.en.toLowerCase()}.`,
    content: `${content}\n\nInputs: replace every [BRACKETED FIELD] with your context before starting. If essential information is missing, ask focused questions first. State assumptions explicitly.\nOutput language: [LANGUAGE].`,
    contentTruncated: false, type: category.id === 'photography' || category.id === 'illustration' || (category.id === 'architecture' && index < 3) || (category.id === 'products' && index !== 3) ? 'IMAGE' : category.id === 'video' ? 'VIDEO' : 'TEXT',
    mediaUrl: null, url: '', origin: 'mercury', category: category.label[locale], tags: [category.label[locale]], author: null,
    votes: 0, createdAt: '', updatedAt: '', trending: false, featured: true,
  }))
}
