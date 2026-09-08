import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import {
  formatMediaPrice,
  formatScore,
  formatSpeed,
  formatUsd,
} from '../lib/ranking'
import type { RankedModel, TaskId } from '../types/models'

function isMediaTask(task: TaskId) {
  return task === 'image' || task === 'speech'
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
          <Link
            key={model.id}
            to={`/model/${model.slug}?task=${task}`}
            className="panel min-w-[200px] shrink-0 rounded-xl px-4 py-3 transition hover:border-cyan/30"
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
        ))}
      </div>
    </section>
  )
}

export function LeaderboardTable({
  models,
  task,
  shimmerKey,
}: {
  models: RankedModel[]
  task: TaskId
  shimmerKey: string
}) {
  const { t } = useI18n()
  const media = isMediaTask(task)

  if (models.length === 0) {
    return (
      <p className="panel rounded-2xl p-8 text-center text-mercury-mute">
        {t('noResults')}
      </p>
    )
  }

  return (
    <div
      key={shimmerKey}
      className="panel mercury-shimmer overflow-hidden rounded-2xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-line text-[11px] uppercase tracking-[0.16em] text-mercury-mute">
              <th className="px-4 py-3 font-medium">{t('rank')}</th>
              <th className="px-4 py-3 font-medium">{t('model')}</th>
              <th className="px-4 py-3 font-medium">
                {media ? t('eloScore') : t('score')}
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
              <th className="px-4 py-3 font-medium">{t('value')}</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr
                key={model.id}
                className="border-b border-ink-line/70 transition hover:bg-cyan/[0.04]"
              >
                <td className="px-4 py-3">
                  <span className="rank-metal font-display text-xl">{model.rank}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/model/${model.slug}?task=${task}`}
                    className="font-medium text-mercury hover:text-cyan"
                  >
                    {model.name}
                  </Link>
                  <div className="text-xs text-mercury-mute">
                    {model.model_creator.name}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-mercury-dim">
                  {formatScore(model.score, media ? 0 : task === 'agents' ? 2 : 1)}
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
                <td className="px-4 py-3 font-mono text-mercury-dim">
                  {model.valueScore > 0 ? formatScore(model.valueScore, 2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
