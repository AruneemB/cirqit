import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useCircuitStore } from '../store/circuitStore'
import { exportQiskitCode } from '../services/api'

interface CodeExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const circuit = useCircuitStore((state) => state.circuit)
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  React.useEffect(() => {
    if (isOpen && !code) {
      fetchCode()
    }
  }, [isOpen])

  const fetchCode = async () => {
    setIsLoading(true)
    try {
      const result = await exportQiskitCode(circuit)
      setCode(result.code)
    } catch (error) {
      alert('Export failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface backdrop-blur-xl border border-white/8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Export Qiskit Code
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {circuit.name} · {circuit.gates.length} gates
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-text-secondary">Generating code...</div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 z-10 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-sm rounded-md transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: '8px', fontSize: '14px' }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface border border-white/8 text-text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
