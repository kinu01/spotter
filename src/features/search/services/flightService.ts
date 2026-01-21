import type {
  FlightSearchParams,
  AmadeusFlightOffer,
  AmadeusDictionaries,
  Flight,
} from '@/shared/types/api.types'
import { transformFlightOffers } from '@/features/flights'

interface FlightSearchResponse {
  success: boolean
  data?: AmadeusFlightOffer[]
  dictionaries?: AmadeusDictionaries
  error?: string
}

export interface FlightSearchResult {
  flights: Flight[]
  carriers: Record<string, string>
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
  let response: Response

  try {
    response = await fetch('/api/flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
  } catch {
    throw new Error('Unable to connect to the server. Please check your internet connection.')
  }

  if (response.status === 404) {
    throw new Error('Flight search service is not available. Please try again later.')
  }

  if (!response.ok) {
    throw new Error(`Server error (${response.status}). Please try again later.`)
  }

  let result: FlightSearchResponse

  try {
    result = await response.json()
  } catch {
    throw new Error('Received an invalid response from the server. Please try again.')
  }

  if (!result.success || !result.data || !result.dictionaries) {
    throw new Error(result.error || 'Failed to fetch flights. Please try again.')
  }

  const flights = transformFlightOffers(result.data, result.dictionaries)

  return {
    flights,
    carriers: result.dictionaries.carriers,
  }
}
