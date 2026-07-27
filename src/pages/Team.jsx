import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { useUsersQuery, useUpdateRoleMutation } from '../hooks/useTeamQuery';
import { useProjectsQuery, useAddProjectMembersBulkMutation } from '../hooks/useProjectsQuery';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import CustomSelect from '../components/ui/CustomSelect';
import { Shield, ShieldAlert, AlertCircle, CheckCircle2, Users, Search, Check, FolderKanban } from 'lucide-react';

const Team = () => {
  const { user: currentUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const { data: users = [], isLoading: usersLoading } = useUsersQuery();
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();

  const updateRoleMutation = useUpdateRoleMutation();
  const addMembersBulkMutation = useAddProjectMembersBulkMutation();

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectableUsers = users.filter(
    (u) => u._id !== (currentUser?.id || currentUser?._id)
  );

  const handleSelectAllToggle = () => {
    if (selectedUserIds.length === selectableUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(selectableUsers.map((u) => u._id));
    }
  };

  const handleBulkAssign = () => {
    if (!selectedProjectId || selectedUserIds.length === 0) return;

    addMembersBulkMutation.mutate(
      { projectId: selectedProjectId, userIds: selectedUserIds },
      {
        onSuccess: () => {
          const projName = projects.find((p) => p._id === selectedProjectId)?.name || 'the project';
          showToast(`Assigned ${selectedUserIds.length} members to "${projName}" successfully`, 'success');
          setSelectedUserIds([]);
          setSelectedProjectId('');
        },
        onError: () => {
          showToast('Failed to assign members to project', 'error');
        },
      }
    );
  };

  const handleRoleToggle = (userId, currentRole) => {
    if (userId === (currentUser?.id || currentUser?._id)) {
      showToast('You cannot change your own role', 'error');
      return;
    }

    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const confirmMessage =
      currentRole === 'admin'
        ? 'Are you sure you want to demote this admin to a member?'
        : 'Are you sure you want to promote this member to an admin?';

    if (!window.confirm(confirmMessage)) return;

    updateRoleMutation.mutate(
      { id: userId, role: newRole },
      {
        onSuccess: () => {
          showToast('Role updated successfully', 'success');
        },
        onError: () => {
          showToast('Failed to update role', 'error');
        },
      }
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">Only administrators can access the Team management console.</p>
      </div>
    );
  }

  // Build rich project select options with detailed metrics & owner metadata
  const projectSelectOptions = [
    { value: '', name: 'Choose a target project...' },
    ...projects.map((p) => {
      const completionPct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
      const ownerName = typeof p.owner === 'object' ? p.owner?.fullName : 'Workspace Owner';
      return {
        value: p._id,
        name: p.name,
        owner: ownerName,
        memberCount: p.members?.length || 0,
        completedTasks: p.completedTasks || 0,
        totalTasks: p.totalTasks || 0,
        completionPct,
        status: p.status || 'active',
      };
    }),
  ];

  return (
    <div className="p-4 sm:p-[24px] max-w-[1400px] mx-auto space-y-6 pb-28">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Team Members</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage team access, project workloads, and system roles</p>
        </div>

        {selectableUsers.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedUserIds.length > 0 && selectedUserIds.length === selectableUsers.length}
              onChange={handleSelectAllToggle}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="select-all" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
              Select All Members ({selectableUsers.length})
            </label>
          </div>
        )}
      </div>

      {/* MEMBER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {usersLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center">
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2 rounded-lg" />
              <Skeleton className="h-4 w-44 mb-4 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-full mt-auto" />
            </div>
          ))
        ) : (
          users.map((u) => {
            const userProjects = projects.filter((p) =>
              p.members?.some((m) => (m.user?._id || m.user) === u._id)
            );
            const isSelf = u._id === (currentUser?.id || currentUser?._id);

            return (
              <div
                key={u._id}
                className={`bg-white rounded-2xl border p-6 flex flex-col items-center text-center transition-all relative ${
                  selectedUserIds.includes(u._id)
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/10'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Select Checkbox */}
                {!isSelf && (
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u._id)}
                      onChange={() => toggleUserSelection(u._id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                )}

                <Avatar name={u.fullName} src={u.profileImage || u.avatar} size="xl" className="mb-3.5 shadow-sm" />
                <h3 className="text-base font-bold text-gray-900 line-clamp-1">{u.fullName}</h3>
                <p className="text-xs text-gray-500 mb-3 truncate w-full px-2" title={u.email}>{u.email}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge color={u.role === 'admin' ? 'indigo' : 'gray'} className="px-3 py-1 text-xs font-semibold capitalize">
                    {u.role || 'member'}
                  </Badge>
                  {isSelf && (
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      You
                    </span>
                  )}
                </div>

                {/* Metrics Breakdown */}
                <div className="w-full bg-gray-50/80 border border-gray-100 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Projects</span>
                    <span className="font-bold text-gray-900 text-sm">{userProjects.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Active Tasks</span>
                    <span className="font-bold text-indigo-600 text-sm">{u.assignedTasksCount || 0}</span>
                  </div>
                </div>

                {/* Assigned Projects List Preview */}
                <div className="w-full mb-4 text-left">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Assigned Projects</span>
                  {userProjects.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No assigned projects</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {userProjects.map((p) => (
                        <span key={p._id} className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action button */}
                {!isSelf && (
                  <div className="mt-auto w-full pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleRoleToggle(u._id, u.role || 'member')}
                      disabled={updateRoleMutation.isPending}
                      className={`flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        u.role === 'admin'
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <><ShieldAlert size={15} /> Demote to Member</>
                      ) : (
                        <><Shield size={15} /> Promote to Admin</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* THREE-SECTION FLOATING ASSIGNMENT DOCK (SaaS Glassmorphic Style) */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[90] w-[95%] max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-5 text-white flex flex-col gap-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-200">
          {/* Section 1: Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                👥 {selectedUserIds.length} Selected
              </span>
              <span className="text-slate-300 text-xs font-semibold">
                Assign selected members to a project
              </span>
            </div>
          </div>

          {/* Section 2: Searchable Project Selector with Rich Cards */}
          <div>
            <CustomSelect
              options={projectSelectOptions}
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              placeholder="🔍 Search project..."
              searchable
              searchPlaceholder="Search project name, owner, or status..."
              direction="up" // Opens upward float above dock
              buttonClassName="bg-slate-800/90 text-white border-slate-700 hover:bg-slate-750 focus:ring-indigo-500/40 text-xs font-semibold py-2.5 rounded-xl shadow-inner"
              dropdownClassName="bg-white text-slate-900 shadow-2xl border-slate-200"
              renderSelected={(opt) =>
                !opt || !opt.value ? (
                  <span className="text-slate-400 font-normal">Select target project...</span>
                ) : (
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                    <span className="font-bold text-white text-xs truncate">{opt.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                      {opt.memberCount} members
                    </span>
                  </div>
                )
              }
              renderOption={(opt) =>
                !opt.value ? (
                  <span className="text-gray-400 italic text-xs py-1">{opt.name}</span>
                ) : (
                  <div className="flex flex-col gap-1.5 w-full py-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            opt.status === 'active'
                              ? 'bg-emerald-500'
                              : opt.status === 'completed'
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="font-bold text-gray-900 text-xs truncate">{opt.name}</span>
                        <Badge
                          color={opt.status === 'active' ? 'green' : 'gray'}
                          className="text-[10px] py-0 px-1.5 capitalize"
                        >
                          {opt.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {opt.completionPct}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${opt.completionPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>Owner: {opt.owner}</span>
                      <span>{opt.totalTasks} Tasks • {opt.memberCount} Members</span>
                    </div>
                  </div>
                )
              }
            />
          </div>

          {/* Section 3: Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => setSelectedUserIds([])}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAssign}
              disabled={!selectedProjectId || addMembersBulkMutation.isPending}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl transition-all ${
                !selectedProjectId || addMembersBulkMutation.isPending
                  ? 'bg-indigo-500/40 cursor-not-allowed text-white/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transform hover:-translate-y-0.5'
              }`}
            >
              <Check size={14} />
              {addMembersBulkMutation.isPending ? 'Assigning...' : '✓ Assign Members'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
