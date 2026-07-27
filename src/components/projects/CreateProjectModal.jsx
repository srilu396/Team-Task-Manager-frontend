import React, { useState, useContext } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CustomSelect from '../ui/CustomSelect';
import { useCreateProjectMutation } from '../../hooks/useProjectsQuery';
import { ToastContext } from '../../context/ToastContext';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { showToast } = useContext(ToastContext);
  const createProjectMutation = useCreateProjectMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    createProjectMutation.mutate(formData, {
      onSuccess: () => {
        showToast('Project created successfully', 'success');
        setFormData({ name: '', description: '', status: 'active' });
        onClose();
      },
      onError: (error) => {
        showToast(error.response?.data?.message || 'Failed to create project', 'error');
      },
    });
  };

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-emerald-500' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-400' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Mobile App Redesign"
        />
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of project goals and scope..."
            className="px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Initial Status</label>
          <CustomSelect
            options={statusOptions}
            value={formData.status}
            onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
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
        
        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={createProjectMutation.isPending || !formData.name.trim()}>
            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
