export type PauliString = 'I' | 'X' | 'Y' | 'Z'

export interface PauliTerm {
  coefficient: number
  paulis: PauliString[]  // One per qubit, e.g., ['Z', 'Z'] for Z₀Z₁
}

export interface Observable {
  name: string
  terms: PauliTerm[]
}
