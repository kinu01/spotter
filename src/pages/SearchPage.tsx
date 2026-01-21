import { useState } from 'react'
import { SearchForm, useFlightSearch } from '@/features/search'
import { FlightList, FlightSummary } from '@/features/flights'
import { FilterPanel, FilterDrawer, useFlightFilters } from '@/features/filters'
import { PriceChart } from '@/features/charts'
import { useIsMobile } from '@/shared/hooks/useBreakpoint'
import { Button } from '@/shared/components/Button'

export function SearchPage() {
  const { flights, carriers, isLoading, error, hasSearched, search } = useFlightSearch()
  const {
    filteredFlights,
    filters,
    options,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  } = useFlightFilters(flights, carriers)

  const isMobile = useIsMobile()
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const showFilters = hasSearched && flights.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <h1 className="text-2xl font-semibold text-gray-900">Spotter</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Form */}
        <section className="mb-6 sm:mb-8">
          <SearchForm onSearch={search} isLoading={isLoading} />
        </section>

        {/* Results Section */}
        {(hasSearched || isLoading) && (
          <div className="lg:flex lg:gap-8">
            {/* Filters Sidebar (Desktop) */}
            {showFilters && !isMobile && (
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-6 bg-white rounded-lg border border-gray-200 p-4">
                  <FilterPanel
                    filters={filters}
                    options={options}
                    onChange={updateFilter}
                    onReset={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Button */}
              {showFilters && isMobile && (
                <div className="mb-4 flex items-center justify-between">
                  <FlightSummary
                    flights={filteredFlights}
                    totalCount={flights.length}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsFilterDrawerOpen(true)}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* Desktop Summary */}
              {showFilters && !isMobile && (
                <FlightSummary
                  flights={filteredFlights}
                  totalCount={flights.length}
                />
              )}

              {/* Price Chart */}
              {!isLoading && filteredFlights.length > 0 && (
                <PriceChart flights={filteredFlights} />
              )}

              {/* Flight List */}
              <FlightList
                flights={filteredFlights}
                isLoading={isLoading}
                error={error}
                hasSearched={hasSearched}
                onRetry={() => {}}
              />
            </div>
          </div>
        )}

        {/* Empty State when not searched */}
        {!hasSearched && !isLoading && (
          <div className="mt-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <h2 className="mt-4 text-xl font-medium text-gray-900">
              Find your next flight
            </h2>
            <p className="mt-2 text-gray-500">
              Enter your origin, destination, and travel dates to search for available flights.
            </p>
          </div>
        )}
      </main>

      {/* Mobile Filter Drawer */}
      {isMobile && (
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          options={options}
          onChange={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredFlights.length}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            Flight data provided by Amadeus. Prices are estimates and may vary.
          </p>
        </div>
      </footer>
    </div>
  )
}
