import type { FilterState, FilterOptions } from '../filter.types'
import { SortSelect } from './SortSelect'
import { StopsFilter } from './StopsFilter'
import { PriceSlider } from './PriceSlider'
import { AirlineFilter } from './AirlineFilter'

interface FilterPanelProps {
  filters: FilterState
  options: FilterOptions
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function FilterPanel({
  filters,
  options,
  onChange,
  onReset,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <SortSelect
          value={filters.sortBy}
          onChange={(sortBy) => onChange('sortBy', sortBy)}
        />

        <div className="border-t border-gray-200 pt-6">
          <StopsFilter
            options={options.stopsOptions}
            selected={filters.stops}
            onChange={(stops) => onChange('stops', stops)}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <PriceSlider
            min={options.priceRange.min}
            max={options.priceRange.max}
            value={filters.priceRange}
            onChange={(range) => onChange('priceRange', range)}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <AirlineFilter
            options={options.airlines}
            selected={filters.airlines}
            onChange={(airlines) => onChange('airlines', airlines)}
          />
        </div>
      </div>
    </div>
  )
}
