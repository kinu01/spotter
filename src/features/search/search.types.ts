export type { FlightSearchParams } from '@/shared/types/api.types'

export type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'

export interface SearchFormData {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  adults: number
  travelClass: TravelClass
}
