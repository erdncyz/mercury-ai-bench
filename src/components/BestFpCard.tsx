import { BenchmarkMeta, PriceMeta } from './BenchmarkMeta'
import { benchmarkDigits, modelPath } from '../lib/benchmarks'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { FavoriteButton } from './FavoriteButton'
import { useI18n } from '../i18n/I18nProvider'
import { creatorColor } from '../lib/creatorColors'
import { fadeUp, hoverLift, staggerFast } from '../lib/motion'
import {
  formatMediaPrice,
  formatScore,
  formatUsd,
} from '../lib/ranking'
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

  const isMedia = task === 'image' || task === 'speech' || task === 'video' || task === 'presentation'

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
            {t('bestFp')}
          </p>
          <p className="mt-1 text-xs text-mercury-mute">{t('bestFpHint')}</p>
        </div>
      </div>
      <motion.ol
        className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-3"
        variants={staggerFast}
        initial="hidden"
        animate="show"
      >
        {models.map((model, index) => {
          const priceLabel = isMedia
            ? formatMediaPrice(model)
            : formatUsd(model.pricing.price_1m_blended_3_to_1)

          return (
            <motion.li key={model.id} className="min-w-0" variants={fadeUp}>
              <motion.div whileHover={hoverLift} className={`panel relative flex h-full flex-col overflow-hidden rounded-2xl transition hover:border-cyan/40 ${index === 0 ? 'panel-glow border-cyan/30' : ''}`}>
                <Link
                  to={modelPath(model, task)}
                  title={model.name}
                  className="relative flex min-h-[176px] flex-1 flex-col p-5"
                >
                  {index === 0 && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_160px_at_100%_0%,rgba(94,234,212,0.16),transparent_60%)]"
                    />
                  )}
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-baseline justify-between pr-11">
                      <span
                        className={`${index === 0 ? 'rank-gold' : 'rank-metal'} font-display text-3xl`}
                      >
                        {index + 1}
                      </span>
                      <span className="font-mono text-[11px] text-cyan">
                        {formatScore(model.valueScore, 2)}×
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-[3.25rem] text-lg font-medium leading-snug text-mercury">
                      {model.name}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-sm text-mercury-mute">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ background: creatorColor(model.model_creator.name) }}
                        aria-hidden
                      />
                      {model.model_creator.name} · #{model.rank}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-3 font-mono text-xs">
                      <span className="text-mercury-dim">
                        {t('score')} {formatScore(model.score, benchmarkDigits(model.benchmark, isMedia ? 0 : 1))}
                      </span>
                      <span className="text-cyan">{priceLabel}</span>
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-3"><BenchmarkMeta result={model.benchmark} compact /><PriceMeta pricing={model.pricing} /></div>
                <FavoriteButton slug={model.slug} className="absolute right-4 top-4" />
              </motion.div>
            </motion.li>
          )
        })}
      </motion.ol>
    </section>
  )
}
