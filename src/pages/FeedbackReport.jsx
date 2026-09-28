import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Star, ChevronDown, ChevronUp, Zap, Target, Eye } from 'lucide-react'
import { getSessions, getBadges } from '../services/storage.js'
import ScoreDial from '../components/ui/ScoreDial.jsx'
import confetti from 'canvas-confetti'

function AnswerReviewCard({ result, index }) {
  const [expanded, setExpanded] = useState(false)
  const { question, answer, evaluation } = result
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + (index * 0.1) }}
      className="glass-card overflow-hidden mb-4"
    >
      <div 
        className="p-5 cursor-pointer flex gap-4 items-start"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold shrink-0
          ${evaluation.score >= 8 ? 'bg-emerald-500/20 text-emerald-400' : evaluation.score >= 6 ? 'bg-violet-500/20 text-violet-400' : 'bg-red-500/20 text-red-400'}`}>
          {evaluation.score}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium mb-1 line-clamp-2 pr-4">{question.text}</h4>
          <p className="text-[var(--text-muted)] text-sm truncate">{evaluation.overallComment}</p>
        </div>
        
        <div className="shrink-0 text-[var(--text-muted)] pt-2">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)]"
          >
            <div className="p-5 bg-black/20 space-y-5">
              {/* Answer */}
              <div>
                <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Your Answer</h5>
                <div className="p-4 rounded-xl bg-white/5 text-[var(--text-secondary)] text-sm italic">
                  "{answer}"
                </div>
              </div>
              
              {/* Feedback Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl border-emerald-500/20 bg-emerald-500/5">
                  <h5 className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                    <CheckCircle2 size={16} /> What you did well
                  </h5>
                  <ul className="space-y-2">
                    {evaluation.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="glass p-4 rounded-xl border-orange-500/20 bg-orange-500/5">
                  <h5 className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                    <AlertTriangle size={16} /> Areas to improve
                  </h5>
                  <ul className="space-y-2">
                    {evaluation.improvements?.map((s, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Body Language Section */}
              {evaluation.bodyLanguage && (
                <div className="glass p-4 rounded-xl border-blue-500/20 bg-blue-500/5 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="flex items-center gap-2 text-blue-400 font-medium">
                      <Eye size={16} /> Body Language & Demeanor
                    </h5>
                    <div className="text-blue-400 font-display font-bold">
                      {evaluation.bodyLanguage.score}/10
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{evaluation.bodyLanguage.feedback}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-xs text-blue-400/80 mb-1">Strengths</h6>
                      <ul className="space-y-1">
                        {evaluation.bodyLanguage.strengths?.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-xs text-orange-400/80 mb-1">Watch Out For</h6>
                      <ul className="space-y-1">
                        {evaluation.bodyLanguage.improvements?.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-orange-400 mt-0.5">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Better Outline */}
              <div className="glass p-4 rounded-xl border-violet-500/20 bg-violet-500/5">
                <h5 className="flex items-center gap-2 text-violet-400 font-medium mb-2">
                  <Star size={16} /> How to structure a 10/10 answer
                </h5>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                  {evaluation.betterOutline}
                </p>
              </div>
              
              {/* Tags */}
              {evaluation.issueTags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {evaluation.issueTags.map(tag => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FeedbackReport() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sessionId, practiceStatus } = location.state || {}
  
  const sessions = getSessions()
  const session = sessions.find(s => s.id === sessionId)
  
  useEffect(() => {
    // Fire confetti for good scores or new badges
    if (session?.overallScore >= 8 || practiceStatus?.milestoneReached) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#c026d3', '#10b981', '#f59e0b']
        })
      }, 500)
    }
  }, [session, practiceStatus])
  
  if (!session) return <Navigate to="/" replace />
  
  const { summary, results } = session

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      {/* Header & Score */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 card-glow p-8 bg-gradient-to-br from-violet-900/20 to-black/40">
        <ScoreDial score={session.overallScore} size={140} />
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-white/10 px-2 py-1 rounded text-xs text-[var(--text-secondary)] uppercase tracking-wider">{session.category}</span>
            <span className="bg-white/10 px-2 py-1 rounded text-xs text-[var(--text-secondary)] uppercase tracking-wider">{session.difficulty}</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2 leading-tight">
            {summary.headline}
          </h1>
          <p className="text-violet-300 mb-4">{summary.encouragement}</p>
          
          <button onClick={() => navigate('/progress')} className="btn-secondary py-2 text-sm">
            View Analytics <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      {/* Badges Alert */}
      {practiceStatus?.milestoneReached && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-pink-500/10 flex items-center gap-4"
        >
          <div className="text-4xl flame-animate">🔥</div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">New Streak Milestone!</h3>
            <p className="text-orange-200 text-sm">You hit a {practiceStatus.milestoneReached}-day streak. Badge unlocked in your profile.</p>
          </div>
        </motion.div>
      )}
      
      {/* AI Coaching Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" size={18} /> Key Takeaways
          </h3>
          <ul className="space-y-3">
            {summary.keyTakeaways?.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-[var(--text-muted)] shrink-0 mt-0.5">{i+1}</div>
                <span className="text-[var(--text-primary)] text-sm leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col justify-center bg-gradient-to-b from-violet-500/10 to-transparent">
          <h3 className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-bold mb-1">Top Focus Area</h3>
          <p className="font-display font-bold text-xl text-white mb-4 capitalize">{summary.topWeakArea}</p>
          <p className="text-[var(--text-secondary)] text-sm mb-4">Focus on this in your next session to bump your average score.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary py-2 text-sm justify-center w-full">
            <Target size={14} /> View Drill
          </button>
        </motion.div>
      </div>
      
      {/* Detailed Answers Breakdown */}
      <h3 className="font-display font-bold text-xl text-white mb-4 mt-12 flex items-center gap-2">
        Detailed Breakdown <span className="text-sm font-normal text-[var(--text-muted)] bg-white/10 px-2 py-0.5 rounded-full">{results.length} Questions</span>
      </h3>
      
      <div>
        {results.map((result, i) => (
          <AnswerReviewCard key={i} result={result} index={i} />
        ))}
      </div>
    </div>
  )
}
