import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn, profileExists } from './services/storage.js'
import AppShell from './components/layout/AppShell.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MockInterview from './pages/MockInterview.jsx'
import FeedbackReport from './pages/FeedbackReport.jsx'
import Progress from './pages/Progress.jsx'
import Settings from './pages/Settings.jsx'
import Community from './pages/Community.jsx'

/** Only logged-in users can access this route. */
function RequireAuth({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return children
}

/** Only logged-in users who have completed onboarding can access the main app. */
function RequireProfile({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!profileExists()) return <Navigate to="/onboarding" replace />
  return children
}

/** Auth pages redirect logged-in users who have a profile to the dashboard. */
function RequireGuest({ children }) {
  if (isLoggedIn() && profileExists()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────── */}
        <Route
          path="/"
          element={
            <RequireGuest>
              <Landing />
            </RequireGuest>
          }
        />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireGuest>
              <Signup />
            </RequireGuest>
          }
        />

        {/* ── Onboarding (logged-in, no profile yet) ── */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <div className="bg-[var(--bg-0)] min-h-dvh">
                <Onboarding />
              </div>
            </RequireAuth>
          }
        />

        {/* ── Main app (logged-in + profile) ─────────── */}
        <Route
          path="/dashboard"
          element={
            <RequireProfile>
              <AppShell><Dashboard /></AppShell>
            </RequireProfile>
          }
        />
        <Route
          path="/practice"
          element={
            <RequireProfile>
              <AppShell><MockInterview /></AppShell>
            </RequireProfile>
          }
        />
        <Route
          path="/feedback"
          element={
            <RequireProfile>
              <AppShell><FeedbackReport /></AppShell>
            </RequireProfile>
          }
        />
        <Route
          path="/progress"
          element={
            <RequireProfile>
              <AppShell><Progress /></AppShell>
            </RequireProfile>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireProfile>
              <AppShell><Settings /></AppShell>
            </RequireProfile>
          }
        />
        <Route
          path="/community"
          element={
            <RequireProfile>
              <AppShell><Community /></AppShell>
            </RequireProfile>
          }
        />

        {/* ── Fallback ──────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
