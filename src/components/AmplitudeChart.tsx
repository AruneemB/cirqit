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
    <div className="w-full bg-glass border border-violet-soft/20 rounded-xl p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Amplitude Components</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(198,181,255,0.1)" />
          <XAxis
            dataKey="basis"
            tick={{ fill: '#A89DC8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(198,181,255,0.2)' }}
          />
          <YAxis
            tick={{ fill: '#A89DC8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(198,181,255,0.2)' }}
            domain={[-1, 1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E1534',
              border: '1px solid rgba(198,181,255,0.2)',
              borderRadius: '8px',
              color: '#E9E4FF',
            }}
          />
          <Legend wrapperStyle={{ color: '#A89DC8' }} />
          <Bar dataKey="Re(α)" fill="#8A64FF" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Im(α)" fill="#B48EFF" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { indexToBasisLabel }
