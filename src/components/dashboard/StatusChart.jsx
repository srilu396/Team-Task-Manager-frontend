import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const CountUp = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}</span>;
};

const StatusChart = ({ data, totalTasks }) => {
  const chartData = [
    { name: 'Todo', value: data?.todo || 0, color: '#9CA3AF' },
    { name: 'In Progress', value: data?.in_progress || 0, color: '#3B82F6' },
    { name: 'Review', value: data?.review || 0, color: '#F59E0B' },
    { name: 'Done', value: data?.done || 0, color: '#10B981' }
  ].filter(item => item.value > 0);

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-600 font-medium">{entry.value}</span>
            <span className="text-gray-900 font-bold">{entry.payload.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="text-blue-500 w-5 h-5" />
        <h3 className="text-[18px] font-semibold text-gray-900">Tasks by Status</h3>
      </div>
      
      <div className="flex-1 relative">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend content={renderCustomLegend} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-gray-900"><CountUp end={totalTasks} /></span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No task data available
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusChart;
