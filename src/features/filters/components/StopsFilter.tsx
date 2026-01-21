interface StopsFilterProps {
  options: { value: number; label: string; count: number }[]
  selected: number[]
  onChange: (stops: number[]) => void
}

export function StopsFilter({ options, selected, onChange }: StopsFilterProps) {
  function handleToggle(value: number) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  if (options.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Stops</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
              </span>
            </div>
            <span className="text-sm text-gray-400">{option.count}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
