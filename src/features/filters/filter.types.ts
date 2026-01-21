export interface FilterState {
  stops: number[] // Empty means all, [0] = nonstop only, [1] = 1 stop, etc.
  priceRange: [number, number] | null // [min, max]
  airlines: string[] // Empty means all, array of airline codes
}

export interface FilterOptions {
  stopsOptions: { value: number; label: string; count: number }[]
  priceRange: { min: number; max: number }
  airlines: { code: string; name: string; count: number }[]
}

export const DEFAULT_FILTERS: FilterState = {
  stops: [],
  priceRange: null,
  airlines: [],
}
