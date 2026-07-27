import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import taskService from '../../services/task.service';
import { ToastContext } from '../../context/ToastContext';

const KanbanBoard = ({ tasks = [], project, onTaskClick, onAddTask, onTaskUpdated }) => {
  const { showToast } = useContext(ToastContext);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const defaultColumns = [
    { id: 'todo', title: 'TODO', color: '#64748B' },
    { id: 'in_progress', title: 'IN PROGRESS', color: '#2563EB' },
    { id: 'review', title: 'REVIEW', color: '#D97706' },
    { id: 'testing', title: 'TESTING', color: '#8B5CF6' },
    { id: 'done', title: 'DONE', color: '#10B981' }
  ];

  const columns = project?.customStatuses && project.customStatuses.length > 0
    ? project.customStatuses.map(status => ({
        id: status.name.toLowerCase().replace(' ', '_'),
        title: status.name.toUpperCase(),
        color: status.color
      }))
    : defaultColumns;

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // 1. Return early if dropped outside any column or dropped in exact same column & index
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const draggedTask = localTasks.find(t => t._id === draggableId);
    if (!draggedTask) return;

    // Save previous state for rollback
    const previousTasks = [...localTasks];

    // 2. Optimistic local state update
    const updatedTasks = localTasks.map(t =>
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setLocalTasks(updatedTasks);

    try {
      // 3. Send API request to backend
      const updated = await taskService.updateTask(draggableId, { status: newStatus });
      
      const colObj = columns.find(c => c.id === newStatus);
      const colTitle = colObj ? colObj.title : newStatus.toUpperCase().replace('_', ' ');
      
      // 4. Success feedback
      showToast(`Moved "${draggedTask.title}" to ${colTitle}`, 'success');
      
      if (onTaskUpdated) {
        onTaskUpdated(updated);
      }
    } catch (error) {
      // 5. Rollback on failure
      setLocalTasks(previousTasks);
      showToast(error.response?.data?.message || 'Failed to update task status', 'error');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-6 h-[calc(100vh-220px)] custom-scrollbar select-none">
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            status={col.id}
            color={col.color}
            tasks={localTasks.filter(t => {
              const normalizedStatus = t.status ? t.status.toLowerCase().replace(' ', '_') : 'todo';
              return normalizedStatus === col.id;
            })}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
