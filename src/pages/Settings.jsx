import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import DeleteAccountModal from '../components/ui/DeleteAccountModal';
import { AlertTriangle, Trash2 } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and profile</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="flex items-center gap-6">
            <Avatar name={user?.fullName || 'User'} src={user?.profileImage || user?.avatar} size="xl" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{user?.fullName}</h3>
              <p className="text-gray-500">{user?.email}</p>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                {user?.role || 'Member'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={user?.fullName || ''} 
                readOnly 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input 
                type="text" 
                value={(user?.role || 'Member').toUpperCase()} 
                readOnly 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium cursor-not-allowed opacity-80" disabled>
              Save Changes
            </button>
          </div>
          <p className="mt-2 text-xs text-right text-gray-400">Editing profile details will be available in a future update.</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-xl shadow-sm border border-red-200/70 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
          </div>
          <p className="text-sm text-red-700 mb-5">
            Once you delete your account, there is no going back. All of your personal profile data, created content, and associations will be permanently removed.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-red-200/60">
            <div>
              <p className="text-sm font-semibold text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete your TaskNova account and all associated data</p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
