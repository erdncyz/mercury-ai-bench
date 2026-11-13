import { useEffect, useId, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import type { HistoryMetric, HistoryPoint, ModelHistoryResponse } from '../../shared/modelHistory'
import { formatScore, formatUsd } from '../lib/ranking'

const LABELS: Record<string, MessageKey> = {
  intelligence: 'intelligenceIndex', coding: 'codingIndex', engineering: 'engineeringMetric',
  math: 'mathIndex', agents: 'agentsIndex', tau2: 'tau2', tau2Telecom: 'tau2',
  longcontext: 'longContextIndex', aaLcr: 'longContextIndex', instruction: 'instructionIndex',
  elo: 'eloMetric', inputPrice: 'inputPriceHistory', outputPrice: 'outputPriceHistory', speed: 'speed', latency: 'ttft',
}

function formatted(metric: HistoryMetric) {
  if (metric.unit === 'usd') return formatUsd(metric.value, 4)
  return `${formatScore(metric.value, 2)}${metric.unit === 'seconds' ? ' s' : metric.unit === 'tokens/s' ? ' t/s' : ''}`
}

export function ModelHistory({ slug }: { slug: string }) {
  const { t, locale } = useI18n()
  const id = useId()
  const [days, setDays] = useState(30)
  const [metricKey, setMetricKey] = useState('intelligence')
  const [retry, setRetry] = useState(0)
  const requestKey = `${slug}:${days}:${retry}`
  const [result, setResult] = useState<{ requestKey: string; points: HistoryPoint[]; loading: boolean; error: boolean }>({ requestKey: '', points: [], loading: true, error: false })
  const state = result.requestKey === requestKey ? result : { points: [], loading: true, error: false }
  useEffect(() => {
    const controller = new AbortController()
    void fetch(`/api/model-history?${new URLSearchParams({ slug, days: String(days) })}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('history unavailable')
        const data = await res.json() as ModelHistoryResponse
        if (!data.available || !Array.isArray(data.points)) throw new Error('history unavailable')
        if (!controller.signal.aborted) setResult({ requestKey, points: data.points, loading: false, error: false })
      }).catch(() => { if (!controller.signal.aborted) setResult({ requestKey, points: [], loading: false, error: true }) })
    return () => controller.abort()
  }, [slug, days, requestKey])
  const keys = [...new Set(state.points.flatMap((p) => p.metrics.map((m) => m.key)))]
  const selected = keys.includes(metricKey) ? metricKey : keys[0] ?? ''
  const observations = state.points.map((p) => ({ at: p.at, metric: p.metrics.find((m) => m.key === selected) }))
  const values = observations.flatMap((p) => p.metric ? [p.metric.value] : [])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const low = Math.max(0, min === max ? min - Math.max(0.0001, min * 0.1) : min - (max - min) * 0.1)
  const high = min === max ? max + Math.max(0.0001, max * 0.1) : max + (max - min) * 0.1
  const first = Date.parse(observations[0]?.at ?? '')
  const last = Date.parse(observations.at(-1)?.at ?? '')
  const x = (at: string) => first === last ? 350 : 65 + (Date.parse(at) - first) / (last - first) * 590
  const y = (value: number) => 190 - (value - low) / (high - low) * 160
  const date = (at: string) => new Date(at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return (
    <section className="panel mt-8 rounded-2xl p-5" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-display text-2xl text-mercury">{t('historyTitle')}</h2>
      <p className="mt-2 max-w-3xl text-sm text-mercury-mute">{t('historyHint')}</p>
      <div className="mt-5 flex flex-wrap gap-4">
        <label className="text-xs text-mercury-mute">{t('historyPeriod')}
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="ml-2 min-h-11 rounded-lg border border-white/15 bg-ink px-3 text-sm text-mercury">
            {[7, 30, 90, 365].map((d) => <option key={d} value={d}>{d} {t('historyDays')}</option>)}
          </select>
        </label>
        {keys.length > 0 && <label className="text-xs text-mercury-mute">{t('historyMetric')}
          <select value={selected} onChange={(e) => setMetricKey(e.target.value)} className="ml-2 min-h-11 max-w-full rounded-lg border border-white/15 bg-ink px-3 text-sm text-mercury">
            {keys.map((key) => <option key={key} value={key}>{LABELS[key] ? t(LABELS[key]) : key}</option>)}
          </select>
        </label>}
      </div>
      {state.loading ? <p className="py-8 text-mercury-mute" role="status">{t('loading')}</p>
        : state.error ? <div className="py-6 text-sm text-mercury-mute" role="alert">{t('historyError')} <button type="button" onClick={() => setRetry(retry + 1)} className="min-h-11 px-3 text-cyan underline">{t('historyRetry')}</button></div>
        : values.length === 0 ? <p className="py-8 text-sm text-mercury-mute">{t('historyEmpty')}</p>
        : <>
          {values.length === 1 && <p className="mt-5 text-sm text-cyan">{t('historySingle')}</p>}
          <svg viewBox="0 0 700 245" className="mt-4 w-full" role="img" aria-labelledby={`${id}-chart-title`}>
            <title id={`${id}-chart-title`}>{t('historyTitle')} — {LABELS[selected] ? t(LABELS[selected]) : selected}</title>
            {[low, (low + high) / 2, high].map((value, i) => <g key={i}>
              <line x1="65" x2="655" y1={y(value)} y2={y(value)} stroke="currentColor" className="text-white/10" />
              <text x="58" y={y(value) + 4} textAnchor="end" fill="#8fa3c0" fontSize="10">{observations.find((p) => p.metric)?.metric?.unit === 'usd' ? formatUsd(value, 4) : value.toFixed(2)}</text>
            </g>)}
            {observations.map((point, i) => {
              if (!point.metric) return null
              const previous = observations[i - 1]
              const connect = previous?.metric && previous.metric.cohort === point.metric.cohort && Date.parse(point.at) - Date.parse(previous.at) <= 36 * 3600000
              return <g key={point.at}>
                {connect && <line x1={x(previous.at)} y1={y(previous.metric!.value)} x2={x(point.at)} y2={y(point.metric.value)} stroke="#5eead4" strokeWidth="2" />}
                <circle cx={x(point.at)} cy={y(point.metric.value)} r="4" fill="#5eead4"><title>{date(point.at)}: {formatted(point.metric)}</title></circle>
              </g>
            })}
            <text x="65" y="225" fill="#8fa3c0" fontSize="11">{date(observations[0].at)}</text>
            {first !== last && <text x="655" y="225" textAnchor="end" fill="#8fa3c0" fontSize="11">{date(observations.at(-1)!.at)}</text>}
          </svg>
          <details className="text-sm text-mercury-mute"><summary className="min-h-11 cursor-pointer py-2">{t('evaluations')} ({values.length})</summary>
            <div className="max-h-72 overflow-auto"><table className="w-full text-left text-xs">
              <thead><tr><th className="p-2">{t('historyDate')} (UTC)</th><th className="p-2">{t('historyValue')}</th><th className="p-2">{t('historyCohort')}</th></tr></thead>
              <tbody>{observations.filter((p) => p.metric).map((p) => <tr key={p.at} className="border-t border-white/10"><td className="whitespace-nowrap p-2">{date(p.at)}</td><td className="p-2 text-mercury">{formatted(p.metric!)}</td><td className="break-all p-2">{p.metric!.cohort}</td></tr>)}</tbody>
            </table></div>
          </details>
        </>}
      <p className="mt-4 max-w-4xl text-xs leading-relaxed text-mercury-mute">{t('historyMethod')}</p>
    </section>
  )
}
