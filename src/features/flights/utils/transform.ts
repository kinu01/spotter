import type {
  AmadeusFlightOffer,
  AmadeusDictionaries,
  Flight,
  FlightSegment,
} from '@/shared/types/api.types'

function parseDuration(isoDuration: string): number {
  // Parse ISO 8601 duration (e.g., "PT2H30M" -> 150 minutes)
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  return hours * 60 + minutes
}

function formatDuration(isoDuration: string): string {
  const minutes = parseDuration(isoDuration)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function formatTime(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatDate(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function transformFlightOffer(
  offer: AmadeusFlightOffer,
  dictionaries: AmadeusDictionaries
): Flight {
  const firstItinerary = offer.itineraries[0]
  const firstSegment = firstItinerary.segments[0]
  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1]

  // Get stop locations (intermediate airports)
  const stopLocations: string[] = []
  for (let i = 0; i < firstItinerary.segments.length - 1; i++) {
    stopLocations.push(firstItinerary.segments[i].arrival.iataCode)
  }

  // Get cabin class from first traveler pricing
  const cabin = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY'

  // Transform segments
  const segments: FlightSegment[] = firstItinerary.segments.map((segment) => ({
    departure: {
      airport: segment.departure.iataCode,
      time: formatTime(segment.departure.at),
      terminal: segment.departure.terminal,
    },
    arrival: {
      airport: segment.arrival.iataCode,
      time: formatTime(segment.arrival.at),
      terminal: segment.arrival.terminal,
    },
    airline: dictionaries.carriers[segment.carrierCode] || segment.carrierCode,
    airlineCode: segment.carrierCode,
    flightNumber: `${segment.carrierCode}${segment.number}`,
    duration: formatDuration(segment.duration),
    aircraft: dictionaries.aircraft[segment.aircraft.code] || segment.aircraft.code,
  }))

  const mainCarrier = offer.validatingAirlineCodes[0] || firstSegment.carrierCode

  return {
    id: offer.id,
    price: parseFloat(offer.price.grandTotal),
    currency: offer.price.currency,
    airline: dictionaries.carriers[mainCarrier] || mainCarrier,
    airlineCode: mainCarrier,
    departure: {
      airport: firstSegment.departure.iataCode,
      time: formatTime(firstSegment.departure.at),
      date: formatDate(firstSegment.departure.at),
    },
    arrival: {
      airport: lastSegment.arrival.iataCode,
      time: formatTime(lastSegment.arrival.at),
      date: formatDate(lastSegment.arrival.at),
    },
    duration: formatDuration(firstItinerary.duration),
    durationMinutes: parseDuration(firstItinerary.duration),
    stops: firstItinerary.segments.length - 1,
    stopLocations,
    segments,
    cabin,
    seatsAvailable: offer.numberOfBookableSeats,
  }
}

export function transformFlightOffers(
  offers: AmadeusFlightOffer[],
  dictionaries: AmadeusDictionaries
): Flight[] {
  return offers.map((offer) => transformFlightOffer(offer, dictionaries))
}
