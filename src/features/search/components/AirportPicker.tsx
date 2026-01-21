import { useState, useRef, useEffect } from 'react'
import { searchAirports, type Airport } from '@/data/airports'

interface AirportPickerProps {
  label: string
  value: string
  onChange: (code: string) => void
  placeholder?: string
  error?: string
}

export function AirportPicker({
  label,
  value,
  onChange,
  placeholder = 'Search city or airport',
  error,
}: AirportPickerProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Airport[]>([])
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length >= 1) {
      const airports = searchAirports(query)
      setResults(airports)
      setHighlightedIndex(0)
    } else {
      setResults([])
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(airport: Airport) {
    setSelectedAirport(airport)
    onChange(airport.code)
    setQuery('')
    setIsOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        handleSelect(results[highlightedIndex])
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  function handleClear() {
    setSelectedAirport(null)
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  const displayValue = selectedAirport
    ? `${selectedAirport.code} - ${selectedAirport.city}`
    : value
    ? value
    : ''

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {selectedAirport || value ? (
          <div
            className={`
              flex items-center justify-between w-full rounded-lg border px-3 py-2
              bg-white cursor-pointer
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
            onClick={() => {
              handleClear()
              setIsOpen(true)
            }}
          >
            <span className="text-gray-900">{displayValue}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              block w-full rounded-lg border px-3 py-2
              text-gray-900 placeholder-gray-400
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
          />
        )}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {!selectedAirport && !value && !query && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-auto"
        >
          {results.map((airport, index) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelect(airport)}
              className={`
                w-full px-3 py-2 text-left flex items-center justify-between
                ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              <div>
                <div className="font-medium text-gray-900">
                  {airport.city}
                </div>
                <div className="text-sm text-gray-500">
                  {airport.name}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {airport.code}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
