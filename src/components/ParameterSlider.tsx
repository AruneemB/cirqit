import React from 'react'

interface ParameterSliderProps {
  label: string
  value: number
  onChange: (newValue: number) => void
  min?: number
  max?: number
  step?: number
}

export const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 2 * Math.PI,
  step = 0.01,
}) => {
  const piValue = (value / Math.PI).toFixed(2)

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface/60 rounded-lg border border-white/8">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-text-secondary uppercase">{label.toUpperCase()}</span>
        <span className="text-primary font-bold">{piValue}π</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-bg/50 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[10px] text-text-secondary font-mono mt-1">
        <span>0</span>
        <div className="flex gap-2">
          <button onClick={() => onChange(Math.PI / 2)} className="hover:text-primary">π/2</button>
          <button onClick={() => onChange(Math.PI)} className="hover:text-primary">π</button>
          <button onClick={() => onChange(2 * Math.PI)} className="hover:text-primary">2π</button>
        </div>
      </div>
    </div>
  )
}
