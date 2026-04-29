import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ParameterSlider } from '../components/ParameterSlider'

describe('ParameterSlider', () => {
  it('renders label and value', () => {
    render(<ParameterSlider label="theta" value={Math.PI} onChange={() => {}} />)
    expect(screen.getByText('THETA')).toBeInTheDocument()
    expect(screen.getByText('1.00π')).toBeInTheDocument()
  })

  it('calls onChange when slider moves', () => {
    const handleChange = vi.fn()
    render(<ParameterSlider label="theta" value={0} onChange={handleChange} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '1.57' } })

    expect(handleChange).toHaveBeenCalledWith(1.57)
  })
})
