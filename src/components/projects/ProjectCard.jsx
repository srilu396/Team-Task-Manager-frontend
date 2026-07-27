import React, { memo } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { Users, Calendar, CheckSquare, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
  const statusColors = {
    active: 'green',
    completed: 'blue',
    archived: 'gray',
  };

  const totalTasks = project.totalTasks || 0;
  const completedTasks = project.completedTasks || 0;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <Card
      onClick={onClick}
      className="flex flex-col h-full bg-white border border-gray-200/80 hover:border-indigo-300 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
    >
      {/* Top Accent Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header: Title + Status */}
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug flex-1">
          {project.name}
        </h3>
        <Badge color={statusColors[project.status] || 'gray'} className="capitalize shrink-0 text-xs font-semibold px-2.5 py-1">
          {project.status || 'active'}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs sm:text-sm mb-5 flex-1 line-clamp-3 leading-relaxed">
        {project.description || 'No description provided for this project.'}
      </p>

      {/* Progress Section */}
      <div className="mb-5 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-gray-700 flex items-center gap-1.5">
            <CheckSquare size={14} className="text-indigo-500" />
            {completedTasks} / {totalTasks} tasks
          </span>
          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200/80 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer / Avatar Stack & Action */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar Stack */}
          <div className="flex -space-x-2 shrink-0">
            {project.members?.slice(0, 4).map((member, i) => (
              <Avatar
                key={member.user?._id || member.user || i}
                name={member.user?.fullName || 'User'}
                src={member.user?.profileImage || member.user?.avatar}
                size="sm"
                className="border-2 border-white ring-1 ring-gray-100 shadow-xs"
                style={{ zIndex: 10 - i }}
              />
            ))}
            {project.members?.length > 4 && (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 border-2 border-white text-[11px] font-bold text-indigo-700 z-0">
                +{project.members.length - 4}
              </div>
            )}
          </div>

          <span className="text-xs font-semibold text-gray-500 hidden sm:inline-block">
            {project.members?.length || 0} {project.members?.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          <span>Open</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
};

export default memo(ProjectCard);
