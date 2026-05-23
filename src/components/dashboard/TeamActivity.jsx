import React from 'react';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TeamActivity = ({ activities = [] }) => {
  const displayActivities = activities.slice(0, 5);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-emerald-500 w-5 h-5" />
        <h3 className="text-[18px] font-semibold text-gray-900">Team Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {displayActivities.length > 0 ? (
          <div className="space-y-6">
            {displayActivities.map((activity, index) => (
              <div key={activity._id || index} className="flex gap-4">
                <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm z-10 relative">
                    {getInitials(activity.user?.fullName)}
                  </div>
                  {index !== displayActivities.length - 1 && (
                    <div className="absolute top-10 bottom-[-24px] left-1/2 w-0.5 bg-gray-100 -translate-x-1/2 z-0"></div>
                  )}
                </div>
                
                <div className="flex-1 pt-2 pb-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold text-gray-900">{activity.user?.fullName || 'Someone'}</span>
                    {' '}
                    <span className="text-gray-600">{activity.action || 'performed an action'}</span>
                    {' '}
                    {activity.target && (
                      <span className="font-medium text-gray-900">{activity.target}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Activity className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No recent team activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamActivity;
