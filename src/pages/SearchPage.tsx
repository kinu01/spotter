import { useState } from 'react'
import { SearchForm, useFlightSearch, SearchHistory, useSearchHistory } from '@/features/search'
import type { FlightSearchParams } from '@/shared/types/api.types'
import { FlightList, FlightSummary } from '@/features/flights'
import { FilterPanel, FilterDrawer, QuickFilterTabs, useFlightFilters } from '@/features/filters'
import { PriceChart, PriceDistributionChart } from '@/features/charts'
import { useIsMobile } from '@/shared/hooks/useBreakpoint'
import { Button } from '@/shared/components/Button'
import { PlaneIcon, FilterIcon } from '@/shared/components/Icons'

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
  const { history, addSearch, removeItem, clearHistory } = useSearchHistory()

  const isMobile = useIsMobile()
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const showFilters = hasSearched && flights.length > 0

  // Wrap search to save to history
  function handleSearch(params: FlightSearchParams) {
    addSearch(params)
    search(params)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <PlaneIcon size="lg" className="text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Spotter</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Form */}
        <section className="mb-6 sm:mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          {!hasSearched && !isLoading && (
            <SearchHistory
              history={history}
              onSelect={handleSearch}
              onRemove={removeItem}
              onClear={clearHistory}
            />
          )}
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
                    <FilterIcon size="sm" className="mr-2" />
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

              {/* Charts */}
              {!isLoading && filteredFlights.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <PriceChart flights={filteredFlights} />
                  <PriceDistributionChart flights={filteredFlights} />
                </div>
              )}

              {/* Quick Filter Tabs */}
              {showFilters && (
                <div className="mb-4">
                  <QuickFilterTabs
                    value={filters.quickFilter}
                    onChange={(quickFilter) => updateFilter('quickFilter', quickFilter)}
                    flights={flights}
                  />
                </div>
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
            <PlaneIcon size="xl" className="mx-auto h-24 w-24 text-gray-300" />
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
