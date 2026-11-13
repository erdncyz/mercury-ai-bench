import { BenchmarkMeta, PriceMeta } from './BenchmarkMeta'
import { benchmarkDigits, modelPath } from '../lib/benchmarks'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ScoreBar } from './charts/ScoreBar'
import { FavoriteButton } from './FavoriteButton'
import { useI18n } from '../i18n/I18nProvider'
import { creatorColor } from '../lib/creatorColors'
import { fadeIn } from '../lib/motion'
import {
  formatMediaPrice,
  formatScore,
  formatSpeed,
  formatUsd,
  isNewRelease,
  scoreDigits,
} from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

function isMediaTask(task: TaskId) {
  return task === 'image' || task === 'speech' || task === 'video' || task === 'presentation'
}

export function ValueStrip({
  models,
  task,
}: {
  models: RankedModel[]
  task: TaskId
}) {
  const { t } = useI18n()
  const best = [...models]
    .filter((m) => m.valueScore > 0)
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 4)

  if (best.length === 0) return null

  return (
    <section className="mb-6">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-mercury-mute">
        {t('bestValue')}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {best.map((model) => (
          <div key={model.id} className="relative min-w-[240px] shrink-0">
            <Link
              to={modelPath(model, task)}
              className="panel block h-full rounded-xl px-4 py-3 pr-14 transition hover:border-cyan/30"
            >
              <p className="text-sm font-medium text-mercury">{model.name}</p>
              <p className="text-xs text-mercury-mute">{model.model_creator.name}</p>
              <div className="mt-2 flex justify-between font-mono text-[11px]">
                <span className="text-cyan">{formatScore(model.valueScore, 2)}×</span>
                <span className="text-mercury-dim">
                  {isMediaTask(task)
                    ? formatMediaPrice(model)
                    : formatUsd(model.pricing.price_1m_blended_3_to_1)}
                </span>
              </div>
            </Link>
            <FavoriteButton slug={model.slug} className="absolute right-3 top-3" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function LeaderboardTable({
  models,
  task,
  shimmerKey,
  selected,
  onToggleSelect,
  monthlyRequests = 0,
}: {
  models: RankedModel[]
  task: TaskId
  shimmerKey: string
  selected?: Set<string>
  onToggleSelect?: (slug: string) => void
  monthlyRequests?: number
}) {
  const { t } = useI18n()
  const media = isMediaTask(task)
  const maxScore = Math.max(...models.map((m) => m.score), 1)
  const digits = scoreDigits(task)
  const selectable = Boolean(onToggleSelect)
  const showMonthly = !media && monthlyRequests > 0

  if (models.length === 0) {
    return (
      <p className="panel rounded-2xl p-8 text-center text-mercury-mute">
        {t('noResults')}
      </p>
    )
  }

  return (
    <motion.div
      key={shimmerKey}
      className="panel mercury-shimmer overflow-hidden rounded-2xl"
      variants={fadeIn}
      initial="hidden"
      animate="show"
    >
      <ol className="divide-y divide-white/8 md:hidden">
        {models.map((model) => {
          const metrics = [
            { label: media && task !== 'presentation' ? t('eloScore') : t('score'), value: formatScore(model.score, benchmarkDigits(model.benchmark, digits)) },
            ...(media
              ? [{ label: t('unitPrice'), value: formatMediaPrice(model) }]
              : [
                  { label: t('inputPrice'), value: formatUsd(model.pricing.price_1m_input_tokens) },
                  { label: t('outputPrice'), value: formatUsd(model.pricing.price_1m_output_tokens) },
                  { label: t('blended'), value: formatUsd(model.pricing.price_1m_blended_3_to_1) },
                  { label: t('speed'), value: formatSpeed(model.median_output_tokens_per_second) },
                ]),
            { label: t('requestCost'), value: formatUsd(Number.isFinite(model.requestCost) ? model.requestCost : null, 4) },
            ...(showMonthly ? [{ label: t('monthlyCost'), value: formatUsd(Number.isFinite(model.requestCost) ? model.requestCost * monthlyRequests : null) }] : []),
            { label: t('value'), value: model.valueScore > 0 ? formatScore(model.valueScore, 2) : '—' },
          ]
          return (
            <li key={model.id} className={`p-4 ${selected?.has(model.slug) ? 'bg-cyan/[0.06]' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="rank-metal shrink-0 font-display text-2xl">{model.rank}</span>
                <div className="min-w-0 flex-1">
                  <Link to={modelPath(model, task)} className="block py-1 text-base font-medium text-mercury hover:text-cyan">
                    {model.name}
                  </Link>
                  <p className="text-xs text-mercury-mute">{model.model_creator.name}</p>
                  <BenchmarkMeta result={model.benchmark} compact />
                  <PriceMeta pricing={model.pricing} />
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-cyan">
                    {isNewRelease(model) && <span>{t('newBadge')}</span>}
                    {model.open_weights && <span>{t('openBadge')}</span>}
                  </div>
                </div>
                <FavoriteButton slug={model.slug} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/8 pt-3">
                {metrics.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-mercury-mute">{label}</dt>
                    <dd className="mt-1 font-mono text-sm text-mercury">{value}</dd>
                  </div>
                ))}
              </dl>
              {selectable && (
                <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 text-sm text-mercury-dim">
                  <input type="checkbox" className="h-5 w-5 accent-cyan"
                    checked={selected?.has(model.slug) ?? false}
                    onChange={() => onToggleSelect?.(model.slug)}
                    aria-label={`${t('compare')}: ${model.name}`}
                  />
                  {t('compare')}
                </label>
              )}
            </li>
          )
        })}
      </ol>
      <div className="hidden md:block">
        <p className="border-b border-white/8 px-4 py-3 text-xs text-mercury-mute xl:hidden">{t('scrollTable')}</p>
        <div className="table-scroll overflow-x-auto" role="region" aria-label={t('navBench')} tabIndex={0}>
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.16em] text-mercury-mute">
                {selectable && <th className="w-10 px-3 py-3" aria-label={t('compare')} />}
                <th className="px-4 py-3 font-medium">{t('rank')}</th>
                <th className="px-4 py-3 font-medium">{t('model')}</th>
                <th className="px-4 py-3 font-medium">
                  {media && task !== 'presentation' ? t('eloScore') : t('score')}
                </th>
                {media ? (
                  <th className="px-4 py-3 font-medium">{t('unitPrice')}</th>
                ) : (
                  <>
                    <th className="px-4 py-3 font-medium">{t('inputPrice')}</th>
                    <th className="px-4 py-3 font-medium">{t('outputPrice')}</th>
                    <th className="px-4 py-3 font-medium">{t('blended')}</th>
                    <th className="px-4 py-3 font-medium">{t('speed')}</th>
                  </>
                )}
                <th className="px-4 py-3 font-medium">{t('requestCost')}</th>
                {showMonthly && <th className="px-4 py-3 font-medium">{t('monthlyCost')}</th>}
                <th className="px-4 py-3 font-medium">{t('value')}</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <tr
                  key={model.id}
                  className={`border-b border-white/6 transition hover:bg-cyan/[0.05] ${
                    selected?.has(model.slug) ? 'bg-cyan/[0.06]' : ''
                  }`}
                >
                  {selectable && (
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-cyan"
                        checked={selected?.has(model.slug) ?? false}
                        onChange={() => onToggleSelect?.(model.slug)}
                        aria-label={`${t('compare')}: ${model.name}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className="rank-metal font-display text-xl">{model.rank}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FavoriteButton slug={model.slug} />
                      <Link
                        to={modelPath(model, task)}
                        className="font-medium text-mercury hover:text-cyan"
                      >
                        {model.name}
                      </Link>
                      {isNewRelease(model) && (
                        <span className="rounded-full border border-cyan/40 bg-cyan/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-cyan">
                          {t('newBadge')}
                        </span>
                      )}
                      {model.open_weights && (
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-emerald-200">
                          {t('openBadge')}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-mercury-mute">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: creatorColor(model.model_creator.name) }}
                        aria-hidden
                      />
                      {model.model_creator.name}
                    </div>
                    <BenchmarkMeta result={model.benchmark} compact />
                    <PriceMeta pricing={model.pricing} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-mono text-mercury-dim">
                        {formatScore(model.score, benchmarkDigits(model.benchmark, digits))}
                      </span>
                      <ScoreBar value={model.score} max={maxScore} delay={Math.min(index * 0.02, 0.4)} />
                    </div>
                  </td>
                  {media ? (
                    <td className="px-4 py-3 font-mono text-mercury-dim">
                      {formatMediaPrice(model)}
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-mercury-dim">
                        {formatUsd(model.pricing.price_1m_input_tokens)}
                      </td>
                      <td className="px-4 py-3 font-mono text-mercury-dim">
                        {formatUsd(model.pricing.price_1m_output_tokens)}
                      </td>
                      <td className="px-4 py-3 font-mono text-mercury-dim">
                        {formatUsd(model.pricing.price_1m_blended_3_to_1)}
                      </td>
                      <td className="px-4 py-3 font-mono text-mercury-dim">
                        {formatSpeed(model.median_output_tokens_per_second)}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 font-mono text-cyan">
                    {formatUsd(
                      Number.isFinite(model.requestCost) ? model.requestCost : null,
                      4,
                    )}
                  </td>
                  {showMonthly && (
                    <td className="px-4 py-3 font-mono text-mercury">
                      {formatUsd(
                        Number.isFinite(model.requestCost)
                          ? model.requestCost * monthlyRequests
                          : null,
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono text-mercury-dim">
                    {model.valueScore > 0 ? formatScore(model.valueScore, 2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
