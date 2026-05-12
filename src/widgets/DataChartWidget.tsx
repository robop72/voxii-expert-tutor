import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts';

export interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface DataChartWidgetProps {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  chartType?: 'bar' | 'line';
  data: DataPoint[];
}

const DEFAULT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function DataChartWidget({ title, xLabel, yLabel, chartType = 'bar', data }: DataChartWidgetProps) {
  return (
    <div className="my-4 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700 flex items-center gap-2">
        <span className="text-sm">📊</span>
        <span className="text-xs font-medium text-gray-300">{title ?? 'Data Chart'}</span>
      </div>

      <div className="p-4 bg-gray-900/60">
        <ResponsiveContainer width="100%" height={260}>
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 11 } : undefined} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 11 } : undefined} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
