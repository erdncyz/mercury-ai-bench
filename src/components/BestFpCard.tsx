import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { formatMediaPrice, formatScore, formatUsd } from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

export function BestFpCard({
  model,
  task,
}: {
  model: RankedModel | null
  task: TaskId
}) {
  const { t } = useI18n()
  if (!model) return null

  const isMedia = task === 'image' || task === 'speech'
  const priceLabel = isMedia
    ? formatMediaPrice(model)
    : formatUsd(model.pricing.price_1m_blended_3_to_1)

  return (
    <section className="mb-6 reveal reveal-delay-2">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
        {t('bestFp')}
      </p>
      <Link
        to={`/model/${model.slug}?task=${task}`}
        className="panel group relative block overflow-hidden rounded-2xl border-cyan/25 p-5 transition hover:border-cyan/50"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_90%_0%,rgba(94,234,212,0.12),transparent_60%)]"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-mercury-mute">{t('bestFpHint')}</p>
            <p className="mt-1 font-display text-3xl text-mercury md:text-4xl">
              {model.name}
            </p>
            <p className="mt-1 text-sm text-mercury-mute">
              {model.model_creator.name} · #{model.rank} {t('score').toLowerCase()}
            </p>
          </div>
          <div className="flex gap-6 font-mono text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-mercury-mute">
                {t('score')}
              </p>
              <p className="rank-metal text-2xl">
                {formatScore(model.score, isMedia ? 0 : 1)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-mercury-mute">
                {t('value')}
              </p>
              <p className="text-2xl text-cyan">{formatScore(model.valueScore, 2)}×</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-mercury-mute">
                {isMedia ? t('unitPrice') : t('blended')}
              </p>
              <p className="text-2xl text-mercury-dim">{priceLabel}</p>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}
