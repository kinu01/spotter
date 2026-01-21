import type { SortOption } from '../filter.types'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price', label: 'Price (lowest)' },
  { value: 'duration', label: 'Duration (shortest)' },
  { value: 'departure', label: 'Departure (earliest)' },
  { value: 'arrival', label: 'Arrival (earliest)' },
]

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sort by
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
