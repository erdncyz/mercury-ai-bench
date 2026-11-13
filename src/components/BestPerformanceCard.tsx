import { ArrowRight, Trophy } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { BenchmarkMeta } from './BenchmarkMeta'
import { benchmarkDigits, modelPath } from '../lib/benchmarks'
import { FavoriteButton } from './FavoriteButton'
import { useI18n } from '../i18n/I18nProvider'
import { TASKS } from '../i18n/messages'
import { creatorColor } from '../lib/creatorColors'
import { formatScore, scoreDigits } from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

export function BestPerformanceCard({ models, task }: { models: RankedModel[]; task: TaskId }) {
  const { t } = useI18n()
  const highestScore = Math.max(...models.map((model) => model.score))
  const leaders = models.filter((model) => model.score === highestScore)
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
        <ul className="divide-y divide-white/8">
          {leaders.map((model) => (
            <li key={model.id} className="relative">
              <Link
                to={modelPath(model, task)}
                className="flex flex-col gap-4 p-5 pr-16 transition hover:bg-gold/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words text-xl font-medium text-mercury">{model.name}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-mercury-dim">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: creatorColor(model.model_creator.name) }}
                      aria-hidden
                    />
                    {model.model_creator.name}
                    {leaders.length > 1 && <span className="text-gold">· {t('jointLeader')}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <div className="sm:text-right">
                    <p className="font-mono text-2xl text-gold">
                      {formatScore(model.score, benchmarkDigits(model.benchmark, scoreDigits(task)))}{task === 'speed' && ' t/s'}
                    </p>
                    <p className="mt-1 text-xs text-mercury-mute">{model.benchmark?.label ?? t(taskInfo.descKey)}</p>
                  </div>
                  <ArrowRight size={18} className="text-gold" aria-hidden />
                </div>
              </Link>
              <div className="px-5 pb-4"><BenchmarkMeta result={model.benchmark} /></div>
              <FavoriteButton slug={model.slug} className="absolute right-4 top-4" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
