import React from 'react';
import { Link } from 'react-router-dom';
import { ListTodo, ChevronRight } from 'lucide-react';

const MyTasks = ({ tasks = [] }) => {
  const displayTasks = tasks.slice(0, 5);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-amber-100 text-amber-600';
      case 'low': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-600';
      case 'review': return 'bg-purple-100 text-purple-600';
      case 'in_progress': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ListTodo className="text-blue-500 w-5 h-5" />
          <h3 className="text-[18px] font-semibold text-gray-900">My Tasks</h3>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {displayTasks.length > 0 ? (
        <div className="flex flex-col">
          {displayTasks.map((task, index) => {
            const overdue = task.status !== 'done' && isOverdue(task.dueDate);
            return (
              <Link
                key={task._id}
                to={task.project?._id ? `/projects/${task.project._id}?task=${task._id}` : '#'}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate mb-1">{task.title}</div>
                  <div className="text-xs text-gray-500 truncate">{task.project?.name || 'No Project'}</div>
                </div>
                
                <div className="flex items-center gap-4 ml-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'N/A'}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                    {task.status?.replace('_', ' ') || 'TODO'}
                  </span>
                  
                  <div className={`text-sm font-medium w-24 text-right ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                    {overdue ? 'Overdue' : task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No tasks assigned to you yet</p>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
