import React from 'react';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ tasks, project, onTaskClick, onAddTask }) => {
  const defaultColumns = [
    { id: 'todo', title: 'TODO', color: '#6B7280' },
    { id: 'in_progress', title: 'IN PROGRESS', color: '#1D4ED8' },
    { id: 'review', title: 'REVIEW', color: '#D97706' },
    { id: 'done', title: 'DONE', color: '#065F46' }
  ];

  const columns = project?.customStatuses && project.customStatuses.length > 0
    ? project.customStatuses.map(status => ({
        id: status.name.toLowerCase().replace(' ', '_'),
        title: status.name.toUpperCase(),
        color: status.color
      }))
    : defaultColumns;

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
      {columns.map(col => (
        <KanbanColumn
          key={col.id}
          title={col.title}
          status={col.id}
          color={col.color}
          tasks={tasks.filter(t => {
            const normalizedStatus = t.status ? t.status.toLowerCase().replace(' ', '_') : 'todo';
            return normalizedStatus === col.id;
          })}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
