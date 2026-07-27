import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, Clock, Calendar, MessageSquare, Filter, ChevronDown, ChevronRight, FolderKanban, ArrowUpDown } from 'lucide-react';
import { useTasksQuery } from '../hooks/useTasksQuery';
import { useProjectsQuery } from '../hooks/useProjectsQuery';
import { AuthContext } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import CustomSelect from '../components/ui/CustomSelect';
import TaskModal from '../components/tasks/TaskModal';

const Tasks = () => {
  const { user } = useContext(AuthContext);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Persistent Collapse State in localStorage
  const [collapsedProjects, setCollapsedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('tasknova_collapsed_projects');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Per-project sub-status quick filters
  const [projectSubFilters, setProjectSubFilters] = useState({});

  const toggleProjectCollapse = (projId) => {
    setCollapsedProjects((prev) => {
      const next = { ...prev, [projId]: !prev[projId] };
      try {
        localStorage.setItem('tasknova_collapsed_projects', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const setSubFilter = (projId, status) => {
    setProjectSubFilters((prev) => ({ ...prev, [projId]: status }));
  };

  const queryFilters = useMemo(() => {
    const raw = { ...filters, search: debouncedSearch };
    return Object.fromEntries(
      Object.entries(raw).filter(([_, v]) => v !== '')
    );
  }, [filters.status, filters.priority, debouncedSearch]);

  const { data: tasks = [], isLoading: tasksLoading, refetch } = useTasksQuery(queryFilters);
  const { data: projects = [] } = useProjectsQuery();

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const getStatusBadge = (task) => {
    const status = task.status;
    const proj = projects.find((p) => p._id === (task.project?._id || task.project));
    if (proj?.customStatuses && proj.customStatuses.length > 0) {
      const match = proj.customStatuses.find(
        (s) => s.name.toLowerCase().replace(' ', '_') === status.toLowerCase().replace(' ', '_')
      );
      if (match) {
        return <Badge color={match.color}>{match.name}</Badge>;
      }
    }
    const colors = {
      todo: 'gray',
      in_progress: 'blue',
      review: 'yellow',
      testing: 'purple',
      done: 'green',
    };
    const labels = {
      todo: 'To Do',
      in_progress: 'In Progress',
      review: 'Review',
      testing: 'Testing',
      done: 'Done',
    };
    return <Badge color={colors[status] || 'gray'}>{labels[status] || status}</Badge>;
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'testing', label: 'Testing' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  // Group tasks by project
  const groupedProjects = useMemo(() => {
    const map = new Map();

    // First initialize map with all projects
    projects.forEach((proj) => {
      map.set(proj._id, {
        id: proj._id,
        name: proj.name,
        status: proj.status || 'active',
        tasks: [],
        rawProject: proj,
      });
    });

    // Add unassigned bucket
    map.set('unassigned', {
      id: 'unassigned',
      name: 'Unassigned Tasks',
      status: 'active',
      tasks: [],
    });

    // Populate tasks into respective buckets
    tasks.forEach((t) => {
      const pId = t.project?._id || t.project || 'unassigned';
      if (!map.has(pId)) {
        map.set(pId, {
          id: pId,
          name: t.project?.name || 'Workspace Project',
          status: 'active',
          tasks: [],
        });
      }
      map.get(pId).tasks.push(t);
    });

    // Filter out empty projects if a global search or status filter is active
    return Array.from(map.values()).filter((group) => {
      if (filters.search || filters.status || filters.priority) {
        return group.tasks.length > 0;
      }
      return group.tasks.length > 0 || group.id !== 'unassigned';
    });
  }, [tasks, projects, filters]);

  return (
    <div className="p-4 sm:p-[24px] max-w-[1400px] mx-auto space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Tasks Explorer</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            View, search, and manage tasks grouped by project with live progress tracking
          </p>
        </div>
      </div>

      {/* Global Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search tasks by title..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="w-full md:w-48">
          <CustomSelect
            options={statusOptions}
            value={filters.status}
            onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
            placeholder="Status..."
          />
        </div>

        <div className="w-full md:w-48">
          <CustomSelect
            options={priorityOptions}
            value={filters.priority}
            onChange={(val) => setFilters((prev) => ({ ...prev, priority: val }))}
            placeholder="Priority..."
          />
        </div>

        {(filters.search || filters.status || filters.priority) && (
          <button
            onClick={() => setFilters({ search: '', status: '', priority: '' })}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* PROJECT-WISE TASK GROUPS */}
      {tasksLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
              <Skeleton className="h-8 w-1/3 rounded-xl" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : groupedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
          <Filter size={36} className="text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No matching tasks found</h3>
          <p className="text-xs text-gray-500 max-w-sm text-center">
            Try adjusting your search criteria or removing active filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedProjects.map((group) => {
            const isCollapsed = Boolean(collapsedProjects[group.id]);
            const subFilter = projectSubFilters[group.id] || 'all';

            // Metrics calculation
            const totalTasks = group.tasks.length;
            const completedTasks = group.tasks.filter((t) => t.status === 'done').length;
            const inProgressTasks = group.tasks.filter((t) => t.status === 'in_progress').length;
            const overdueTasks = group.tasks.filter((t) => {
              if (t.status === 'done' || !t.dueDate) return false;
              return new Date(t.dueDate).getTime() < Date.now();
            }).length;

            const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Apply per-project quick status filter
            const filteredProjectTasks = group.tasks.filter((t) => {
              if (subFilter === 'all') return true;
              return t.status === subFilter;
            });

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all"
              >
                {/* PROJECT SUMMARY HEADER CARD */}
                <div className="p-5 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/50 border-b border-gray-100 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Title + Status Badge */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleProjectCollapse(group.id)}
                        className="p-1.5 hover:bg-gray-200/60 text-gray-600 rounded-lg transition-colors"
                        title={isCollapsed ? 'Expand Project Tasks' : 'Collapse Project Tasks'}
                      >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-indigo-600 shrink-0" />
                        <h2 className="text-lg font-bold text-gray-900 truncate">{group.name}</h2>
                        <Badge color={group.status === 'active' ? 'green' : 'gray'} className="capitalize text-xs">
                          {group.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Stat Breakdown Pills */}
                    <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
                        {totalTasks} Tasks
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl">
                        {completedTasks} Completed
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl">
                        {inProgressTasks} In Progress
                      </span>
                      {overdueTasks > 0 && (
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-xl">
                          {overdueTasks} Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Completion Progress Bar */}
                  <div className="w-full flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 shrink-0 min-w-[45px] text-right">
                      {completionPct}%
                    </span>
                  </div>

                  {/* Quick Filters Per Project */}
                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      <span className="text-xs text-gray-400 font-semibold mr-1">Filter:</span>
                      {[
                        { key: 'all', label: 'All', count: totalTasks },
                        { key: 'todo', label: 'To Do', count: group.tasks.filter((t) => t.status === 'todo').length },
                        { key: 'in_progress', label: 'In Progress', count: inProgressTasks },
                        { key: 'review', label: 'Review', count: group.tasks.filter((t) => t.status === 'review').length },
                        { key: 'done', label: 'Done', count: completedTasks },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setSubFilter(group.id, tab.key)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                            subFilter === tab.key
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* TASK TABLE (COLLAPSIBLE) */}
                {!isCollapsed && (
                  <div>
                    {filteredProjectTasks.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 font-medium">
                        No tasks match the selected status filter for this project.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[750px]">
                          <thead>
                            <tr className="bg-gray-50/60 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <th className="px-6 py-3.5">Task</th>
                              <th className="px-6 py-3.5">Status</th>
                              <th className="px-6 py-3.5">Priority</th>
                              <th className="px-6 py-3.5">Assignee</th>
                              <th className="px-6 py-3.5">Due Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredProjectTasks.map((task) => (
                              <tr
                                key={task._id}
                                onClick={() => handleTaskClick(task)}
                                className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                              >
                                <td className="px-6 py-3.5">
                                  <div>
                                    <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors block">
                                      {task.title}
                                    </span>
                                    {task.description && (
                                      <span className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                        {task.description}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5">{getStatusBadge(task)}</td>
                                <td className="px-6 py-3.5">
                                  <Badge
                                    color={
                                      task.priority === 'high'
                                        ? 'red'
                                        : task.priority === 'medium'
                                        ? 'yellow'
                                        : 'blue'
                                    }
                                    className="capitalize text-xs font-medium"
                                  >
                                    {task.priority || 'medium'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-3.5">
                                  {task.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar
                                        name={task.assignedTo.fullName}
                                        src={task.assignedTo.profileImage || task.assignedTo.avatar}
                                        size="xs"
                                      />
                                      <span className="text-xs font-medium text-gray-700">
                                        {task.assignedTo.fullName}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 text-xs text-gray-500 font-medium">
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdated={() => refetch()}
        />
      )}
    </div>
  );
};

export default Tasks;
