import { Link } from 'react-router-dom'
import { BestFpCard } from '../components/BestFpCard'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { TaskPicker } from '../components/TaskPicker'
import { TopTeaser } from '../components/TopTeaser'
import { useModels } from '../hooks/useModels'
import { useI18n } from '../i18n/I18nProvider'
import { bestValueModel, rankModels } from '../lib/ranking'
import type { TaskId } from '../types/models'
import { useMemo, useState } from 'react'

export function HomePage() {
  const { t } = useI18n()
  const { models, data, loading, error } = useModels()
  const [task, setTask] = useState<TaskId>('coding')

  const ranked = useMemo(
    () => rankModels(models, task, 'score'),
    [models, task],
  )
  const bestFp = useMemo(() => bestValueModel(ranked), [ranked])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-16 pt-10 md:px-8 md:pt-16">
        <section className="relative mb-14 max-w-3xl reveal">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(215,224,239,0.18),transparent_70%)] blur-2xl"
          />
          <p className="font-display text-5xl leading-none tracking-tight text-mercury md:text-7xl">
            {t('brand')}
          </p>
          <h1 className="mt-6 max-w-xl text-balance text-xl text-mercury-dim md:text-2xl">
            {t('heroHeadline')}
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-mercury-mute md:text-base">
            {t('heroSupport')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={`/bench?task=${task}`}
              className="rounded-full bg-mercury px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-cyan"
            >
              {t('openBench')}
            </Link>
            {error && (
              <span className="font-mono text-[11px] text-mercury-mute">{t('error')}</span>
            )}
          </div>
        </section>

        <section className="mb-8 reveal reveal-delay-1">
          <TaskPicker value={task} onChange={setTask} />
        </section>

        {loading ? (
          <p className="font-mono text-sm text-mercury-mute">{t('loading')}</p>
        ) : (
          <>
            <BestFpCard model={bestFp} task={task} />
            <TopTeaser models={ranked} task={task} />
          </>
        )}
      </main>
      <SiteFooter fetchedAt={data?.fetchedAt} source={data?.source} />
    </div>
  )
}
