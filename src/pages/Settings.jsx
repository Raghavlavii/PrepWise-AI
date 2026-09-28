import { useState, useEffect } from 'react'
import { getProfile, saveProfile, clearAllData, getSettings, saveSettings } from '../services/storage.js'
import { DEMO_PROFILE, DEMO_STREAK, DEMO_SESSIONS, DEMO_WEAK_AREAS, DEMO_BADGES } from '../data/demoData.js'
import { ROLES } from '../data/roles.js'

export default function Settings() {
  const [profile, setProfile] = useState(getProfile() || { name: '', role: 'SDE' })
  const [settings, setSettingsState] = useState(getSettings())
  const [saved, setSaved] = useState(false)
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '')

  const handleSaveProfile = () => {
    saveProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLoadDemo = () => {
    if (confirm('This will overwrite your current progress with demo data. Continue?')) {
      localStorage.setItem('pw_profile', JSON.stringify(DEMO_PROFILE))
      localStorage.setItem('pw_streak', JSON.stringify(DEMO_STREAK))
      localStorage.setItem('pw_sessions', JSON.stringify(DEMO_SESSIONS))
      localStorage.setItem('pw_weak_areas', JSON.stringify(DEMO_WEAK_AREAS))
      localStorage.setItem('pw_badges', JSON.stringify(DEMO_BADGES))
      window.location.href = '/'
    }
  }

  const handleReset = () => {
    if (confirm('Are you absolutely sure? This will delete all your practice history, streaks, and badges.')) {
      clearAllData()
      window.location.href = '/onboarding'
    }
  }

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto space-y-8">
      <h1 className="font-display font-bold text-3xl text-white">Profile & Settings</h1>

      {/* Profile Section */}
      <section className="glass-card p-6">
        <h2 className="font-display font-semibold text-lg text-white mb-4">Your Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
            <input 
              type="text" 
              className="input-field"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Target Role</label>
            <select 
              className="input-field appearance-none bg-[var(--bg-2)]"
              value={profile.role}
              onChange={e => setProfile({...profile, role: e.target.value})}
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          
          <button onClick={handleSaveProfile} className="btn-primary w-full justify-center">
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* API Key Info */}
      <section className="glass-card p-6">
        <h2 className="font-display font-semibold text-lg text-white mb-2">Gemini API Key</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          The app requires a Gemini API key to function. This is configured via the `.env` file.
        </p>
        
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
          <span className="text-sm text-[var(--text-secondary)]">
            {apiKey ? 'API Key is configured' : 'API Key is missing in .env'}
          </span>
        </div>
      </section>

      {/* Developer / Data Tools */}
      <section className="glass-card p-6 border-orange-500/20 bg-orange-500/5">
        <h2 className="font-display font-semibold text-lg text-white mb-2">Data Management</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          All your data is stored locally in your browser's localStorage.
        </p>
        
        <div className="flex flex-col gap-3">
          <button onClick={handleLoadDemo} className="btn-secondary w-full justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-magenta-600/20 translate-y-[100%] group-hover:translate-y-0 transition-transform" />
            <span className="relative z-10">Load Demo Data</span>
          </button>
          
          <button onClick={handleReset} className="py-3 px-4 rounded-xl border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors font-medium text-sm">
            Delete All Data & Reset
          </button>
        </div>
      </section>
      
      <div className="text-center pt-8 pb-4">
        <div className="logo-badge mx-auto mb-2 opacity-50 w-8 h-8 text-xs">PW</div>
        <p className="text-xs text-[var(--text-muted)]">PrepWise AI v1.0</p>
      </div>
    </div>
  )
}
