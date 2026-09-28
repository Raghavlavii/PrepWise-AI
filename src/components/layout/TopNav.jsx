import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Bell } from 'lucide-react'
import { getProfile, getStreak } from '../../services/storage.js'

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const profile = getProfile()
  const streak = getStreak()
  const navigate = useNavigate()

  return (
    <header className="sticky top-4 z-50 bg-[var(--bg-1)] border border-[var(--border)] mx-4 rounded-[32px] px-4 py-3 lg:hidden shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 btn-ghost p-0 hover:bg-transparent">
          <div className="logo-badge bg-[var(--brand)] text-[var(--bg-0)] shadow-none">PW</div>
          <span className="font-display font-bold text-base text-white">PrepWise AI</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Streak badge */}
          {streak?.current > 0 && (
            <div className="flex items-center gap-1 bg-[var(--brand)]/10 border border-[var(--brand)]/30 rounded-full px-3 py-1">
              <span className="text-base">🔥</span>
              <span className="text-[var(--brand)] font-bold text-sm font-display">{streak.current}</span>
            </div>
          )}
          {/* Profile avatar */}
          {profile && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm font-display cursor-pointer" onClick={() => navigate('/settings')}>
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
