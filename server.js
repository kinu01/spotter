import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Cache for Amadeus token
let cachedToken = null
let tokenExpiry = 0

async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken
  }

  const clientId = process.env.AMADEUS_CLIENT_ID
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured. Check your .env file.')
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

  const data = await response.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000

  return cachedToken
}

async function searchFlights(params, token) {
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

// Flight search endpoint
app.post('/api/flights', async (req, res) => {
  try {
    const params = req.body

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

    console.log(`Searching flights: ${params.origin} → ${params.destination} on ${params.departureDate}`)

    const token = await getAccessToken()
    const data = await searchFlights(params, token)

    console.log(`Found ${data.data?.length || 0} flights`)

    return res.json({
      success: true,
      data: data.data,
      dictionaries: data.dictionaries,
    })
  } catch (error) {
    console.error('Flight search error:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred',
    })
  }
})

app.listen(PORT, () => {
  console.log(`\n🛫 Spotter API server running at http://localhost:${PORT}`)
  console.log(`   POST /api/flights - Search for flights\n`)
})
