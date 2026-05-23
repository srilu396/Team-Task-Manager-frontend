import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { X } from 'lucide-react';
import api from '../../services/api';

const ProfileImageUpload = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useContext(ToastContext);
  const { user, updateUser } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error')
  };

  const updateUserInContext = updateUser;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 
                          'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await api.post(
        '/users/upload-avatar',
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Profile picture updated!');
      updateUserInContext(response.data.user);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const displayImage = preview || user?.avatar || user?.profileImage;

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  return (
    <div style={{ textAlign: 'center' }} className="mb-6">
      {/* Avatar Display */}
      <div
        onClick={() => fileInputRef.current.click()}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          margin: '0 auto',
          border: '3px solid #E5E7EB'
        }}
      >
        {displayImage ? (
          <img
            src={getImageUrl(displayImage)}
            alt="Profile"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: '0.2s',
          borderRadius: '50%'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <span style={{ 
            color: 'white', 
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {uploading ? 'Uploading...' : 'Change Photo'}
          </span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        style={{
          marginTop: '8px',
          padding: '6px 14px',
          background: 'none',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          fontSize: '13px',
          cursor: 'pointer',
          color: '#4F46E5'
        }}
      >
        {uploading ? 'Uploading...' : '📷 Upload Photo'}
      </button>
      <p style={{ 
        fontSize: '11px', 
        color: '#9CA3AF',
        marginTop: '4px'
      }}>
        JPG, PNG, GIF up to 5MB
      </p>
    </div>
  );
};

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.put('/users/profile', { fullName });
      updateUser(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-text-main mb-6">Edit Profile</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <ProfileImageUpload />

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
