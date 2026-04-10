import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProbabilityHistogramProps {
  statevector: number[][] // [[real, imag], ...]
}

function indexToBasisLabel(index: number, numQubits: number): string {
  return '|' + index.toString(2).padStart(numQubits, '0') + '⟩'
}

export const ProbabilityHistogram: React.FC<ProbabilityHistogramProps> = ({ statevector }) => {
  const numQubits = Math.round(Math.log2(statevector.length))

  const data = statevector
    .map(([re, im], i) => ({
      basis: indexToBasisLabel(i, numQubits),
      probability: re ** 2 + im ** 2,
    }))
    .filter((d) => d.probability >= 0.0001) // Filter < 0.01%
    .sort((a, b) => b.probability - a.probability)
    .map((d) => ({
      ...d,
      probability: parseFloat((d.probability * 100).toFixed(4)),
    }))

  return (
    <div className="w-full bg-surface/40 border border-white/8 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/70 mb-3">Measurement Probabilities</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="basis"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value}%`, 'Probability']}
          />
          <Bar dataKey="probability" fill="#34D399" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
