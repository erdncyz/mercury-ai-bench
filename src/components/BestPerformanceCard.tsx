import { ArrowRight, Trophy } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { benchmarkDigits, modelPath } from '../lib/benchmarks'
import { FavoriteButton } from './FavoriteButton'
import { useI18n } from '../i18n/I18nProvider'
import { TASKS } from '../i18n/messages'
import { creatorColor } from '../lib/creatorColors'
import { formatScore, scoreDigits } from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

export function BestPerformanceCard({ models, task }: { models: RankedModel[]; task: TaskId }) {
  const { t } = useI18n()
  const [expandedTask, setExpandedTask] = useState<TaskId | null>(null)
  const expanded = expandedTask === task
  const listId = useId()
  const ranked = [...models].sort((a, b) => b.score - a.score)
  const leaders = expanded ? ranked : ranked.slice(0, 3)
  const taskInfo = TASKS.find((entry) => entry.id === task)!

  return (
    <section className="panel overflow-hidden rounded-2xl border-gold/25">
      <div className="flex items-start gap-3 border-b border-gold/10 bg-gold/5 p-5">
        <Trophy size={24} weight="duotone" className="shrink-0 text-gold" aria-hidden />
        <div>
          <h2 className="text-sm font-medium text-gold">
            {t(leaders[0]?.benchmark?.historical ? 'historicalLeader' : 'bestPerformance')} · {t(taskInfo.labelKey)}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-mercury-dim">{t('bestPerformanceHint')}</p>
        </div>
      </div>
      {leaders.length === 0 ? (
        <p className="p-5 text-sm text-mercury-mute">{t('noPerformanceData')}</p>
      ) : (
        <ol id={listId} className="grid divide-y divide-white/8 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {leaders.map((model, index) => (
            <li key={model.id} className="relative">
              <Link
                to={modelPath(model, task)}
                className="flex h-full flex-col justify-between gap-4 p-5 pr-16 transition hover:bg-gold/5"
              >
                <div className="min-w-0">
                  <p className="mb-3 font-display text-3xl text-gold">{index + 1}</p>
                  <p className="break-words text-xl font-medium text-mercury">{model.name}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-mercury-dim">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: creatorColor(model.model_creator.name) }}
                      aria-hidden
                    />
                    {model.model_creator.name}
                    {model.score === leaders[0].score && models.filter((entry) => entry.score === model.score).length > 1 && <span className="text-gold">· {t('jointLeader')}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <div>
                    <p className="font-mono text-2xl text-gold">
                      {formatScore(model.score, benchmarkDigits(model.benchmark, scoreDigits(task)))}{task === 'speed' && ' t/s'}
                    </p>
                    <p className="mt-1 text-xs text-mercury-mute">{model.benchmark?.id.startsWith('combined:') ? t('combinedScore') : t(taskInfo.descKey)}</p>
                  </div>
                  <ArrowRight size={18} className="text-gold" aria-hidden />
                </div>
              </Link>

              <FavoriteButton slug={model.slug} className="absolute right-4 top-4" />
            </li>
          ))}
        </ol>
      )}
      {ranked.length > 3 && (
        <div className="border-t border-gold/10 p-4">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpandedTask(expanded ? null : task)}
            className="rounded-lg border border-gold/25 px-4 py-2 text-sm text-gold transition hover:bg-gold/5"
          >
            {t(expanded ? 'showTopThreeModels' : 'showAllPerformanceModels')}
            {!expanded && ` (${ranked.length})`}
          </button>
        </div>
      )}
    </section>
  )
}
