import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock recharts to avoid canvas/DOM issues in test env
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('AmplitudeChart', () => {
  it('renders without crashing', async () => {
    const { AmplitudeChart } = await import('../components/AmplitudeChart')
    const sv: number[][] = [[1, 0], [0, 0]]
    const { container } = render(<AmplitudeChart statevector={sv} />)
    expect(container).toBeInTheDocument()
  })

  it('displays correct heading', async () => {
    const { AmplitudeChart } = await import('../components/AmplitudeChart')
    const sv: number[][] = [[1, 0], [0, 0]]
    render(<AmplitudeChart statevector={sv} />)
    expect(screen.getByText('Amplitude Distribution')).toBeInTheDocument()
  })
})

describe('ProbabilityHistogram', () => {
  it('renders without crashing', async () => {
    const { ProbabilityHistogram } = await import('../components/ProbabilityHistogram')
    const sv: number[][] = [[1, 0], [0, 0]]
    const { container } = render(<ProbabilityHistogram statevector={sv} />)
    expect(container).toBeInTheDocument()
  })

  it('displays correct heading', async () => {
    const { ProbabilityHistogram } = await import('../components/ProbabilityHistogram')
    const sv: number[][] = [[1, 0], [0, 0]]
    render(<ProbabilityHistogram statevector={sv} />)
    expect(screen.getByText('Measurement Probabilities')).toBeInTheDocument()
  })
})

describe('indexToBasisLabel', () => {
  it('converts indices to binary basis state labels', async () => {
    const { indexToBasisLabel } = await import('../components/AmplitudeChart')
    expect(indexToBasisLabel(0, 2)).toBe('|00⟩')
    expect(indexToBasisLabel(1, 2)).toBe('|01⟩')
    expect(indexToBasisLabel(2, 2)).toBe('|10⟩')
    expect(indexToBasisLabel(3, 2)).toBe('|11⟩')
  })

  it('pads correctly for 3 qubits', async () => {
    const { indexToBasisLabel } = await import('../components/AmplitudeChart')
    expect(indexToBasisLabel(0, 3)).toBe('|000⟩')
    expect(indexToBasisLabel(5, 3)).toBe('|101⟩')
  })
})

describe('probability computation', () => {
  it('computes |amplitude|² correctly for Bell state', () => {
    const sqrt2inv = 1 / Math.sqrt(2)
    // Bell state: (1/√2)|00⟩ + (1/√2)|11⟩
    const sv: number[][] = [[sqrt2inv, 0], [0, 0], [0, 0], [sqrt2inv, 0]]
    const probs = sv.map(([re, im]) => re ** 2 + im ** 2)
    expect(probs[0]).toBeCloseTo(0.5)
    expect(probs[1]).toBeCloseTo(0)
    expect(probs[2]).toBeCloseTo(0)
    expect(probs[3]).toBeCloseTo(0.5)
  })

  it('handles complex amplitudes', () => {
    // |ψ⟩ = (1/√2)|0⟩ + (i/√2)|1⟩
    const sqrt2inv = 1 / Math.sqrt(2)
    const sv: number[][] = [[sqrt2inv, 0], [0, sqrt2inv]]
    const probs = sv.map(([re, im]) => re ** 2 + im ** 2)
    expect(probs[0]).toBeCloseTo(0.5)
    expect(probs[1]).toBeCloseTo(0.5)
  })
})
