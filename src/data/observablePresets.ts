import { Observable } from '../types/observable'

export type PresetCategory = 'quantum_chemistry' | 'optimization' | 'condensed_matter'

export interface ObservablePreset {
  id: string
  name: string
  category: PresetCategory
  description: string
  citation?: string
  numQubits: number
  observable: Observable
}

export const observablePresets: ObservablePreset[] = [
  // ── Quantum Chemistry ──────────────────────────────────────────────────────

  {
    id: 'h2_equilibrium',
    name: 'H₂ (equilibrium, 0.735 Å)',
    category: 'quantum_chemistry',
    description:
      'Molecular hydrogen Hamiltonian at equilibrium bond length, mapped to 2 qubits via Jordan-Wigner transformation (STO-3G basis). The ground-state energy is ≈ −1.137 Ha.',
    citation: 'Peruzzo et al., Nature Comms 5, 4213 (2014)',
    numQubits: 2,
    observable: {
      name: 'H₂ (0.735 Å)',
      terms: [
        { coefficient: -1.0523732, paulis: ['I', 'I'] },
        { coefficient: 0.3979374, paulis: ['Z', 'I'] },
        { coefficient: -0.3979374, paulis: ['I', 'Z'] },
        { coefficient: -0.0112801, paulis: ['Z', 'Z'] },
        { coefficient: 0.1809270, paulis: ['X', 'X'] },
        { coefficient: 0.1809270, paulis: ['Y', 'Y'] },
      ],
    },
  },

  {
    id: 'h2_stretched',
    name: 'H₂ (stretched, 1.4 Å)',
    category: 'quantum_chemistry',
    description:
      'Molecular hydrogen Hamiltonian at a stretched bond length. Stronger correlation effects make this harder to minimize — a good benchmark for VQE expressibility.',
    citation: 'O\'Malley et al., Phys. Rev. X 6, 031007 (2016)',
    numQubits: 2,
    observable: {
      name: 'H₂ (1.4 Å)',
      terms: [
        { coefficient: -0.4804, paulis: ['I', 'I'] },
        { coefficient: 0.3435, paulis: ['Z', 'I'] },
        { coefficient: -0.3435, paulis: ['I', 'Z'] },
        { coefficient: 0.0910, paulis: ['Z', 'Z'] },
        { coefficient: 0.1804, paulis: ['X', 'X'] },
        { coefficient: 0.1804, paulis: ['Y', 'Y'] },
      ],
    },
  },

  {
    id: 'lih_simplified',
    name: 'LiH (simplified, 1.595 Å)',
    category: 'quantum_chemistry',
    description:
      'Lithium hydride Hamiltonian with frozen core approximation, reduced to 4 active-space qubits via Jordan-Wigner. Ground-state energy ≈ −7.882 Ha.',
    citation: 'Kandala et al., Nature 549, 242 (2017)',
    numQubits: 4,
    observable: {
      name: 'LiH (1.595 Å)',
      terms: [
        { coefficient: -7.4981, paulis: ['I', 'I', 'I', 'I'] },
        { coefficient: 0.1712, paulis: ['Z', 'I', 'I', 'I'] },
        { coefficient: -0.2228, paulis: ['I', 'Z', 'I', 'I'] },
        { coefficient: 0.1712, paulis: ['I', 'I', 'Z', 'I'] },
        { coefficient: -0.2228, paulis: ['I', 'I', 'I', 'Z'] },
        { coefficient: 0.1681, paulis: ['Z', 'Z', 'I', 'I'] },
        { coefficient: 0.1200, paulis: ['I', 'I', 'Z', 'Z'] },
        { coefficient: 0.1681, paulis: ['Z', 'I', 'I', 'Z'] },
        { coefficient: 0.0453, paulis: ['X', 'X', 'Y', 'Y'] },
        { coefficient: -0.0453, paulis: ['Y', 'Y', 'X', 'X'] },
        { coefficient: 0.0453, paulis: ['X', 'Y', 'Y', 'X'] },
        { coefficient: 0.0453, paulis: ['Y', 'X', 'X', 'Y'] },
      ],
    },
  },

  // ── Optimization ──────────────────────────────────────────────────────────

  {
    id: 'maxcut_3node',
    name: 'MaxCut — 3-node complete graph',
    category: 'optimization',
    description:
      'MaxCut cost Hamiltonian for K₃ (fully connected 3-node graph). The QAOA ansatz with this observable finds the maximum graph cut. Optimal cut = 2.',
    citation: 'Farhi et al., arXiv:1411.4028 (2014)',
    numQubits: 3,
    observable: {
      name: 'MaxCut K₃',
      terms: [
        { coefficient: 0.5, paulis: ['Z', 'Z', 'I'] },
        { coefficient: 0.5, paulis: ['I', 'Z', 'Z'] },
        { coefficient: 0.5, paulis: ['Z', 'I', 'Z'] },
      ],
    },
  },

  {
    id: 'maxcut_4node_cycle',
    name: 'MaxCut — 4-node cycle graph',
    category: 'optimization',
    description:
      'MaxCut cost Hamiltonian for C₄ (4-node cycle graph: 0-1-2-3-0). The optimal cut partitions the cycle into two pairs. Optimal cut = 4.',
    citation: 'Farhi et al., arXiv:1411.4028 (2014)',
    numQubits: 4,
    observable: {
      name: 'MaxCut C₄',
      terms: [
        { coefficient: 0.5, paulis: ['Z', 'Z', 'I', 'I'] },
        { coefficient: 0.5, paulis: ['I', 'Z', 'Z', 'I'] },
        { coefficient: 0.5, paulis: ['I', 'I', 'Z', 'Z'] },
        { coefficient: 0.5, paulis: ['Z', 'I', 'I', 'Z'] },
      ],
    },
  },

  // ── Condensed Matter ──────────────────────────────────────────────────────

  {
    id: 'ising_2q',
    name: 'Transverse-Field Ising (2 spins)',
    category: 'condensed_matter',
    description:
      'Transverse-field Ising model on a 2-site chain: H = −ZZ − 0.5(X⊗I + I⊗X). The ground state exhibits a quantum phase transition as the transverse field h increases.',
    numQubits: 2,
    observable: {
      name: 'TFIM (n=2)',
      terms: [
        { coefficient: -1.0, paulis: ['Z', 'Z'] },
        { coefficient: -0.5, paulis: ['X', 'I'] },
        { coefficient: -0.5, paulis: ['I', 'X'] },
      ],
    },
  },

  {
    id: 'ising_3q',
    name: 'Transverse-Field Ising (3 spins)',
    category: 'condensed_matter',
    description:
      'Transverse-field Ising model on a 3-site chain with periodic boundary conditions: H = −(Z₀Z₁ + Z₁Z₂ + Z₂Z₀) − 0.5(X₀ + X₁ + X₂).',
    numQubits: 3,
    observable: {
      name: 'TFIM (n=3)',
      terms: [
        { coefficient: -1.0, paulis: ['Z', 'Z', 'I'] },
        { coefficient: -1.0, paulis: ['I', 'Z', 'Z'] },
        { coefficient: -1.0, paulis: ['Z', 'I', 'Z'] },
        { coefficient: -0.5, paulis: ['X', 'I', 'I'] },
        { coefficient: -0.5, paulis: ['I', 'X', 'I'] },
        { coefficient: -0.5, paulis: ['I', 'I', 'X'] },
      ],
    },
  },

  {
    id: 'heisenberg_2q',
    name: 'Heisenberg XXX (2 spins)',
    category: 'condensed_matter',
    description:
      'Isotropic Heisenberg model on 2 sites: H = X⊗X + Y⊗Y + Z⊗Z. The ground state is the spin-singlet (|01⟩ − |10⟩)/√2 with energy −3.',
    numQubits: 2,
    observable: {
      name: 'Heisenberg XXX (n=2)',
      terms: [
        { coefficient: 1.0, paulis: ['X', 'X'] },
        { coefficient: 1.0, paulis: ['Y', 'Y'] },
        { coefficient: 1.0, paulis: ['Z', 'Z'] },
      ],
    },
  },

  {
    id: 'heisenberg_4q',
    name: 'Heisenberg XXX (4 spins)',
    category: 'condensed_matter',
    description:
      'Isotropic Heisenberg model on a 4-site chain with open boundary conditions. A common benchmark for variational algorithms on near-term devices.',
    numQubits: 4,
    observable: {
      name: 'Heisenberg XXX (n=4)',
      terms: [
        { coefficient: 1.0, paulis: ['X', 'X', 'I', 'I'] },
        { coefficient: 1.0, paulis: ['Y', 'Y', 'I', 'I'] },
        { coefficient: 1.0, paulis: ['Z', 'Z', 'I', 'I'] },
        { coefficient: 1.0, paulis: ['I', 'X', 'X', 'I'] },
        { coefficient: 1.0, paulis: ['I', 'Y', 'Y', 'I'] },
        { coefficient: 1.0, paulis: ['I', 'Z', 'Z', 'I'] },
        { coefficient: 1.0, paulis: ['I', 'I', 'X', 'X'] },
        { coefficient: 1.0, paulis: ['I', 'I', 'Y', 'Y'] },
        { coefficient: 1.0, paulis: ['I', 'I', 'Z', 'Z'] },
      ],
    },
  },
]

export const CATEGORY_LABELS: Record<PresetCategory, string> = {
  quantum_chemistry: 'Quantum Chemistry',
  optimization: 'Optimization',
  condensed_matter: 'Condensed Matter',
}
