import { formatPrice } from '@/shared/utils/format'

interface PriceSliderProps {
  min: number
  max: number
  value: [number, number] | null
  onChange: (range: [number, number] | null) => void
}

export function PriceSlider({ min, max, value, onChange }: PriceSliderProps) {
  const currentMin = value?.[0] ?? min
  const currentMax = value?.[1] ?? max

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newMin = Number(e.target.value)
    if (newMin <= currentMax) {
      onChange([newMin, currentMax])
    }
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newMax = Number(e.target.value)
    if (newMax >= currentMin) {
      onChange([currentMin, newMax])
    }
  }

  function handleReset() {
    onChange(null)
  }

  const isActive = value !== null && (currentMin > min || currentMax < max)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Price</h3>
        {isActive && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatPrice(currentMin)}</span>
          <span>{formatPrice(currentMax)}</span>
        </div>

        <div className="relative h-2">
          {/* Track background */}
          <div className="absolute inset-0 bg-gray-200 rounded-full" />

          {/* Active range */}
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{
              left: `${((currentMin - min) / (max - min)) * 100}%`,
              right: `${100 - ((currentMax - min) / (max - min)) * 100}%`,
            }}
          />

          {/* Min slider */}
          <input
            type="range"
            min={min}
            max={max}
            value={currentMin}
            onChange={handleMinChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Max slider */}
          <input
            type="range"
            min={min}
            max={max}
            value={currentMax}
            onChange={handleMaxChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
