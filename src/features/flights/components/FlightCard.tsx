import { useState } from 'react'
import type { Flight } from '@/shared/types/api.types'
import { formatPrice, getStopsLabel } from '@/shared/utils/format'
import { ChevronDownIcon } from '@/shared/components/Icons'

interface FlightCardProps {
  flight: Flight
}

export function FlightCard({ flight }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">
                {flight.airlineCode}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {flight.airline}
              </p>
              <p className="text-sm text-gray-500">
                {flight.segments.length > 0 && flight.segments[0].flightNumber}
              </p>
            </div>
          </div>

          {/* Flight Times */}
          <div className="flex items-center gap-4 sm:gap-8 flex-1 justify-center">
            {/* Departure */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                {flight.departure.time}
              </p>
              <p className="text-sm text-gray-500">
                {flight.departure.airport}
              </p>
            </div>

            {/* Duration & Stops */}
            <div className="flex flex-col items-center flex-1 max-w-32">
              <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
              <div className="w-full flex items-center">
                <div className="h-px bg-gray-300 flex-1" />
                {flight.stops > 0 && (
                  <div className="w-2 h-2 rounded-full bg-gray-400 mx-1" />
                )}
                <div className="h-px bg-gray-300 flex-1" />
              </div>
              <p className={`text-xs mt-1 ${flight.stops === 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {getStopsLabel(flight.stops)}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                {flight.arrival.time}
              </p>
              <p className="text-sm text-gray-500">
                {flight.arrival.airport}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right sm:min-w-24">
            <p className="text-xl font-semibold text-gray-900">
              {formatPrice(flight.price, flight.currency)}
            </p>
            <p className="text-sm text-gray-500">
              {flight.seatsAvailable} {flight.seatsAvailable === 1 ? 'seat' : 'seats'} left
            </p>
          </div>

          {/* Expand Indicator */}
          <div className="hidden sm:block">
            <ChevronDownIcon
              className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Mobile expand hint */}
        <div className="sm:hidden flex items-center justify-center gap-1 mt-2 text-xs text-sky-600">
          <span>{isExpanded ? 'Hide details' : 'Tap for details'}</span>
          <ChevronDownIcon
            size="sm"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Flight details</h4>
          <div className="space-y-4">
            {flight.segments.map((segment, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-medium text-gray-600">
                    {segment.airlineCode}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <p className="font-medium text-gray-900">
                      {segment.departure.time} {segment.departure.airport}
                      {segment.departure.terminal && ` (T${segment.departure.terminal})`}
                    </p>
                    <span className="hidden sm:inline text-gray-400">→</span>
                    <p className="font-medium text-gray-900">
                      {segment.arrival.time} {segment.arrival.airport}
                      {segment.arrival.terminal && ` (T${segment.arrival.terminal})`}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {segment.flightNumber} · {segment.airline} · {segment.duration} · {segment.aircraft}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {flight.stopLocations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Connecting in: {flight.stopLocations.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
