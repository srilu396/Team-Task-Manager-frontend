import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const types = {
    success: { icon: <CheckCircle className="text-green-500" size={20} />, bg: 'bg-green-50 border-green-200 text-green-800' },
    error: { icon: <XCircle className="text-red-500" size={20} />, bg: 'bg-red-50 border-red-200 text-red-800' },
    info: { icon: <Info className="text-blue-500" size={20} />, bg: 'bg-blue-50 border-blue-200 text-blue-800' }
  };

  const current = types[type] || types.info;

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg shadow-lg w-80 animate-in slide-in-from-right-full ${current.bg}`}>
      {current.icon}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="text-current opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
