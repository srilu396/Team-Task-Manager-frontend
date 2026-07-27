import React, { useState, useEffect, useContext } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import CustomSelect from '../ui/CustomSelect';
import { useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useAddCommentMutation } from '../../hooks/useTasksQuery';
import taskService from '../../services/task.service';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';

const TaskModal = ({ isOpen, onClose, task, project, onTaskUpdated, isNew = false, initialStatus = 'todo' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const addCommentMutation = useAddCommentMutation();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (task && !isNew) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          assignedTo: task.assignedTo?._id || task.assignedTo || ''
        });
        fetchComments();
      } else {
        setFormData({
          title: '',
          description: '',
          status: initialStatus,
          priority: 'medium',
          dueDate: '',
          assignedTo: ''
        });
        setComments([]);
      }
    }
  }, [isOpen, task, isNew, initialStatus]);

  const fetchComments = async () => {
    if (!task?._id) return;
    try {
      const data = await taskService.getTaskById(task._id);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const targetProjectId = project?._id || (typeof task?.project === 'object' ? task.project?._id : task?.project);

    if (isNew) {
      createTaskMutation.mutate(
        { ...formData, project: targetProjectId },
        {
          onSuccess: (savedTask) => {
            showToast('Task created successfully', 'success');
            if (onTaskUpdated) onTaskUpdated(savedTask);
            if (onClose) onClose();
          },
          onError: (error) => {
            showToast(error.response?.data?.message || 'Failed to create task', 'error');
          },
        }
      );
    } else {
      updateTaskMutation.mutate(
        { id: task._id, taskData: formData },
        {
          onSuccess: (savedTask) => {
            showToast('Task updated successfully', 'success');
            if (onTaskUpdated) onTaskUpdated(savedTask);
            if (onClose) onClose();
          },
          onError: (error) => {
            showToast(error.response?.data?.message || 'Failed to update task', 'error');
          },
        }
      );
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    addCommentMutation.mutate(
      { taskId: task._id, content: newComment },
      {
        onSuccess: (addedComment) => {
          setComments((prev) => [...prev, addedComment]);
          setNewComment('');
          if (onTaskUpdated) onTaskUpdated();
        },
        onError: () => {
          showToast('Failed to add comment', 'error');
        },
      }
    );
  };

  const canEdit = user?.role === 'admin' || isNew || (task?.assignedTo?._id || task?.assignedTo) === user?.id || (task?.createdBy?._id || task?.createdBy) === user?.id;

  const handleDeleteTask = () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    deleteTaskMutation.mutate(task._id, {
      onSuccess: () => {
        showToast('Task deleted successfully', 'success');
        if (onTaskUpdated) onTaskUpdated();
        if (onClose) onClose();
      },
      onError: () => {
        showToast('Failed to delete task', 'error');
      },
    });
  };

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending;

  // Options for custom selects
  const statusOptions = project?.customStatuses && project.customStatuses.length > 0
    ? project.customStatuses.map((s) => ({ value: s.name.toLowerCase().replace(' ', '_'), label: s.name, color: s.color }))
    : [
        { value: 'todo', label: 'To Do', color: 'gray' },
        { value: 'in_progress', label: 'In Progress', color: 'blue' },
        { value: 'review', label: 'Review', color: 'yellow' },
        { value: 'testing', label: 'Testing', color: 'purple' },
        { value: 'done', label: 'Done', color: 'green' },
      ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' },
  ];

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...(project?.members || []).map((m) => ({
      value: m.user._id,
      label: m.user.fullName,
      email: m.user.email,
      avatar: m.user.profileImage || m.user.avatar,
    })),
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isNew ? 'Create New Task' : 'Task Details'}
      maxWidth={isNew ? 'max-w-xl' : 'max-w-4xl'}
    >
      <div className="flex flex-col md:flex-row gap-8 max-h-[75vh] overflow-y-auto pr-2">
        {/* Left column: Form */}
        <div className={`w-full ${isNew ? '' : 'md:w-3/5 pr-2'} space-y-5`}>
          <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={!canEdit || isPending}
              placeholder="e.g. Implement user authentication flow"
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                disabled={!canEdit || isPending}
                placeholder="Describe what needs to be done..."
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <CustomSelect
                  options={statusOptions}
                  value={formData.status}
                  onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                  disabled={!canEdit || isPending}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <CustomSelect
                  options={priorityOptions}
                  value={formData.priority}
                  onChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
                  disabled={!canEdit || isPending}
                  renderOption={(opt) => (
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                      <span>{opt.label}</span>
                    </div>
                  )}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Assignee</label>
                <CustomSelect
                  options={assigneeOptions}
                  value={formData.assignedTo}
                  onChange={(val) => setFormData((prev) => ({ ...prev, assignedTo: val }))}
                  disabled={!canEdit || isPending}
                  searchable
                  renderOption={(opt) => (
                    <div className="flex items-center gap-2">
                      {opt.value ? <Avatar name={opt.label} src={opt.avatar} size="xs" /> : <div className="w-5 h-5 rounded-full bg-gray-200" />}
                      <span className="truncate">{opt.label}</span>
                    </div>
                  )}
                />
              </div>
              
              <Input
                label="Due Date"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={!canEdit || isPending}
              />
            </div>
          </form>
        </div>
        
        {/* Right column: Comments (only if not new) */}
        {!isNew && (
          <div className="w-full md:w-2/5 flex flex-col border-l pl-6 border-gray-200/80">
            <h4 className="font-bold text-gray-900 mb-4 text-[15px] flex items-center gap-2">
              Comments 
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {comments.length}
              </span>
            </h4>
            
            <div className="overflow-y-auto space-y-4 mb-4 pr-1 h-[260px]">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50/80 p-3.5 rounded-xl text-sm border border-gray-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar 
                        name={comment.user?.fullName} 
                        src={comment.user?.profileImage || comment.user?.avatar} 
                        size="xs" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 text-xs block truncate">{comment.user?.fullName}</span>
                        <span className="text-[10px] text-gray-400 font-medium block">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows="2"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
              <Button type="submit" variant="primary" className="self-end py-1.5 px-3 text-xs font-bold rounded-lg" disabled={!newComment.trim() || addCommentMutation.isPending}>
                {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
        <div>
          {!isNew && user?.role === 'admin' && (
            <Button variant="danger" onClick={handleDeleteTask} disabled={isPending} type="button">
              Delete Task
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="task-form" disabled={isPending}>
            {isPending ? 'Saving...' : isNew ? 'Create Task' : 'Save Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
