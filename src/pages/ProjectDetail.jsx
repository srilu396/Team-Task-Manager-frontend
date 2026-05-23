import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
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

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState('todo');
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  
  // Settings tab form
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '', status: 'active' });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  useEffect(() => {
    // Check if task ID is in query params
    const searchParams = new URLSearchParams(location.search);
    const taskId = searchParams.get('task');
    if (taskId && tasks.length > 0 && !isTaskModalOpen) {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        handleTaskClick(task);
      }
    }
  }, [location.search, tasks]);

  const fetchProjectData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      const data = await projectService.getProjectById(id);
      setProject(data.project);
      setTasks(data.tasks);
      setSettingsForm({
        name: data.project.name,
        description: data.project.description || '',
        status: data.project.status
      });
    } catch (error) {
      showToast('Failed to load project details', 'error');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    setAddingMember(true);
    try {
      await projectService.addMember(id, newMemberEmail);
      showToast('Member added successfully', 'success');
      setNewMemberEmail('');
      fetchProjectData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add member', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await projectService.removeMember(id, userId);
      showToast('Member removed successfully', 'success');
      fetchProjectData();
    } catch (error) {
      showToast('Failed to remove member', 'error');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await projectService.updateProject(id, settingsForm);
      showToast('Project settings updated', 'success');
      fetchProjectData();
    } catch (error) {
      showToast('Failed to update project settings', 'error');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      await projectService.deleteProject(id);
      showToast('Project deleted', 'success');
      navigate('/projects');
    } catch (error) {
      showToast('Failed to delete project', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-[calc(100vh-200px)] rounded-xl" />
      </div>
    );
  }

  if (!project) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 mb-2">
            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/projects')}>Projects</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{project.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-gray-900">{project.name}</h1>
            <Badge color={project.status === 'active' ? 'green' : project.status === 'completed' ? 'blue' : 'gray'}>
              {project.status}
            </Badge>
          </div>
        </div>
        
        {activeTab === 'board' && isAdmin && (
          <Button onClick={() => handleAddTask()}>
            <Plus size={20} />
            <span>Add Task</span>
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'board' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('board')}
        >
          Board
        </button>
        {isAdmin && (
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        )}
        {isAdmin && (
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'board' && (
          <KanbanBoard 
            tasks={tasks} 
            onTaskClick={handleTaskClick} 
            onAddTask={handleAddTask} 
          />
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isAdmin && (
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="w-full sm:flex-1 sm:max-w-md">
                  <Input 
                    label="Add Member by Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <Button onClick={handleAddMember} disabled={addingMember || !newMemberEmail.trim()} className="w-full sm:w-auto justify-center">
                  {addingMember ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            )}
            
            <div className="divide-y divide-gray-100">
              {project.members.map(member => (
                <div key={member.user._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.user.fullName} src={member.user.profileImage || member.user.avatar} />
                    <div>
                      <p className="font-medium text-gray-900">{member.user.fullName}</p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge color={member.role === 'admin' ? 'indigo' : 'gray'}>
                      {member.role}
                    </Badge>
                    
                    {isAdmin && member.user._id !== project.owner._id && (
                      <button 
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
          <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-6">
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <Input
                  label="Project Name"
                  name="name"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                />
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    rows="3"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={settingsForm.status}
                    onChange={(e) => setSettingsForm({ ...settingsForm, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Task Workflow</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure custom task statuses and colors for this project's board and tasks.
                </p>
                <Button type="button" onClick={() => setIsStatusModalOpen(true)}>
                  Manage Statuses
                </Button>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete a project, there is no going back. Please be certain.
                </p>
                <Button variant="danger" onClick={handleDeleteProject}>
                  <Trash2 size={16} />
                  <span>Delete Project</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        project={project}
        isNew={isNewTask}
        initialStatus={initialTaskStatus}
        onTaskUpdated={() => fetchProjectData(false)}
      />

      <CustomStatusManager
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        project={project}
        onStatusesUpdated={fetchProjectData}
        showToast={showToast}
      />
    </div>
  );
};

export default ProjectDetail;
