import { useLocation, NavLink } from 'react-router-dom'
import { Home, Dumbbell, BarChart2, Settings, Users } from 'lucide-react'
import TopNav from './TopNav.jsx'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'

export default function AppShell({ children }) {
  return (
    <div className="bg-[var(--bg-0)] min-h-dvh flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-dvh lg:pl-[240px] p-2 lg:p-4 transition-all max-w-[100vw]">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-1)] rounded-[32px] lg:rounded-[40px] border border-[var(--border)] relative z-10 p-4 lg:p-8 mt-2 lg:mt-0 mb-[70px] lg:mb-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
