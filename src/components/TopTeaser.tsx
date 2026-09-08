import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { formatScore, formatUsd } from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

export function TopTeaser({
  models,
  task,
}: {
  models: RankedModel[]
  task: TaskId
}) {
  const { t } = useI18n()
  const top = models.slice(0, 3)

  return (
    <section className="reveal reveal-delay-3">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl text-mercury md:text-3xl">
          {t('topForTask')}
        </h2>
        <Link
          to={`/bench?task=${task}`}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan hover:text-mercury"
        >
          {t('viewFull')} →
        </Link>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {top.map((model, index) => (
          <li key={model.id}>
            <Link
              to={`/model/${model.slug}?task=${task}`}
              className="panel block rounded-2xl p-5 transition hover:border-cyan/30 hover:bg-ink-panel"
            >
              <div className="flex items-baseline justify-between">
                <span className="rank-metal font-display text-3xl">{model.rank}</span>
                <span className="font-mono text-[11px] text-mercury-mute">
                  #{index + 1}
                </span>
              </div>
              <p className="mt-3 text-lg font-medium text-mercury">{model.name}</p>
              <p className="text-sm text-mercury-mute">{model.model_creator.name}</p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-line pt-3 font-mono text-xs">
                <span className="text-mercury-dim">
                  {t('score')}{' '}
                  {formatScore(
                    model.score,
                    task === 'image' || task === 'speech'
                      ? 0
                      : task === 'agents'
                        ? 2
                        : 1,
                  )}
                </span>
                <span className="text-cyan">
                  {task === 'image' || task === 'speech'
                    ? formatUsd(model.pricing.price_unit)
                    : formatUsd(model.pricing.price_1m_blended_3_to_1)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
