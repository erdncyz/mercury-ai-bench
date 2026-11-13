import { BestFpCard } from './BestFpCard'
import { useI18n } from '../i18n/I18nProvider'
import type { RankedModel, TaskId } from '../types/models'

export function BestPerformanceCard({ models, task, variant = 'performance' }: { models: RankedModel[]; task: TaskId; variant?: 'performance' | 'value' }) {
  const { t } = useI18n()
  const ranked = [...models].sort((a, b) => variant === 'value' ? b.valueScore - a.valueScore : b.score - a.score)

  return (
    <div>
      <div>
        {ranked.length > 0 ? (
          <BestFpCard models={ranked.slice(0, 3)} task={task} variant={variant} />
        ) : (
          <p className="py-5 text-sm text-mercury-mute">{t('noResults')}</p>
        )}
      </div>
    </div>
  )
}
