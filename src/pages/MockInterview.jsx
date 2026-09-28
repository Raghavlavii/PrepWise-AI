import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square, Play, Send, AlertTriangle, FileText, X, Clock, CheckCircle2, Sparkles } from 'lucide-react'
import { getProfile, saveSession, unlockBadge } from '../services/storage.js'
import { getRoleById } from '../data/roles.js'
import { generateQuestions, evaluateAnswer, generateSessionSummary } from '../services/gemini.js'
import { recordPractice } from '../services/streak.js'

// --- Webcam API Hook ---
function useWebcam(isActive) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [frames, setFrames] = useState([])

  useEffect(() => {
    let stream = null;
    let captureInterval = null;

    if (isActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          
          // Capture frame every 4 seconds
          captureInterval = setInterval(() => {
            if (videoRef.current && canvasRef.current) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              canvas.width = 320;
              canvas.height = 240;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // lower quality for API speed
              setFrames(prev => {
                // Keep max 5 frames to avoid huge payload and limit latency
                const newFrames = [...prev, dataUrl];
                return newFrames.slice(-5);
              });
            }
          }, 4000);
        })
        .catch(err => console.error("Webcam error:", err))
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (captureInterval) clearInterval(captureInterval);
    }
  }, [isActive])

  const clearFrames = () => setFrames([]);

  return { videoRef, canvasRef, frames, clearFrames };
}

// --- Web Speech API Hook ---
function useSpeech(onResult) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        onResult(transcript)
      }
      
      recognitionRef.current.onerror = (e) => {
        console.error('Speech recognition error', e)
        setIsRecording(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [onResult])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use text input.')
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch(e) {
        console.error(e)
      }
    }
  }

  return { isRecording, toggleRecording, supported: !!recognitionRef.current }
}

