import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Lock, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import userService from '../../services/user.service';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  const isConfirmed = confirmText.trim() === 'DELETE' && password.trim().length > 0;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setLoading(true);
    setError('');

    try {
      await userService.deleteAccount(password);
      showToast('Your account has been permanently deleted.', 'info');
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Account deletion error:', err);
      const message = err.response?.data?.message || 'Failed to delete account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-red-100">
        <button 
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            <p className="text-xs text-red-600 font-medium">This action is permanent.</p>
          </div>
        </div>

        <div className="bg-red-50/80 border border-red-100 rounded-xl p-3.5 mb-5 text-sm text-red-800">
          <p className="leading-relaxed">
            All your projects, tasks, comments, notifications, profile information and related data may be permanently removed.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock size={14} className="text-gray-500" /> Current Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Type <span className="text-red-600 font-mono select-none font-black">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isConfirmed || loading}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Trash2 size={16} />
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
