import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import projectService from '../../services/project.service';

const CustomStatusManager = ({ isOpen, onClose, project, onStatusesUpdated, showToast }) => {
  const colorOptions = [
    { label: 'Gray',   color: '#6B7280', bg: '#F3F4F6' },
    { label: 'Blue',   color: '#1D4ED8', bg: '#DBEAFE' },
    { label: 'Green',  color: '#065F46', bg: '#D1FAE5' },
    { label: 'Red',    color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Amber',  color: '#D97706', bg: '#FEF3C7' },
    { label: 'Purple', color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Pink',   color: '#BE185D', bg: '#FCE7F3' },
    { label: 'Teal',   color: '#0F766E', bg: '#CCFBF1' },
    { label: 'Orange', color: '#C2410C', bg: '#FFEDD5' },
    { label: 'Indigo', color: '#3730A3', bg: '#E0E7FF' },
  ];

  const initialStatuses = project.customStatuses && project.customStatuses.length > 0
    ? project.customStatuses
    : [
        { name: 'Todo',        color: '#6B7280', bg: '#F3F4F6' },
        { name: 'In Progress', color: '#1D4ED8', bg: '#DBEAFE' },
        { name: 'Review',      color: '#D97706', bg: '#FEF3C7' },
        { name: 'Done',        color: '#065F46', bg: '#D1FAE5' },
      ];

  const [statuses, setStatuses] = useState(initialStatuses);
  const [newStatusName, setNewStatusName] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddStatus = () => {
    if (!newStatusName.trim()) {
      showToast('Status name cannot be empty', 'error');
      return;
    }
    const nameExists = statuses.some(s => s.name.toLowerCase() === newStatusName.trim().toLowerCase());
    if (nameExists) {
      showToast('Status name already exists', 'error');
      return;
    }

    const colorOpt = colorOptions[selectedColorIdx];
    const newStatus = {
      name: newStatusName.trim(),
      color: colorOpt.color,
      bg: colorOpt.bg,
      order: statuses.length
    };

    setStatuses([...statuses, newStatus]);
    setNewStatusName('');
  };

  const handleDeleteStatus = (index) => {
    const statusToDelete = statuses[index];
    if (['todo', 'done'].includes(statusToDelete.name.toLowerCase())) {
      showToast('Cannot delete default Todo or Done statuses', 'error');
      return;
    }
    const updated = statuses.filter((_, idx) => idx !== index);
    setStatuses(updated.map((s, idx) => ({ ...s, order: idx })));
  };

  const handleColorChange = (index, colorValue) => {
    const opt = colorOptions.find(o => o.color === colorValue);
    if (!opt) return;
    
    const updated = statuses.map((s, idx) => {
      if (idx === index) {
        return { ...s, color: opt.color, bg: opt.bg };
      }
      return s;
    });
    setStatuses(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await projectService.updateProject(project._id, {
        customStatuses: statuses
      });
      showToast('Project custom statuses saved!', 'success');
      onStatusesUpdated();
      onClose();
    } catch (error) {
      showToast('Failed to save custom statuses', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors animate-none"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Task Statuses</h2>
        
        {/* Statuses List */}
        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
          {statuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3.5 h-3.5 rounded-full inline-block shrink-0" 
                  style={{ backgroundColor: status.color }}
                />
                <span className="font-semibold text-[14px] text-gray-900">{status.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={status.color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="text-[13px] border border-gray-200 rounded-lg shadow-sm py-1 px-2 font-medium bg-white"
                >
                  {colorOptions.map(opt => (
                    <option key={opt.color} value={opt.color}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {!['todo', 'done'].includes(status.name.toLowerCase()) && (
                  <button 
                    onClick={() => handleDeleteStatus(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Delete status"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Status */}
        <div className="border-t border-gray-100 pt-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add new status:</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="e.g. Testing, Blocked"
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
            <select
              value={selectedColorIdx}
              onChange={(e) => setSelectedColorIdx(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm"
            >
              {colorOptions.map((opt, idx) => (
                <option key={opt.color} value={idx}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddStatus}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            style={{ background: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save Statuses'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomStatusManager;
