import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LossCurveChartProps {
  lossHistory: number[]
  isTraining: boolean
}

export const LossCurveChart: React.FC<LossCurveChartProps> = ({ lossHistory, isTraining }) => {
  const data = lossHistory.map((loss, idx) => ({
    iteration: idx,
    loss: parseFloat(loss.toFixed(6)),
  }))

  return (
    <div className="w-full h-64 bg-surface/40 backdrop-blur-xl border border-white/8 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-heading font-semibold text-text-secondary uppercase tracking-wide">
          Training Loss
        </h3>
        {isTraining && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-ping" />
            <span className="text-[10px] text-success font-mono uppercase">Optimizing...</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.1} />
          <XAxis dataKey="iteration" stroke="#9CA3AF" fontSize={10} hide={data.length < 2} />
          <YAxis stroke="#9CA3AF" fontSize={10} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 31, 53, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line
            type="monotone"
            dataKey="loss"
            stroke="#00D9FF"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
