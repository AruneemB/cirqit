import { Circuit, ExecutionResult, CircuitPatch } from '../types/circuit'

export interface CodeExportResponse {
  code: string
  language: string
  framework: string
}

export interface ExplanationResponse {
  explanation: string
  cached: boolean
}

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

export async function exportQiskitCode(circuit: Circuit): Promise<CodeExportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/export/qiskit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circuit),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(error.detail || 'Export failed', response.status, error)
  }

  return response.json()
}

export async function buildCircuit(text: string, circuit: Circuit): Promise<CircuitPatch> {
  const response = await fetch(`${API_BASE_URL}/api/llm/circuit-build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, circuit }),
  })

  if (!response.ok) {
    throw new ApiError('Circuit build failed', response.status, await response.json().catch(() => ({})))
  }

  return response.json()
}

export async function explainGate(gateType: string, context?: string): Promise<ExplanationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/llm/explain-gate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gateType, context }),
  })

  if (!response.ok) {
    throw new ApiError('Explanation failed', response.status, await response.json())
  }

  return response.json()
}
