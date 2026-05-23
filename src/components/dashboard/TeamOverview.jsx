import React from 'react';
import Avatar from '../ui/Avatar';

const TeamOverview = ({ members }) => {
  if (!members || members.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Team Overview</h2>
      
      <div className="space-y-4">
        {members.map(member => {
          const total = member.totalTasks || 0;
          const completed = member.completedTasks || 0;
          const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={member.fullName} src={member.profileImage || member.avatar} size="md" />
                <div>
                  <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{completed} completed / {member.inProgressTasks} in progress / {total} total</span>
                  <span className="font-medium text-gray-700">{pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamOverview;
