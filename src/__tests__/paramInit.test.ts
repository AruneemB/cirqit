import { describe, it, expect } from 'vitest'
import {
  initializeParameter,
  initializeParameters,
  STRATEGY_LABELS,
  type InitStrategy,
} from '../utils/parameterInitialization'

describe('parameterInitialization', () => {
  describe('random_uniform', () => {
    it('returns value in [0, 2π)', () => {
      for (let i = 0; i < 20; i++) {
        const v = initializeParameter({ strategy: 'random_uniform' })
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(2 * Math.PI)
      }
    })

    it('is reproducible with a seed', () => {
      const a = initializeParameter({ strategy: 'random_uniform', seed: 7 })
      const b = initializeParameter({ strategy: 'random_uniform', seed: 7 })
      expect(a).toBe(b)
    })

    it('differs with different seeds', () => {
      const a = initializeParameter({ strategy: 'random_uniform', seed: 1 })
      const b = initializeParameter({ strategy: 'random_uniform', seed: 2 })
      expect(a).not.toBe(b)
    })
  })

  describe('random_normal', () => {
    it('returns a finite number', () => {
      const v = initializeParameter({ strategy: 'random_normal', seed: 99 })
      expect(isFinite(v)).toBe(true)
    })

    it('is reproducible with a seed', () => {
      const a = initializeParameter({ strategy: 'random_normal', seed: 42 })
      const b = initializeParameter({ strategy: 'random_normal', seed: 42 })
      expect(a).toBe(b)
    })
  })

  describe('xavier', () => {
    it('returns value within xavier bounds', () => {
      const fanIn = 4
      const fanOut = 4
      const limit = Math.sqrt(6 / (fanIn + fanOut))
      for (let i = 0; i < 20; i++) {
        const v = initializeParameter({ strategy: 'xavier', seed: i, fanIn, fanOut })
        expect(v).toBeGreaterThanOrEqual(-limit - 1e-9)
        expect(v).toBeLessThanOrEqual(limit + 1e-9)
      }
    })
  })

  describe('he', () => {
    it('returns a finite number', () => {
      const v = initializeParameter({ strategy: 'he', seed: 5, fanIn: 4 })
      expect(isFinite(v)).toBe(true)
    })
  })

  describe('zeros', () => {
    it('returns exactly 0', () => {
      expect(initializeParameter({ strategy: 'zeros' })).toBe(0)
    })
  })

  describe('identity', () => {
    it('returns π/2', () => {
      expect(initializeParameter({ strategy: 'identity' })).toBeCloseTo(Math.PI / 2)
    })
  })

  describe('initializeParameters', () => {
    it('returns one value per name', () => {
      const names = ['θ_0', 'θ_1', 'θ_2']
      const result = initializeParameters(names, { strategy: 'zeros' })
      expect(Object.keys(result)).toHaveLength(3)
      names.forEach((n) => expect(result[n]).toBeDefined())
    })

    it('is reproducible with seed', () => {
      const names = ['a', 'b', 'c']
      const r1 = initializeParameters(names, { strategy: 'random_uniform', seed: 123 })
      const r2 = initializeParameters(names, { strategy: 'random_uniform', seed: 123 })
      names.forEach((n) => expect(r1[n]).toBe(r2[n]))
    })

    it('produces different values per parameter with seed', () => {
      const names = ['θ_0', 'θ_1']
      const result = initializeParameters(names, { strategy: 'random_uniform', seed: 1 })
      expect(result['θ_0']).not.toBe(result['θ_1'])
    })
  })

  describe('STRATEGY_LABELS', () => {
    it('has a label for every strategy', () => {
      const strategies: InitStrategy[] = [
        'random_uniform', 'random_normal', 'xavier', 'he', 'zeros', 'identity',
      ]
      strategies.forEach((s) => {
        expect(STRATEGY_LABELS[s]).toBeTruthy()
      })
    })
  })
})
