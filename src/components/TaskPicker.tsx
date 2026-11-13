import {
  Brain,
  Eye,
  Code,
  ImageSquare,
  Lightning,
  ListChecks,
  MathOperations,
  Robot,
  TextAlignLeft,
  Waveform,
  VideoCamera,
  PresentationChart,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { TASKS } from '../i18n/messages'
import { useI18n } from '../i18n/I18nProvider'
import type { TaskId } from '../types/models'
import type { Icon } from '@phosphor-icons/react'

const TASK_ICONS: Record<TaskId, Icon> = {
  coding: Code,
  agents: Robot,
  vision: Eye,
  math: MathOperations,
  intelligence: Brain,
  longcontext: TextAlignLeft,
  instruction: ListChecks,
  image: ImageSquare,
  video: VideoCamera,
  presentation: PresentationChart,
  speech: Waveform,
  speed: Lightning,
}

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
            ? 'grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 xl:grid-cols-6'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}
        role="tablist"
        aria-label={t('chooseTask')}
      >
        {TASKS.map((task) => {
          const active = value === task.id
          const Icon = TASK_ICONS[task.id]
          return (
            <button
              key={task.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(task.id)}
              className={`group relative min-w-0 overflow-hidden rounded-xl border px-3 py-3 sm:px-4 text-left transition duration-200 ${
                active
                  ? 'border-cyan/40 bg-cyan/10 shadow-[0_0_24px_-12px_rgba(94,234,212,0.8)]'
                  : 'border-white/8 bg-ink-elevated/50 hover:border-mercury-mute/40 hover:bg-ink-panel'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="task-active"
                  className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex min-w-0 items-start gap-2">
                <Icon
                  size={18}
                  weight={active ? 'duotone' : 'regular'}
                  className={`shrink-0 ${active ? 'text-cyan' : 'text-mercury-mute'}`}
                />
                <span className="min-w-0 [overflow-wrap:anywhere]">
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
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
