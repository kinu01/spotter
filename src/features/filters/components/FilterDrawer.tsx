import { useEffect } from 'react'
import type { FilterState, FilterOptions } from '../filter.types'
import { FilterPanel } from './FilterPanel'
import { CloseIcon } from '@/shared/components/Icons'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  options: FilterOptions
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
  resultCount: number
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  options,
  onChange,
  onReset,
  hasActiveFilters,
  resultCount,
}: FilterDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl
          transform transition-transform duration-300 ease-out
          max-h-[85vh] flex flex-col
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <FilterPanel
            filters={filters}
            options={options}
            onChange={onChange}
            onReset={onReset}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Show {resultCount} {resultCount === 1 ? 'flight' : 'flights'}
          </button>
        </div>
      </div>
    </>
  )
}
