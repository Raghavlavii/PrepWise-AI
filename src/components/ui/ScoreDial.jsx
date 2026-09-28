import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ScoreDial({ score, max = 10, size = 120 }) {
  const [displayScore, setDisplayScore] = useState(0)
  
  useEffect(() => {
    let startTime
    const duration = 1500
    
    const animate = (time) => {
      if (!startTime) startTime = time
      const progress = Math.min((time - startTime) / duration, 1)
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(easeProgress * score)
      
      if (progress < 1) requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }, [score])
  
  const radius = (size - 16) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayScore / max) * circumference
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 8) return 'url(#gradient-green)'
    if (score >= 6) return 'url(#gradient-brand)'
    return 'url(#gradient-orange)'
  }

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gradient-brand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
          <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Track */}
        <circle 
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        
        {/* Inner shadow/bevel effect */}
        <circle 
          cx={size/2} cy={size/2} r={radius - 4}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
        
        {/* Fill */}
        <circle 
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-black text-white" style={{ fontSize: size * 0.28, lineHeight: 1 }}>
          {Math.round(displayScore)}
        </span>
        <span className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider">
          out of {max}
        </span>
      </div>
    </div>
  )
}
