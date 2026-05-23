import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BarChart2 } from 'lucide-react';

const PriorityChart = ({ data }) => {
  const chartData = [
    { name: 'Low', value: data?.low || 0, color: '#3B82F6' },
    { name: 'Medium', value: data?.medium || 0, color: '#F59E0B' },
    { name: 'High', value: data?.high || 0, color: '#EF4444' }
  ];

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="text-purple-500 w-5 h-5" />
        <h3 className="text-[18px] font-semibold text-gray-900">Tasks by Priority</h3>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 14 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 14 }} />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="value" position="top" fill="#374151" fontSize={14} fontWeight="bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriorityChart;
