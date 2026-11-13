import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLibraryPrompts } from '../hooks/useLibraryPrompts'
import { LIBRARY_CATEGORIES, libraryItems } from '../data/promptLibrary'
import { useI18n } from '../i18n/I18nProvider'
import { PromptCard } from './PromptCard'
import { PromptCover } from './PromptCover'

export function PromptLibrary() {
  const { locale } = useI18n()
  const tr = locale === 'tr'
  const live = useLibraryPrompts(locale)
  const categoryItems = (category: typeof LIBRARY_CATEGORIES[number]) => [
    ...live.items.filter(item => item.libraryCategory === category.id),
    ...libraryItems(category, locale),
  ]
  const [selected, setSelected] = useState('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])
  const needle = query.trim().toLocaleLowerCase(locale)
  const groups = LIBRARY_CATEGORIES.filter(c => selected === 'all' || c.id === selected).map(category => ({
    category,
    items: categoryItems(category).filter(item => !needle || [item.title, item.description ?? '', item.content, item.original?.title ?? '', ...item.tags, ...Object.values(category.label)].join(' ').toLocaleLowerCase(locale).includes(needle)),
  })).filter(group => group.items.length)
  const total = groups.reduce((sum, g) => sum + g.items.length, 0)
  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="font-display text-3xl text-mercury">{tr ? 'Bir alan seç, üretmeye başla.' : 'Pick a field. Start creating.'}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mercury-dim">{tr ? '12 alanda hazır şablonlar ve otomatik güncellenen topluluk promptları. Kopyala, kendi bilgilerinle uyarla ve kullan.' : 'Ready-to-use templates and automatically updated community prompts across 12 fields. Copy, adapt and create.'}</p></div>
        <span className="shrink-0 text-xs text-mercury-mute">{tr ? 'Kaynak görseli olmayan kartlarda temsili kapak kullanılır.' : 'Cards without a source image use an illustrated cover.'}</span>
      </div>
      <div className="mb-6 rounded-xl border border-white/10 bg-ink-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-mercury-dim">{live.error
            ? (tr ? 'Canlı kaynağa ulaşılamadı. Hazır şablonlar ve varsa son alınan promptlar gösteriliyor.' : 'Live source unavailable. Showing templates and any previously loaded prompts.')
            : live.loading
              ? (tr ? 'Yeni promptlar kontrol ediliyor… Hazır şablonları kullanabilirsin.' : 'Checking for new prompts… You can use the ready-to-use templates.')
              : (tr ? `72 hazır şablon + ${live.items.length} topluluk promptu. Açıkken 10 dakikada bir kontrol edilir.` : `72 templates + ${live.items.length} community prompts. Checked every 10 minutes while open.`)}</p>
          <button type="button" onClick={live.refresh} disabled={live.loading} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-cyan disabled:opacity-50">{tr ? 'Yeniden kontrol et' : 'Check again'}</button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-mercury-mute">
          <a href="https://prompts.chat" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">prompts.chat</a>
          {' · '}{tr ? 'Son 300 kayıttan kategorilere eşleşenler; en yeniler önce. Başlık ve etiketlere göre otomatik sınıflandırılır.' : 'Category matches from the latest 300 entries, newest first. Automatically classified by title and tags.'}
          {live.fetchedAt && <> {tr ? 'Son başarılı güncelleme: ' : 'Last successful update: '}{new Date(live.fetchedAt).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}</>}
        </p>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {LIBRARY_CATEGORIES.map(category => <button key={category.id} type="button" aria-pressed={selected === category.id} onClick={() => setSelected(selected === category.id ? 'all' : category.id)} className={`overflow-hidden rounded-xl border text-left transition ${selected === category.id ? 'border-cyan bg-cyan/5' : 'border-white/10 hover:border-white/30'}`}>
          <div className="h-20"><PromptCover category={category} /></div>
          <div className="px-3 py-2.5"><span className="block text-xs font-medium text-mercury">{category.label[locale]}</span><span className="mt-1 block text-[11px] text-mercury-mute">{categoryItems(category).length} {tr ? 'prompt' : 'prompts'}</span></div>
        </button>)}
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <label className="relative w-full sm:max-w-md"><span className="sr-only">{tr ? 'Kütüphanede ara' : 'Search library'}</span><MagnifyingGlass size={18} aria-hidden="true" className="absolute left-3 top-3 text-mercury-mute" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={tr ? 'Portre, logo, öğrenme planı…' : 'Portrait, logo, learning plan…'} className="w-full rounded-lg border border-white/15 bg-ink-panel py-2.5 pl-10 pr-3 text-sm focus:border-cyan" /></label>
        <button type="button" aria-pressed={selected === 'all'} onClick={() => setSelected('all')} className={`rounded-lg border px-3 py-2 text-xs ${selected === 'all' ? 'border-cyan/40 text-cyan' : 'border-white/15 text-mercury-dim'}`}>{tr ? 'Tüm alanlar' : 'All fields'}</button>
        <span aria-live="polite" className="text-xs text-mercury-mute">{total} {tr ? 'şablon' : 'templates'}</span>
        {(selected !== 'all' || query) && <button type="button" onClick={() => { setSelected('all'); setQuery('') }} className="inline-flex items-center gap-1 text-xs text-mercury-dim"><X size={12} />{tr ? 'Filtreleri temizle' : 'Clear filters'}</button>}
      </div>
      {groups.length === 0 && <div className="panel rounded-xl p-8 text-center text-sm text-mercury-dim">{tr ? 'Bu aramada şablon bulunamadı. Başka bir kelime deneyebilir veya filtreleri temizleyebilirsin.' : 'No templates found. Try another word or clear the filters.'}</div>}
      <div className="space-y-12">{groups.map(({ category, items }) => {
        const showAll = selected !== 'all' || !!needle || expanded.includes(category.id)
        return <section key={category.id} aria-labelledby={`library-${category.id}`}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div><h3 id={`library-${category.id}`} className="text-xl font-medium" style={{ color: category.color }}>{category.label[locale]}</h3><p className="mt-1 text-sm text-mercury-mute">{category.description[locale]}</p></div>
            <span className="text-xs text-mercury-mute">{items.length} {tr ? 'şablon' : 'templates'}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.slice(0, showAll ? undefined : 3).map((prompt, index) => <PromptCard key={prompt.id} prompt={prompt} cover={<PromptCover category={category} variant={index} />} />)}</div>
          {!showAll && items.length > 3 && <button type="button" onClick={() => setExpanded(prev => [...prev, category.id])} className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-mercury-dim hover:border-cyan/40 hover:text-cyan">{tr ? `${category.label.tr}: tüm ${items.length} şablonu göster` : `Show all ${items.length} ${category.label.en.toLowerCase()} templates`}</button>}
        </section>
      })}</div>
    </div>
  )
}
