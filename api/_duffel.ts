// Duffel replaced Amadeus Self-Service, which Amadeus shut down in July 2026. The screens still
// read the Amadeus offer shape, so this file converts Duffel offers into it.

export interface DuffelPlace {
  iata_code: string
}

export interface DuffelSegment {
  origin: DuffelPlace
  destination: DuffelPlace
  origin_terminal?: string | null
  destination_terminal?: string | null
  departing_at: string
  arriving_at: string
  duration?: string | null
  marketing_carrier: { iata_code: string; name: string }
  marketing_carrier_flight_number: string
  aircraft?: { iata_code: string; name: string } | null
  passengers?: { cabin_class?: string }[]
}

export interface DuffelOffer {
  id: string
  total_amount: string
  total_currency: string
  base_amount?: string | null
  owner: { iata_code: string; name: string }
  slices: { duration?: string | null; segments: DuffelSegment[] }[]
}

export interface SearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  travelClass?: string
  nonStop?: boolean
  maxPrice?: number
}

const CABINS: Record<string, string> = {
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium_economy',
  BUSINESS: 'business',
  FIRST: 'first',
}

export function buildOfferRequest(params: SearchParams) {
  const slices = [
    { origin: params.origin, destination: params.destination, departure_date: params.departureDate },
  ]
  if (params.returnDate) {
    slices.push({ origin: params.destination, destination: params.origin, departure_date: params.returnDate })
  }
  return {
    data: {
      slices,
      passengers: Array.from({ length: params.adults }, () => ({ type: 'adult' })),
      cabin_class: CABINS[params.travelClass ?? ''] ?? 'economy',
      ...(params.nonStop ? { max_connections: 0 } : {}),
    },
  }
}

// Duffel can return durations with days ("P1DT2H30M"); the screens parse only "PT#H#M".
export function toHoursMinutes(iso: string | null | undefined, from?: string, to?: string): string {
  let minutes = 0
  const m = iso?.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/)
  if (m) {
    minutes = Number(m[1] || 0) * 1440 + Number(m[2] || 0) * 60 + Number(m[3] || 0)
  } else if (from && to) {
    minutes = Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 60000))
  }
  return `PT${Math.floor(minutes / 60)}H${minutes % 60}M`
}

export function toAmadeusShape(offers: DuffelOffer[], maxPrice?: number, limit = 50) {
  const carriers: Record<string, string> = {}
  const aircraft: Record<string, string> = {}

  const kept = offers
    .filter((o) => !maxPrice || Number(o.total_amount) <= maxPrice)
    .sort((a, b) => Number(a.total_amount) - Number(b.total_amount))
    .slice(0, limit)

  const data = kept.map((offer) => {
    carriers[offer.owner.iata_code] = offer.owner.name
    const itineraries = offer.slices.map((slice) => {
      const first = slice.segments[0]
      const last = slice.segments[slice.segments.length - 1]
      return {
        duration: toHoursMinutes(slice.duration, first?.departing_at, last?.arriving_at),
        segments: slice.segments.map((s, i) => {
          carriers[s.marketing_carrier.iata_code] = s.marketing_carrier.name
          if (s.aircraft) aircraft[s.aircraft.iata_code] = s.aircraft.name
          return {
            id: String(i + 1),
            departure: { iataCode: s.origin.iata_code, terminal: s.origin_terminal ?? undefined, at: s.departing_at },
            arrival: { iataCode: s.destination.iata_code, terminal: s.destination_terminal ?? undefined, at: s.arriving_at },
            carrierCode: s.marketing_carrier.iata_code,
            number: s.marketing_carrier_flight_number,
            aircraft: { code: s.aircraft?.iata_code ?? '' },
            duration: toHoursMinutes(s.duration, s.departing_at, s.arriving_at),
            numberOfStops: 0,
          }
        }),
      }
    })
    const cabin = (offer.slices[0]?.segments[0]?.passengers?.[0]?.cabin_class ?? 'economy').toUpperCase()
    return {
      type: 'flight-offer',
      id: offer.id,
      source: 'DUFFEL',
      oneWay: offer.slices.length === 1,
      numberOfBookableSeats: 0,
      itineraries,
      price: {
        currency: offer.total_currency,
        total: offer.total_amount,
        base: offer.base_amount ?? offer.total_amount,
        grandTotal: offer.total_amount,
      },
      validatingAirlineCodes: [offer.owner.iata_code],
      travelerPricings: [{ fareDetailsBySegment: [{ cabin }] }],
    }
  })

  return { data, dictionaries: { locations: {}, aircraft, currencies: {}, carriers } }
}
