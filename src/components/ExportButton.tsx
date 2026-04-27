import React, { useState } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { CodeExportModal } from './CodeExportModal'

export const ExportButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const hasGates = useCircuitStore((state) => state.circuit.gates.length > 0)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!hasGates}
        className="px-6 py-2 bg-secondary text-white font-heading font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Export Code
      </button>

      <CodeExportModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
