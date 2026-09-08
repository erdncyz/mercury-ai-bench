import { TASKS } from '../i18n/messages'
import { useI18n } from '../i18n/I18nProvider'
import type { TaskId } from '../types/models'

export function TaskPicker({
  value,
  onChange,
  compact = false,
}: {
  value: TaskId
  onChange: (task: TaskId) => void
  compact?: boolean
}) {
  const { t } = useI18n()

  return (
    <div>
      {!compact && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-mercury-mute">
          {t('chooseTask')}
        </p>
      )}
      <div
        className={`grid gap-2 ${
          compact
            ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
        role="tablist"
        aria-label={t('chooseTask')}
      >
        {TASKS.map((task) => {
          const active = value === task.id
          return (
            <button
              key={task.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(task.id)}
              className={`group rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-cyan/40 bg-cyan/10 shadow-[0_0_0_1px_rgba(94,234,212,0.12)]'
                  : 'border-ink-line bg-ink-elevated/60 hover:border-mercury-mute/40 hover:bg-ink-panel'
              }`}
            >
              <span
                className={`block text-sm font-medium ${
                  active ? 'text-cyan' : 'text-mercury'
                }`}
              >
                {t(task.labelKey)}
              </span>
              {!compact && (
                <span className="mt-1 block text-xs text-mercury-mute group-hover:text-mercury-dim">
                  {t(task.descKey)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
