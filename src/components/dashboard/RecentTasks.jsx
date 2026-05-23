import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentTasks = ({ tasks = [] }) => {
  const displayTasks = tasks.slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-600';
      case 'review': return 'bg-purple-100 text-purple-600';
      case 'in_progress': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-orange-500 w-5 h-5" />
        <h3 className="text-[18px] font-semibold text-gray-900">Recent Tasks</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {displayTasks.length > 0 ? (
          <div className="space-y-4">
            {displayTasks.map(task => (
              <Link
                key={task._id}
                to={task.project?._id ? `/projects/${task.project._id}?task=${task._id}` : '#'}
                className="block p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-1 flex-1 pr-4">{task.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(task.status)}`}>
                    {task.status?.replace('_', ' ') || 'TODO'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="truncate max-w-[120px]">{task.project?.name || 'No Project'}</span>
                    <span>•</span>
                    <span className="truncate max-w-[100px]">{task.createdBy?.fullName || 'Unknown'}</span>
                  </div>
                  <div className="text-gray-400 text-xs whitespace-nowrap">
                    {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Clock className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No recent tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTasks;
