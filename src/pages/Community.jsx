import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ArrowUp, Send, User } from 'lucide-react'
import { getCommunityPosts, saveCommunityPost, upvoteCommunityPost, getProfile } from '../services/storage.js'

export default function Community() {
  const [posts, setPosts] = useState([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profile = getProfile()

  useEffect(() => {
    // Seed with some initial data if empty
    let currentPosts = getCommunityPosts()
    if (currentPosts.length === 0) {
      saveCommunityPost({
        author: 'PrepWise Team',
        role: 'Coach',
        content: "Welcome to the PrepWise Community! Share your interview tips, recent experiences, or ask questions here. Let's help each other ace those placements! 🚀",
        upvotes: 42
      })
      saveCommunityPost({
        author: 'Rahul',
        role: 'SDE',
        content: "Just finished my first System Design mock. Highly recommend the URL Shortener drill to get started with the basics of scaling.",
        upvotes: 15
      })
      currentPosts = getCommunityPosts()
    }
    setPosts(currentPosts)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    setIsSubmitting(true)
    
    // Simulate network delay for better UX
    setTimeout(() => {
      const post = saveCommunityPost({
        author: profile?.name || 'Anonymous',
        role: profile?.role || 'Student',
        content: newPostContent.trim(),
        upvotes: 0
      })
      setPosts([post, ...posts])
      setNewPostContent('')
      setIsSubmitting(false)
    }, 400)
  }

  const handleUpvote = (id) => {
    if (upvoteCommunityPost(id)) {
      setPosts(posts.map(p => 
        p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p
      ))
    }
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Community</h1>
        <p className="text-[var(--text-secondary)]">Share tips, ask questions, and learn from others preparing for placements.</p>
      </div>
      
      {/* Compose Post */}
      <div className="glass-card p-4 md:p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            className="input-field min-h-[100px] mb-3 text-sm md:text-base"
            placeholder="Share an interview tip, question, or recent experience..."
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold font-display">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-[var(--text-secondary)] hidden sm:inline">Posting as <strong className="text-white">{profile?.name || 'Anonymous'}</strong></span>
            </div>
            
            <button 
              type="submit" 
              disabled={!newPostContent.trim() || isSubmitting}
              className="btn-primary py-2 px-6 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post'} <Send size={14} />
            </button>
          </div>
        </form>
      </div>
      
      {/* Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="post-card flex gap-4"
            >
              {/* Upvote Column */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button 
                  onClick={() => handleUpvote(post.id)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-colors text-[var(--text-muted)] hover:text-violet-400 active:scale-95"
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
                <span className="font-display font-bold text-sm text-[var(--text-secondary)]">{post.upvotes}</span>
              </div>
              
              {/* Content Column */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display font-medium text-white">{post.author}</span>
                  <span className="bg-white/10 text-[var(--text-muted)] px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{post.role}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                
                <div className="mt-3 flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
                    <MessageSquare size={14} /> Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
