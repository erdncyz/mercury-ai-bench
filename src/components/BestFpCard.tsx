import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { formatMediaPrice, formatScore, formatUsd } from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

export function BestFpCard({
  models,
  task,
}: {
  models: RankedModel[]
  task: TaskId
}) {
  const { t } = useI18n()
  if (models.length === 0) return null

  const isMedia = task === 'image' || task === 'speech'

  return (
    <section className="mb-6 reveal reveal-delay-2">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
            {t('bestFp')}
          </p>
          <p className="mt-1 text-xs text-mercury-mute">{t('bestFpHint')}</p>
        </div>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {models.map((model, index) => {
          const priceLabel = isMedia
            ? formatMediaPrice(model)
            : formatUsd(model.pricing.price_1m_blended_3_to_1)

          return (
            <li key={model.id}>
              <Link
                to={`/model/${model.slug}?task=${task}`}
                className={`panel group relative block h-full overflow-hidden rounded-2xl p-5 transition hover:border-cyan/40 ${
                  index === 0 ? 'border-cyan/30' : ''
                }`}
              >
                {index === 0 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_160px_at_100%_0%,rgba(94,234,212,0.14),transparent_60%)]"
                  />
                )}
                <div className="relative">
                  <div className="flex items-baseline justify-between">
                    <span className="rank-metal font-display text-3xl">{index + 1}</span>
                    <span className="font-mono text-[11px] text-cyan">
                      {formatScore(model.valueScore, 2)}×
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-medium leading-snug text-mercury">
                    {model.name}
                  </p>
                  <p className="mt-1 text-sm text-mercury-mute">
                    {model.model_creator.name} · #{model.rank}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-line pt-3 font-mono text-xs">
                    <span className="text-mercury-dim">
                      {t('score')} {formatScore(model.score, isMedia ? 0 : 1)}
                    </span>
                    <span className="text-cyan">{priceLabel}</span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
