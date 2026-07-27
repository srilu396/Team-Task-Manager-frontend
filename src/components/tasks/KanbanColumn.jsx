import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ title, status, color, tasks = [], onTaskClick, onAddTask }) => {
  return (
    <div className="flex flex-col bg-slate-50/80 rounded-2xl w-[320px] shrink-0 max-h-full border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Column Header */}
      <div 
        className="p-3.5 flex items-center justify-between border-b border-gray-200/80 bg-white"
        style={color ? { borderTop: `4px solid ${color}` } : { borderTop: '4px solid #64748B' }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: color || '#64748B' }} 
          />
          <h3 className="font-bold text-[13px] text-gray-800 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200/60">
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 overflow-y-auto custom-scrollbar transition-colors duration-200 min-h-[160px] ${
              snapshot.isDraggingOver
                ? 'bg-indigo-50/40 ring-2 ring-indigo-400/50 ring-inset rounded-b-2xl'
                : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <TaskCard
                    task={task}
                    onClick={() => onTaskClick(task)}
                    dragProvided={dragProvided}
                    snapshot={dragSnapshot}
                  />
                )}
              </Draggable>
            ))}
            
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-[13px] font-medium text-gray-400 border-2 border-dashed border-gray-200/80 rounded-xl mb-3">
                Drop tasks here
              </div>
            )}

            {onAddTask && (
              <button 
                onClick={() => onAddTask(status)}
                className="w-full flex items-center justify-center gap-2 py-2 mt-1 text-[13px] font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all border border-dashed border-gray-200 hover:border-indigo-200"
              >
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
