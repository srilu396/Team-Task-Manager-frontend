import React from 'react';
import { AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

const OverdueTasks = ({ tasks = [], onMarkDone, isAdmin }) => {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-[18px] font-semibold text-gray-900">Overdue Tasks</h3>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {tasks.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => {
          const daysOverdue = differenceInDays(new Date(), new Date(task.dueDate));
          return (
            <div key={task._id} className="bg-white rounded-lg border border-red-100 border-l-4 border-l-red-500 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{task.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{task.project?.name || 'No Project'}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold border border-gray-200">
                    {getInitials(task.assignedTo?.fullName)}
                  </div>
                  <span className="text-sm text-gray-700">{task.assignedTo?.fullName || 'Unassigned'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-red-50">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-red-600 font-medium text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <span className="text-xs text-red-500">{daysOverdue > 0 ? `${daysOverdue} days overdue` : 'Due today'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onMarkDone && onMarkDone(task._id)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors tooltip-trigger relative group"
                    title="Mark Done"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  {isAdmin && (
                    <button 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors tooltip-trigger relative group"
                      title="Reassign"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverdueTasks;
