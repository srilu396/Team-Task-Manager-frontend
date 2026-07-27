import React, { useState, useContext } from 'react';
import useDashboardQuery from '../hooks/useDashboardQuery';
import { useTasksQuery, useUpdateTaskMutation } from '../hooks/useTasksQuery';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import CustomSelect from '../components/ui/CustomSelect';
import { UserCheck, Clock, CheckCircle, AlertCircle, Calendar, ChevronDown, ChevronRight, MessageSquare, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskModal from '../components/tasks/TaskModal';

const MemberDashboard = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardQuery();
  const { user } = useContext(AuthContext);

  if (statsLoading) {
    return (
      <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
        <Skeleton className="h-10 w-1/3 mb-6 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <MemberDashboardContent 
      stats={stats} 
      user={user} 
    />
  );
};

const MemberDashboardContent = ({ stats, user }) => {
  const userId = user?.id || user?._id;
  const { data: tasks = [], isLoading: tasksLoading } = useTasksQuery({ assignedTo: userId });
  const updateTaskMutation = useUpdateTaskMutation();

  const [activeTab, setActiveTab] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { showToast } = useContext(ToastContext);

  // Persistent Collapse State in localStorage
  const [collapsedProjects, setCollapsedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('tasknova_collapsed_member_projects');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleProjectCollapse = (projName) => {
    setCollapsedProjects((prev) => {
      const next = { ...prev, [projName]: !prev[projName] };
      try {
        localStorage.setItem('tasknova_collapsed_member_projects', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const getTabCount = (tab) => {
    if (tab === 'All') return tasks.length;
    if (tab === 'In Progress') return tasks.filter((t) => t.status === 'in_progress').length;
    if (tab === 'Todo') return tasks.filter((t) => t.status === 'todo').length;
    if (tab === 'Review') return tasks.filter((t) => t.status === 'review').length;
    if (tab === 'Testing') return tasks.filter((t) => t.status === 'testing').length;
    if (tab === 'Done') return tasks.filter((t) => t.status === 'done').length;
    return 0;
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const statusLabels = { todo: 'Todo', in_progress: 'In Progress', review: 'Review', testing: 'Testing', done: 'Done' };
    updateTaskMutation.mutate(
      { id: taskId, taskData: { status: newStatus } },
      {
        onSuccess: () => {
          showToast(`Status updated to ${statusLabels[newStatus] || newStatus}`, 'success');
        },
        onError: () => {
          showToast('Failed to update task status', 'error');
        },
      }
    );
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Filter tasks by active tab
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'In Progress') return t.status === 'in_progress';
    if (activeTab === 'Todo') return t.status === 'todo';
    if (activeTab === 'Review') return t.status === 'review';
    if (activeTab === 'Done') return t.status === 'done';
    return true;
  });

  // Group by project
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const pName = task.project?.name || 'Unassigned Project';
    if (!acc[pName]) acc[pName] = [];
    acc[pName].push(task);
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">My Workspace</h1>
          <p className="text-[14px] text-gray-500">Track your assigned work, project health, and deadlines</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {/* Card 1 */}
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <UserCheck size={24} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{tasks.length}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Assigned to Me</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Total workload in your queue
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <Clock size={24} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{getTabCount('In Progress')}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">In Progress</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Tasks currently active
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <CheckCircle size={24} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{getTabCount('Done')}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Completed</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Successfully finished tasks
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <AlertCircle size={24} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{stats?.myOverdueTasks || 0}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Overdue Tasks</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Past deadline tasks
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL TAB FILTER */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4 mb-6">
          {['All', 'Todo', 'In Progress', 'Review', 'Done'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        {tasksLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No tasks found</p>
            <p className="text-xs text-gray-400 mt-1">You have no tasks matching this tab status.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([projectName, projTasks]) => {
              const isCollapsed = Boolean(collapsedProjects[projectName]);

              // Calculate summary metrics for project group
              const totalCount = projTasks.length;
              const completedCount = projTasks.filter((t) => t.status === 'done').length;
              const inProgressCount = projTasks.filter((t) => t.status === 'in_progress').length;
              const overdueCount = projTasks.filter((t) => {
                if (t.status === 'done' || !t.dueDate) return false;
                return new Date(t.dueDate).getTime() < Date.now();
              }).length;

              const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={projectName}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all"
                >
                  {/* PROJECT SUMMARY HEADER CARD */}
                  <div className="p-4 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/50 border-b border-gray-100 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleProjectCollapse(projectName)}
                          className="p-1 hover:bg-gray-200/60 text-gray-600 rounded-lg transition-colors"
                          title={isCollapsed ? 'Expand Project Tasks' : 'Collapse Project Tasks'}
                        >
                          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <FolderKanban className="w-4 h-4 text-indigo-500 shrink-0" />
                        <h3 className="font-bold text-gray-900 text-sm truncate">{projectName}</h3>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg">
                          {totalCount} Tasks
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg">
                          {completedCount} Done
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg">
                          {inProgressCount} Active
                        </span>
                        {overdueCount > 0 && (
                          <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-lg">
                            {overdueCount} Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600 shrink-0">{completionPct}%</span>
                    </div>
                  </div>

                  {/* COLLAPSIBLE TASK LIST */}
                  {!isCollapsed && (
                    <div className="p-3 space-y-2">
                      {projTasks.map((task) => (
                        <div
                          key={task._id}
                          className="p-4 bg-white border border-gray-200 hover:border-indigo-300 rounded-xl transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 hover:text-indigo-600 text-sm truncate">
                                {task.title}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {task.comments?.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {task.comments.length}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
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

                            <div className="w-36">
                              <CustomSelect
                                options={[
                                  { value: 'todo', label: 'To Do' },
                                  { value: 'in_progress', label: 'In Progress' },
                                  { value: 'review', label: 'Review' },
                                  { value: 'testing', label: 'Testing' },
                                  { value: 'done', label: 'Done' },
                                ]}
                                value={task.status}
                                onChange={(val) => handleStatusChange(task._id, val)}
                                buttonClassName="py-1 px-2.5 text-xs bg-gray-50/90 border-gray-300 font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* TASK DETAIL MODAL */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          onTaskSaved={() => {
            setIsTaskModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default MemberDashboard;
