import React, { useState, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useCircuitStore } from '../store/circuitStore'

function renderMarkdown(text: string): React.ReactNode {
  const segments: React.ReactNode[] = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let blockKey = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(
        <span key={`text-${blockKey}`}>
          {renderInline(text.slice(lastIndex, match.index))}
        </span>
      )
    }
    const lang = match[1] || 'text'
    segments.push(
      <SyntaxHighlighter
        key={`code-${blockKey}`}
        language={lang}
        style={oneDark}
        customStyle={{ fontSize: '0.7rem', borderRadius: '6px', margin: '6px 0', padding: '8px' }}
        wrapLongLines
      >
        {match[2].trim()}
      </SyntaxHighlighter>
    )
    lastIndex = match.index + match[0].length
    blockKey++
  }

  if (lastIndex < text.length) {
    segments.push(
      <span key={`text-end-${blockKey}`}>{renderInline(text.slice(lastIndex))}</span>
    )
  }

  return <>{segments}</>
}

function renderInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  const lines = text.split('\n')

  lines.forEach((line, li) => {
    if (li > 0) result.push(<br key={`br-${li}`} />)
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    parts.forEach((part, pi) => {
      const key = `p-${li}-${pi}`
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        result.push(
          <code key={key} className="bg-white/10 text-primary font-mono text-[11px] px-1 py-0.5 rounded">
            {part.slice(1, -1)}
          </code>
        )
      } else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        result.push(
          <strong key={key} className="text-text-primary font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      } else {
        result.push(<React.Fragment key={key}>{part}</React.Fragment>)
      }
    })
  })

  return result
}

export const CopilotSidebar: React.FC = () => {
  const { copilot, sendCopilotMessage, toggleCopilot, clearCopilot } = useCircuitStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [copilot.messages])

  useEffect(() => {
    if (copilot.isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [copilot.isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || copilot.isStreaming) return
    setInput('')
    await sendCopilotMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={toggleCopilot}
        aria-label="Toggle Copilot"
        data-testid="copilot-toggle"
        className={`fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          copilot.isOpen
            ? 'bg-primary/20 border border-primary/60 text-primary'
            : 'bg-surface border border-white/12 text-text-secondary hover:text-primary hover:border-primary/40'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Sidebar panel */}
      {copilot.isOpen && (
        <div
          data-testid="copilot-panel"
          className="fixed right-0 top-0 bottom-0 z-30 w-80 bg-surface/95 backdrop-blur-xl border-l border-white/8 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
            <div>
              <h2 className="text-sm font-heading font-semibold text-text-primary">Cirqit Copilot</h2>
              <p className="text-[10px] text-text-secondary font-mono">Quantum ML Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              {copilot.messages.length > 0 && (
                <button
                  onClick={clearCopilot}
                  aria-label="Clear conversation"
                  className="text-text-secondary hover:text-error transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={toggleCopilot}
                aria-label="Close Copilot"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
            {copilot.messages.length === 0 ? (
              <div className="text-center text-text-secondary text-xs py-8 space-y-2">
                <div className="text-3xl">⚛</div>
                <p>Ask me about your circuit, VQE strategies, or quantum gates.</p>
              </div>
            ) : (
              copilot.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    data-testid={`message-${msg.role}`}
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary/20 border border-primary/30 text-text-primary'
                        : 'bg-bg/60 border border-white/8 text-text-primary'
                    }`}
                  >
                    {msg.isStreaming ? (
                      <div className="flex items-center gap-1.5" data-testid="streaming-indicator">
                        <span
                          className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/8 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={copilot.isStreaming}
                placeholder="Ask about your circuit… (Enter to send)"
                rows={2}
                className="flex-1 bg-bg/50 border border-white/8 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/50 outline-none focus:border-primary/40 resize-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || copilot.isStreaming}
                aria-label="Send message"
                className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary text-bg flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
