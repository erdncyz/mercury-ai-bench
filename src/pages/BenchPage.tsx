import { DownloadSimple, MagnifyingGlass, Scales, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BestPerformanceCard } from '../components/BestPerformanceCard'
import { FrontierChart } from '../components/charts/FrontierChart'
import { RankBars } from '../components/charts/RankBars'
import { DEFAULT_COST } from '../components/CostControls'
import { LeaderboardTable } from '../components/LeaderboardTable'
import { PageShell, SkeletonBlock } from '../components/PageShell'
import { TaskPicker } from '../components/TaskPicker'
import { useModels } from '../hooks/useModels'
import { useI18n } from '../i18n/I18nProvider'
import { downloadText, rankedToCsv } from '../lib/export'
import { chartable } from '../lib/charts'
import { bestValueModels, modelsForTask, rankModels, TASK_IDS } from '../lib/ranking'
import type { SortKey, TaskId } from '../types/models'

const SORT_IDS: SortKey[] = ['score', 'price', 'speed', 'value']
const WEIGHT_FILTERS = ['all', 'open', 'closed'] as const
type WeightFilter = (typeof WEIGHT_FILTERS)[number]
const MAX_COMPARE = 4

function parseTask(value: string | null): TaskId {
  return TASK_IDS.includes(value as TaskId) ? (value as TaskId) : 'coding'
}

function parseSort(value: string | null): SortKey {
  return SORT_IDS.includes(value as SortKey) ? (value as SortKey) : 'score'
}

function parseWeights(value: string | null): WeightFilter {
  return WEIGHT_FILTERS.includes(value as WeightFilter) ? (value as WeightFilter) : 'all'
}

