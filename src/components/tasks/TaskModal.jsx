import React, { useState, useEffect, useContext } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import taskService from '../../services/task.service';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';

const TaskModal = ({ isOpen, onClose, task, project, onTaskUpdated, isNew = false, initialStatus = 'todo' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
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
          assignedTo: task.assignedTo?._id || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isNew) {
        await taskService.createTask({ ...formData, project: project._id });
        showToast('Task created successfully', 'success');
      } else {
        await taskService.updateTask(task._id, formData);
        showToast('Task updated successfully', 'success');
      }
      onTaskUpdated();
      onClose();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    
    try {
      const addedComment = await taskService.addComment(task._id, newComment);
      setComments([...comments, addedComment]);
      setNewComment('');
      onTaskUpdated(); // Update comment count in parent
    } catch (error) {
      showToast('Failed to add comment', 'error');
    }
  };

  const canEdit = user?.role === 'admin' || isNew || task?.assignedTo?._id === user?.id || task?.createdBy?._id === user?.id;

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await taskService.deleteTask(task._id);
      showToast('Task deleted successfully', 'success');
      onTaskUpdated();
      onClose();
    } catch (error) {
      showToast('Failed to delete task', 'error');
    } finally {
      setLoading(false);
    }
  };

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
              disabled={!canEdit}
            />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!canEdit}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  disabled={!canEdit}
                >
                  {project?.customStatuses && project.customStatuses.length > 0 ? (
                    project.customStatuses.map(status => (
                      <option key={status.name} value={status.name.toLowerCase().replace(' ', '_')}>
                        {status.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  disabled={!canEdit}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Assignee</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  disabled={!canEdit}
                >
                  <option value="">Unassigned</option>
                  {project?.members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.fullName}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Due Date"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={!canEdit}
              />
            </div>
          </form>
        </div>
        
        {/* Right column: Comments (only if not new) */}
        {!isNew && (
          <div className="w-full md:w-2/5 flex flex-col border-l pl-6 border-gray-200/60">
            <h4 className="font-semibold text-gray-900 mb-4 text-[15px] flex items-center gap-2">
              Comments 
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {comments.length}
              </span>
            </h4>
            
            <div className="overflow-y-auto space-y-4 mb-4 pr-1 h-[260px] scroll-smooth scrollbar-none">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-gray-400 italic">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="bg-gray-50/70 hover:bg-gray-50 p-4 rounded-xl text-sm border border-gray-100/50 shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Avatar 
                        name={comment.user.fullName} 
                        src={comment.user.profileImage || comment.user.avatar} 
                        size="sm" 
                        className="border border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-800 text-[13px] block truncate">{comment.user.fullName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                          {new Date(comment.createdAt).toLocaleDateString()} · {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-[13px] leading-relaxed whitespace-pre-wrap pl-0.5">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2.5">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment or reply..."
                rows="2"
                className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
              />
              <Button type="submit" variant="primary" className="self-end py-1.5 px-4 text-xs font-bold shadow-sm rounded-lg" disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </form>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
        <div>
          {!isNew && user?.role === 'admin' && (
            <Button variant="danger" onClick={handleDeleteTask} disabled={loading} type="button">
              Delete Task
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="task-form" disabled={loading}>
            {loading ? 'Saving...' : isNew ? 'Create Task' : 'Save Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
