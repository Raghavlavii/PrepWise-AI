import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Trophy, TrendingUp, Target, Award, Calendar, Activity } from 'lucide-react'
import { getSessions, getBadges, getStats } from '../services/storage.js'
import { BADGES } from '../data/badges.js'

export default function Progress() {
  const sessions = getSessions()
  const stats = getStats()
  const unlockedBadges = getBadges() || {}
  const [activeTab, setActiveTab] = useState('overview') // overview, badges, history

  // Chart Data preparation
  const chartData = useMemo(() => {
    if (!sessions.length) return []
    // Get last 14 sessions reversed (chronological)
    return sessions.slice(0, 14).reverse().map((s, i) => ({
      name: `S${i+1}`,
      score: s.overallScore || 0,
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }))
  }, [sessions])

  const radarData = useMemo(() => {
    if (!stats?.categoryScores?.length) return []
    return stats.categoryScores.map(c => ({
      subject: c.category,
      A: c.avgScore,
      fullMark: 10
    }))
  }, [stats])

  if (!sessions.length) {
    return (
      <div className="px-4 py-12 max-w-2xl mx-auto text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Activity size={48} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">No data yet</h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md">Complete some mock interviews to unlock your progress dashboard, skill radar, and performance trends.</p>
        <button onClick={() => window.location.href = '/practice'} className="btn-primary">Start Practicing</button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-white mb-6">Your Progress</h1>
      
      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl w-full max-w-md mb-8">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'badges', label: 'Badges', icon: Trophy },
          { id: 'history', label: 'History', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-[var(--bg-2)] text-white shadow-md' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-bold mb-1">Sessions</p>
                <p className="font-display font-black text-3xl text-white">{stats.totalSessions}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-bold mb-1">Avg Score</p>
                <p className="font-display font-black text-3xl text-violet-400">{stats.avgScore}<span className="text-sm text-violet-400/50">/10</span></p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-bold mb-1">Best Score</p>
                <p className="font-display font-black text-3xl text-emerald-400">{stats.bestScore}<span className="text-sm text-emerald-400/50">/10</span></p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-bold mb-1">Badges</p>
                <p className="font-display font-black text-3xl text-orange-400">{Object.keys(unlockedBadges).length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Trend Area Chart */}
              <div className="glass-card p-5 h-[300px] flex flex-col">
                <h3 className="font-display font-semibold text-white mb-4">Score Trend</h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} domain={[0, 10]} ticks={[0,2,4,6,8,10]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(7,7,13,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#c7d2fe' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#c026d3" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skill Radar Chart */}
              {radarData.length > 2 ? (
                <div className="glass-card p-5 h-[300px] flex flex-col">
                  <h3 className="font-display font-semibold text-white mb-2">Skill Breakdown</h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#7c3aed" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(7,7,13,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-5 h-[300px] flex flex-col items-center justify-center text-center">
                  <Target size={32} className="text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)] text-sm">Complete practice in more categories to unlock your skill radar.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BADGES.map(badge => {
              const unlocked = unlockedBadges[badge.id]
              return (
                <div 
                  key={badge.id} 
                  className={`relative p-5 rounded-2xl border transition-all ${unlocked ? 'bg-[var(--bg-2)] border-[var(--border)] card-glow' : 'bg-white/5 border-white/5 opacity-60 grayscale'}`}
                >
                  <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl mb-3 ${unlocked ? 'badge-3d badge-3d-face' : ''}`} style={unlocked ? {boxShadow: `0 0 20px ${badge.glowColor}`} : {}}>
                    {badge.icon}
                  </div>
                  <div className="text-center">
                    <h4 className="font-display font-bold text-white text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-tight">{badge.description}</p>
                    {unlocked && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-2">
                        {new Date(unlocked.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="glass-card p-4 flex items-center gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg
                  ${s.overallScore >= 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                    s.overallScore >= 6 ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 
                    'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {s.overallScore}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white truncate">{s.category}</h4>
                    <span className="bg-white/10 text-[var(--text-muted)] px-1.5 py-0.5 rounded text-[10px] uppercase">{s.difficulty}</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] truncate">{s.summary?.headline || 'Session completed'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[var(--text-secondary)] text-sm">{new Date(s.createdAt).toLocaleDateString()}</p>
                  <p className="text-[var(--text-muted)] text-xs">{Math.round(s.durationSeconds / 60)} min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
