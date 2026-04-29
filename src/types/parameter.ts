export interface Parameter {
  name: string
  value: number
  isTrainable: boolean
  gateIds: string[]
}

export interface ParameterMapping {
  gateId: string
  paramIndex: number
  parameterName: string
}
