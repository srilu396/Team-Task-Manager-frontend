import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const types = {
    success: {
      icon: <CheckCircle className="text-emerald-500 shrink-0" size={18} />,
      bg: 'bg-white border-emerald-200/80 text-gray-800 shadow-xl ring-1 ring-emerald-500/10',
    },
    error: {
      icon: <AlertTriangle className="text-red-500 shrink-0" size={18} />,
      bg: 'bg-white border-red-200/80 text-gray-800 shadow-xl ring-1 ring-red-500/10',
    },
    info: {
      icon: <Info className="text-indigo-500 shrink-0" size={18} />,
      bg: 'bg-white border-indigo-200/80 text-gray-800 shadow-xl ring-1 ring-indigo-500/10',
    },
  };

  const current = types[type] || types.info;

  // Sanitize message to hide internal code or stack details
  const displayMessage = typeof message === 'string'
    ? message.replace(/Network Error|AxiosError|\[object Object\]/gi, 'An unexpected error occurred. Please try again.')
    : 'Operation completed';

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl w-80 sm:w-96 transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${current.bg}`}>
      {current.icon}
      <p className="flex-1 text-xs font-semibold leading-relaxed truncate">{displayMessage}</p>
      <button onClick={onClose} aria-label="Close notification" className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
