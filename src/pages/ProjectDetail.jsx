import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, CheckSquare, Clock, Users, BarChart3, FolderKanban, Settings as SettingsIcon } from 'lucide-react';
import { useProjectDetailQuery, useUpdateProjectMutation, useDeleteProjectMutation, useAddProjectMemberMutation } from '../hooks/useProjectsQuery';
import projectService from '../services/project.service';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import CustomStatusManager from '../components/tasks/CustomStatusManager';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import Input from '../components/ui/Input';
import CustomSelect from '../components/ui/CustomSelect';

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  
  const { data: projectData, isLoading, refetch } = useProjectDetailQuery(id);
  const updateProjectMutation = useUpdateProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  const addMemberMutation = useAddProjectMemberMutation();

  const project = projectData?.project;
  const tasks = projectData?.tasks || [];

  const [activeTab, setActiveTab] = useState('board');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState('todo');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Stats calculation
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress').length;
  const progressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Settings tab form
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '', status: 'active' });

  useEffect(() => {
    if (project) {
      setSettingsForm({
        name: project.name,
        description: project.description || '',
        status: project.status || 'active'
      });
    }
  }, [project]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const taskId = searchParams.get('task');
    if (taskId && tasks.length > 0 && !isTaskModalOpen) {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        handleTaskClick(task);
      }
    }
  }, [location.search, tasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = (status = 'todo') => {
    setSelectedTask(null);
    setIsNewTask(true);
    setInitialTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    addMemberMutation.mutate(
      { projectId: id, email: newMemberEmail },
      {
        onSuccess: () => {
          showToast('Member added successfully', 'success');
          setNewMemberEmail('');
          refetch();
        },
        onError: (error) => {
          showToast(error.response?.data?.message || 'Failed to add member', 'error');
        },
      }
    );
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await projectService.removeMember(id, userId);
      showToast('Member removed successfully', 'success');
      refetch();
    } catch (error) {
      showToast('Failed to remove member', 'error');
    }
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    updateProjectMutation.mutate(
      { id, projectData: settingsForm },
      {
        onSuccess: () => {
          showToast('Project settings updated', 'success');
          refetch();
        },
        onError: () => {
          showToast('Failed to update project settings', 'error');
        },
      }
    );
  };

  const handleDeleteProject = () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? This action cannot be undone.')) return;
    
    deleteProjectMutation.mutate(id, {
      onSuccess: () => {
        showToast('Project deleted', 'success');
        navigate('/projects');
      },
      onError: () => {
        showToast('Failed to delete project', 'error');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-[24px] max-w-[1400px] mx-auto space-y-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-[calc(100vh-220px)] rounded-2xl" />
      </div>
    );
  }

  if (!project) return null;

  const isAdmin = user?.role === 'admin';

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-emerald-500' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-400' },
  ];

  return (
    <div className="p-4 sm:p-[24px] max-w-[1400px] mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate('/projects')}>Projects</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-semibold">{project.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
            <Badge color={project.status === 'active' ? 'green' : project.status === 'completed' ? 'blue' : 'gray'} className="capitalize px-3 py-1 text-xs">
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1 max-w-3xl leading-relaxed">{project.description}</p>
          )}
        </div>
        
        {activeTab === 'board' && isAdmin && (
          <Button onClick={() => handleAddTask()} className="gap-2 shrink-0 h-[42px] px-5 rounded-xl shadow-sm">
            <Plus size={18} />
            <span className="font-semibold">Add Task</span>
          </Button>
        )}
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <CheckSquare size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Tasks</span>
            <span className="text-xl font-bold text-gray-900">{totalTasksCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-bold text-gray-900">{inProgressTasksCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <BarChart3 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completion</span>
              <span className="text-xs font-bold text-emerald-600">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Team Members</span>
            <span className="text-xl font-bold text-gray-900">{project.members?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'board' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('board')}
        >
          <FolderKanban size={16} />
          <span>Board View</span>
        </button>
        {isAdmin && (
          <button
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'members' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            <span>Members ({project.members?.length || 0})</span>
          </button>
        )}
        {isAdmin && (
          <button
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'settings' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={16} />
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'board' && (
          <KanbanBoard 
            tasks={tasks} 
            project={project}
            onTaskClick={handleTaskClick} 
            onAddTask={handleAddTask} 
            onTaskUpdated={() => refetch()}
          />
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isAdmin && (
              <form onSubmit={handleAddMember} className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="w-full sm:flex-1 sm:max-w-md">
                  <Input 
                    label="Add Member by Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <Button type="submit" disabled={addMemberMutation.isPending || !newMemberEmail.trim()} className="w-full sm:w-auto justify-center">
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </form>
            )}
            
            <div className="divide-y divide-gray-100">
              {project.members?.map((member) => (
                <div key={member.user._id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.user.fullName} src={member.user.profileImage || member.user.avatar} />
                    <div>
                      <p className="font-semibold text-gray-900">{member.user.fullName}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge color={member.role === 'admin' ? 'indigo' : 'gray'} className="capitalize">
                      {member.role || 'member'}
                    </Badge>
                    
                    {isAdmin && member.user._id !== project.owner?._id && (
                      <button 
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <Input
                  label="Project Name"
                  name="name"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    rows="3"
                    className="px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <CustomSelect
                    options={statusOptions}
                    value={settingsForm.status}
                    onChange={(val) => setSettingsForm((prev) => ({ ...prev, status: val }))}
                    renderOption={(opt) => (
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                    )}
                    renderSelected={(opt) => (
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${opt?.color || 'bg-gray-400'}`} />
                        <span className="font-semibold">{opt?.label || 'Select status'}</span>
                      </div>
                    )}
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" disabled={updateProjectMutation.isPending}>
                    {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Task Workflow</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure custom task statuses and colors for this project's board.
                </p>
                <Button type="button" variant="secondary" onClick={() => setIsStatusModalOpen(true)}>
                  Manage Custom Statuses
                </Button>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete a project, there is no going back. All tasks and comments will be permanently removed.
                </p>
                <Button variant="danger" onClick={handleDeleteProject} disabled={deleteProjectMutation.isPending}>
                  <Trash2 size={16} />
                  <span>{deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          project={project}
          isNew={isNewTask}
          initialStatus={initialTaskStatus}
          onTaskUpdated={() => refetch()}
        />
      )}

      {isStatusModalOpen && (
        <CustomStatusManager
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          project={project}
          onStatusesUpdated={() => refetch()}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
