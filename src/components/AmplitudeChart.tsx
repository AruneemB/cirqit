import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AmplitudeChartProps {
  statevector: number[][] // [[real, imag], ...]
}

function indexToBasisLabel(index: number, numQubits: number): string {
  return '|' + index.toString(2).padStart(numQubits, '0') + '⟩'
}

export const AmplitudeChart: React.FC<AmplitudeChartProps> = ({ statevector }) => {
  const numQubits = Math.round(Math.log2(statevector.length))

  const data = statevector.map(([re, im], i) => ({
    basis: indexToBasisLabel(i, numQubits),
    'Re(α)': parseFloat(re.toFixed(6)),
    'Im(α)': parseFloat(im.toFixed(6)),
  }))

  return (
    <div className="w-full bg-surface/40 border border-white/8 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/70 mb-3">Amplitude Components</h3>
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
            domain={[-1, 1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Bar dataKey="Re(α)" fill="#00D9FF" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Im(α)" fill="#A78BFA" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { indexToBasisLabel }
