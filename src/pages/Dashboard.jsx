import React, { useState, useEffect, useContext } from 'react';
import dashboardService from '../services/dashboard.service';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { FolderKanban, CheckSquare, Users, AlertCircle, Plus, Calendar, Clock, ArrowRight, MessageSquare, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dismissOverdue, setDismissOverdue] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://team-task-manager-0wk0.onrender.com/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

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
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          <div className="lg:col-span-8 space-y-[24px]">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-[24px]">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Failed to load data</h2>
        <p className="text-[14px] text-gray-500 mb-4">There was a problem connecting to the server.</p>
        <Button onClick={() => { setLoading(true); fetchStats(); }}>Try Again</Button>
      </div>
    );
  }

  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasksCount = stats?.overdueTasks || 0;
  const totalProjects = stats?.totalProjects || 0;
  const totalMembers = stats?.totalMembers || 0;

  return (
    <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
      {/* TEAM CODE ONBOARDING BANNER FOR ADMINS */}
      {user?.role === 'admin' && user?.teamCode && totalMembers === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-indigo-900 text-[16px] mb-1">Onboard your team to TaskNova! 🚀</h3>
            <p className="text-[13px] text-indigo-700 leading-relaxed max-w-2xl">
              Share your unique Team Code with your members. They will enter it when registering their account to automatically join your workspace and appear on your dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-indigo-100 px-4 py-2 rounded-lg shadow-sm shrink-0">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Your Code:</span>
            <span className="font-extrabold text-[14px] text-indigo-900 tracking-wide font-mono">{user.teamCode}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user.teamCode);
                showToast('Team code copied to clipboard!', 'success');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold text-[12px] ml-1 bg-indigo-50/50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* OVERDUE ALERT BANNER */}
      {overdueTasksCount > 0 && !dismissOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-[14px]">{overdueTasksCount} tasks are overdue! Review them now.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')} className="text-[14px] font-semibold hover:underline">View Overdue →</button>
            <button onClick={() => setDismissOverdue(true)} className="text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.fullName || 'Admin'}! 👋</h1>
          <p className="text-[14px] text-gray-500">Here's what's happening with your projects</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[14px] text-gray-600 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <Button onClick={() => navigate('/projects')} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {/* STATS ROW (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {/* Card 1 - Active Projects */}
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
            <FolderKanban size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{totalProjects}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Active Projects</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              Total projects in workspace
            </div>
          </div>
        </div>

        {/* Card 2 - Total Tasks */}
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
            <CheckSquare size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{totalTasks}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Total Tasks</div>
            </div>
            <div className="text-[11px] opacity-90 mt-3 pt-1 border-t border-white/10">
              <div className="flex justify-between mb-1">
                <span>{completedTasks} completed</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Team Members */}
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
            <Users size={24} style={{ color: 'white' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[90px]">
            <div>
              <div className="text-[32px] font-bold leading-tight">{totalMembers}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Team Members</div>
            </div>
            <div className="text-[11px] opacity-75 mt-3 pt-1 border-t border-white/10">
              {stats?.teamOverview?.filter(u => u.inProgressTasks > 0).length || 0} active today
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
              <div className="text-[32px] font-bold leading-tight">{overdueTasksCount}</div>
              <div className="text-[14px] font-semibold opacity-90 mt-1">Overdue Tasks</div>
            </div>
            <div className="text-[11px] opacity-90 mt-3 pt-1 border-t border-white/10">
              <div className="flex justify-between mb-1">
                <span>Needs attention</span>
                <span>{overdueTasksCount > 0 ? 'Urgent' : 'All clear'}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full" style={{ width: `${overdueTasksCount > 0 ? 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        
        {/* LEFT COLUMN (65%) */}
        <div className="lg:col-span-8 space-y-[24px]">
          
          {/* Block 1 - Project Progress */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-[18px] font-semibold text-gray-900">Projects Overview</h2>
              <Link to="/projects" className="text-[14px] font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            <div className="p-[20px] space-y-[16px]">
              {stats?.projectsProgress?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-[14px]">No projects yet</p>
                </div>
              ) : (
                stats?.projectsProgress?.slice(0, 4).map(project => {
                  const pct = project.totalTasks > 0 ? Math.round((project.tasksCompleted / project.totalTasks) * 100) : 0;
                  const membersCount = project.members?.length || 0;
                  return (
                    <div key={project._id} className="border border-gray-200 rounded-[12px] p-4 hover:border-gray-300 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project._id}`)}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-5 h-5 text-gray-400" />
                          <span className="text-[16px] font-semibold text-gray-900">{project.name}</span>
                        </div>
                        <Badge color={project.status === 'active' ? 'green' : 'gray'}>{project.status === 'active' ? 'Active ✓' : project.status}</Badge>
                      </div>
                      <div className="text-[14px] text-gray-500 mb-3">
                        Tasks: {project.totalTasks} total · {project.tasksCompleted} done
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-[13px] font-semibold text-gray-700 w-8">{pct}%</span>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-[13px] text-gray-500">
                          <Users className="w-3.5 h-3.5" /> {membersCount} members
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                            <Calendar className="w-3.5 h-3.5" /> Due: {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Block 2 - Task Board Summary */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">Tasks by Status</h2>
            </div>
            <div className="p-[20px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px] mb-6">
                {['todo', 'in_progress', 'review', 'done'].map((status) => {
                  const labelMap = { todo: 'TODO', in_progress: 'IN PROGRESS', review: 'REVIEW', done: 'DONE' };
                  const colorMap = { todo: 'bg-gray-400', in_progress: 'bg-blue-500', review: 'bg-amber-500', done: 'bg-green-500' };
                  const count = stats?.tasksByStatus?.[status] || 0;
                  const total = stats?.totalTasks || 1;
                  const wPct = Math.max((count / total) * 100, 2);
                  return (
                    <div key={status} className="flex flex-col border border-gray-200 rounded-[12px] p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[12px] font-semibold text-gray-500 mb-1">{labelMap[status]}</span>
                      <span className="text-[20px] font-bold text-gray-900 mb-2">{count}</span>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex justify-center mx-auto">
                        <div className={`${colorMap[status]} h-1.5 rounded-full`} style={{ width: `${wPct}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="space-y-3">
                {stats?.recentTasks?.slice(0, 8).map(task => (
                  <div key={task._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-[12px] hover:shadow-sm hover:border-gray-300 cursor-pointer transition-all" onClick={() => navigate(`/projects/${task.project?._id}`)}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full border border-gray-400 shrink-0"></span>
                        <span className="font-semibold text-[14px] text-gray-900">{task.title}</span>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge color={task.priority}>{task.priority}</Badge>
                          <Badge color={task.status}>{task.status.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <div className="text-[12px] sm:text-[13px] text-gray-500 flex flex-wrap items-center gap-1.5 sm:gap-2 ml-0 sm:ml-4">
                        <span>{task.project?.name || 'Project'}</span>
                        <span>·</span>
                        <span>Assigned: {task.assignedTo?.fullName || 'Unassigned'}</span>
                        {task.dueDate && (
                          <>
                            <span>·</span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stats?.recentTasks?.length === 0 && (
                  <div className="text-center py-4 text-[14px] text-gray-500">No tasks found</div>
                )}
                {stats?.recentTasks?.length > 8 && (
                  <div className="text-center pt-2">
                    <Button variant="secondary" onClick={() => navigate('/projects')} className="w-full">View All Tasks</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Block 3 - Recent Activity */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-[20px]">
              {stats?.recentActivity?.length === 0 ? (
                <div className="text-center py-6 text-[14px] text-gray-500">No recent activity</div>
              ) : (
                <div className="relative border-l border-gray-200 ml-3 space-y-6">
                  {stats?.recentActivity?.slice(0, 8).map((activity, i) => (
                    <div key={i} className="pl-6 relative">
                      <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white"></div>
                      <div className="text-[14px]">
                        <span className="font-semibold text-gray-900">{activity.user?.fullName || 'User'}</span>
                        <span className="text-gray-600 mx-1">{activity.action}</span>
                        <span className="font-medium text-gray-900">"{activity.target}"</span>
                      </div>
                      <div className="text-[13px] text-gray-500 mt-0.5">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="lg:col-span-4 space-y-[24px]">
          
          {/* Panel 1 - My Tasks Quick View */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">My Tasks</h2>
            </div>
            <div className="p-0">
              {stats?.overdueTasksList?.length === 0 ? (
                <div className="p-5 text-center text-gray-500 text-[14px]">All caught up!</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {stats?.overdueTasksList?.slice(0, 5).map(task => (
                    <div key={task._id} className="p-[20px] hover:bg-gray-50 cursor-pointer flex justify-between items-center group" onClick={() => navigate(`/projects/${task.project?._id}`)}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full border border-gray-400"></span>
                          <span className="font-semibold text-[14px] text-gray-900 truncate max-w-[180px]">{task.title}</span>
                          <Badge color={task.priority}>{task.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-red-500 font-medium ml-4">
                          <Clock className="w-3.5 h-3.5" /> Overdue
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <Link to="/projects" className="text-[14px] font-medium text-blue-600 hover:text-blue-700">View all my tasks</Link>
            </div>
          </Card>

          {/* Panel 2 - Team Members Status */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">Team</h2>
            </div>
            <div className="p-0 divide-y divide-gray-100">
              {stats?.teamOverview?.length === 0 ? (
                <div className="p-5 text-center text-gray-500 text-[14px]">No team members</div>
              ) : (
                stats?.teamOverview?.slice(0, 6).map(member => {
                  let statusColor = 'bg-gray-300'; // offline
                  if (member.inProgressTasks > 0) statusColor = 'bg-green-500'; // active
                  // If we had overdue per member, we'd set yellow/red, here we simulate with tasks
                  if (member.totalTasks > 10) statusColor = 'bg-red-500'; // overloaded
                  else if (member.totalTasks > 5) statusColor = 'bg-yellow-500'; // busy
                  
                  return (
                    <div key={member._id} className="p-[20px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {member.profileImage || member.avatar ? (
                            <img 
                              src={getImageUrl(member.profileImage || member.avatar)} 
                              alt={member.fullName} 
                              className="w-8 h-8 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[12px]">
                              {member.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColor}`}></div>
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-gray-900">{member.fullName}</div>
                          <div className="text-[13px] text-gray-500">{member.totalTasks} tasks</div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Panel 3 - Upcoming Deadlines */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-[18px] font-semibold text-gray-900">Upcoming Deadlines</h2>
            </div>
            <div className="p-0 divide-y divide-gray-100">
              {stats?.recentTasks?.filter(t => t.dueDate && new Date(t.dueDate) >= new Date()).slice(0, 5).map(task => (
                <div key={task._id} className="p-[20px] flex gap-4">
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
                      {task.assignedTo?.fullName || 'Unassigned'} · <Badge color={task.priority} className="scale-90 origin-left">{task.priority}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {stats?.recentTasks?.filter(t => t.dueDate && new Date(t.dueDate) >= new Date()).length === 0 && (
                <div className="p-5 text-center text-gray-500 text-[14px]">No upcoming deadlines</div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
