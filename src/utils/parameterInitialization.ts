export type InitStrategy = 'random_uniform' | 'random_normal' | 'xavier' | 'he' | 'zeros' | 'identity'

export interface InitOptions {
  strategy: InitStrategy
  seed?: number
  fanIn?: number
  fanOut?: number
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0x100000000
  }
}

function boxMullerNormal(r: () => number): number {
  const u1 = Math.max(r(), 1e-10)
  const u2 = r()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function initializeParameter(opts: InitOptions): number {
  const rand = opts.seed !== undefined ? seededRandom(opts.seed) : Math.random
  const fanIn = opts.fanIn ?? 1
  const fanOut = opts.fanOut ?? 1

  switch (opts.strategy) {
    case 'random_uniform':
      return rand() * 2 * Math.PI

    case 'random_normal': {
      const r = opts.seed !== undefined ? seededRandom(opts.seed) : Math.random
      return boxMullerNormal(r) * 0.1

    }

    case 'xavier': {
      if (fanIn + fanOut <= 0) throw new Error('fanIn + fanOut must be > 0 for Xavier initialization')
      const limit = Math.sqrt(6 / (fanIn + fanOut))
      return (rand() * 2 - 1) * limit
    }

    case 'he': {
      if (fanIn <= 0) throw new Error('fanIn must be > 0 for He initialization')
      const r = opts.seed !== undefined ? seededRandom(opts.seed) : Math.random
      const std = Math.sqrt(2 / fanIn)
      return boxMullerNormal(r) * std
    }

    case 'zeros':
      return 0

    case 'identity':
      return Math.PI / 2

    default:
      return 0
  }
}

export function initializeParameters(
  names: string[],
  opts: InitOptions
): Record<string, number> {
  const result: Record<string, number> = {}
  names.forEach((name, i) => {
    const seed = opts.seed !== undefined ? opts.seed + i : undefined
    result[name] = initializeParameter({ ...opts, seed })
  })
  return result
}

export const STRATEGY_LABELS: Record<InitStrategy, string> = {
  random_uniform: 'Random Uniform [0, 2π)',
  random_normal: 'Random Normal (μ=0, σ=0.1)',
  xavier: 'Xavier / Glorot',
  he: 'He (Kaiming)',
  zeros: 'Zeros',
  identity: 'Identity (π/2)',
}
