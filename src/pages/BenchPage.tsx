import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BestFpCard } from '../components/BestFpCard'
import { CostCalculator } from '../components/CostCalculator'
import { LeaderboardTable, ValueStrip } from '../components/LeaderboardTable'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { TaskPicker } from '../components/TaskPicker'
import { useModels } from '../hooks/useModels'
import { useI18n } from '../i18n/I18nProvider'
import { bestValueModel, COST_SCENARIOS, rankModels, TASK_IDS } from '../lib/ranking'
import type { SortKey, TaskId } from '../types/models'

const SORT_IDS: SortKey[] = ['score', 'price', 'speed', 'value']

function parseTask(value: string | null): TaskId {
  return TASK_IDS.includes(value as TaskId) ? (value as TaskId) : 'coding'
}

function parseSort(value: string | null): SortKey {
  return SORT_IDS.includes(value as SortKey) ? (value as SortKey) : 'score'
}

export function BenchPage() {
  const { t } = useI18n()
  const { models, data, loading, error } = useModels()
  const [params, setParams] = useSearchParams()

  const task = parseTask(params.get('task'))
  const sort = parseSort(params.get('sort'))
  const [query, setQuery] = useState('')
  const [creator, setCreator] = useState('all')
  const [scenarioId, setScenarioId] = useState('code')
  const [inputTokens, setInputTokens] = useState(COST_SCENARIOS[1].inputTokens)
  const [outputTokens, setOutputTokens] = useState(COST_SCENARIOS[1].outputTokens)

  const creators = useMemo(() => {
    const pool =
      task === 'image'
        ? models.filter((m) => m.kind === 'image')
        : task === 'speech'
          ? models.filter((m) => m.kind === 'speech')
          : models.filter((m) => m.kind === 'language')
    const set = new Set(pool.map((m) => m.model_creator.name))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [models, task])

  const ranked = useMemo(() => {
    let list = rankModels(models, task, sort, inputTokens, outputTokens)
    if (creator !== 'all') {
      list = list.filter((m) => m.model_creator.name === creator)
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.model_creator.name.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q),
      )
    }
    return list
  }, [models, task, sort, inputTokens, outputTokens, creator, query])

  const bestFp = useMemo(() => bestValueModel(ranked), [ranked])
  const isMedia = task === 'image' || task === 'speech'

  const setTask = (next: TaskId) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('task', next)
    setCreator('all')
    setParams(nextParams, { replace: true })
  }

  const setSort = (next: SortKey) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('sort', next)
    setParams(nextParams, { replace: true })
  }

  const sortLabel = (key: SortKey) => {
    switch (key) {
      case 'price':
        return t('sortPrice')
      case 'speed':
        return t('sortSpeed')
      case 'value':
        return t('sortValue')
      default:
        return t('sortScore')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-8 md:px-8">
        <div className="mb-8 reveal">
          <h1 className="font-display text-4xl text-mercury md:text-5xl">
            {t('navBench')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-mercury-mute">{t('heroSupport')}</p>
          {error && (
            <p className="mt-2 font-mono text-[11px] text-mercury-mute">{t('error')}</p>
          )}
        </div>

        <div className="mb-6 reveal reveal-delay-1">
          <TaskPicker value={task} onChange={setTask} compact />
        </div>

        {!loading && <BestFpCard model={bestFp} task={task} />}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_280px] reveal reveal-delay-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded-lg border border-ink-line bg-ink-elevated px-3 py-2 text-sm text-mercury outline-none placeholder:text-mercury-mute focus:border-cyan/40 sm:max-w-xs"
            />
            <select
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              className="rounded-lg border border-ink-line bg-ink-elevated px-3 py-2 text-sm text-mercury outline-none focus:border-cyan/40"
            >
              <option value="all">{t('allCreators')}</option>
              {creators.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-mercury-mute">
                {t('sortBy')}
              </span>
              {SORT_IDS.filter((key) => !(isMedia && key === 'speed')).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition ${
                    sort === key
                      ? 'border-cyan/40 bg-cyan/10 text-cyan'
                      : 'border-ink-line text-mercury-mute hover:text-mercury'
                  }`}
                >
                  {sortLabel(key)}
                </button>
              ))}
            </div>
          </div>
          {!isMedia && (
            <CostCalculator
              inputTokens={inputTokens}
              outputTokens={outputTokens}
              scenarioId={scenarioId}
              onScenario={setScenarioId}
              onChange={(input, output) => {
                setInputTokens(input)
                setOutputTokens(output)
              }}
            />
          )}
        </div>

        {loading ? (
          <p className="font-mono text-sm text-mercury-mute">{t('loading')}</p>
        ) : (
          <>
            <ValueStrip models={ranked} task={task} />
            <LeaderboardTable models={ranked} task={task} shimmerKey={task} />
          </>
        )}
      </main>
      <SiteFooter fetchedAt={data?.fetchedAt} source={data?.source} />
    </div>
  )
}
