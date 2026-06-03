import React, { useState, useEffect, useContext } from 'react';
import { Search } from 'lucide-react';
import taskService from '../services/task.service';
import projectService from '../services/project.service';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import TaskModal from '../components/tasks/TaskModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const fetchTasks = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      // Clean empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      // Force fetching only my tasks if not admin
      if (user?.role !== 'admin' && (user?.id || user?._id)) {
        cleanFilters.assignedTo = user.id || user._id;
      }
      const data = await taskService.getTasks(cleanFilters);
      setTasks(data);
    } catch (error) {
      showToast('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const getStatusBadge = (task) => {
    const status = task.status;
    const proj = projects.find(p => p._id === task.project?._id) || task.project;
    if (proj?.customStatuses && proj.customStatuses.length > 0) {
      const match = proj.customStatuses.find(s => s.name.toLowerCase().replace(' ', '_') === status.toLowerCase().replace(' ', '_'));
      if (match) {
        return <Badge color={match.color}>{match.name}</Badge>;
      }
    }
    const colors = {
      todo: 'gray',
      in_progress: 'blue',
      review: 'yellow',
      done: 'green'
    };
    const labels = {
      todo: 'To Do',
      in_progress: 'In Progress',
      review: 'Review',
      done: 'Done'
    };
    return <Badge color={colors[status] || 'gray'}>{labels[status] || status}</Badge>;
  };

  // Group by project
  const groupedTasks = tasks.reduce((acc, task) => {
    const pName = task.project?.name || 'Unassigned Project';
    if (!acc[pName]) acc[pName] = [];
    acc[pName].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">View and filter across all projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
        </div>
        

        
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[120px]"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        
        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[120px]"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Task List grouped by Project */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4 text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          No tasks found matching your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedTasks).map(projectName => (
            <div key={projectName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                  {projectName}
                </h2>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                  {groupedTasks[projectName].length} {groupedTasks[projectName].length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 w-1/3">Title</th>
                      <th className="px-6 py-3">Assignee</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3 text-right">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedTasks[projectName].map(task => (
                      <tr 
                        key={task._id} 
                        onClick={() => handleTaskClick(task)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate" title={task.title}>
                          {task.title}
                        </td>
                        <td className="px-6 py-4">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-2" title={task.assignedTo.fullName}>
                              <Avatar name={task.assignedTo.fullName} src={task.assignedTo.profileImage || task.assignedTo.avatar} size="sm" />
                              <span className="text-sm text-gray-700 hidden lg:inline">{task.assignedTo.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(task)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={
                            task.priority === 'high' ? 'red' : 
                            task.priority === 'medium' ? 'blue' : 'gray'
                          }>
                            {task.priority}
                          </Badge>
                        </td>
                        <td className={`px-6 py-4 text-right text-sm ${
                          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
                            ? 'text-red-500 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        project={selectedTask ? projects.find(p => p._id === selectedTask.project._id) : null}
        isNew={false}
        onTaskUpdated={() => fetchTasks(false)}
      />
    </div>
  );
};

export default Tasks;
