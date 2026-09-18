import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nProvider'
import { BenchPage } from './pages/BenchPage'
import { ComparePage } from './pages/ComparePage'
import { HomePage } from './pages/HomePage'
import { ModelPage } from './pages/ModelPage'

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bench" element={<BenchPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/model/:slug" element={<ModelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}
