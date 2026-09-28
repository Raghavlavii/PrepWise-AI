import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Brain, Trophy, Target, CheckCircle2, Star, Flame } from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Coaching', desc: 'Gemini AI evaluates every answer in real time — structure, clarity, and depth.' },
  { icon: Target, title: 'Role-Aware Practice', desc: 'Custom question banks for SDE, PM, and Consulting. Not generic, never generic.' },
  { icon: Flame, title: 'Daily Streak System', desc: 'Build unstoppable momentum with a daily practice habit and milestone badges.' },
  { icon: Trophy, title: 'Body Language Analysis', desc: 'Webcam insights on eye contact, expressions, and demeanor during your session.' },
]

const STATS = [
  { value: '50K+', label: 'Mock Interviews' },
  { value: '4.9★', label: 'Avg Rating' },
  { value: '3×', label: 'Higher Offer Rate' },
]

const ROLES = [
  { id: 'SDE', emoji: '💻', label: 'Software Engineer', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'PM', emoji: '📊', label: 'Product Manager', color: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
  { id: 'Consulting', emoji: '📐', label: 'Consulting', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.12 } } }

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-[var(--bg-0)] overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
        <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-full px-5 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5">
            <div className="logo-badge">PW</div>
            <span className="font-display font-bold text-white text-base">PrepWise AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-[var(--text-secondary)] text-sm font-medium hover:text-white transition-colors px-3 py-1.5"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary py-2 px-5 text-sm"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[var(--brand)]/10 border border-[var(--brand)]/30 text-[var(--brand)] rounded-full px-4 py-1.5 text-sm font-semibold mb-8"
        >
          <Zap size={14} className="fill-[var(--brand)]" />
          AI-Powered Interview Preparation
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display font-black text-5xl sm:text-6xl md:text-7xl text-white leading-tight tracking-tight mb-6"
        >
          Ace every interview
          <br />
          <span className="text-[var(--brand)]">with daily practice.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          PrepWise AI is a role-aware mock interview coach that builds a daily habit,
          detects your weak spots, and gives you brutally honest AI feedback — in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary text-base py-3.5 px-8 shadow-[0_8px_32px_rgba(255,199,0,0.3)]"
          >
            Start Practicing Free <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-[var(--text-secondary)] text-base font-medium hover:text-white transition-colors flex items-center gap-2"
          >
            Already have an account? <span className="text-[var(--brand)] underline">Log in</span>
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex justify-center gap-8 sm:gap-16"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <p className="font-display font-black text-3xl text-white">{s.value}</p>
              <p className="text-[var(--text-muted)] text-sm mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── App Preview ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[var(--bg-1)] border border-[var(--border)] rounded-[40px] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        >
          {/* Mock dashboard preview */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[['🔥', '7 Days', 'Streak'], ['⭐', '8.4/10', 'Avg Score'], ['🎯', '32', 'Sessions']].map(([emoji, val, label]) => (
              <div key={label} className="bg-[var(--bg-2)] rounded-[20px] p-4 flex flex-col gap-1.5">
                <span className="text-2xl">{emoji}</span>
                <p className="font-display font-black text-white text-xl">{val}</p>
                <p className="text-[var(--text-muted)] text-xs">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--bg-0)] border border-[var(--brand)]/20 rounded-[24px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[var(--brand)]/10 border border-[var(--brand)]/30 text-[var(--brand)] rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                <Brain size={11} /> AI Recommended
              </span>
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-1">System Design Deep Dive</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">Your AI coach identified System Design as your recurring weak area this week.</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-[var(--brand)] text-[var(--bg-0)] font-bold text-sm rounded-full py-2.5 text-center">Start Drill →</div>
              <div className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-secondary)] text-sm rounded-full py-2.5 text-center">Browse All</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Role Cards ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-black text-3xl md:text-4xl text-white mb-3"
        >
          Built for your track.
        </motion.h2>
        <p className="text-[var(--text-secondary)] mb-10">Not a generic question bank. PrepWise knows your role.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`border rounded-[24px] p-6 text-left ${r.color}`}
            >
              <span className="text-4xl mb-4 block">{r.emoji}</span>
              <h3 className="font-display font-bold text-white text-lg">{r.label}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-black text-3xl md:text-4xl text-white mb-10 text-center"
        >
          Everything you need to get the offer.
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--bg-1)] border border-[var(--border)] rounded-[28px] p-6 hover:border-[var(--brand)]/30 hover:bg-[var(--bg-2)] transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-[var(--brand)]" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[var(--brand)] rounded-[40px] p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <h2 className="font-display font-black text-3xl md:text-5xl text-[var(--bg-0)] mb-4 relative z-10">
            Your dream offer starts today.
          </h2>
          <p className="text-[var(--bg-0)]/70 text-lg mb-8 relative z-10">
            Join thousands of students crushing their placement season with PrepWise AI.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="relative z-10 bg-[var(--bg-0)] text-white font-display font-bold text-base py-4 px-10 rounded-full hover:bg-[var(--bg-2)] transition-all shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          >
            Create Free Account →
          </button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="text-center text-[var(--text-muted)] text-sm pb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="logo-badge w-6 h-6 rounded-lg text-xs">PW</div>
          <span className="text-white font-semibold">PrepWise AI</span>
        </div>
        <p>© {new Date().getFullYear()} PrepWise AI. Built to make you interview-ready.</p>
      </footer>
    </div>
  )
}
