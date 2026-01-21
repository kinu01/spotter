import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Flight } from '@/shared/types/api.types'
import { aggregateByAirline, type ChartDataPoint } from '../utils/chartData'
import { formatPrice } from '@/shared/utils/format'

interface PriceChartProps {
  flights: Flight[]
}

const COLORS = [
  '#3B82F6', // blue-500
  '#6366F1', // indigo-500
  '#8B5CF6', // violet-500
  '#A855F7', // purple-500
  '#D946EF', // fuchsia-500
  '#EC4899', // pink-500
  '#F43F5E', // rose-500
  '#EF4444', // red-500
]

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: ChartDataPoint }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900">{data.airline}</p>
      <p className="text-sm text-gray-600">
        From <span className="font-medium">{formatPrice(data.minPrice)}</span>
      </p>
      <p className="text-sm text-gray-500">
        {data.count} {data.count === 1 ? 'flight' : 'flights'}
      </p>
    </div>
  )
}

export function PriceChart({ flights }: PriceChartProps) {
  const chartData = useMemo(() => aggregateByAirline(flights), [flights])

  if (flights.length === 0 || chartData.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Price by Airline
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <XAxis
              dataKey="airline"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
            <Bar dataKey="minPrice" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
