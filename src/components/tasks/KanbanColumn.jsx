import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ title, status, color, tasks, onTaskClick, onAddTask }) => {
  return (
    <div className="flex flex-col bg-gray-50 rounded-[12px] w-[320px] shrink-0 max-h-full border border-gray-200 shadow-sm">
      <div 
        className="p-4 flex items-center justify-between border-b border-gray-200 bg-gray-100 rounded-t-[12px]"
        style={color ? { borderTop: `4px solid ${color}` } : {}}
      >
        <h3 className="font-semibold text-[13px] text-gray-700 uppercase tracking-wider">
          {title} ({tasks.length})
        </h3>
      </div>
      
      <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
        {tasks.map(task => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onClick={() => onTaskClick(task)} 
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-4 text-[14px] text-gray-500 border-2 border-dashed border-gray-200 rounded-[12px] mb-3">
            No tasks
          </div>
        )}
        
        <button 
          onClick={() => onAddTask(status)}
          className="w-full flex items-center justify-center gap-2 py-2 mt-1 text-[14px] font-medium text-gray-600 hover:bg-gray-200 rounded-[8px] transition-colors"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;
