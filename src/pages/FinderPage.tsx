import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell, SkeletonBlock } from '../components/PageShell'
import { CostControls, DEFAULT_COST } from '../components/CostControls'
import { PriceMeta } from '../components/PriceMeta'
import { useModels } from '../hooks/useModels'
import { useI18n } from '../i18n/I18nProvider'
import { TASKS } from '../i18n/messages'
import { recommendModels, type RecommendationSettings } from '../lib/recommend'
import { formatScore, formatSpeed, formatUsd, scoreDigits } from '../lib/ranking'
import { modelPath } from '../lib/benchmarks'

export function FinderPage() {
  const { t } = useI18n()
  const { models, data, loading, notice } = useModels()
  const [settings, setSettings] = useState<RecommendationSettings>({
    ...DEFAULT_COST, task: 'coding', budget: 50, priority: 'balanced', openOnly: false,
  })
  const [submitted, setSubmitted] = useState<RecommendationSettings | null>(null)
  const results = submitted ? recommendModels(models, submitted) : []
  const task = TASKS.find((item) => item.id === settings.task)!
  const resultTask = TASKS.find((item) => item.id === submitted?.task)
  const control = 'min-h-11 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-mercury focus:border-cyan'
  return (
    <PageShell fetchedAt={data?.fetchedAt} source={data?.source} wide>
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl text-mercury md:text-5xl">{t('finderTitle')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-mercury-mute">{t('finderHint')}</p>
        {notice && <p className="mt-2 text-sm text-amber-200">{t(notice)}</p>}
      </header>
      <form onSubmit={(event) => { event.preventDefault(); setSubmitted({ ...settings }) }} className="space-y-7">
        <fieldset className="panel rounded-2xl p-5">
          <legend className="px-2 text-lg text-mercury">{t('finderTask')}</legend>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {TASKS.filter((item) => !['image', 'speech', 'video', 'presentation', 'speed'].includes(item.id)).map((item) => (
              <label key={item.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${settings.task === item.id ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-white/10 text-mercury-mute'}`}>
                <input type="radio" name="task" value={item.id} checked={settings.task === item.id} onChange={() => setSettings({ ...settings, task: item.id })} className="accent-cyan" />
                {t(item.labelKey)}
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-mercury-dim">{t(task.descKey)}</p>
          <p className="mt-2 text-xs text-mercury-mute">{t('finderMediaHint')}</p>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-lg text-mercury">{t('finderBudget')}</legend>
          <CostControls value={settings} onChange={(cost) => setSettings({ ...settings, ...cost })} />
          <label className="block max-w-xs text-sm text-mercury-mute">{t('monthlyBudget')}
            <input type="number" min="0" max="1000000000" step="0.01" required value={settings.budget} onChange={(e) => setSettings({ ...settings, budget: Number(e.target.value) })} className={`${control} mt-2`} />
          </label>
        </fieldset>
        <fieldset className="panel rounded-2xl p-5">
          <legend className="px-2 text-lg text-mercury">{t('finderPriority')}</legend>
          <div className="flex flex-wrap gap-3">
            {(['quality', 'balanced', 'speed'] as const).map((priority) => (
              <label key={priority} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 ${settings.priority === priority ? 'border-cyan/50 text-cyan' : 'border-white/10 text-mercury-mute'}`}>
                <input type="radio" name="priority" checked={settings.priority === priority} onChange={() => setSettings({ ...settings, priority })} className="accent-cyan" />
                {t(priority === 'quality' ? 'qualityPriority' : priority === 'speed' ? 'speedPriority' : 'balancedPriority')}
              </label>
            ))}
          </div>
          <label className="mt-4 flex min-h-11 items-center gap-2 text-sm text-mercury-dim">
            <input type="checkbox" checked={settings.openOnly} onChange={(e) => setSettings({ ...settings, openOnly: e.target.checked })} className="accent-cyan" />{t('openOnly')}
          </label>
        </fieldset>
        <button type="submit" disabled={loading} className="min-h-11 rounded-full bg-cyan px-6 py-3 font-medium text-ink disabled:opacity-50">{t('findRecommendations')}</button>
      </form>
      {loading && <SkeletonBlock className="mt-8 h-40" />}
      {submitted && !loading && (
        <section className="mt-10" aria-live="polite">
          <h2 className="font-display text-3xl text-mercury">{t('finderResults')}</h2>
          <p className="mt-2 text-sm text-mercury-mute">{resultTask && t(resultTask.labelKey)} · {formatUsd(submitted.budget)} · {t(submitted.priority === 'quality' ? 'qualityPriority' : submitted.priority === 'speed' ? 'speedPriority' : 'balancedPriority')}</p>
          {!results.length && <p className="panel mt-4 rounded-xl p-6 text-mercury-dim">{t('finderEmpty')}</p>}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {results.map(({ model, monthlyCost }, index) => (
              <article key={model.id} className={`panel rounded-2xl p-5 ${index === 0 ? 'border-cyan/40' : ''}`}>
                <p className="text-sm text-mercury-mute">#{index + 1} · {model.model_creator.name}</p>
                <h3 className="mt-2 break-words text-xl text-mercury">{model.name}</h3>

                <dl className="mt-5 space-y-3 text-sm">
                  {[
                    [t('monthlyEstimate'), formatUsd(monthlyCost)],
                    [t('budgetRemaining'), formatUsd(submitted.budget - monthlyCost)],
                    [resultTask ? t(resultTask.labelKey) : '', formatScore(model.score, scoreDigits(submitted.task))],
                    [t('speed'), formatSpeed(model.median_output_tokens_per_second)],
                  ].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-mercury-mute">{label}</dt><dd className="font-mono text-cyan">{value}</dd></div>)}
                </dl>
                <PriceMeta pricing={model.pricing} />
                <Link to={modelPath(model, submitted.task)} className="mt-5 inline-flex min-h-11 items-center text-sm text-cyan underline underline-offset-4">{t('viewModel')}</Link>
              </article>
            ))}
          </div>
          {results.length > 1 && <Link to={`/compare?${new URLSearchParams({ task: submitted.task, m: results.map((r) => r.model.slug).join(','),  })}`} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-cyan/40 px-5 text-sm text-cyan">{t('compareShortlist')}</Link>}
        </section>
      )}
      <details className="mt-8 text-sm text-mercury-mute"><summary className="cursor-pointer text-mercury-dim">{t('methodology')}</summary><p className="mt-3 max-w-3xl leading-relaxed">{t('finderMethod')}</p></details>
    </PageShell>
  )
}
