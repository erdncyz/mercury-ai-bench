import { AUTOCAD_PROMPTS } from './autocad.ts'
import { BIM_PROMPTS } from './bim.ts'
import { DESIGN_PROMPTS } from './design.ts'
import { INTERIOR_PROMPTS } from './interior.ts'
import { LANDSCAPE_PROMPTS } from './landscape.ts'
import { PRESENTATION_PROMPTS } from './presentation.ts'
import { TECHNICAL_PROMPTS } from './technical.ts'
import type { ArchTopic, CuratedPrompt } from './types.ts'
import { VISUAL_PROMPTS } from './visual.ts'

export type { ArchTopic, CuratedPrompt } from './types.ts'

export const ARCH_TEMPLATES: Record<ArchTopic, CuratedPrompt[]> = {
  visual: VISUAL_PROMPTS,
  autocad: AUTOCAD_PROMPTS,
  bim: BIM_PROMPTS,
  design: DESIGN_PROMPTS,
  technical: TECHNICAL_PROMPTS,
  presentation: PRESENTATION_PROMPTS,
  interior: INTERIOR_PROMPTS,
  landscape: LANDSCAPE_PROMPTS,
}
