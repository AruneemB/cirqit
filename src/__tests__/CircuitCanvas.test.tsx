import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CircuitCanvasWrapper } from '../components/CircuitCanvas'

describe('CircuitCanvas', () => {
  it('renders without crashing', () => {
    // Suppress React Flow ResizeObserver warning in test environment
    const originalResizeObserver = window.ResizeObserver
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    const { container } = render(<CircuitCanvasWrapper />)
    expect(container).toBeInTheDocument()

    window.ResizeObserver = originalResizeObserver
  })
})
