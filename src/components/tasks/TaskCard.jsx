import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { MessageSquare, Calendar } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const priorityColors = {
    low: 'border-t-green-500',
    medium: 'border-t-amber-500',
    high: 'border-t-red-500'
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[12px] border border-gray-200 border-t-4 ${priorityColors[task.priority] || 'border-t-gray-300'} p-4 mb-3 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all ${isOverdue ? 'ring-1 ring-red-500' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge color={task.priority}>{task.priority}</Badge>
      </div>
      
      <h4 className="font-semibold text-[14px] text-gray-900 mb-1 line-clamp-2">{task.title}</h4>
      <div className="text-[12px] text-gray-500 mb-4 line-clamp-1">
        {task.project?.name || 'Project'}
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center text-[12px] ${isOverdue ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              <Calendar size={14} className="mr-1" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          <div className="flex items-center text-gray-500 text-[12px]">
            <MessageSquare size={14} className="mr-1" />
            <span>{task.comments?.length || task.commentsCount || 0}</span>
          </div>
        </div>
        <div>
          <Avatar name={task.assignedTo?.fullName || 'Unassigned'} src={task.assignedTo?.profileImage || task.assignedTo?.avatar} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
