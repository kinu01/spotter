import { useState } from 'react'

interface AirlineFilterProps {
  options: { code: string; name: string; count: number }[]
  selected: string[]
  onChange: (airlines: string[]) => void
}

export function AirlineFilter({ options, selected, onChange }: AirlineFilterProps) {
  const [showAll, setShowAll] = useState(false)

  function handleToggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code))
    } else {
      onChange([...selected, code])
    }
  }

  function handleSelectAll() {
    onChange([])
  }

  if (options.length === 0) return null

  const displayedOptions = showAll ? options : options.slice(0, 5)
  const hasMore = options.length > 5

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Airlines</h3>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="space-y-2">
        {displayedOptions.map((option) => (
          <label
            key={option.code}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center min-w-0">
              <input
                type="checkbox"
                checked={selected.includes(option.code)}
                onChange={() => handleToggle(option.code)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 truncate">
                {option.name}
              </span>
            </div>
            <span className="text-sm text-gray-400 flex-shrink-0 ml-2">
              {option.count}
            </span>
          </label>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          {showAll ? 'Show less' : `Show all ${options.length} airlines`}
        </button>
      )}
    </div>
  )
}
