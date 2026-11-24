import { describe, expect, it } from 'vitest'
import { buildOfferRequest, toAmadeusShape, toHoursMinutes, type DuffelOffer } from './_duffel'
import { transformFlightOffers } from '../src/features/flights/utils/transform'
import type { AmadeusDictionaries, AmadeusFlightOffer } from '../src/shared/types/api.types'

const segment = (from: string, to: string, dep: string, arr: string, flight = '100') => ({
  origin: { iata_code: from },
  destination: { iata_code: to },
  departing_at: dep,
  arriving_at: arr,
  marketing_carrier: { iata_code: 'AA', name: 'American Airlines' },
  marketing_carrier_flight_number: flight,
  aircraft: { iata_code: '321', name: 'Airbus A321' },
  passengers: [{ cabin_class: 'economy' }],
})

const offer = (id: string, total: string, segments = [segment('JFK', 'LAX', '2026-12-01T08:00:00', '2026-12-01T11:30:00')]): DuffelOffer => ({
  id,
  total_amount: total,
  total_currency: 'USD',
  base_amount: '100.00',
  owner: { iata_code: 'AA', name: 'American Airlines' },
  slices: [{ duration: 'PT6H30M', segments }],
})

describe('buildOfferRequest', () => {
  it('sends one adult passenger per adult and maps the cabin', () => {
    const body = buildOfferRequest({ origin: 'JFK', destination: 'LAX', departureDate: '2026-12-01', adults: 2, travelClass: 'BUSINESS' })
    expect(body.data.passengers).toEqual([{ type: 'adult' }, { type: 'adult' }])
    expect(body.data.cabin_class).toBe('business')
    expect(body.data.slices).toHaveLength(1)
  })

  it('adds a return slice and a non-stop limit when asked', () => {
    const body = buildOfferRequest({ origin: 'JFK', destination: 'LAX', departureDate: '2026-12-01', returnDate: '2026-12-05', adults: 1, nonStop: true })
    expect(body.data.slices[1]).toEqual({ origin: 'LAX', destination: 'JFK', departure_date: '2026-12-05' })
    expect(body.data).toHaveProperty('max_connections', 0)
  })
})

describe('toHoursMinutes', () => {
  it('turns days into hours so the screens can parse it', () => {
    expect(toHoursMinutes('P1DT2H30M')).toBe('PT26H30M')
    expect(toHoursMinutes('PT05H10M')).toBe('PT5H10M')
  })

  it('falls back to the departure and arrival times when the duration is missing', () => {
    expect(toHoursMinutes(null, '2026-12-01T08:00:00', '2026-12-01T09:45:00')).toBe('PT1H45M')
  })
})

describe('toAmadeusShape', () => {
  it('sorts by price, applies the price cap and fills the carrier names', () => {
    const { data, dictionaries } = toAmadeusShape([offer('b', '300.00'), offer('a', '150.00'), offer('c', '900.00')], 500)
    expect(data.map((o) => o.id)).toEqual(['a', 'b'])
    expect(dictionaries.carriers.AA).toBe('American Airlines')
    expect(dictionaries.aircraft['321']).toBe('Airbus A321')
  })

  it('produces offers the existing screen transform reads correctly', () => {
    const oneStop = offer('x', '220.50', [
      segment('JFK', 'ORD', '2026-12-01T08:00:00', '2026-12-01T10:00:00', '10'),
      segment('ORD', 'LAX', '2026-12-01T11:00:00', '2026-12-01T13:30:00', '20'),
    ])
    const { data, dictionaries } = toAmadeusShape([oneStop])
    const [flight] = transformFlightOffers(
      data as unknown as AmadeusFlightOffer[],
      dictionaries as AmadeusDictionaries,
    )
    expect(flight.price).toBe(220.5)
    expect(flight.airline).toBe('American Airlines')
    expect(flight.stops).toBe(1)
    expect(flight.stopLocations).toEqual(['ORD'])
    expect(flight.durationMinutes).toBe(390)
    expect(flight.segments[1].flightNumber).toBe('AA20')
    expect(flight.cabin).toBe('ECONOMY')
    expect(flight.seatsAvailable).toBe(0)
  })
})
