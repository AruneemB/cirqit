import React, { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Node,
  ReactFlowProvider,
} from 'react-flow-renderer'
import { useCircuitStore } from '../store/circuitStore'
import { GateNode } from './GateNode'
import { executeStatevector } from '../services/api'
import { ExecutionStatus } from './ExecutionStatus'

const nodeTypes = {
  gate: GateNode,
}

export const CircuitCanvas: React.FC = () => {
  const circuit = useCircuitStore((state) => state.circuit)
  const addGate = useCircuitStore((state) => state.addGate)

  const execute = useCallback(async () => {
    try {
      const result = await executeStatevector(useCircuitStore.getState().circuit)
      useCircuitStore.getState().setExecutionResult(result)
    } catch (err) {
      console.error('Simulation failed:', err)
    }
  }, [])

  // Use a debounced effect to run simulation when gates change
  useEffect(() => {
    const timeout = setTimeout(execute, 300)
    return () => clearTimeout(timeout)
  }, [circuit.gates, execute])

  // Convert circuit gates to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return circuit.gates.map((gate) => ({
      id: gate.id,
      type: 'gate',
      position: gate.position,
      data: { gate },
    }))
  }, [circuit.gates])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const gateType = event.dataTransfer.getData('application/gate-type')
      if (!gateType) return

      const canvasBounds = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - canvasBounds.left
      const y = event.clientY - canvasBounds.top

      // Snap to nearest qubit wire (each wire is 80px apart, starting at y=50)
      const wireSpacing = 80
      const firstWireY = 50
      const qubitIndex = Math.round((y - firstWireY) / wireSpacing)
      const snappedY = firstWireY + qubitIndex * wireSpacing

      // Clamp to valid qubit range
      const clampedQubit = Math.max(0, Math.min(qubitIndex, circuit.numQubits - 1))
      const clampedY = firstWireY + clampedQubit * wireSpacing

      // Determine qubit array based on gate type
      const qubits = gateType === 'CNOT' || gateType === 'CZ' || gateType === 'SWAP'
        ? [clampedQubit, Math.min(clampedQubit + 1, circuit.numQubits - 1)]
        : [clampedQubit]

      addGate({
        type: gateType as any,
        qubits,
        params: ['RX', 'RY', 'RZ'].includes(gateType) ? [0] : undefined,
        position: { x, y: clampedY },
      })
    },
    [circuit.numQubits, addGate]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  return (
    <div
      className="flex-1 h-full relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        className="bg-bg"
      >
        <Background color="#1A1F35" gap={20} />
        <Controls className="bg-surface border border-white/8 rounded-lg" />
        <ExecutionStatus />

        {/* Qubit wires */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {Array.from({ length: circuit.numQubits }).map((_, i) => {
            const y = 50 + i * 80
            return (
              <g key={i}>
                <line
                  x1={0}
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  opacity={0.3}
                />
                <text x={10} y={y - 10} fill="#9CA3AF" fontSize={12} fontFamily="monospace">
                  q{i}
                </text>
              </g>
            )
          })}
        </svg>
      </ReactFlow>
    </div>
  )
}

export const CircuitCanvasWrapper: React.FC = () => (
  <ReactFlowProvider>
    <CircuitCanvas />
  </ReactFlowProvider>
)
