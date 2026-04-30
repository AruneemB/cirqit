import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useCircuitStore } from '../store/circuitStore'
import { exportQiskitCode, exportPennyLaneCode } from '../services/api'

type Framework = 'qiskit' | 'pennylane'

interface CodeExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const circuit = useCircuitStore((state) => state.circuit)
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [addNarration, setAddNarration] = useState(false)
  const [copied, setCopied] = useState(false)
  const [framework, setFramework] = useState<Framework>('qiskit')
  const latestRequestRef = React.useRef(0)

  React.useEffect(() => {
    if (isOpen && !code) {
      fetchCode(framework, addNarration)
    }
  }, [isOpen])

  const fetchCode = async (fw: Framework = framework, withNarration = addNarration) => {
    const requestId = ++latestRequestRef.current
    setIsLoading(true)
    try {
      const result = fw === 'pennylane'
        ? await exportPennyLaneCode(circuit)
        : await exportQiskitCode(circuit, withNarration)
      if (requestId === latestRequestRef.current) {
        setCode(result.code)
      }
    } catch (error) {
      if (requestId === latestRequestRef.current) {
        alert('Export failed: ' + (error as Error).message)
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false)
      }
    }
  }

  const handleFrameworkChange = (fw: Framework) => {
    setFramework(fw)
    setCode('')
    fetchCode(fw, addNarration)
  }

  const handleToggleNarration = (enabled: boolean) => {
    setAddNarration(enabled)
    setCode('')
    fetchCode(framework, enabled)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const frameworkLabel = framework === 'pennylane' ? 'PennyLane' : 'Qiskit'

  return (
    <div data-testid="export-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-panel backdrop-blur-xl border border-violet-soft/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-violet-soft/20">
          <div>
            <h2 data-testid="export-modal-title" className="text-2xl font-heading font-bold text-text-primary">
              Export {frameworkLabel} Code
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
              <div className="text-text-secondary">
                {addNarration ? 'Generating annotated code...' : 'Generating code...'}
              </div>
            </div>
          ) : (
            <div data-testid="export-code-block" className="relative">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 z-10 px-3 py-1 bg-accent/20 hover:bg-accent/30 text-accent text-sm rounded-md transition-colors"
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

        <div className="flex items-center justify-between gap-3 p-6 border-t border-violet-soft/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary uppercase font-mono tracking-wide">Framework</label>
              <select
                value={framework}
                onChange={(e) => handleFrameworkChange(e.target.value as Framework)}
                className="bg-glass border border-violet-soft/20 text-text-primary text-sm rounded-lg px-3 py-1.5 outline-none focus:border-accent/50"
              >
                <option value="qiskit">Qiskit</option>
                <option value="pennylane">PennyLane</option>
              </select>
            </div>
            {framework === 'qiskit' && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addNarration}
                  onChange={(e) => handleToggleNarration(e.target.checked)}
                  className="w-4 h-4 rounded border-violet-soft/40 accent-accent"
                />
                <span className="text-sm text-text-secondary">Add explanatory comments</span>
              </label>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-glass border border-violet-soft/20 text-text-primary rounded-lg hover:bg-glass/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
