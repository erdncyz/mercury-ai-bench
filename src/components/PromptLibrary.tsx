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
  const [expanded, setExpanded] = useState<string[]>([])
  const groups = LIBRARY_CATEGORIES.filter(c => selected === 'all' || c.id === selected).map(category => ({
    category,
    items: categoryItems(category),
  })).filter(group => group.items.length)
  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="font-display text-3xl text-mercury">{tr ? 'Bir alan seç, üretmeye başla.' : 'Pick a field. Start creating.'}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mercury-dim">{tr ? '12 alanda hazır şablonlar ve otomatik güncellenen topluluk promptları. Kopyala, kendi bilgilerinle uyarla ve kullan.' : 'Ready-to-use templates and automatically updated community prompts across 12 fields. Copy, adapt and create.'}</p></div>
        <span className="shrink-0 text-xs text-mercury-mute">{tr ? 'Kaynak görseli olmayan kartlarda temsili kapak kullanılır.' : 'Cards without a source image use an illustrated cover.'}</span>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {LIBRARY_CATEGORIES.map(category => <button key={category.id} type="button" aria-pressed={selected === category.id} onClick={() => setSelected(selected === category.id ? 'all' : category.id)} className={`overflow-hidden rounded-xl border text-left transition ${selected === category.id ? 'border-cyan bg-cyan/5' : 'border-white/10 hover:border-white/30'}`}>
          <div className="h-20"><PromptCover category={category} /></div>
          <div className="px-3 py-2.5"><span className="block text-xs font-medium text-mercury">{category.label[locale]}</span><span className="mt-1 block text-[11px] text-mercury-mute">{categoryItems(category).length} {tr ? 'prompt' : 'prompts'}</span></div>
        </button>)}
      </div>
      {groups.length === 0 && <div className="panel rounded-xl p-8 text-center text-sm text-mercury-dim">{tr ? 'Bu alanda şablon bulunamadı. Başka bir alan seçebilirsin.' : 'No templates found in this field. Try another field.'}</div>}
      <div className="space-y-12">{groups.map(({ category, items }) => {
        const showAll = selected !== 'all' || expanded.includes(category.id)
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
