import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { loginUser, profileExists } from '../services/storage.js'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500)) // simulate async
    const result = loginUser(form)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    // If no profile (role not yet chosen), go to onboarding; else dashboard
    navigate(profileExists() ? '/' : '/onboarding', { replace: true })
  }

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

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
          <h1 className="font-display font-black text-2xl text-white mb-1">Welcome back</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-8">Log in to continue your interview prep streak.</p>

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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update('password')}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)]/60 focus:bg-[var(--bg-3)] transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">Log In <ArrowRight size={16} /></span>
              )}
            </button>
          </form>
        </motion.div>

        {/* Sign up link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-[var(--text-muted)] text-sm mt-6"
        >
          Don't have an account?{' '}
          <Link to="/signup" className="text-[var(--brand)] font-semibold hover:underline">
            Create one free
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
