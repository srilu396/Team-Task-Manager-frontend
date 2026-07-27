import React, { useState, useContext } from 'react';
import useDashboardQuery from '../hooks/useDashboardQuery';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import StatusChart from '../components/dashboard/StatusChart';
import PriorityChart from '../components/dashboard/PriorityChart';
import { FolderKanban, CheckSquare, Users, AlertCircle, Plus, Calendar, Clock, ArrowRight, MessageSquare, X, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { data: stats, isLoading, isError, refetch } = useDashboardQuery();
  const [dismissOverdue, setDismissOverdue] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
        <Skeleton className="h-10 w-1/3 mb-6 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          <div className="lg:col-span-8 space-y-[24px]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-[24px]">
            <Skeleton className="h-[650px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Failed to load dashboard statistics</h2>
        <p className="text-[14px] text-gray-500 mb-4">There was a problem connecting to the server.</p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
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
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
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
          <p className="text-[14px] text-gray-500">Here's what's happening with your workspace</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[14px] text-gray-600 font-medium hidden sm:inline-block">
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
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <FolderKanban size={24} />
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
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <CheckSquare size={24} />
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
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <Users size={24} />
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

        {/* Card 4 - Overdue Tasks */}
        <div className="p-6 text-white rounded-2xl relative overflow-hidden shadow-lg border-none hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <div className="absolute w-28 h-28 rounded-full bg-white/10 -top-5 -right-5 pointer-events-none" />
          <div className="absolute top-4 right-4 text-white">
            <AlertCircle size={24} />
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
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-[24px]">
          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            <StatusChart data={stats?.taskStatusDistribution} totalTasks={totalTasks} />
            <PriorityChart data={stats?.taskPriorityDistribution} />
          </div>

          {/* PROJECT PROGRESS */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Project Progress</h3>
              <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            {stats?.projectsProgress && stats.projectsProgress.length > 0 ? (
              <div className="space-y-4">
                {stats.projectsProgress.map((proj) => {
                  const percent = proj.totalTasks > 0 ? Math.round((proj.completedTasks / proj.totalTasks) * 100) : 0;
                  return (
                    <div key={proj._id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-900 mb-1">
                        <span>{proj.name}</span>
                        <span>{percent}% ({proj.completedTasks}/{proj.totalTasks})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No project progress data yet.</p>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-[24px]">
          {/* TEAM OVERVIEW */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Team Activity Overview</h3>
            {stats?.teamOverview && stats.teamOverview.length > 0 ? (
              <div className="space-y-3">
                {stats.teamOverview.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={member.fullName} src={member.profileImage} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{member.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    <Badge color="blue" className="shrink-0 text-xs font-semibold">
                      {member.assignedTasks} Tasks
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No team activity recorded.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
