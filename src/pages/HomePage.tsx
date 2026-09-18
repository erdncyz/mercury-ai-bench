import { ArrowRight } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { BestFpCard } from '../components/BestFpCard'
import { FrontierChart } from '../components/charts/FrontierChart'
import { RankBars } from '../components/charts/RankBars'
import { MagneticLink } from '../components/MagneticLink'
import { MercuryOrb } from '../components/MercuryOrb'
import { PageShell, SkeletonBlock } from '../components/PageShell'
import { PulseTeaser } from '../components/PulseTeaser'
import { StatStrip } from '../components/StatStrip'
import { TaskPicker } from '../components/TaskPicker'
import { TopTeaser } from '../components/TopTeaser'
import { useModels } from '../hooks/useModels'
import { useI18n } from '../i18n/I18nProvider'
import { paretoFrontier } from '../lib/charts'
import { bestValueModels, rankModels } from '../lib/ranking'
import type { TaskId } from '../types/models'

export function HomePage() {
  const { t } = useI18n()
  const { models, data, loading, error } = useModels()
  const [task, setTask] = useState<TaskId>('coding')

  const ranked = useMemo(
    () => rankModels(models, task, 'score'),
    [models, task],
  )
  const bestFp = useMemo(() => bestValueModels(ranked, 3), [ranked])
  const frontier = useMemo(() => paretoFrontier(ranked, task), [ranked, task])
  const creators = useMemo(
    () => new Set(ranked.map((m) => m.model_creator.name)).size,
    [ranked],
  )

  return (
    <PageShell fetchedAt={data?.fetchedAt} source={data?.source} wide>
      <section className="mb-10 grid items-center gap-6 md:grid-cols-[1.15fr_0.85fr] md:gap-8">
        <div className="relative">
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
            <MagneticLink
              to={`/bench?task=${task}`}
              className="inline-flex items-center gap-2 rounded-full bg-mercury px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_32px_-10px_rgba(94,234,212,0.8)] transition hover:bg-cyan"
            >
              {t('openBench')}
              <ArrowRight size={16} weight="bold" />
            </MagneticLink>
            {error && (
              <span className="font-mono text-[11px] text-mercury-mute">{t('error')}</span>
            )}
          </div>
        </div>
        <div className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60 md:h-72 md:w-72 lg:h-80 lg:w-80">
          <MercuryOrb />
        </div>
      </section>

      <section className="mb-8">
        <TaskPicker value={task} onChange={setTask} />
      </section>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
          <SkeletonBlock className="h-80" />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <StatStrip
              models={ranked.length}
              creators={creators}
              frontier={frontier.length}
              live={data?.source === 'live'}
            />
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <FrontierChart models={ranked} task={task} />
            <RankBars models={ranked} task={task} />
          </div>

          <div className="mb-8">
            <BestFpCard models={bestFp} task={task} />
          </div>
          <TopTeaser models={ranked} task={task} />
          <PulseTeaser />
        </>
      )}
    </PageShell>
  )
}
