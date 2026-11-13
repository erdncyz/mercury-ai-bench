import type { AiModel, TaskId } from '../types/models'
import { rankModels } from './ranking'

export interface RecommendationSettings {
  task: TaskId
  budget: number
  monthlyRequests: number
  inputTokens: number
  outputTokens: number
  priority: 'quality' | 'balanced' | 'speed'
  openOnly: boolean
}

/** Apply hard constraints first; normalize the remaining candidates on a common scale. */
export function recommendModels(models: AiModel[], settings: RecommendationSettings) {
  const eligible = rankModels(models, settings.task, 'score', settings.inputTokens, settings.outputTokens)
    .filter((model) => Number.isFinite(model.score))
    .filter((model) => !settings.openOnly || model.open_weights)
    .filter((model) => Number.isFinite(model.requestCost) && model.requestCost >= 0)
    .filter((model) => model.requestCost * settings.monthlyRequests <= settings.budget)
    .filter((model) => settings.priority !== 'speed' || (model.median_output_tokens_per_second ?? 0) > 0)
  const qualityMax = Math.max(0, ...eligible.map((m) => m.score)) || 1
  const speedMax = Math.max(0, ...eligible.map((m) => m.median_output_tokens_per_second ?? 0)) || 1
  const weights = settings.priority === 'quality' ? [0.85, 0, 0.15]
    : settings.priority === 'speed' ? [0.3, 0.55, 0.15] : [0.6, 0.15, 0.25]
  return eligible.map((model) => {
    const monthlyCost = model.requestCost * settings.monthlyRequests
    const affordability = settings.budget > 0 ? 1 - monthlyCost / settings.budget : 1
    const fit = weights[0] * model.score / qualityMax
      + weights[1] * (model.median_output_tokens_per_second ?? 0) / speedMax
      + weights[2] * affordability
    return { model, monthlyCost, fit }
  }).sort((a, b) => b.fit - a.fit || b.model.score - a.model.score).slice(0, 3)
}
