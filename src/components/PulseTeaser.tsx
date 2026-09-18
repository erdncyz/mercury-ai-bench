import { ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { NewsRow, RepoCard } from './PulseItems'
import { usePulse } from '../hooks/usePulse'
import { useI18n } from '../i18n/I18nProvider'
import { SkeletonBlock } from './PageShell'

export function PulseTeaser() {
  const { t } = useI18n()
  const { data, loading, error } = usePulse()

  if (!loading && (error || !data)) return null

  const news = data?.news.slice(0, 5) ?? []
  const repos = data?.repos.skills.slice(0, 3) ?? []

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl text-mercury md:text-3xl">{t('pulseTitle')}</h2>
        <Link
          to="/pulse"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan hover:text-mercury"
        >
          {t('pulseSeeAll')}
          <ArrowRight size={14} />
        </Link>
      </div>
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel rounded-2xl p-3">
            <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
              {t('pulseNews')}
            </p>
            <div className="divide-y divide-white/5">
              {news.map((item) => (
                <NewsRow key={item.id} item={item} compact />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="px-1 font-mono text-[11px] uppercase tracking-[0.22em] text-mercury-mute">
              {t('pulseSkills')}
            </p>
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
