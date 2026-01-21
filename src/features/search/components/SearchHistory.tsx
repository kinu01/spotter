import type { SearchHistoryItem } from '../hooks/useSearchHistory'
import { CloseIcon, HistoryIcon, ArrowRightIcon } from '@/shared/components/Icons'

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  onSelect: (item: SearchHistoryItem) => void
  onRemove: (id: string) => void
  onClear: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function SearchHistory({
  history,
  onSelect,
  onRemove,
  onClear,
}: SearchHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HistoryIcon size="sm" />
          <span>Recent searches</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 pt-2 pr-2 -mt-2 -mr-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 group relative"
          >
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              <span className="font-medium text-gray-900">{item.origin}</span>
              <ArrowRightIcon size="sm" className="text-gray-400" />
              <span className="font-medium text-gray-900">{item.destination}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{formatDate(item.departureDate)}</span>
              {item.adults > 1 && (
                <>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{item.adults} pax</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <CloseIcon size="sm" className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
