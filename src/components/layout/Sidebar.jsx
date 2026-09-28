import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, BarChart2, Settings, Users, LogOut } from 'lucide-react'
import { getProfile, logoutUser } from '../../services/storage.js'

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/practice', icon: Dumbbell, label: 'Practice' },
  { to: '/progress', icon: BarChart2, label: 'Progress' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/settings', icon: Settings, label: 'Profile' },
]

export default function Sidebar() {
  const profile = getProfile()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/', { replace: true })
  }

  return (
    <aside className="sidebar hidden lg:flex bg-transparent border-none">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-4 mt-4">
        <div className="logo-badge bg-[var(--brand)] text-[var(--bg-0)] shadow-none">PW</div>
        <div>
          <div className="font-display font-bold text-base leading-tight text-white">PrepWise AI</div>
          <div className="text-xs text-[var(--brand)] font-medium">Interview Coach</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 mx-2 rounded-2xl font-medium transition-all ${isActive ? 'bg-[var(--bg-2)] text-[var(--brand)]' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--glass-bg)]'}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile footer */}
      {profile && (
        <div className="mt-auto pt-4 border-t border-[var(--border)] px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm font-display">
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)] font-display">{profile.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{profile.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 mx-2 mt-2 rounded-2xl font-medium text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
      >
        <LogOut size={18} />
        <span>Log out</span>
      </button>
    </aside>
  )
}
