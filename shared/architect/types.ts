// Mercury-authored prompt templates for architects. prompts.chat has almost nothing for AutoCAD / BIM / 2D→3D work,
// so these fill the gap. Prompt text stays English (models follow it more reliably); titles/descriptions are bilingual.

export type ArchTopic =
  | 'visual'
  | 'autocad'
  | 'bim'
  | 'design'
  | 'technical'
  | 'presentation'
  | 'interior'
  | 'landscape'

export interface CuratedPrompt {
  id: string
  type: 'IMAGE' | 'TEXT' | 'VIDEO'
  title: { en: string; tr: string }
  description: { en: string; tr: string }
  tags: string[]
  content: string
}

export const KEEP_GEOMETRY = `Treat the attached drawing as the single source of truth for geometry:
- Keep every wall, opening, door, window, stair and column exactly where the drawing places it; do not add, remove, move or resize rooms.
- Respect the proportions implied by the dimension lines and the scale bar ([SCALE, e.g. 1:100]); wall thickness [WALL_THICKNESS, e.g. 20 cm exterior / 10 cm interior].
- Ignore annotations, hatches, grid bubbles, dimension text and title block — they are information, not objects to render.`

export const VERIFY_REGULATIONS = `Jurisdiction: [COUNTRY / CITY, e.g. Türkiye — Planlı Alanlar İmar Yönetmeliği + local plan notes].
- Quote the article/clause you rely on and say which edition you assume; if you are not sure a rule is current, say so explicitly.
- Never invent numeric limits. If a value depends on the local zoning plan, ask me for it instead of guessing.
- End with "To verify" — the items a licensed professional must confirm with the authority.`
