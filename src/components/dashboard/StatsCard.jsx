import React, { useState, useEffect } from 'react';

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

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, subtitle }) => {
  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            <CountUp end={value} />
          </div>
          <div className="text-sm text-gray-500 font-medium mt-1">{title}</div>
        </div>
        <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
          <Icon size={24} />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="mt-2">
          {trend ? (
            <div className={`text-sm font-medium flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
              {trend === 'up' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
              {trend === 'down' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>}
              {trendValue}
            </div>
          ) : (
            <div className="text-sm font-medium text-gray-500">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
