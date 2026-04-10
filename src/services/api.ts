import { Circuit, ExecutionResult } from '../types/circuit'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function executeStatevector(circuit: Circuit): Promise<ExecutionResult> {
  const response = await fetch(`${API_BASE_URL}/api/execute/statevector`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(circuit),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(errorData.detail || 'Execution failed', response.status, errorData)
  }

  return response.json()
}
