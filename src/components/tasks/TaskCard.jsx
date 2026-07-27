import React from 'react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { MessageSquare, Calendar, GripVertical } from 'lucide-react';

const TaskCard = ({ task, onClick, dragProvided, snapshot }) => {
  const priorityColors = {
    low: 'border-t-emerald-500',
    medium: 'border-t-amber-500',
    high: 'border-t-rose-500'
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isDragging = snapshot?.isDragging;

  return (
    <div
      ref={dragProvided?.innerRef}
      {...(dragProvided?.draggableProps || {})}
      style={dragProvided?.draggableProps?.style}
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/80 border-t-4 ${
        priorityColors[task.priority] || 'border-t-gray-300'
      } p-3.5 mb-3 cursor-pointer select-none transition-all duration-200 ${
        isDragging
          ? 'shadow-2xl ring-2 ring-indigo-500 scale-[1.03] rotate-[1.5deg] z-50 opacity-95 bg-indigo-50/20'
          : 'hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300'
      } ${isOverdue ? 'ring-1 ring-rose-500/50' : ''}`}
    >
      <div className="flex justify-between items-center mb-2">
        <Badge color={task.priority}>{task.priority}</Badge>
        {dragProvided && (
          <div
            {...dragProvided.dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to move"
            aria-label="Drag task"
          >
            <GripVertical size={16} />
          </div>
        )}
      </div>

      <h4 className="font-bold text-[14px] text-gray-900 mb-1 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      <div className="text-[12px] text-gray-400 font-medium mb-3.5 line-clamp-1">
        {task.project?.name || 'Project'}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 mt-auto">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center text-[11px] font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>
              <Calendar size={13} className="mr-1 opacity-70" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          <div className="flex items-center text-gray-400 text-[11px] font-medium">
            <MessageSquare size={13} className="mr-1 opacity-70" />
            <span>{task.comments?.length || task.commentsCount || 0}</span>
          </div>
        </div>
        <div>
          <Avatar 
            name={task.assignedTo?.fullName || 'Unassigned'} 
            src={task.assignedTo?.profileImage || task.assignedTo?.avatar} 
            size="sm" 
            className="border border-white shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
