import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildOfferRequest, toAmadeusShape, type DuffelOffer, type SearchParams } from './_duffel.js'

type FlightSearchParams = SearchParams

async function searchFlights(params: FlightSearchParams) {
  const token = process.env.DUFFEL_ACCESS_TOKEN
  if (!token) {
    throw new Error('Duffel API token not configured')
  }

  const response = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=20000', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Duffel-Version': 'v2',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildOfferRequest(params)),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Flight search failed: ${error}`)
  }

  const body = (await response.json()) as { data?: { offers?: DuffelOffer[] } }
  return toAmadeusShape(body.data?.offers ?? [], params.maxPrice)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const params: FlightSearchParams = req.body

    // Validate required parameters
    if (!params.origin || !params.destination || !params.departureDate || !params.adults) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: origin, destination, departureDate, adults',
      })
    }

    // Validate IATA codes (3 letters)
    const iataPattern = /^[A-Z]{3}$/
    if (!iataPattern.test(params.origin) || !iataPattern.test(params.destination)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IATA code. Must be 3 uppercase letters.',
      })
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(params.departureDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD.',
      })
    }

    const data = await searchFlights(params)

    return res.status(200).json({
      success: true,
      data: data.data,
      dictionaries: data.dictionaries,
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    })
  }
}
