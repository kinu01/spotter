import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Flight } from '@/shared/types/api.types'
import { getPriceDistribution, type PriceDistribution } from '../utils/chartData'

interface PriceDistributionChartProps {
  flights: Flight[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: PriceDistribution }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900">{data.range}</p>
      <p className="text-sm text-gray-600">
        {data.count} {data.count === 1 ? 'flight' : 'flights'}
      </p>
    </div>
  )
}

export function PriceDistributionChart({ flights }: PriceDistributionChartProps) {
  const chartData = useMemo(() => getPriceDistribution(flights), [flights])

  if (flights.length === 0 || chartData.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Price Distribution
      </h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="range"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={45}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0EA5E9"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
