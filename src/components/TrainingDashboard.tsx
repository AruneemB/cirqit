import React, { useState } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { LossCurveChart } from './LossCurveChart'
import { ParameterSlider } from './ParameterSlider'

export const TrainingDashboard: React.FC = () => {
  const { parameters, training, startTraining, stopTraining, updateParameter } = useCircuitStore()
  const [learningRate, setLearningRate] = useState(0.01)
  const [maxIter, setMaxIter] = useState(100)

  const isTraining = training.isTraining
  const lossHistory = training.lossHistory

  const handleStart = () => {
    startTraining({ learningRate, maxIterations: maxIter })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">VQE Trainer</h2>
        <p className="text-sm text-text-secondary">Variational Quantum Eigensolver</p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text-secondary uppercase font-mono">Learning Rate</label>
          <input
            type="number"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            disabled={isTraining}
            className="bg-bg/50 border border-white/8 rounded px-3 py-2 text-sm focus:border-primary/50 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text-secondary uppercase font-mono">Max Iterations</label>
          <input
            type="number"
            value={maxIter}
            onChange={(e) => setMaxIter(parseInt(e.target.value))}
            disabled={isTraining}
            className="bg-bg/50 border border-white/8 rounded px-3 py-2 text-sm focus:border-primary/50 outline-none"
          />
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={isTraining ? stopTraining : handleStart}
        className={`w-full py-3 rounded-lg font-heading font-bold transition-all ${
          isTraining
            ? 'bg-error/20 text-error border border-error/50 hover:bg-error/30'
            : 'bg-primary text-bg hover:shadow-[0_0_20px_rgba(0,217,255,0.4)]'
        }`}
      >
        {isTraining ? 'Stop Training' : 'Initialize Optimization'}
      </button>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface/40 p-4 rounded-lg border border-white/8">
          <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">Current Loss</div>
          <div className="text-xl font-mono text-primary">
            {lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].toFixed(6) : '---'}
          </div>
        </div>
        <div className="bg-surface/40 p-4 rounded-lg border border-white/8">
          <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">Iteration</div>
          <div className="text-xl font-mono text-text-primary">
            {training.currentIteration}{' '}
            <span className="text-xs text-text-secondary">/ {maxIter}</span>
          </div>
        </div>
      </div>

      {/* Loss Chart */}
      <LossCurveChart lossHistory={lossHistory} isTraining={isTraining} />

      {/* Parameter Watcher */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-text-secondary uppercase font-mono tracking-widest">
          Parameter Monitor
        </h3>
        {Object.values(parameters).map((param) => (
          <ParameterSlider
            key={param.name}
            label={param.name}
            value={param.value}
            onChange={(val) => updateParameter(param.name, val)}
          />
        ))}
      </div>
    </div>
  )
}