export default function MockInterview() {
  const navigate = useNavigate()
  const location = useLocation()
  const profile = getProfile()
  const role = getRoleById(profile?.role)
  
  // Setup state
  const [setupPhase, setSetupPhase] = useState(true)
  const [category, setCategory] = useState(location.state?.category || role.categories[0])
  const [difficulty, setDifficulty] = useState('Medium')
  const [resume, setResume] = useState('')
  const [resumeOpen, setResumeOpen] = useState(false)
  
  // Interview state
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [results, setResults] = useState([])
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  const { isRecording, toggleRecording, supported } = useSpeech((text) => setAnswer(text))
  const { videoRef, canvasRef, frames, clearFrames } = useWebcam(!setupPhase && !loading && !evaluating)

  // Handle timer
  useEffect(() => {
    let interval;
    if (!setupPhase && !loading && !evaluating && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [setupPhase, loading, evaluating, timeRemaining])

  const startInterview = async () => {
    setLoading(true)
    setSetupPhase(false)
    const qs = await generateQuestions({ role: role.id, category, difficulty, resume })
    setQuestions(qs)
    setTimeRemaining(qs[0]?.timeHint || 120)
    setLoading(false)
  }

  const submitAnswer = async () => {
    if (isRecording) toggleRecording();
    
    setEvaluating(true)
    const currentQ = questions[currentIdx]
    const evalResult = await evaluateAnswer({
      question: currentQ.text,
      answer,
      role: role.id,
      category,
      images: frames // Pass captured webcam frames
    })
    
    const newResult = { question: currentQ, answer, evaluation: evalResult }
    const updatedResults = [...results, newResult]
    setResults(updatedResults)
    setAnswer('')
    clearFrames()
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setTimeRemaining(questions[currentIdx + 1]?.timeHint || 120)
      setEvaluating(false)
    } else {
      // Finish interview
      const avgScore = Math.round(updatedResults.reduce((sum, r) => sum + r.evaluation.score, 0) / questions.length)
      const allTags = updatedResults.flatMap(r => r.evaluation.issueTags || [])
      
      const summary = await generateSessionSummary({
        role: role.id,
        answers: updatedResults,
        overallScore: avgScore,
        weakAreas: allTags
      })
      
      const sessionData = {
        role: role.id,
        category,
        difficulty,
        overallScore: avgScore,
        questionsCount: questions.length,
        issueTags: allTags,
        durationSeconds: questions.reduce((sum, q) => sum + (q.timeHint || 120), 0) - timeRemaining,
        summary,
        results: updatedResults
      }
      
      const saved = saveSession(sessionData)
      const practiceStatus = recordPractice()
      
      // Navigate to feedback with ID
      navigate('/feedback', { state: { sessionId: saved.id, practiceStatus } })
    }
  }
  
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (setupPhase) {
    return (
      <div className="px-4 py-8 max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Practice Mock Interview</h1>
        <p className="text-[var(--text-secondary)] mb-8">Configure your session. Our AI will dynamically generate questions based on your selections.</p>
        
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-display font-medium text-white mb-3">Topic Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {role.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-3 px-4 rounded-xl border transition-all ${category === cat ? 'bg-violet-600/20 border-violet-500 text-white shadow-glow-sm' : 'bg-white/5 border-white/10 text-[var(--text-muted)] hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-5">
            <h3 className="font-display font-medium text-white mb-3">Difficulty</h3>
            <div className="flex gap-3">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${difficulty === d ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-transparent border-white/10 text-[var(--text-muted)] hover:bg-white/5'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-medium text-white flex items-center gap-2">
                  <FileText size={16} className="text-violet-400" />
                  Resume Context <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-[var(--text-muted)] uppercase">Optional</span>
                </h3>
              </div>
              <button onClick={() => setResumeOpen(!resumeOpen)} className="text-xs text-violet-400 hover:text-violet-300">
                {resumeOpen ? 'Close' : resume ? 'Edit' : 'Add Resume'}
              </button>
            </div>
            
            <AnimatePresence>
              {resumeOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-[var(--text-muted)] mb-3">Paste your resume text below. The AI will use it to personalize behavioral and experience-based questions.</p>
                  <textarea
                    className="input-field min-h-[150px] text-sm"
                    placeholder="Paste your resume text here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {!resumeOpen && resume && (
              <div className="text-sm text-emerald-400 flex items-center gap-2 bg-emerald-400/10 p-2 rounded-lg border border-emerald-400/20 mt-2">
                <CheckCircle2 size={14} /> Resume attached
              </div>
            )}
          </div>
          
          <button onClick={startInterview} className="btn-primary w-full py-4 text-lg justify-center mt-4">
            <Play size={20} /> Generate Questions & Start
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[80dvh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-6" />
        <h2 className="font-display font-bold text-2xl text-white mb-2">Generating Questions...</h2>
        <p className="text-[var(--text-secondary)]">Our AI is crafting {difficulty.toLowerCase()} {category} questions tailored for a {role.id}.</p>
      </div>
    )
  }
  
  if (evaluating) {
    return (
      <div className="min-h-[80dvh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-6 animate-pulse-glow w-16 h-16 flex items-center justify-center rounded-full bg-violet-600/20">✨</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Evaluating Answer...</h2>
        <p className="text-[var(--text-secondary)]">Analysing structure, clarity, and content.</p>
      </div>
    )
  }

  const currentQ = questions[currentIdx]

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto flex flex-col min-h-[calc(100dvh-140px)] lg:min-h-[calc(100dvh-80px)]">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[var(--text-muted)] text-sm font-medium">{category}</p>
          <div className="flex items-center gap-2 text-white font-display font-bold">
            Question {currentIdx + 1} <span className="text-[var(--text-muted)] font-normal text-sm">of {questions.length}</span>
          </div>
        </div>
        
        {/* Timer & Webcam PiP */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-16 bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className={`glass px-4 py-2 rounded-xl flex items-center gap-2 font-display font-bold text-lg
            ${timeRemaining < 30 ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-violet-300'}`}>
            <Clock size={18} />
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      <div className="progress-track mb-8">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }} 
        />
      </div>
      
      {/* Question Card */}
      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="question-card mb-6"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-white/10 text-[var(--text-secondary)] px-2 py-1 rounded text-xs">{difficulty}</span>
          {currentQ?.tags?.map(t => (
             <span key={t} className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded text-xs">{t}</span>
          ))}
        </div>
        <h2 className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-6">
          {currentQ?.text}
        </h2>
        {currentQ?.hint && (
           <div className="bg-[var(--bg-3)] border border-[var(--border)] p-3 rounded-xl flex items-start gap-3">
             <div className="mt-0.5"><Sparkles size={16} className="text-yellow-400" /></div>
             <p className="text-sm text-[var(--text-secondary)]"><span className="font-semibold text-white">Hint:</span> {currentQ.hint}</p>
           </div>
        )}
      </motion.div>
      
      {/* Answer Input */}
      <div className="flex-1 flex flex-col relative mt-auto">
        {/* HUD overlay for active recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 feedback-hud z-10 w-[90%] max-w-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-sm text-white font-medium">Listening...</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">{answer.split(' ').length} words</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="relative flex-1 flex flex-col">
          <textarea
            className="input-field flex-1 min-h-[200px] resize-none pb-16 text-lg"
            placeholder={isRecording ? "Speak now..." : "Type your answer here, or click the mic to speak..."}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          
          <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center">
            {supported ? (
              <button 
                onClick={toggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white mic-btn recording shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
              >
                {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <button 
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="btn-primary py-2.5 px-6 disabled:opacity-50"
            >
              Submit <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
