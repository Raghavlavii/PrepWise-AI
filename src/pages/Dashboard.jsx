import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, BookOpen, Flame, TrendingUp, Brain, Zap, ChevronRight, Star, Clock, ArrowUpRight } from 'lucide-react'
import { getProfile, getStreak, getSessions, getWeakAreas, getStats, saveWeakAreas, computeWeakAreas } from '../services/storage.js'
import { getWeekStrip, checkStreakIntegrity } from '../services/streak.js'
import { getRoleById } from '../data/roles.js'
import { getRecommendedPractice } from '../services/gemini.js'

// ─── Week Strip ──────────────────────────────────────────────
function WeekStrip() {
  const days = getWeekStrip()
  return (
    <div className="flex justify-between gap-1 mt-4">
      {days.map((day) => (
        <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all
            ${day.done
              ? 'bg-[var(--brand)] text-[var(--bg-0)] shadow-[0_0_12px_rgba(255,199,0,0.5)]'
              : day.isToday
              ? 'border-2 border-[var(--brand)] text-[var(--brand)]'
              : 'bg-[var(--bg-3)] text-[var(--text-muted)]'
            }`}>
            {day.done ? '✓' : day.label[0]}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">{day.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Streak Card ─────────────────────────────────────────────
function StreakCard({ streak }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { setAnimated(true); setTimeout(() => setAnimated(false), 1000) }, [streak?.current])

  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[28px] p-5 relative overflow-hidden">
      {/* Amber glow blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      <div className="flex items-start justify-between mb-1 relative z-10">
        <div>
          <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-2">Current Streak</p>
          <div className="flex items-center gap-2">
            <motion.div
              animate={animated ? { scale: [1, 1.3, 1], rotate: [-5, 5, -5, 0] } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flame-animate text-4xl select-none"
            >
              🔥
            </motion.div>
            <motion.span
              key={streak?.current}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="font-display font-black text-4xl text-white"
            >
              {streak?.current || 0}
            </motion.span>
            <span className="text-[var(--text-muted)] text-sm mt-2">days</span>
          </div>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {streak?.current > 0 ? `Keep the momentum going!` : 'Complete a session to start your streak'}
          </p>
        </div>
        <div className="text-right bg-[var(--bg-3)] rounded-2xl px-4 py-3">
          <p className="text-[var(--text-muted)] text-xs mb-0.5">Longest</p>
          <p className="font-display font-bold text-2xl text-white">{streak?.longest || 0}</p>
          <p className="text-[var(--text-muted)] text-xs">days</p>
        </div>
      </div>
      <WeekStrip />
    </div>
  )
}

// ─── Recommended Practice Card ───────────────────────────────
function RecommendedCard({ profile, weakAreas }) {
  const navigate = useNavigate()
  const [rec, setRec] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const sessions = getSessions()
    getRecommendedPractice({ role: profile?.role, weakAreas, sessions })
      .then((r) => { if (!cancelled) { setRec(r); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [profile?.role, weakAreas?.length])

  if (loading) return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[28px] p-6">
      <div className="skeleton h-4 w-32 mb-3 rounded" />
      <div className="skeleton h-7 w-3/4 mb-2 rounded" />
      <div className="skeleton h-4 w-full mb-4 rounded" />
      <div className="flex gap-3">
        <div className="skeleton h-11 flex-1 rounded-2xl" />
        <div className="skeleton h-11 flex-1 rounded-2xl" />
      </div>
    </div>
  )

  const defaultRec = rec || {
    title: 'Start Your First Session',
    description: 'Your AI coach will personalise recommendations after your first practice.',
    category: profile?.role === 'SDE' ? 'DSA' : profile?.role === 'PM' ? 'Case Studies' : 'Guesstimates',
    type: 'mock',
    duration: 20,
    reason: 'Because great preparation starts with your first step.',
  }

  return (
    <div className="bg-[var(--bg-0)] border border-[var(--brand)]/30 rounded-[28px] p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--brand)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 bg-[var(--brand)]/10 border border-[var(--brand)]/30 text-[var(--brand)] rounded-full px-3 py-1 text-xs font-semibold">
            <Brain size={12} /> AI Recommended
          </span>
          {defaultRec.duration && (
            <span className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
              <Clock size={12} /> {defaultRec.duration} min
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-xl text-white mb-1">{defaultRec.title}</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-1">{defaultRec.description}</p>
        {defaultRec.reason && (
          <p className="text-[var(--brand)]/60 text-xs italic mb-5">"{defaultRec.reason}"</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/practice', { state: { category: defaultRec.category, type: defaultRec.type } })}
            className="btn-primary flex-1 justify-center py-3"
          >
            <Play size={16} /> Start Drill
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="flex-1 justify-center py-3 inline-flex items-center gap-2 bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-secondary)] rounded-full font-semibold text-sm hover:border-[var(--border-strong)] hover:text-white transition-all"
          >
            <BookOpen size={16} /> Browse All
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Quick Stat Card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[20px] p-4 flex flex-col gap-2 hover:border-[var(--border-strong)] transition-all">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${accent}`}>
        <Icon size={16} />
      </div>
      <p className="font-display font-black text-2xl text-white">{value ?? '—'}</p>
      <p className="text-[var(--text-muted)] text-xs font-medium">{label}</p>
    </div>
  )
}

// ─── Weak Areas ──────────────────────────────────────────────
function WeakAreasList({ areas }) {
  if (!areas?.length) return null
  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[28px] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-[var(--brand)]" />
        <h3 className="font-display font-semibold text-white">Weak Areas to Work On</h3>
      </div>
      <div className="space-y-3">
        {areas.slice(0, 4).map((area, i) => (
          <div key={area.tag} className="flex items-center gap-3">
            <span className="text-[var(--text-muted)] text-sm font-display w-4">{i + 1}</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-[var(--text-primary)] text-sm capitalize">{area.tag}</span>
                <span className="text-[var(--text-muted)] text-xs">{area.count}×</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--brand)] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (area.count / (areas[0]?.count || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recent Sessions ─────────────────────────────────────────
function RecentSessions({ sessions }) {
  const navigate = useNavigate()
  if (!sessions?.length) return null

  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[28px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-white">Recent Sessions</h3>
        <button
          onClick={() => navigate('/progress')}
          className="text-[var(--brand)] text-xs flex items-center gap-1 hover:underline"
        >
          View all <ChevronRight size={14} />
        </button>
      </div>
      <div className="space-y-3">
        {sessions.slice(0, 3).map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-[var(--bg-3)] rounded-2xl">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-display font-bold text-sm shrink-0
              ${s.overallScore >= 8 ? 'bg-emerald-500/20 text-emerald-400' : s.overallScore >= 6 ? 'bg-[var(--brand)]/20 text-[var(--brand)]' : 'bg-red-500/20 text-red-400'}`}>
              {s.overallScore || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-primary)] text-sm font-medium truncate">{s.category}</p>
              <p className="text-[var(--text-muted)] text-xs">{s.difficulty} · {new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex shrink-0">
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={10} className={star <= Math.round((s.overallScore || 0) / 2) ? 'text-[var(--brand)] fill-[var(--brand)]' : 'text-[var(--text-muted)]'} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Page ──────────────────────────────────────────
export default function Dashboard() {
  const profile = getProfile()
  const streak = checkStreakIntegrity()
  const stats = getStats()
  const sessions = getSessions()
  const weakAreas = computeWeakAreas()
  const navigate = useNavigate()

  useEffect(() => {
    const areas = computeWeakAreas()
    saveWeakAreas(areas)
  }, [])

  const role = getRoleById(profile?.role)

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Greeting header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[var(--text-muted)] text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-display font-bold text-2xl text-white mt-0.5">
              Welcome back, {profile?.name} 👋
            </h1>
            {streak.current > 0 && (
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                You're on a <span className="text-[var(--brand)] font-bold">{streak.current}-day streak</span>. Keep the momentum going!
              </p>
            )}
          </div>

          {/* Quick Start CTA */}
          <button
            onClick={() => navigate('/practice')}
            className="shrink-0 ml-4 bg-[var(--brand)] text-[var(--bg-0)] rounded-full w-12 h-12 flex items-center justify-center shadow-[0_4px_12px_rgba(255,199,0,0.4)] hover:scale-105 transition-transform"
          >
            <ArrowUpRight size={20} />
          </button>
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <StreakCard streak={streak} />
      </motion.div>

      {/* Recommended Practice */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <RecommendedCard profile={profile} weakAreas={weakAreas} />
      </motion.div>

      {/* Quick Stats */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="font-display font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider mb-3">Quick Stats</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Sessions" value={stats.totalSessions} icon={Play} accent="bg-[var(--brand)]/15 text-[var(--brand)]" />
            <StatCard label="Avg Score" value={`${stats.avgScore}/10`} icon={TrendingUp} accent="bg-emerald-500/15 text-emerald-400" />
            <StatCard label="Best Score" value={`${stats.bestScore}/10`} icon={Star} accent="bg-violet-500/15 text-violet-400" />
          </div>
        </motion.div>
      )}

      {/* Weak Areas */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <WeakAreasList areas={weakAreas} />
      </motion.div>

      {/* Recent Sessions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <RecentSessions sessions={sessions} />
      </motion.div>

      {/* Empty state */}
      {!sessions.length && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[28px] p-8 text-center"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="font-display font-bold text-white text-lg mb-2">Ready to start?</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-5">
            Complete your first {role?.label} mock interview and unlock your personalised AI coaching.
          </p>
          <button onClick={() => navigate('/practice')} className="btn-primary mx-auto">
            <Play size={16} /> Start First Session
          </button>
        </motion.div>
      )}
    </div>
  )
}
