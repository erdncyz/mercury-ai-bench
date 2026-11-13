import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PwaProvider } from './components/PwaProvider'
import { I18nProvider } from './i18n/I18nProvider'
import { BenchPage } from './pages/BenchPage'
import { ComparePage } from './pages/ComparePage'
import { HomePage } from './pages/HomePage'
import { McpPage } from './pages/McpPage'
import { ModelPage } from './pages/ModelPage'
import { NewsPage } from './pages/NewsPage'
import { PromptsPage } from './pages/PromptsPage'
import { SkillsPage } from './pages/SkillsPage'
import { FinderPage } from './pages/FinderPage'
import { WorkspacePage } from './pages/WorkspacePage'
import { PromptWorkspaceProvider } from './hooks/PromptWorkspaceProvider'

export default function App() {
  return (
    <I18nProvider>
      <PwaProvider>
      <PromptWorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bench" element={<BenchPage />} />
          <Route path="/find" element={<FinderPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/mcp" element={<McpPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/pulse" element={<Navigate to="/news" replace />} />
            <Route path="/model/:slug" element={<ModelPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PromptWorkspaceProvider>
      </PwaProvider>
    </I18nProvider>
  )
}
