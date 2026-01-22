import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatDuration,
  getStopsLabel,
  addDays,
} from '../format'

describe('formatPrice', () => {
  it('formats USD price correctly', () => {
    expect(formatPrice(299)).toBe('$299')
    expect(formatPrice(1250)).toBe('$1,250')
  })

  it('formats other currencies', () => {
    expect(formatPrice(299, 'EUR')).toBe('€299')
    expect(formatPrice(299, 'GBP')).toBe('£299')
  })

  it('rounds decimal values', () => {
    expect(formatPrice(299.99)).toBe('$300')
    expect(formatPrice(299.49)).toBe('$299')
  })
})

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(150)).toBe('2h 30m')
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('handles hours only', () => {
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(60)).toBe('1h')
  })

  it('handles minutes only', () => {
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(5)).toBe('5m')
  })

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0m')
  })
})

describe('getStopsLabel', () => {
  it('returns Nonstop for 0 stops', () => {
    expect(getStopsLabel(0)).toBe('Nonstop')
  })

  it('returns singular for 1 stop', () => {
    expect(getStopsLabel(1)).toBe('1 stop')
  })

  it('returns plural for multiple stops', () => {
    expect(getStopsLabel(2)).toBe('2 stops')
    expect(getStopsLabel(3)).toBe('3 stops')
  })
})

describe('addDays', () => {
  it('adds days to a date', () => {
    expect(addDays('2024-01-15', 7)).toBe('2024-01-22')
    expect(addDays('2024-01-15', 1)).toBe('2024-01-16')
  })

  it('handles month rollover', () => {
    expect(addDays('2024-01-30', 5)).toBe('2024-02-04')
  })

  it('handles year rollover', () => {
    expect(addDays('2024-12-30', 5)).toBe('2025-01-04')
  })
})
