import { createContext, useContext, useState, type ReactNode } from 'react'
import { emptyWorkspace, parseWorkspace, WORKSPACE_KEY, type PromptWorkspace } from '../lib/promptWorkspace'

function initial() {
  try {
    const saved = localStorage.getItem(WORKSPACE_KEY)
    return { data: saved ? parseWorkspace(JSON.parse(saved)) : emptyWorkspace(), error: false }
  } catch {
    return { data: emptyWorkspace(), error: true }
  }
}
interface WorkspaceContext {
  data: PromptWorkspace
  error: boolean
  commit: (next: PromptWorkspace) => boolean
}
const Context = createContext<WorkspaceContext | null>(null)
export function PromptWorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial)
  const commit = (next: PromptWorkspace) => {
    try {
      const valid = parseWorkspace(next)
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(valid))
      setState({ data: valid, error: false })
      return true
    } catch {
      setState((previous) => ({ ...previous, error: true }))
      return false
    }
  }
  return <Context.Provider value={{ ...state, commit }}>{children}</Context.Provider>
}
export function usePromptWorkspace() {
  const context = useContext(Context)
  if (!context) throw new Error('PromptWorkspaceProvider required')
  return context
}
