import React, { useState, useEffect, useContext } from 'react';
import dashboardService from '../services/dashboard.service';
import taskService from '../services/task.service';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { UserCheck, Clock, CheckCircle, AlertCircle, Calendar, ChevronDown, ChevronRight, MessageSquare, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);

  const fetchStats = async () => {
    try {
      setError(false);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
      setError(true);
      showToast('Failed to load dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error && !stats) return <div>Error loading dashboard</div>;

  return (
    <MemberDashboardContent 
      stats={stats} 
      user={user} 
      fetchStats={fetchStats}
    />
  );
};

const MemberDashboardContent = ({ stats, user, fetchStats }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [expandedTasks, setExpandedTasks] = useState({});
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks({ assignedTo: user?.id || user?._id });
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const getTabCount = (tab) => {
    if (tab === 'All') return tasks.length;
    if (tab === 'In Progress') return tasks.filter(t => t.status === 'in_progress').length;
    if (tab === 'Todo') return tasks.filter(t => t.status === 'todo').length;
    if (tab === 'Review') return tasks.filter(t => t.status === 'review').length;
    if (tab === 'Done') return tasks.filter(t => t.status === 'done').length;
    return 0;
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      showToast('Status updated successfully', 'success');
      loadTasks();
      fetchStats();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const toggleTaskExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
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
          <p className="text-[14px] text-gray-500">Track your assigned work</p>
        </div>
      </div>

      {/* MY STATS (4 small cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {/* Card 1 - Assigned to Me */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
          border: 'none'
        }}>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            top: '-20px',
            right: '-20px'
          }} />
          <div className="absolute top-4 right-4 text-white">
            <UserCheck size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{stats?.myTotalTasks || 0}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Assigned to Me</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Total workload in your queue
            </div>
          </div>
        </div>

        {/* Card 2 - In Progress */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
          border: 'none'
        }}>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            top: '-20px',
            right: '-20px'
          }} />
          <div className="absolute top-4 right-4 text-white">
            <Clock size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{stats?.myInProgressTasks || 0}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">In Progress</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Tasks currently being active
            </div>
          </div>
        </div>

        {/* Card 3 - Completed */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
          border: 'none'
        }}>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            top: '-20px',
            right: '-20px'
          }} />
          <div className="absolute top-4 right-4 text-white">
            <CheckCircle size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{stats?.myCompletedTasks || 0}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Completed</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Tasks successfully finished
            </div>
          </div>
        </div>

        {/* Card 4 - Overdue */}
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
          border: 'none'
        }}>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            top: '-20px',
            right: '-20px'
          }} />
          <div className="absolute top-4 right-4 text-white">
            <AlertCircle size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{stats?.myOverdueTasks || 0}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Overdue</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Tasks past their due date
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        {/* LEFT COL: MY TASKS */}
        <div className="lg:col-span-8 space-y-[24px]">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">My Tasks</h2>
            </div>
            
            <div className="flex overflow-x-auto scrollbar-none border-b border-gray-200 mb-4 whitespace-nowrap">
              {['All', 'In Progress', 'Todo', 'Review', 'Done'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none text-center px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-[1px] flex items-center justify-center ${
                    activeTab === tab 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ background: 'none', cursor: 'pointer' }}
                >
                  {tab}
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getTabCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-[20px] space-y-6">
              {Object.keys(groupedTasks).length === 0 ? (
                <div className="text-center py-8 text-[14px] text-gray-500">No tasks found.</div>
              ) : (
                Object.keys(groupedTasks).map(project => (
                  <div key={project} className="space-y-3">
                    <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" /> {project}
                    </h3>
                    <div className="border border-gray-200 rounded-[12px] divide-y divide-gray-100 overflow-hidden">
                      {groupedTasks[project].map(task => (
                        <div key={task._id} className="bg-white">
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => toggleTaskExpand(task._id)}>
                              <button className="mt-1 text-gray-400 hover:text-gray-600 shrink-0">
                                {expandedTasks[task._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-semibold text-[14px] text-gray-900 truncate max-w-[200px] sm:max-w-none">{task.title}</span>
                                  <Badge color={task.priority}>{task.priority}</Badge>
                                </div>
                                <div className="text-[13px] text-gray-500 flex flex-wrap items-center gap-3">
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3.5 h-3.5" /> {task.comments?.length || task.commentsCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 ml-0 sm:ml-4 w-full sm:w-auto justify-end shrink-0">
                              <select 
                                value={task.status}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                className="text-[13px] border-gray-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8 font-medium bg-gray-50 cursor-pointer w-full sm:w-auto"
                              >
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          {expandedTasks[task._id] && (
                            <div className="px-11 pb-4 pt-1 bg-gray-50 border-t border-gray-100 text-[13px] text-gray-600">
                              <p className="mb-3 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                              <button onClick={() => navigate(`/projects/${task.project?._id}?task=${task._id}`)} className="text-blue-600 font-medium hover:underline">
                                Open Full Task →
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COL: MY PROJECTS & UPCOMING */}
        <div className="lg:col-span-4 space-y-[24px]">
          
          {/* My Projects */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">My Projects</h2>
            </div>
            <div className="p-0 divide-y divide-gray-100">
              {stats?.myProjects?.length === 0 ? (
                <div className="p-5 text-center text-gray-500 text-[14px]">No projects yet.</div>
              ) : (
                stats?.myProjects?.map(project => {
                  const total = project.myTasksTotal || 0;
                  const completed = project.myTasksCompleted || 0;
                  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
                  return (
                    <div key={project._id} className="p-[20px] hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/projects/${project._id}`)}>
                      <h3 className="font-semibold text-[14px] text-gray-900 mb-2">{project.name}</h3>
                      <div className="flex justify-between text-[12px] text-gray-500 mb-1.5">
                        <span>{completed} / {total} tasks done</span>
                        <span className="font-semibold text-gray-700">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Upcoming Section */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">Due This Week</h2>
            </div>
            <div className="p-0 divide-y divide-gray-100">
              {stats?.myUpcomingTasks?.length === 0 ? (
                <div className="p-5 text-center text-gray-500 text-[14px]">No upcoming deadlines.</div>
              ) : (
                stats?.myUpcomingTasks?.map(task => (
                  <div key={task._id} className="p-[20px] flex gap-4 cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/projects/${task.project?._id}?task=${task._id}`)}>
                    <div className="flex flex-col items-center justify-center min-w-[40px] bg-gray-50 border border-gray-200 rounded-lg p-2 text-center h-[48px]">
                      <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-[16px] font-bold text-gray-900 leading-none">
                        {new Date(task.dueDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900 mb-0.5 line-clamp-1">{task.title}</div>
                      <div className="text-[13px] text-gray-500 flex items-center gap-1.5">
                        {task.project?.name || 'Project'} · <Badge color={task.priority} className="scale-90 origin-left">{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
