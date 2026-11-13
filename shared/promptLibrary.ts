// Classify before translation. A prompt belongs to one category; unknown topics stay in the community feed.
export const LIBRARY_CATEGORY_IDS = [
  'photography', 'products', 'architecture', 'illustration', 'video', 'branding',
  'software', 'ux', 'marketing', 'business', 'learning', 'writing',
] as const
export type LibraryCategoryId = typeof LIBRARY_CATEGORY_IDS[number]

const RULES: { id: LibraryCategoryId; match: RegExp; exclude?: RegExp }[] = [
  { id: 'architecture', match: /\b(architectur\w*|floor ?plans?|interior|exterior|facade|courtyard|landscap\w*|bim|revit|autocad|furniture|living room|bedroom|kitchen|garden design)\b/i, exclude: /\b(software|system|cloud|solution|data|enterprise) architect\w*\b/i },
  { id: 'products', match: /\b(product (photo\w*|image\w*|shot\w*|render\w*|listing\w*|description\w*)|e[- ]?commerce|packaging|jewelry|jewellery|cosmetic\w*|skincare|perfume|studio product|still life)\b/i },
  { id: 'video', match: /\b(video\w*|filmmak\w*|film director|storyboard\w*|motion|animation|animated|documentary|camera movement|music clip|stop[- ]motion)\b/i },
  { id: 'photography', match: /\b(cinematic|film still|film grain|analog|black and white|photo\w*|portrait\w*|headshot\w*|camera|lens|lighting|retouch\w*|color grad\w*|colour grad\w*|35mm|bokeh|exposure|polaroid)\b/i },
  { id: 'illustration', match: /\b(illustrat\w*|3d|isometric|cartoon\w*|anime|manga|clay|character design|concept art|digital art|watercolor|watercolour|painting|game (asset|prop)\w*)\b/i },
  { id: 'branding', match: /\b(brand\w*|logo\w*|graphic design|poster\w*|typograph\w*|visual identity|magazine cover|editorial design|presentation design)\b/i },
  { id: 'ux', match: /\b(ui|ux|user (experience|interface)|interface|wireframe\w*|landing page|dashboard|usability|onboarding|accessibility|web design|design system|microcopy)\b/i },
  { id: 'software', match: /\b(cod(e|ing|er)|program\w*|develop\w*|debug\w*|software|backend|frontend|api|database\w*|sql|devops|python|javascript|typescript|react|html|css|security|unit test\w*|web development|flappy bird)\b/i },
  { id: 'marketing', match: /\b(market\w*|seo|advertis\w*|ad copy|social media|linkedin|instagram|tiktok|campaign\w*|copywrit\w*|content (calendar|strategy)|email (sequence|newsletter)|conversion)\b/i },
  { id: 'business', match: /\b(business|startup\w*|entrepreneur\w*|sales|recruit\w*|hiring|human resources|finance|financial|product manag\w*|project manag\w*|proposal|meeting|customer|competitor|prd|roadmap|strateg\w*)\b/i },
  { id: 'learning', match: /\b(learn\w*|educat\w*|teach\w*|tutor\w*|study|studying|research\w*|flashcard\w*|lesson\w*|socratic|curriculum|language (practice|learning)|explain\w*)\b/i },
  { id: 'writing', match: /\b(writ\w*|story\w*|fiction|poem\w*|poetry|travel|itinerary|productivity|weekly plan|resume|cv|portfolio|edit(or|ing) text|proofread\w*|summari[sz]\w*|translat\w*)\b/i },
]

export function classifyLibraryPrompt(item: { title: string; description: string | null; category: string | null; tags: string[]; type: string }): LibraryCategoryId | null {
  if (item.type === 'VIDEO') return 'video'
  let best: LibraryCategoryId | null = null
  let score = 0
  for (const rule of RULES) {
    if (rule.exclude?.test(`${item.title} ${item.description ?? ''} ${item.category ?? ''}`)) continue
    const weight = (rule.match.test(item.title) ? 6 : 0)
      + (rule.match.test(item.tags.join(' ')) ? 4 : 0)
      + (rule.match.test(item.category ?? '') ? 3 : 0)
      + (rule.match.test(item.description ?? '') ? 1 : 0)
    if (weight > score) { score = weight; best = rule.id }
  }
  return best
}
