import React from 'react'
import { GateType } from '../types/circuit'

interface GateButtonProps {
  type: GateType
  label: string
  description: string
  onDragStart: (type: GateType) => void
}

const GateButton: React.FC<GateButtonProps> = ({ type, label, description, onDragStart }) => (
  <div
    draggable
    onDragStart={() => onDragStart(type)}
    className="w-20 h-20 bg-glass border border-violet-soft/20 rounded-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:border-accent/50 hover:shadow-[0_0_12px_rgba(180,142,255,0.45)] transition-all group"
    title={description}
  >
    <span className="text-2xl font-mono font-bold text-accent group-hover:scale-110 transition-transform">
      {label}
    </span>
    <span className="text-[10px] text-text-secondary mt-1 uppercase tracking-tighter">
      {type}
    </span>
  </div>
)

const gates: { type: GateType; label: string; description: string; category: string }[] = [
  { type: 'H', label: 'H', description: 'Hadamard gate', category: 'Single-Qubit' },
  { type: 'X', label: 'X', description: 'Pauli-X (NOT) gate', category: 'Single-Qubit' },
  { type: 'Y', label: 'Y', description: 'Pauli-Y gate', category: 'Single-Qubit' },
  { type: 'Z', label: 'Z', description: 'Pauli-Z gate', category: 'Single-Qubit' },
  { type: 'S', label: 'S', description: 'Phase gate (S)', category: 'Single-Qubit' },
  { type: 'T', label: 'T', description: 'T gate', category: 'Single-Qubit' },
  { type: 'RX', label: 'RX', description: 'Rotation around X-axis', category: 'Parameterized' },
  { type: 'RY', label: 'RY', description: 'Rotation around Y-axis', category: 'Parameterized' },
  { type: 'RZ', label: 'RZ', description: 'Rotation around Z-axis', category: 'Parameterized' },
  { type: 'CNOT', label: 'CNOT', description: 'Controlled-NOT', category: 'Two-Qubit' },
  { type: 'CZ', label: 'CZ', description: 'Controlled-Z', category: 'Two-Qubit' },
  { type: 'SWAP', label: 'SWAP', description: 'Swap qubits', category: 'Two-Qubit' },
]

export const GatePalette: React.FC = () => {
  const handleDragStart = (type: GateType) => {
    // Store the gate type in dataTransfer for the drop handler
    const event = window.event as unknown as DragEvent
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/gate-type', type)
      event.dataTransfer.effectAllowed = 'copy'
    }
  }

  const categories = Array.from(new Set(gates.map((g) => g.category)))

  return (
    <div className="w-64 h-full bg-panel backdrop-blur-xl border-r border-violet-soft/20 p-4 overflow-y-auto">
      <h2 className="text-xl font-heading font-bold text-text-primary mb-4">Gate Palette</h2>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-heading font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            {category}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {gates
              .filter((g) => g.category === category)
              .map((gate) => (
                <GateButton
                  key={gate.type}
                  type={gate.type}
                  label={gate.label}
                  description={gate.description}
                  onDragStart={handleDragStart}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
