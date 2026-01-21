import { useMemo, useRef, useState, useEffect } from 'react'
import type { Flight } from '@/shared/types/api.types'
import type { QuickFilter } from '../filter.types'
import { formatPrice, formatDuration } from '@/shared/utils/format'
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/components/Icons'

interface QuickFilterTabsProps {
  value: QuickFilter
  onChange: (value: QuickFilter) => void
  flights: Flight[]
}

export function QuickFilterTabs({ value, onChange, flights }: QuickFilterTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const stats = useMemo(() => {
    if (flights.length === 0) {
      return { minPrice: 0, minDuration: 0 }
    }
    return {
      minPrice: Math.min(...flights.map((f) => f.price)),
      minDuration: Math.min(...flights.map((f) => f.durationMinutes)),
    }
  }, [flights])

  const tabs: { value: QuickFilter; label: string; sublabel?: string }[] = [
    { value: 'all', label: 'All' },
    {
      value: 'cheapest',
      label: 'Cheapest',
      sublabel: flights.length > 0 ? formatPrice(stats.minPrice) : undefined,
    },
    {
      value: 'fastest',
      label: 'Fastest',
      sublabel: flights.length > 0 ? formatDuration(stats.minDuration) : undefined,
    },
    { value: 'best', label: 'Best' },
  ]

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Left Arrow - Mobile only */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-md rounded-full flex items-center justify-center sm:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon size="sm" className="text-gray-600" />
        </button>
      )}

      {/* Tabs */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                value === tab.value
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {tab.label}
            {tab.sublabel && (
              <span className={`ml-1 ${value === tab.value ? 'text-sky-100' : 'text-gray-500'}`}>
                {tab.sublabel}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right Arrow - Mobile only */}
      {canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-md rounded-full flex items-center justify-center sm:hidden"
          aria-label="Scroll right"
        >
          <ChevronRightIcon size="sm" className="text-gray-600" />
        </button>
      )}
    </div>
  )
}
