import { useMemo, useState } from 'react'
import { PageShell, SkeletonBlock } from '../components/PageShell'
import { NewsRow, RepoCard } from '../components/PulseItems'
import { usePulse } from '../hooks/usePulse'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import type { PulsePayload } from '../hooks/usePulse'

type RepoTab = keyof PulsePayload['repos']
const REPO_TABS: { key: RepoTab; label: MessageKey }[] = [
  { key: 'skills', label: 'pulseSkills' },
  { key: 'agents', label: 'pulseAgents' },
  { key: 'mcp', label: 'pulseMcp' },
  { key: 'rising', label: 'pulseRising' },
]

export function PulsePage() {
  const { t } = useI18n()
  const { data, loading, error } = usePulse()
  const [source, setSource] = useState('all')
  const [repoTab, setRepoTab] = useState<RepoTab>('skills')

  const sources = useMemo(() => {
    const set = new Set((data?.news ?? []).map((n) => n.source))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [data])

  const news = useMemo(
    () => (data?.news ?? []).filter((n) => source === 'all' || n.source === source),
    [data, source],
  )

  const repos = data?.repos[repoTab] ?? []

  const chip = (active: boolean) =>
    `rounded-md border px-2.5 py-1.5 text-xs transition ${
      active ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/8 text-mercury-mute hover:text-mercury'
    }`

  return (
    <PageShell fetchedAt={data?.fetchedAt} source={data?.source} wide>
      <header className="mb-8">
        <h1 className="font-display text-4xl text-mercury md:text-5xl">{t('pulseTitle')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-mercury-mute">{t('pulseHint')}</p>
        {error && <p className="mt-2 font-mono text-[11px] text-mercury-mute">{t('pulseError')}</p>}
      </header>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <SkeletonBlock className="h-[32rem]" />
          <SkeletonBlock className="h-[32rem]" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="panel rounded-2xl p-3 md:p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
                <p className="mr-auto font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">
                  {t('pulseNews')}
                </p>
                <button type="button" onClick={() => setSource('all')} className={chip(source === 'all')}>
                  {t('pulseAllSources')}
                </button>
                {sources.map((s) => (
                  <button key={s} type="button" onClick={() => setSource(s)} className={chip(source === s)}>
                    {s}
                  </button>
                ))}
              </div>
              {news.length === 0 ? (
                <p className="p-6 text-center text-sm text-mercury-mute">{t('pulseEmpty')}</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {news.map((item) => (
                    <NewsRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>

            <section className="panel rounded-2xl p-3 md:p-4">
              <p className="mb-3 px-1 font-mono text-[11px] uppercase tracking-[0.22em] text-mercury-mute">
                {t('pulsePapers')}
              </p>
              {(data?.papers.length ?? 0) === 0 ? (
                <p className="p-6 text-center text-sm text-mercury-mute">{t('pulseEmpty')}</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {data!.papers.map((item) => (
                    <NewsRow key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="mr-auto font-display text-2xl text-mercury md:text-3xl">{t('pulseRepos')}</h2>
              {REPO_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRepoTab(tab.key)}
                  className={chip(repoTab === tab.key)}
                >
                  {t(tab.label)}
                </button>
              ))}
            </div>
            {repos.length === 0 ? (
              <p className="panel rounded-2xl p-8 text-center text-sm text-mercury-mute">{t('pulseEmpty')}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {repos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageShell>
  )
}
