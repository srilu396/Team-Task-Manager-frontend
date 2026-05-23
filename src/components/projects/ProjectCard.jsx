import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { Users, Calendar } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
  const statusColors = {
    active: 'green',
    completed: 'blue',
    archived: 'gray'
  };

  const totalTasks = project.totalTasks || 0;
  const completedTasks = project.completedTasks || 0;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <Card onClick={onClick} className="flex flex-col h-full hover:border-primary/50 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{project.name}</h3>
        <Badge color={statusColors[project.status] || 'gray'} className="capitalize">{project.status}</Badge>
      </div>
      
      <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-2">
        {project.description || 'No description provided.'}
      </p>

      {/* Task Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{completedTasks} / {totalTasks} tasks</span>
          <span className="font-medium text-gray-700">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 4).map((member, i) => (
            <Avatar 
              key={member.user._id || member.user} 
              name={member.user.fullName || 'User'} 
              src={member.user.profileImage || member.user.avatar}
              size="sm" 
              className="border-2 border-white"
              style={{ zIndex: 10 - i }}
            />
          ))}
          {project.members?.length > 4 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium text-gray-600 z-0">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        
        <div className="flex items-center text-gray-500 text-sm gap-4">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{project.members?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
