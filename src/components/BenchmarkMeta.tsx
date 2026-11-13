import { useI18n } from '../i18n/I18nProvider'
import type { BenchmarkResult, ModelPricing } from '../types/models'

export function BenchmarkMeta({ result, compact = false, cohort = false }: { result?: BenchmarkResult; compact?: boolean; cohort?: boolean }) {
  const { t, locale } = useI18n()
  if (!result) return null
  const unit = result.unit === 'percent' ? '%' : result.unit === 'fraction' ? '0–1' : result.unit === 'elo' ? 'Elo' : result.unit === 'tokens/s' ? 'token/s' : t('indexUnit')
  const date = (value: string) => new Date(value).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', value.length === 7 ? { month: 'long', year: 'numeric' } : undefined)
  return (
    <div className="mt-2 space-y-1 break-words text-[11px] leading-relaxed text-mercury-dim">
      <p className="flex flex-wrap gap-x-2 gap-y-1">
        <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-cyan">{result.source} · {result.label}</a>
        {result.historical && <span className="text-gold">{t('historicalData')}</span>}
      </p>
      {compact && <p>{result.version ?? t('notPublished')} · {t('dataCollected')}: {date(result.collectedAt)}</p>}
      {!compact && <>
        <p>{t('benchmarkVersion')}: {result.version ?? t('notPublished')} · {t('scoreUnit')}: {unit}</p>
        <p>{t('dataCollected')}: {date(result.collectedAt)}{!cohort && <> · {t('evaluationDate')}: {result.evaluatedAt ? date(result.evaluatedAt) : t('notPublished')}</>}</p>
        {!cohort && result.publishedAt && <p>{t('resultPublished')}: {date(result.publishedAt)}</p>}
        {!cohort && result.configuration && <p>{result.configuration}</p>}
      </>}
    </div>
  )
}

export function PriceMeta({ pricing }: { pricing: ModelPricing }) {
  const { t, locale } = useI18n()
  const meta = pricing.provenance
  if (!meta || (pricing.price_unit == null && pricing.price_1m_blended_3_to_1 == null)) return null
  const text = `${meta.estimated ? t('estimatedPrice') : meta.source}${meta.collectedAt ? ` · ${new Date(meta.collectedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB')}` : ` · ${t('priceDateUnknown')}`}`
  return <p className={`mt-1 text-[11px] leading-relaxed ${meta.estimated ? 'text-gold' : 'text-mercury-mute'}`}>
    {meta.url ? <a href={meta.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2">{text}</a> : text}
  </p>
}
