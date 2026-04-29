import { Circuit } from './circuit'
import { Observable } from './observable'
import { Parameter, ParameterMapping } from './parameter'

export interface CircuitContext {
  circuit: Circuit
  parameters: Record<string, Parameter>
  observable?: Observable
  parameterMappings: ParameterMapping[]
}

export interface TrainingConfig {
  learningRate: number
  maxIterations: number
  convergenceThreshold: number
}

export interface TrainingJob {
  id: string
  context: CircuitContext
  config: TrainingConfig
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentIteration: number
  currentLoss: number
  lossHistory: number[]
  startedAt?: string
  completedAt?: string
}
