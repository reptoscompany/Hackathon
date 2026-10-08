import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { AIAssistantPage, AnalyticsPage, CrimeMapPage, IncidentsPage, PatrolPlanningPage, PredictionPage, ReportsPage, SettingsPage } from './pages/OperationalPages'

export default function App() {
  return <AppShell><Routes><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/crime-map" element={<CrimeMapPage />} /><Route path="/ai-assistant" element={<AIAssistantPage />} /><Route path="/analytics" element={<AnalyticsPage />} /><Route path="/prediction" element={<PredictionPage />} /><Route path="/patrol-planning" element={<PatrolPlanningPage />} /><Route path="/incidents" element={<IncidentsPage />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></AppShell>
}
