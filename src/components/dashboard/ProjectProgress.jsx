import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Users } from 'lucide-react';

const ProjectProgress = ({ projects = [] }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-emerald-100 text-emerald-600';
      case 'archived': return 'bg-gray-100 text-gray-600';
      case 'on_hold': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <FolderKanban className="text-indigo-500 w-5 h-5" />
        <h3 className="text-[18px] font-semibold text-gray-900">Project Progress</h3>
      </div>

      {projects.length > 0 ? (
        <div className="flex flex-col">
          {projects.map((project, index) => {
            const completed = project.tasksCompleted || 0;
            const total = project.totalTasks || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const members = project.members || [];
            
            return (
              <div key={project._id} className={`py-5 ${index !== projects.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <Link to={`/projects/${project._id}`} className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status || 'active')}`}>
                          {(project.status || 'active').replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        <span>{completed} / {total} tasks completed</span>
                        {members.length > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{members.length} members</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <div className="flex -space-x-2">
                        {members.slice(0, 3).map((member, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold border-2 border-white relative z-10" title={member.user?.fullName}>
                            {getInitials(member.user?.fullName)}
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold border-2 border-white relative z-10">
                            +{members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12 text-right">{progress}%</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No active projects found</p>
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;
