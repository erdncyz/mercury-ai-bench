import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useI18n } from '../i18n/I18nProvider'
import { usePromptWorkspace } from '../hooks/PromptWorkspaceProvider'
import { fillTemplate, mergeWorkspace, parseWorkspace, templateFields, type SavedPrompt } from '../lib/promptWorkspace'
import { downloadText } from '../lib/export'

const control = 'min-h-11 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-mercury focus:border-cyan'
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm text-mercury transition hover:border-cyan/50 hover:text-cyan'

function PromptEditor({ initial, onClose }: { initial: SavedPrompt; onClose: () => void }) {
  const { t } = useI18n()
  const { data, commit } = usePromptWorkspace()
  const [prompt, setPrompt] = useState(initial)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const fields = templateFields(prompt.content)
  const preview = fillTemplate(prompt.content, prompt.values)
  return <form onSubmit={(event) => {
    event.preventDefault()
    const cleaned = { ...prompt, title: prompt.title.trim(), values: Object.fromEntries(fields.filter((field) => Object.hasOwn(prompt.values, field)).map((field) => [field, prompt.values[field]])) }
    const next = { ...data, prompts: [...data.prompts.filter((p) => p.id !== prompt.id), cleaned] }
    if (commit(next)) onClose()
  }} className="panel min-w-0 space-y-5 rounded-2xl p-5">
    <label className="block text-sm text-mercury-mute">{t('workspaceTitleLabel')}<input autoFocus required maxLength={250} value={prompt.title} onChange={(e) => setPrompt({ ...prompt, title: e.target.value })} className={`${control} mt-2`} /></label>
    <label className="block text-sm text-mercury-mute">{t('workspaceCollection')}
      <select value={prompt.collectionId ?? ''} onChange={(e) => setPrompt({ ...prompt, collectionId: e.target.value || null })} className={`${control} mt-2`}>
        <option value="">{t('workspaceUnfiled')}</option>{data.collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
    <label className="block text-sm text-mercury-mute">{t('workspaceContentLabel')}
      <textarea required rows={9} maxLength={100000} value={prompt.content} onChange={(e) => { setPrompt({ ...prompt, content: e.target.value }); setCopyState('idle') }} className={`${control} mt-2 font-mono`} />
    </label>
    <p className="text-xs leading-relaxed text-mercury-mute">{t('workspaceTemplateHint')}</p>
    {prompt.truncated && <p className="text-sm text-amber-200">{t('workspaceTruncated')}</p>}
    {prompt.sourceUrl && <a href={prompt.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-cyan underline">{t('promptsOpen')}</a>}
    {fields.length > 0 && <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-3 text-sm text-cyan">{t('workspaceFields')}</legend>
      {fields.map((field) => <label key={field} className="min-w-0 break-words text-sm text-mercury-mute">{field}
        <input maxLength={10000} value={Object.hasOwn(prompt.values, field) ? prompt.values[field] : ''} onChange={(e) => { setPrompt({ ...prompt, values: { ...prompt.values, [field]: e.target.value } }); setCopyState('idle') }} className={`${control} mt-1`} />
      </label>)}
    </fieldset>}
    <div><h2 className="mb-2 text-sm text-cyan">{t('workspacePreview')}</h2><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-ink p-4 text-xs leading-relaxed text-mercury-dim">{preview}</pre></div>
    <div className="flex flex-wrap gap-2">
      <button type="submit" className="min-h-11 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-ink">{t('workspaceSaveChanges')}</button>
      <button type="button" className={button} onClick={async () => { try { await navigator.clipboard.writeText(preview); setCopyState('copied') } catch { setCopyState('error') } }}>{copyState === 'copied' ? t('copied') : t('promptsCopy')}</button>
      <button type="button" className={button} onClick={onClose}>{t('workspaceCancel')}</button>
    </div>
    <p role="status" className="text-sm text-mercury-mute">{copyState === 'error' ? t('workspaceCopyError') : copyState === 'copied' ? t('copied') : ''}</p>
  </form>
}

export function WorkspacePage() {
  const { t } = useI18n()
  const { data, error, commit } = usePromptWorkspace()
  const [collection, setCollection] = useState('all')
  const [collectionName, setCollectionName] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<SavedPrompt | null>(null)
  const [importState, setImportState] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInput = useRef<HTMLInputElement>(null)
  const prompts = data.prompts.filter((p) => (collection === 'all' || (p.collectionId ?? '') === collection)
    && `${p.title} ${p.content}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  return <PageShell wide>
    <header className="mb-7 max-w-3xl"><h1 className="font-display text-4xl text-mercury md:text-5xl">{t('workspaceTitle')}</h1><p className="mt-3 text-sm leading-relaxed text-mercury-mute">{t('workspaceHint')}</p></header>
    {error && <p role="alert" className="mb-5 rounded-lg border border-amber-200/30 p-3 text-sm text-amber-200">{t('workspaceStorageError')}</p>}
    <div className="mb-5 flex flex-wrap gap-2">
      <button type="button" className={button} onClick={() => setSelected({ id: crypto.randomUUID(), title: '', content: '', collectionId: collection !== 'all' && collection !== '' ? collection : null, values: {} })}>{t('workspaceNew')}</button>
      <Link className={button} to="/prompts">{t('workspaceLibrary')}</Link>
      <button type="button" className={button} onClick={() => downloadText('mercury-prompt-workspace.json', JSON.stringify(data, null, 2), 'application/json')}>{t('workspaceExport')}</button>
      <button type="button" className={button} onClick={() => fileInput.current?.click()}>{t('workspaceImport')}</button>
      <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" aria-label={t('workspaceImport')} onChange={async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
          if (file.size > 5 * 1024 * 1024) throw new Error('File too large')
          const incoming = parseWorkspace(JSON.parse(await file.text()))
          const merged = mergeWorkspace(data, incoming)
          if (commit(merged)) setImportState('success')
        } catch { setImportState('error') }
      }} />
    </div>
    {importState !== 'idle' && <p role="status" className="mb-4 text-sm text-cyan">{t(importState === 'success' ? 'workspaceImported' : 'workspaceImportError')}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="panel min-w-0 space-y-4 rounded-2xl p-4">
        <label className="block text-sm text-mercury-mute">{t('workspaceCollection')}
          <select className={`${control} mt-2`} value={collection} onChange={(e) => setCollection(e.target.value)}>
            <option value="all">{t('workspaceAll')}</option><option value="">{t('workspaceUnfiled')}</option>
            {data.collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <form onSubmit={(event) => {
          event.preventDefault()
          const name = collectionName.trim()
          if (!name) return
          const existing = data.collections.find((c) => c.name.toLocaleLowerCase() === name.toLocaleLowerCase())
          if (existing) { setCollection(existing.id); setCollectionName(''); return }
          const id = crypto.randomUUID()
          if (commit({ ...data, collections: [...data.collections, { id, name }] })) { setCollection(id); setCollectionName('') }
        }} className="space-y-2">
          <label className="block text-xs text-mercury-mute">{t('workspaceCollectionName')}<input maxLength={120} required value={collectionName} onChange={(e) => setCollectionName(e.target.value)} className={`${control} mt-2`} /></label>
          <button type="submit" className={`${button} w-full`}>{t('workspaceAddCollection')}</button>
        </form>
        {collection !== 'all' && collection !== '' && <button type="button" className="min-h-11 text-left text-xs text-mercury-mute underline" onClick={() => {
          if (commit({ ...data, collections: data.collections.filter((c) => c.id !== collection), prompts: data.prompts.map((p) => p.collectionId === collection ? { ...p, collectionId: null } : p) })) {
            if (selected?.collectionId === collection) setSelected({ ...selected, collectionId: null })
            setCollection('all')
          }
        }}>{t('workspaceDeleteCollection')}</button>}
        <label className="block text-xs text-mercury-mute">{t('workspaceSearch')}<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className={`${control} mt-2`} /></label>
        <ul className="max-h-[32rem] space-y-2 overflow-auto">
          {prompts.map((p) => <li key={p.id}><button type="button" onClick={() => setSelected(p)} aria-pressed={selected?.id === p.id} className={`w-full break-words rounded-lg border p-3 text-left text-sm ${selected?.id === p.id ? 'border-cyan/40 text-cyan' : 'border-white/10 text-mercury-dim'}`}>{p.title}</button></li>)}
        </ul>
        {data.prompts.length > 0 && prompts.length === 0 && <p className="text-sm text-mercury-mute">{t('workspaceNoMatches')}</p>}
      </aside>
      <div className="min-w-0">
        {selected ? <>
          <PromptEditor key={`${selected.id}-${selected.collectionId}`} initial={selected} onClose={() => setSelected(null)} />
          {data.prompts.some((p) => p.id === selected.id) && <button type="button" className="mt-3 min-h-11 px-3 text-sm text-rose-200" onClick={() => {
            if (window.confirm(t('workspaceConfirmDelete')) && commit({ ...data, prompts: data.prompts.filter((p) => p.id !== selected.id) })) setSelected(null)
          }}>{t('workspaceDelete')}</button>}
        </> : <div className="panel rounded-2xl p-8 text-sm text-mercury-mute">
          <p>{data.prompts.length ? t('workspaceEdit') : t('workspaceEmpty')}</p>
          {prompts.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{prompts.map((p) => <button type="button" key={p.id} onClick={() => setSelected(p)} className="min-w-0 rounded-lg border border-white/10 p-4 text-left hover:border-cyan/40"><span className="block break-words text-mercury">{p.title}</span><span className="mt-2 line-clamp-3 block break-words text-xs">{p.content}</span></button>)}</div>}
        </div>}
      </div>
    </div>
  </PageShell>
}
