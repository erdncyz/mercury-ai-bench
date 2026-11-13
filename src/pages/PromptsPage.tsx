import { MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell, SkeletonBlock } from '../components/PageShell'
import { PromptCard } from '../components/PromptCard'
import { PromptLibrary } from '../components/PromptLibrary'
import { PromptCover } from '../components/PromptCover'
import { LIBRARY_CATEGORIES } from '../data/promptLibrary'
import { classifyLibraryPrompt } from '../../shared/promptLibrary'
import { PROMPT_GROUPS, PROMPT_SECTIONS, usePrompts, type PromptSort } from '../hooks/usePrompts'
import { useI18n } from '../i18n/I18nProvider'

function parseSection(value: string | null) {
  return PROMPT_SECTIONS.some((s) => s.id === value) ? (value as string) : 'all'
}

export function PromptsPage() {
  const { locale } = useI18n()
  const [params, setParams] = useSearchParams()
  const live = params.get('view') === 'live' || (!!params.get('section') && params.get('view') !== 'library')
  const switcher = <div className="mb-6 flex justify-center">
      <nav aria-label={locale === 'tr' ? 'Prompt koleksiyonları' : 'Prompt collections'} className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ink-panel p-1">
        {(['library', 'live'] as const).map(view => <button key={view} type="button" aria-pressed={live === (view === 'live')} onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('view', view); return next }, { replace: true })} className={`rounded-lg px-4 py-2 text-sm ${live === (view === 'live') ? 'bg-cyan/10 text-cyan' : 'text-mercury-mute hover:text-mercury'}`}>
          {view === 'library' ? (locale === 'tr' ? 'Görsel kütüphane' : 'Visual library') : (locale === 'tr' ? 'Topluluk promptları' : 'Community prompts')}
        </button>)}
      </nav>
    </div>
  return live ? <LivePromptsPage switcher={switcher} /> : <PageShell wide>{switcher}<header className="mb-8"><h1 className="font-display text-4xl text-mercury md:text-5xl">Prompts</h1></header><PromptLibrary /></PageShell>
}

