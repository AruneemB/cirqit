import { Circuit, ExecutionResult, CircuitPatch } from '../types/circuit'
import { CircuitContext } from '../types/training'

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

export interface NarrateCodeResponse {
  annotated_code: string
}

export async function narrateCode(
  code: string,
  language: string,
  circuitIntent?: string
): Promise<NarrateCodeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/llm/narrate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, circuit_intent: circuitIntent }),
  })

  if (!response.ok) {
    throw new ApiError('Narration failed', response.status, await response.json().catch(() => ({})))
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

export interface TrainingJobResponse {
  jobId: string
  status: string
}

export interface TrainingStartRequest {
  context: CircuitContext
  learningRate?: number
  maxIterations?: number
  convergenceThreshold?: number
}

export async function startTrainingJob(request: TrainingStartRequest): Promise<TrainingJobResponse> {
  const response = await fetch(`${API_BASE_URL}/api/training/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(error.detail || 'Training start failed', response.status, error)
  }

  return response.json()
}

export function createTrainingStream(jobId: string): EventSource {
  return new EventSource(`${API_BASE_URL}/api/training/stream/${jobId}`)
}
