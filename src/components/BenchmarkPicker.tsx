import { modelsForTask } from '../lib/ranking'
import { useI18n } from '../i18n/I18nProvider'
import { getBenchmarkOptions, selectBenchmark } from '../lib/benchmarks'
import type { AiModel, SourceStatus, TaskId } from '../types/models'
import { BenchmarkMeta } from './BenchmarkMeta'

export function BenchmarkPicker({ models, task, value, onChange, sources }: {
  models: AiModel[]; task: TaskId; value?: string | null; onChange: (value: string) => void; sources?: SourceStatus[]
}) {
  const { t } = useI18n()
  const options = getBenchmarkOptions(models, task)
  const selected = selectBenchmark(models, task, value)
  const count = models.filter((m) => m.benchmarks?.some((r) => r.id === selected?.id)).length
  const total = modelsForTask(models, task).length
  return <section className="panel mb-5 rounded-2xl p-4">
    <label className="flex flex-col gap-2 text-xs text-mercury-dim sm:flex-row sm:items-center">
      <span className="shrink-0">{t('benchmarkSource')}</span>
      <select
        aria-label={t('benchmarkSource')}
        value={selected?.id ?? ''} onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-mercury"
        disabled={!options.length}
      >
        {!options.length && <option value="">{t('noPerformanceData')}</option>}
        {options.map((option) => <option key={option.id} value={option.id}>
          {option.source} · {option.label} · {option.version ?? `${t('snapshotLabel')} ${option.collectedAt.slice(0, 10)}`}{option.historical ? ` · ${t('historicalData')}` : ''}
        </option>)}
      </select>
    </label>
    <BenchmarkMeta result={selected} cohort />
    <p className="mt-3 text-xs leading-relaxed text-mercury-mute">{t('benchmarkCohortHint')} {count} / {total} {t('coverageModels')}</p>
    {selected?.historical && <p className="mt-2 text-xs leading-relaxed text-gold">{t('historicalWarning')}</p>}
    {sources && <details className="mt-3 text-xs text-mercury-dim">
      <summary className="cursor-pointer py-1">{t('dataSourcesStatus')}</summary>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
        {sources.map((source) => <li key={source.id}>
          <a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-white/20">{source.name}</a>
          {' · '}{t(source.status === 'ok' ? 'sourceAvailable' : source.status === 'stale' ? 'sourceStale' : 'sourceUnavailable')}
          {source.fetchedAt && ` · ${source.fetchedAt.slice(0, 10)}`}
        </li>)}
      </ul>
    </details>}
  </section>
}
