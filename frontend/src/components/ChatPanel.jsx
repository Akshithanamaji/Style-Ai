import { useState, useRef, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'

export default function ChatPanel({ context }) {
  const welcome = context.season && context.faceShape
    ? `Hi! I'm your personal stylist. I know your profile — ${context.faceShape} face shape, ${context.season} color season. Ask me anything about what to wear or colors that suit you!`
    : `Hi! I'm your personal stylist. Feel free to ask general fashion questions while you complete your analysis!`

  const [messages, setMessages] = useState([{ role: 'assistant', text: welcome }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setError('')
    setMessages((m) => [...m, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          context,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Chat error')
      }
      const data = await res.json()
      setSessionId(data.session_id)
      setMessages((m) => [...m, { role: 'assistant', text: data.reply }])
    } catch (e) {
      setError(e.message)
      setMessages((m) => m.slice(0, -1)) // remove the user message on failure
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#14151B] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="px-5 py-4 border-b border-white/10 bg-white/[0.04] backdrop-blur-md">
        <h3
          style={{ fontFamily: "'Anton', sans-serif" }}
          className="uppercase tracking-wider text-white text-sm flex items-center gap-2"
        >
          <MessageSquare size={16} className="text-[#F4845F]" />
          <span>Chat with Your Stylist</span>
        </h3>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5 font-medium">Powered by Gemini AI</p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#F4845F] text-white rounded-br-sm shadow-md'
                  : 'bg-white/10 text-white/90 rounded-bl-sm border border-white/10 backdrop-blur-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-white/10">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-xs text-red-300 text-center bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
            {error.includes('API_KEY') || error.includes('not set')
              ? '⚠️ GEMINI_API_KEY not configured — add it to .env'
              : `Error: ${error}`}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3.5 border-t border-white/10 bg-white/[0.02]">
        <div className="flex gap-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything… e.g. 'something more formal'"
            rows={2}
            className="flex-1 resize-none border border-white/20 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#F4845F] bg-white/[0.05]"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="bg-white text-black px-4 py-2 rounded-2xl text-xs uppercase tracking-wider font-bold hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer self-end shadow-md"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-white/40 mt-1.5 uppercase tracking-wider">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
