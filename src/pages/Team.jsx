import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import userService from '../services/user.service';
import projectService from '../services/project.service';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { Shield, ShieldAlert, AlertCircle } from 'lucide-react';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      showToast('Failed to load team members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllToggle = () => {
    const selectableUsers = users.filter(u => u.role !== 'admin' && u._id !== (currentUser.id || currentUser._id));
    if (selectedUserIds.length === selectableUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(selectableUsers.map(u => u._id));
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedProjectId) return;
    try {
      setAssigning(true);
      await projectService.addMembersBulk(selectedProjectId, selectedUserIds);
      const projName = projects.find(p => p._id === selectedProjectId)?.name || 'the project';
      showToast(`Assigned ${selectedUserIds.length} members to "${projName}" successfully`, 'success');
      setSelectedUserIds([]);
      setSelectedProjectId('');
    } catch (error) {
      showToast('Failed to assign members to project', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === (currentUser.id || currentUser._id)) {
      showToast('You cannot change your own role', 'error');
      return;
    }

    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const confirmMessage = currentRole === 'admin' 
      ? 'Are you sure you want to demote this admin to a member?'
      : 'Are you sure you want to promote this member to an admin?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await userService.updateRole(userId, newRole);
      showToast('Role updated successfully', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">Only administrators can view the Team page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1">Manage system access and roles</p>
        </div>
        {users.filter(u => u.role !== 'admin' && u._id !== (currentUser.id || currentUser._id)).length > 0 && (
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
            <input 
              type="checkbox"
              id="select-all"
              checked={
                selectedUserIds.length > 0 && 
                selectedUserIds.length === users.filter(u => u.role !== 'admin' && u._id !== (currentUser.id || currentUser._id)).length
              }
              onChange={handleSelectAllToggle}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="select-all" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
              Select All Members
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-8 w-24 rounded-full mt-auto" />
            </div>
          ))
        ) : (
          users.filter(u => u.role !== 'admin' && u._id !== (currentUser.id || currentUser._id)).map(u => (
            <div key={u._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow relative">
              {/* Checkbox for selection */}
              <div className="absolute top-4 left-4">
                <input 
                  type="checkbox"
                  checked={selectedUserIds.includes(u._id)}
                  onChange={() => toggleUserSelection(u._id)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <Avatar name={u.fullName} src={u.profileImage || u.avatar} size="xl" className="mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{u.fullName}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-1">{u.email}</p>
              <p className="text-xs font-medium text-gray-600 mb-4 bg-gray-100 px-2 py-1 rounded-md">{u.assignedTasksCount || 0} Assigned Tasks</p>
              
              <div className="mt-auto flex flex-col items-center gap-3 w-full">
                <Badge color={u.role === 'admin' ? 'indigo' : 'gray'} className="px-3 py-1 text-xs">
                  {(u.role || 'member').toUpperCase()}
                </Badge>
                
                {u._id !== (currentUser.id || currentUser._id) && (
                  <button
                    onClick={() => handleRoleToggle(u._id, u.role || 'member')}
                    className={`flex items-center justify-center w-full gap-2 px-4 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                      u.role === 'admin' 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                    }`}
                  >
                    {u.role === 'admin' ? (
                      <><ShieldAlert size={16} /> Demote to Member</>
                    ) : (
                      <><Shield size={16} /> Promote to Admin</>
                    )}
                  </button>
                )}
                
                {u._id === (currentUser.id || currentUser._id) && (
                  <div className="w-full px-4 py-2 mt-2 text-sm text-gray-400 bg-gray-50 rounded-lg">
                    Current User
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Bulk Action Dock */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
              {selectedUserIds.length} Selected
            </span>
            <span className="text-gray-600 text-sm font-medium">Assign them to a project:</span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
            >
              <option value="">Choose a Project...</option>
              {projects.map(proj => (
                <option key={proj._id} value={proj._id}>{proj.name}</option>
              ))}
            </select>
            
            <button
              onClick={handleBulkAssign}
              disabled={!selectedProjectId || assigning}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${
                !selectedProjectId || assigning 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
            
            <button
              onClick={() => setSelectedUserIds([])}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
