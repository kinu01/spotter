// Amadeus API Response Types
export interface AmadeusFlightOffer {
  type: string
  id: string
  source: string
  instantTicketingRequired: boolean
  nonHomogeneous: boolean
  oneWay: boolean
  lastTicketingDate: string
  numberOfBookableSeats: number
  itineraries: AmadeusItinerary[]
  price: AmadeusPrice
  pricingOptions: {
    fareType: string[]
    includedCheckedBagsOnly: boolean
  }
  validatingAirlineCodes: string[]
  travelerPricings: AmadeusTravelerPricing[]
}

export interface AmadeusItinerary {
  duration: string
  segments: AmadeusSegment[]
}

export interface AmadeusSegment {
  departure: {
    iataCode: string
    terminal?: string
    at: string
  }
  arrival: {
    iataCode: string
    terminal?: string
    at: string
  }
  carrierCode: string
  number: string
  aircraft: {
    code: string
  }
  operating?: {
    carrierCode: string
  }
  duration: string
  id: string
  numberOfStops: number
  blacklistedInEU: boolean
}

export interface AmadeusPrice {
  currency: string
  total: string
  base: string
  fees?: {
    amount: string
    type: string
  }[]
  grandTotal: string
}

export interface AmadeusTravelerPricing {
  travelerId: string
  fareOption: string
  travelerType: string
  price: {
    currency: string
    total: string
    base: string
  }
  fareDetailsBySegment: {
    segmentId: string
    cabin: string
    fareBasis: string
    class: string
    includedCheckedBags?: {
      weight?: number
      weightUnit?: string
      quantity?: number
    }
  }[]
}

export interface AmadeusDictionaries {
  locations: Record<string, {
    cityCode: string
    countryCode: string
  }>
  aircraft: Record<string, string>
  currencies: Record<string, string>
  carriers: Record<string, string>
}

export interface AmadeusFlightSearchResponse {
  meta: {
    count: number
    links: {
      self: string
    }
  }
  data: AmadeusFlightOffer[]
  dictionaries: AmadeusDictionaries
}

// Internal Flight Types (transformed)
export interface Flight {
  id: string
  price: number
  currency: string
  airline: string
  airlineCode: string
  departure: {
    airport: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    time: string
    date: string
  }
  duration: string
  durationMinutes: number
  stops: number
  stopLocations: string[]
  segments: FlightSegment[]
  cabin: string
  seatsAvailable: number
}

export interface FlightSegment {
  departure: {
    airport: string
    time: string
    terminal?: string
  }
  arrival: {
    airport: string
    time: string
    terminal?: string
  }
  airline: string
  airlineCode: string
  flightNumber: string
  duration: string
  aircraft: string
}

// Search Parameters
export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  nonStop?: boolean
  maxPrice?: number
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface FlightSearchResult {
  flights: Flight[]
  carriers: Record<string, string>
}
