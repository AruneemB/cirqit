import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeStatevector, ApiError } from '../services/api'

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global fetch if it's not already mocked
    global.fetch = vi.fn()
  })

  it('calls the correct endpoint and handles successful response', async () => {
    const mockResponse = { 
      circuitId: 'test-id',
      backend: 'statevector',
      executedAt: new Date().toISOString()
    }
    
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await executeStatevector({ id: 'test-id' } as any)
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/execute/statevector'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 'test-id' }),
      })
    )
    expect(result).toEqual(mockResponse)
  })

  it('throws ApiError on failed response', async () => {
    const errorDetail = { detail: 'Internal Server Error' }
    
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve(errorDetail),
    })

    await expect(executeStatevector({} as any)).rejects.toThrow(ApiError)
    await expect(executeStatevector({} as any)).rejects.toThrow('Internal Server Error')
  })

  it('uses default error message if detail is missing', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({}),
    })

    await expect(executeStatevector({} as any)).rejects.toThrow('Execution failed')
  })
})