function LivePromptsPage({ switcher }: { switcher: ReactNode }) {
  const { t, locale } = useI18n()
  const [params, setParams] = useSearchParams()
  const section = parseSection(params.get('section'))
  const sort: PromptSort = params.get('sort') === 'top' ? 'top' : 'new'
  const q = params.get('q') ?? ''
  const [draft, setDraft] = useState(q)
  const { items, total, hasMore, fetchedAt, source, searchedAs, loading, loadingMore, error, loadMore } = usePrompts(
    section,
    sort,
    q,
    locale,
  )

  const update = (patch: Record<string, string | null>) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (value) p.set(key, value)
          else p.delete(key)
        }
        return p
      },
      { replace: true },
    )
  }

  useEffect(() => setDraft(q), [q])

  useEffect(() => {
    const next = draft.trim()
    if (next === q) return
    const id = window.setTimeout(() => update({ q: next || null }), 350)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const activeSection = PROMPT_SECTIONS.find((s) => s.id === section)
  const groupCover = (group: string) => LIBRARY_CATEGORIES.find(category => category.id === ({
    featured: 'illustration', software: 'software', architecture: 'architecture',
    design: 'ux', editing: 'photography', business: 'business', knowledge: 'writing',
  }[group] ?? 'illustration'))!


  return (
    <PageShell fetchedAt={fetchedAt} source={source} wide>
      {switcher}
      <header className="mb-8">
        <h1 className="font-display text-4xl text-mercury md:text-5xl">{t('navPrompts')}</h1>
      </header>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl text-mercury">{locale === 'tr' ? 'Bir alan seç, ilham bul.' : 'Pick a field. Find inspiration.'}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mercury-dim">{t('promptsHint')}</p>
        </div>
        <span className="shrink-0 text-xs text-mercury-mute">{locale === 'tr' ? 'Kaynak görseli olmayan kartlarda temsili kapak kullanılır.' : 'Cards without a source image use an illustrated cover.'}</span>
      </div>
      <div className="mb-6">
        <a
          href="https://prompts.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-[11px] text-mercury-mute hover:text-cyan"
        >
          {t('promptsSource')}
        </a>
        {error && <p className="mt-2 font-mono text-[11px] text-mercury-mute">{t('pulseError')}</p>}
      </div>

      <nav className="mb-6" aria-label={t('navPrompts')}>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {PROMPT_GROUPS.map(group => (
            <button key={group.id} type="button"
              aria-pressed={activeSection?.group === group.id}
              onClick={() => update({ section: PROMPT_SECTIONS.find(item => item.group === group.id)?.id ?? null })}
              className={`overflow-hidden rounded-xl border text-left transition ${activeSection?.group === group.id ? 'border-cyan bg-cyan/5' : 'border-white/10 hover:border-white/30'}`}
            >
              <div className="h-20"><PromptCover category={groupCover(group.id)} /></div>
              <div className="px-3 py-2.5"><span className="block text-xs font-medium text-mercury">{group.label[locale]}</span></div>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SECTIONS.filter(item => item.group === activeSection?.group).map(item => (
            <button key={item.id} type="button"
              onClick={() => update({ section: item.id === 'all' ? null : item.id })}
              aria-pressed={section === item.id}
              className={`rounded-lg border px-3 py-2 text-sm transition ${section === item.id ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/10 text-mercury-mute hover:border-white/30 hover:text-mercury'}`}
            >{item.label[locale]}</button>
          ))}
        </div>
      </nav>

      {(section === 'architect' || section.startsWith('arch-')) && (
        <p className="mb-5 rounded-xl border border-cyan/20 bg-cyan/[0.05] px-4 py-3 text-sm text-mercury-dim">
          {t('promptsArchitectHint')}
        </p>
      )}
      {activeSection?.group === 'editing' && (
        <p className="mb-5 rounded-xl border border-cyan/20 bg-cyan/[0.05] px-4 py-3 text-sm text-mercury-dim">
          {t('promptsImageEditHint')}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative w-full min-w-0 basis-full sm:flex-1 sm:basis-auto sm:max-w-sm">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mercury-mute"
          />
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('searchPrompts')}
            className="w-full rounded-lg border border-white/8 bg-ink py-2 pl-9 pr-3 text-sm text-mercury outline-none placeholder:text-mercury-mute focus:border-cyan/40"
          />
        </label>
        <div className="flex overflow-hidden rounded-md border border-white/10">
          {(['new', 'top'] as PromptSort[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ sort: value === 'new' ? null : value })}
              aria-pressed={sort === value}
              className={`px-3 py-1.5 text-xs transition ${
                sort === value ? 'bg-cyan/15 text-cyan' : 'text-mercury-mute hover:text-mercury'
              }`}
            >
              {value === 'new' ? t('promptsSortNew') : t('promptsSortTop')}
            </button>
          ))}
        </div>
        {!loading && (
          <span className="font-mono text-[11px] text-mercury-mute">
            {activeSection?.label[locale]} · {items.length} / {total} {t('promptsResults')}
            {searchedAs && (
              <>
                {' '}
                · {t('promptsSearchedAs')} “{searchedAs}”
              </>
            )}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-96" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="panel rounded-2xl p-8 text-center text-sm text-mercury-mute">{t('pulseEmpty')}</p>
      ) : (
        <>
          <section aria-labelledby="community-results">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
              <h3 id="community-results" className="text-xl font-medium" style={{ color: groupCover(activeSection?.group ?? 'featured').color }}>{activeSection?.label[locale]}</h3>
              <span className="text-xs text-mercury-mute">{total} {t('promptsResults')}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((prompt, index) => {
                const categoryId = prompt.libraryCategory ?? classifyLibraryPrompt(prompt.original ? { ...prompt, ...prompt.original } : prompt)
                const category = LIBRARY_CATEGORIES.find(item => item.id === categoryId) ?? groupCover(activeSection?.group ?? 'featured')
                return <PromptCard key={prompt.id} prompt={prompt} cover={<PromptCover category={category} variant={index} />} />
              })}
            </div>
          </section>
          {hasMore && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mercury-mute transition hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
              >
                {loadingMore ? '…' : t('showMore')}
              </button>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
