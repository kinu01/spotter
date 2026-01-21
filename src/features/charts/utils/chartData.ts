import type { Flight } from '@/shared/types/api.types'

export interface ChartDataPoint {
  airline: string
  airlineCode: string
  minPrice: number
  avgPrice: number
  count: number
}

export function aggregateByAirline(
  flights: Flight[],
  limit: number = 8
): ChartDataPoint[] {
  const aggregation = new Map<string, { airline: string; prices: number[] }>()

  for (const flight of flights) {
    const existing = aggregation.get(flight.airlineCode)
    if (existing) {
      existing.prices.push(flight.price)
    } else {
      aggregation.set(flight.airlineCode, {
        airline: flight.airline,
        prices: [flight.price],
      })
    }
  }

  const dataPoints: ChartDataPoint[] = Array.from(aggregation.entries())
    .map(([airlineCode, data]) => ({
      airline: data.airline.length > 15 ? data.airline.slice(0, 15) + '...' : data.airline,
      airlineCode,
      minPrice: Math.min(...data.prices),
      avgPrice: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length),
      count: data.prices.length,
    }))
    .sort((a, b) => a.minPrice - b.minPrice)
    .slice(0, limit)

  return dataPoints
}

export interface PriceDistribution {
  range: string
  count: number
  minPrice: number
  maxPrice: number
}

export function getPriceDistribution(
  flights: Flight[],
  buckets: number = 6
): PriceDistribution[] {
  if (flights.length === 0) return []

  const prices = flights.map((f) => f.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const bucketSize = Math.ceil((max - min) / buckets) || 1

  const distribution: PriceDistribution[] = []

  for (let i = 0; i < buckets; i++) {
    const bucketMin = min + i * bucketSize
    const bucketMax = i === buckets - 1 ? max : min + (i + 1) * bucketSize
    const count = prices.filter((p) => p >= bucketMin && p <= bucketMax).length

    if (count > 0 || distribution.length > 0) {
      distribution.push({
        range: `$${Math.round(bucketMin)}-${Math.round(bucketMax)}`,
        count,
        minPrice: bucketMin,
        maxPrice: bucketMax,
      })
    }
  }

  return distribution
}
