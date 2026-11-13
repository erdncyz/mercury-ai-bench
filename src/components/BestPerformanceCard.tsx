import { useId, useState } from 'react'
import { BestFpCard } from './BestFpCard'
import { useI18n } from '../i18n/I18nProvider'
import type { RankedModel, TaskId } from '../types/models'

export function BestPerformanceCard({ models, task, variant = 'performance' }: { models: RankedModel[]; task: TaskId; variant?: 'performance' | 'value' }) {
  const { t } = useI18n()
  const [expandedTask, setExpandedTask] = useState<TaskId | null>(null)
  const expanded = expandedTask === task
  const listId = useId()
  const ranked = [...models].sort((a, b) => variant === 'value' ? b.valueScore - a.valueScore : b.score - a.score)

  return (
    <div>
      <div id={listId}>
        {ranked.length > 0 ? (
          <BestFpCard models={expanded ? ranked : ranked.slice(0, 3)} task={task} variant={variant} />
        ) : (
          <p className="py-5 text-sm text-mercury-mute">{t('noResults')}</p>
        )}
      </div>
      {ranked.length > 3 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpandedTask(expanded ? null : task)}
          className="mt-3 rounded-lg border border-cyan/25 px-4 py-2 text-sm text-cyan transition hover:bg-cyan/5"
        >
          {t(expanded ? 'showTopThreeModels' : 'showAllPerformanceModels')}
          {!expanded && ` (${ranked.length})`}
        </button>
      )}
    </div>
  )
}
