import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, BarChart2, Settings, Users } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/practice', icon: Dumbbell, label: 'Practice' },
  { to: '/progress', icon: BarChart2, label: 'Progress' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/settings', icon: Settings, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav lg:hidden">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
