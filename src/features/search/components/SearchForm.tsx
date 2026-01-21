import { useState } from 'react'
import { AirportPicker } from './AirportPicker'
import { DateInput } from './DateInput'
import { Button } from '@/shared/components/Button'
import { SwapIcon } from '@/shared/components/Icons'
import { getTodayDate, addDays } from '@/shared/utils/format'
import type { FlightSearchParams } from '@/shared/types/api.types'

interface SearchFormProps {
  onSearch: (params: FlightSearchParams) => void
  isLoading?: boolean
}

interface FormErrors {
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState(addDays(getTodayDate(), 7))
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!origin) {
      newErrors.origin = 'Please select an origin'
    }

    if (!destination) {
      newErrors.destination = 'Please select a destination'
    }

    if (origin && destination && origin === destination) {
      newErrors.destination = 'Destination must be different from origin'
    }

    if (!departureDate) {
      newErrors.departureDate = 'Please select a departure date'
    }

    if (returnDate && returnDate < departureDate) {
      newErrors.returnDate = 'Return date must be after departure date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    onSearch({
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined,
      adults: passengers,
    })
  }

  function handleSwapLocations() {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Origin */}
        <div className="lg:col-span-3">
          <AirportPicker
            label="From"
            value={origin}
            onChange={(code) => {
              setOrigin(code)
              setErrors((prev) => ({ ...prev, origin: undefined }))
            }}
            placeholder="Origin"
            error={errors.origin}
          />
        </div>

        {/* Swap Button */}
        <div className="hidden lg:flex lg:col-span-1 justify-center pb-1">
          <button
            type="button"
            onClick={handleSwapLocations}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Swap origin and destination"
          >
            <SwapIcon className="text-gray-400" />
          </button>
        </div>

        {/* Destination */}
        <div className="lg:col-span-3">
          <AirportPicker
            label="To"
            value={destination}
            onChange={(code) => {
              setDestination(code)
              setErrors((prev) => ({ ...prev, destination: undefined }))
            }}
            placeholder="Destination"
            error={errors.destination}
          />
        </div>

        {/* Departure Date */}
        <div className="lg:col-span-2">
          <DateInput
            label="Departure"
            value={departureDate}
            onChange={(value) => {
              setDepartureDate(value)
              setErrors((prev) => ({ ...prev, departureDate: undefined }))
            }}
            error={errors.departureDate}
            required
          />
        </div>

        {/* Return Date */}
        <div className="lg:col-span-2">
          <DateInput
            label="Return"
            value={returnDate}
            onChange={(value) => {
              setReturnDate(value)
              setErrors((prev) => ({ ...prev, returnDate: undefined }))
            }}
            min={departureDate}
            error={errors.returnDate}
          />
        </div>

        {/* Passengers */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passengers
          </label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="sm:col-span-2 lg:col-span-12">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full sm:w-auto"
            size="lg"
          >
            Search flights
          </Button>
        </div>
      </div>
    </form>
  )
}
