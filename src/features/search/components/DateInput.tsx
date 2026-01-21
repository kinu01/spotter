import { getMinDate } from '@/shared/utils/format'

interface DateInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  error?: string
  required?: boolean
}

export function DateInput({
  label,
  value,
  onChange,
  min = getMinDate(),
  error,
  required = false,
}: DateInputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={`
          block w-full rounded-lg border px-3 py-2
          text-gray-900
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
