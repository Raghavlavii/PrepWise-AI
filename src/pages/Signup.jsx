import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { registerUser } from '../services/storage.js'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p) => /[a-zA-Z]/.test(p) },
]

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const passStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (passStrength < 3) {
      setError('Please choose a stronger password.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = registerUser(form)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    // New users go to onboarding to pick their role
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-0)] flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--brand)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2.5 mb-8"
        >
          <div className="logo-badge w-10 h-10 rounded-2xl text-base">PW</div>
          <span className="font-display font-bold text-white text-xl">PrepWise AI</span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-1)] border border-[var(--border)] rounded-[32px] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        >
          <h1 className="font-display font-black text-2xl text-white mb-1">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-8">Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-2xl px-4 py-3 text-sm"
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={update('name')}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)]/60 focus:bg-[var(--bg-3)] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)]/60 focus:bg-[var(--bg-3)] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update('password')}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)]/60 focus:bg-[var(--bg-3)] transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {/* Strength bar */}
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passStrength ? (passStrength === 3 ? 'bg-emerald-400' : passStrength === 2 ? 'bg-[var(--brand)]' : 'bg-red-400') : 'bg-[var(--bg-3)]'}`} />
                    ))}
                  </div>
                  {PASSWORD_RULES.map(rule => (
                    <div key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${rule.test(form.password) ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                      <CheckCircle2 size={12} className={rule.test(form.password) ? 'fill-emerald-400/20' : ''} />
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--bg-0)]/40 border-t-[var(--bg-0)] rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
              )}
            </button>
          </form>
        </motion.div>

        {/* Log in link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-[var(--text-muted)] text-sm mt-6"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--brand)] font-semibold hover:underline">
            Log in
          </Link>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center mt-3"
        >
          <Link to="/" className="text-[var(--text-muted)] text-xs hover:text-white transition-colors">
            ← Back to home
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
