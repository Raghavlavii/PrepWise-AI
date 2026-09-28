import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, User, Target, Sparkles, Code2, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react'
import { saveProfile } from '../services/storage.js'
import { ROLES } from '../data/roles.js'

const STEPS = ['Welcome', 'Your Name', 'Your Role']

// ─── Step Indicator ─────────────────────────────────────────
function StepBars({ current }) {
  return (
    <div className="flex gap-2 w-full">
      {STEPS.map((_, i) => (
        <div key={i} className={`step-bar ${i < current ? 'completed' : i === current ? 'active' : ''}`} />
      ))}
    </div>
  )
}

// ─── 3D App Icon ─────────────────────────────────────────────
function AppIcon3D() {
  return (
    <div className="flex justify-center mb-8">
      <div className="app-icon-3d">
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-white font-display font-black text-3xl">PW</span>
          <div className="w-8 h-1 bg-white/40 rounded-full mt-1" />
        </div>
        {/* Glow rings */}
        <div className="absolute -inset-8 rounded-full bg-violet-600/10 blur-2xl -z-10" />
        <div className="absolute -inset-12 rounded-full bg-indigo-600/5 blur-3xl -z-10" />
      </div>
    </div>
  )
}

// ─── Welcome Step ────────────────────────────────────────────
function WelcomeStep({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      <AppIcon3D />

      <div className="mb-2">
        <span className="ai-chip">
          <Sparkles size={12} />
          Powered by Gemini AI
        </span>
      </div>

      <h1 className="hero-headline text-4xl sm:text-5xl text-white mb-4 mt-4">
        Welcome to<br />
        <span className="brand-gradient-text">PrepWise AI</span>
      </h1>

      <p className="text-[var(--text-secondary)] text-lg max-w-sm leading-relaxed mb-10">
        Practice becomes a <strong className="text-white">daily habit</strong>, not a one-off cram session.
        Let's get you ready for placement season. 🚀
      </p>

      {/* USP List */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        {[
          { icon: '🎯', text: 'Role-aware mocks — SDE, PM, or Consulting' },
          { icon: '🔥', text: 'Daily streak to keep the habit alive' },
          { icon: '🧠', text: 'AI coach that spots your weak areas' },
          { icon: '⚡', text: '5-minute targeted drills — no fluff' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-center gap-3 glass rounded-2xl px-4 py-3 text-left"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[var(--text-primary)] text-sm font-medium">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <button onClick={onNext} className="btn-primary text-lg px-8 py-4 w-full max-w-sm">
        Get Started <ArrowRight size={20} />
      </button>

      <p className="text-[var(--text-muted)] text-xs mt-4">No account required · Works in any browser</p>
    </motion.div>
  )
}

// ─── Name Step ───────────────────────────────────────────────
function NameStep({ name, setName, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length >= 1) onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-6 shadow-glow-md">
        <User size={36} className="text-white" />
      </div>

      <h2 className="font-display font-bold text-3xl text-white mb-2">What's your name?</h2>
      <p className="text-[var(--text-secondary)] mb-8">We'll personalise your experience just for you.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          className="input-field text-xl font-display text-center"
          placeholder="e.g. Arjun"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          maxLength={40}
        />

        <button
          type="submit"
          disabled={!name.trim()}
          className="btn-primary w-full py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Continue <ArrowRight size={18} />
        </button>

        <button type="button" onClick={onBack} className="btn-ghost w-full">← Back</button>
      </form>
    </motion.div>
  )
}

// ─── Role Card ───────────────────────────────────────────────
const ROLE_ICONS = { SDE: Code2, PM: TrendingUp, Consulting: BarChart3 }

function RoleCard({ role, selected, onSelect }) {
  const Icon = ROLE_ICONS[role.id] || Target
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      onClick={() => onSelect(role.id)}
      className={`role-card text-left w-full ${selected ? 'selected' : ''}`}
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="font-display font-bold text-white text-lg mb-1">{role.label}</h3>
      <p className="text-[var(--text-secondary)] text-sm">{role.description}</p>
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={20} className="text-violet-400" />
        </div>
      )}
    </motion.button>
  )
}

// ─── Role Step ───────────────────────────────────────────────
function RoleStep({ selectedRole, setSelectedRole, onNext, onBack, name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-magenta-600 flex items-center justify-center mb-6 mx-auto shadow-glow-magenta">
          <Target size={36} className="text-white" />
        </div>
        <h2 className="font-display font-bold text-3xl text-white mb-2">
          Hi {name}! What's your target role?
        </h2>
        <p className="text-[var(--text-secondary)]">We'll tailor your AI mocks to this industry.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {ROLES.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selectedRole === role.id}
            onSelect={setSelectedRole}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedRole}
        className="btn-primary w-full py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        Start Practicing <ArrowRight size={18} />
      </button>
      <button onClick={onBack} className="btn-ghost w-full mt-2">← Back</button>
    </motion.div>
  )
}

// ─── Onboarding Page ─────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const handleFinish = () => {
    saveProfile({ name: name.trim(), role: selectedRole })
    navigate('/dashboard', { replace: true })
  }

  const stepComponents = [
    <WelcomeStep onNext={() => setStep(1)} />,
    <NameStep name={name} setName={setName} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    <RoleStep selectedRole={selectedRole} setSelectedRole={setSelectedRole} onNext={handleFinish} onBack={() => setStep(1)} name={name} />,
  ]

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-900/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {step > 0 && (
          <div className="mb-8">
            <StepBars current={step} />
            <p className="text-[var(--text-muted)] text-xs mt-2 text-right">Step {step} of 2</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <div key={step}>
            {stepComponents[step]}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}
