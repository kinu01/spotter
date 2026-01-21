import type { VercelRequest, VercelResponse } from '@vercel/node'

interface AmadeusTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  travelClass?: string
  nonStop?: boolean
  maxPrice?: number
}

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken
  }

  const clientId = process.env.AMADEUS_CLIENT_ID
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured')
  }

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data: AmadeusTokenResponse = await response.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000

  return cachedToken
}

async function searchFlights(params: FlightSearchParams, token: string) {
  const searchParams = new URLSearchParams({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: params.adults.toString(),
    currencyCode: 'USD',
    max: '50',
  })

  if (params.returnDate) {
    searchParams.append('returnDate', params.returnDate)
  }

  if (params.travelClass) {
    searchParams.append('travelClass', params.travelClass)
  }

  if (params.nonStop) {
    searchParams.append('nonStop', 'true')
  }

  if (params.maxPrice) {
    searchParams.append('maxPrice', params.maxPrice.toString())
  }

  const response = await fetch(
    `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Flight search failed: ${error}`)
  }

  return response.json()
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

    const token = await getAccessToken()
    const data = await searchFlights(params, token)

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
