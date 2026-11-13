import { BenchmarkMeta, PriceMeta } from './BenchmarkMeta'
import { benchmarkDigits, modelPath } from '../lib/benchmarks'
import { ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { FavoriteButton } from './FavoriteButton'
import { useI18n } from '../i18n/I18nProvider'
import { creatorColor } from '../lib/creatorColors'
import { fadeUp, hoverLift, staggerFast } from '../lib/motion'
import { formatScore, formatUsd, scoreDigits } from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

export function TopTeaser({
  models,
  task,
  hideHeader = false,
}: {
  models: RankedModel[]
  task: TaskId
  hideHeader?: boolean
}) {
  const { t } = useI18n()
  const top = models.slice(0, 5)

  return (
    <section>
      {!hideHeader && (
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl text-mercury md:text-3xl">
            {t('topForTask')}
          </h2>
          <Link
            to={`/bench?task=${task}`}
            className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan hover:text-mercury"
          >
            {t('viewFull')}
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
      <motion.ol
        className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-5"
        variants={staggerFast}
        initial="hidden"
        animate="show"
      >
        {top.map((model, index) => (
          <motion.li key={model.id} className="min-w-0" variants={fadeUp}>
            <motion.div whileHover={hoverLift} className="panel relative flex h-full flex-col rounded-2xl transition hover:border-cyan/30 hover:bg-ink-panel">
              <Link
                to={modelPath(model, task)}
                title={model.name}
                className="flex min-h-[168px] flex-1 flex-col p-5"
              >
                <div className="flex items-baseline justify-between pr-11">
                  <span className="rank-metal font-display text-3xl">{model.rank}</span>
                  <span className="font-mono text-[11px] text-mercury-mute">
                    #{index + 1}
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
                  <span className="truncate">{model.model_creator.name}</span>
                  {model.open_weights && (
                    <span className="shrink-0 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-emerald-200">
                      {t('openBadge')}
                    </span>
                  )}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-3 font-mono text-xs">
                  <span className="text-mercury-dim">
                    {t('score')}{' '}
                    {formatScore(model.score, benchmarkDigits(model.benchmark, scoreDigits(task)))}
                  </span>
                  <span className="text-cyan">
                    {task === 'image' || task === 'speech' || task === 'video' || task === 'presentation'
                      ? formatUsd(model.pricing.price_unit)
                      : formatUsd(model.pricing.price_1m_blended_3_to_1)}
                  </span>
                </div>
              </Link>
              <div className="px-5 pb-3"><BenchmarkMeta result={model.benchmark} compact /><PriceMeta pricing={model.pricing} /></div>
              <FavoriteButton slug={model.slug} className="absolute right-4 top-4" />
            </motion.div>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
