import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
// ── Pages ──────────────────────────────────────────────────────────────────
import AppLayout           from './components/AppLayout'
import Dashboard           from './components/Dashboard'
import CreateProject       from './components/CreateProject'
import ProjectsPage        from './pages/ProjectsPage'
import ProjectDetailPage   from './pages/ProjectDetailPage'
import UserProfilePage     from './pages/UserProfilePage'
import TeamsPage           from './pages/TeamsPage'
import MessagesPage        from './pages/MessagesPage'
import ResourcesPage       from './pages/ResourcesPage'
import NotificationsPage   from './pages/NotificationsPage'
import SettingsPage        from './pages/SettingsPage'
import LandingPage         from './pages/LandingPage'
import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import AuthSuccessPage     from './pages/AuthSuccessPage'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Landing (root) ── */}
            <Route index           element={<LandingPage />} />

            {/* ── Auth routes ── */}
            <Route path="login"    element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="auth/success" element={<AuthSuccessPage />} />

            {/* ── App routes (with sidebar/navbar layout) ── */}
            <Route element={<AppLayout />}>
              <Route path="dashboard"         element={<Dashboard />} />
              <Route path="projects"          element={<ProjectsPage />} />
              <Route path="projects/create"   element={<CreateProject />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="user/:username"    element={<UserProfilePage />} />
              <Route path="teams"             element={<TeamsPage />} />
              <Route path="messages"          element={<MessagesPage />} />
              <Route path="resources"         element={<ResourcesPage />} />
              <Route path="notifications"     element={<NotificationsPage />} />
              <Route path="settings"          element={<SettingsPage />} />
            </Route>

            {/* ── Catch-all → landing ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
