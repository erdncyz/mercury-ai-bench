import { MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell, SkeletonBlock } from '../components/PageShell'
import { PromptCard } from '../components/PromptCard'
import { PROMPT_GROUPS, PROMPT_SECTIONS, usePrompts, type PromptSort } from '../hooks/usePrompts'
import { useI18n } from '../i18n/I18nProvider'

function parseSection(value: string | null) {
  return PROMPT_SECTIONS.some((s) => s.id === value) ? (value as string) : 'all'
}

export function PromptsPage() {
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

  return (
    <PageShell fetchedAt={fetchedAt} source={source} wide>
      <header className="mb-6">
        <h1 className="font-display text-4xl text-mercury md:text-5xl">{t('navPrompts')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-mercury-mute">{t('promptsHint')}</p>
        <a
          href="https://prompts.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-[11px] text-mercury-mute hover:text-cyan"
        >
          {t('promptsSource')}
        </a>
        {error && <p className="mt-2 font-mono text-[11px] text-mercury-mute">{t('pulseError')}</p>}
      </header>

      <nav className="panel mb-5 space-y-3 rounded-2xl p-4" aria-label={t('navPrompts')}>
        {PROMPT_GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
            <p className="shrink-0 pt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mercury-mute md:w-40">
              {group.label[locale]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SECTIONS.filter((s) => s.group === group.id).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update({ section: item.id === 'all' ? null : item.id })}
                  aria-pressed={section === item.id}
                  className={`rounded-md border px-2.5 py-1.5 text-sm transition ${
                    section === item.id
                      ? 'border-cyan/40 bg-cyan/10 text-cyan'
                      : 'border-white/8 text-mercury-mute hover:text-mercury'
                  }`}
                >
                  {item.label[locale]}
                </button>
              ))}
            </div>
          </div>
        ))}
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
        <label className="relative min-w-0 flex-1 sm:max-w-sm">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-56" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="panel rounded-2xl p-8 text-center text-sm text-mercury-mute">{t('pulseEmpty')}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
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
