'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  score: number;
  label?: string;
}

interface MasteryChartProps {
  data: DataPoint[];
  height?: number;
}

// Custom tooltip component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-cream-300 p-3">
      <p className="text-sm text-charcoal-light mb-1">{label}</p>
      <p className="text-lg font-semibold text-charcoal">
        {payload[0].value}%
      </p>
    </div>
  );
}

export function MasteryChart({ data, height = 300 }: MasteryChartProps) {
  // Format data for display
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      displayDate: point.label || point.date,
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-cream-50 rounded-xl border border-cream-300"
        style={{ height }}
      >
        <p className="text-charcoal-light">No data available yet</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E8E4DD"
            vertical={false}
          />
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#E07856"
            strokeWidth={3}
            dot={{
              fill: '#E07856',
              stroke: '#fff',
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              fill: '#E07856',
              stroke: '#fff',
              strokeWidth: 2,
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