export function BenchPage() {
  const { t } = useI18n()
  const { models, data, loading, notice } = useModels()
  const [params, setParams] = useSearchParams()

  const task = parseTask(params.get('task'))
  const sort = parseSort(params.get('sort'))
  const weights = parseWeights(params.get('weights'))
  const [query, setQuery] = useState('')
  const [creator, setCreator] = useState('all')
  const cost = DEFAULT_COST
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const highlight = sort === 'value' ? 'value' : 'performance'

  const creators = useMemo(() => {
    let pool = modelsForTask(models, task)
    if (weights === 'open') pool = pool.filter((m) => m.open_weights)
    if (weights === 'closed') pool = pool.filter((m) => !m.open_weights)
    const set = new Set(pool.map((m) => m.model_creator.name))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [models, task, weights])

  const ranked = useMemo(() => {
    let list = rankModels(models, task, sort, cost.inputTokens, cost.outputTokens)
    if (weights === 'open') list = list.filter((m) => m.open_weights)
    if (weights === 'closed') list = list.filter((m) => !m.open_weights)
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
  }, [models, task, sort, creator, query, cost, weights])

  const bestFp = useMemo(() => bestValueModels(ranked, ranked.length), [ranked])
  const performanceRanked = useMemo(() => [...ranked].sort((a, b) => b.score - a.score), [ranked])
  const showFrontier = task !== 'presentation' && chartable(ranked, task).length >= 3
  const isMedia = task === 'image' || task === 'speech' || task === 'video' || task === 'presentation'

  const updateParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    mutate(next)
    setParams(next, { replace: true })
  }

  const setTask = (next: TaskId) => {
    setCreator('all')
    setSelected(new Set())
    updateParams((p) => { p.set('task', next); p.delete('benchmark') })
  }

  const setSort = (next: SortKey) => updateParams((p) => p.set('sort', next))

  const toggleSelect = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else if (next.size < MAX_COMPARE) next.add(slug)
      return next
    })
  }

  const exportCsv = () => {
    downloadText(`mercury-${task}-${sort}.csv`, rankedToCsv(ranked))
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

  const control =
    'rounded-lg border border-white/8 bg-ink px-3 py-2 text-sm text-mercury outline-none focus:border-cyan/40'

  return (
    <PageShell fetchedAt={data?.fetchedAt} source={data?.source} wide>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-mercury md:text-5xl">
          {t('navBench')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-mercury-mute">{t('heroSupport')}</p>
        <Link to="/find" className="mt-2 inline-flex min-h-11 items-center text-sm text-cyan underline underline-offset-4">{t('navFinder')}</Link>
        {notice && (
          <p className="mt-2 font-mono text-[11px] text-mercury-mute">{t(notice)}</p>
        )}
      </div>

      <div className="mb-6">
        <TaskPicker value={task} onChange={setTask} compact />
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-96" />
        </div>
      ) : (
        <>
          <div className={`mb-6 grid gap-4 ${showFrontier ? 'lg:grid-cols-[1.2fr_0.8fr]' : ''}`}>
            {showFrontier && <FrontierChart models={ranked} task={task} />}
            <RankBars models={ranked} task={task} />
          </div>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('sortScore')}>
              {(['performance', 'value'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={highlight === option}
                  onClick={() => setSort(option === 'value' ? 'value' : 'score')}
                  className={`rounded-full border px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan ${highlight === option ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/10 text-mercury-mute hover:border-cyan/30 hover:text-mercury'}`}
                >
                  {t(option === 'performance' ? 'bestPerformance' : 'bestFp')}
                </button>
              ))}
            </div>
            <BestPerformanceCard
              key={highlight}
              models={highlight === 'performance' ? performanceRanked : bestFp}
              task={task}
              variant={highlight}
            />
          </div>

          <div className="panel mb-6 mt-6 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <MagnifyingGlass
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mercury-mute"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search')}
                className={`${control} w-full py-2 pl-9 pr-3 placeholder:text-mercury-mute`}
              />
            </label>
            <select value={creator} onChange={(e) => setCreator(e.target.value)} className={control}>
              <option value="all">{t('allCreators')}</option>
              {creators.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={weights}
              onChange={(e) => {
                setCreator('all')
                updateParams((p) => {
                  if (e.target.value === 'all') p.delete('weights')
                  else p.set('weights', e.target.value)
                })
              }}
              className={control}
              aria-label={t('weightsOpen')}
            >
              {WEIGHT_FILTERS.map((id) => (
                <option key={id} value={id}>
                  {id === 'open' ? t('weightsOpen') : id === 'closed' ? t('weightsClosed') : t('weightsAll')}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <span className="font-mono text-[11px] uppercase tracking-wider text-mercury-mute">
                {t('sortBy')}
              </span>
              {SORT_IDS.filter((key) => !(isMedia && key === 'speed')).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
                    sort === key
                      ? 'border-cyan/40 bg-cyan/10 text-cyan'
                      : 'border-white/8 text-mercury-mute hover:text-mercury'
                  }`}
                >
                  {sortLabel(key)}
                </button>
              ))}
              <button
                type="button"
                onClick={exportCsv}
                disabled={ranked.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/8 px-2.5 py-1.5 text-xs text-mercury-mute transition hover:text-mercury disabled:opacity-40"
              >
                <DownloadSimple size={13} />
                {t('exportCsv')}
              </button>
            </div>
          </div>

          <LeaderboardTable
              models={ranked}
              task={task}
              shimmerKey={task}
              selected={selected}
              onToggleSelect={toggleSelect}
              monthlyRequests={cost.monthlyRequests}
          />

          {selected.size > 0 && (
            <div className="compare-dock pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
              <div className="pointer-events-auto panel flex max-w-full flex-wrap justify-center items-center gap-2 rounded-2xl sm:rounded-full border border-cyan/30 px-4 py-2 shadow-[0_0_40px_-12px_rgba(94,234,212,0.7)]">
                <span className="font-mono text-xs text-mercury-mute">
                  {selected.size}/{MAX_COMPARE} {t('compareSelected')}
                </span>
                <Link
                  to={`/compare?task=${task}&m=${[...selected].join(',')}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    selected.size >= 2
                      ? 'bg-mercury text-ink hover:bg-cyan'
                      : 'pointer-events-none bg-white/10 text-mercury-mute'
                  }`}
                  aria-disabled={selected.size < 2}
                >
                  <Scales size={15} weight="bold" />
                  {t('compare')}
                </Link>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="rounded-full p-3 text-mercury-mute hover:text-mercury"
                  aria-label={t('compareClear')}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
