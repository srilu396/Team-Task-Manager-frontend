import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsQuery } from '../hooks/useProjectsQuery';
import { AuthContext } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { Plus, FolderKanban, Search, LayoutGrid, List as ListIcon, ArrowRight, Users } from 'lucide-react';

const Projects = () => {
  const { data: projects = [], isLoading } = useProjectsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const filteredProjects = useMemo(() => {
    if (!debouncedSearchTerm) return projects;
    const term = debouncedSearchTerm.toLowerCase();
    return projects.filter((project) => 
      project.name.toLowerCase().includes(term) || 
      (project.description && project.description.toLowerCase().includes(term))
    );
  }, [projects, debouncedSearchTerm]);

  return (
    <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Projects</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage your team's projects and workloads</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-[42px] text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 transition-all shadow-xs"
            />
          </div>

          {user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0 h-[42px] px-5 rounded-xl shadow-sm">
              <Plus size={18} />
              <span className="font-semibold">New Project</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                onClick={() => navigate(`/projects/${project._id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Project Name</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5">Team</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProjects.map((project) => {
                  const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : (project.progress || 0);
                  return (
                    <tr 
                      key={project._id} 
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group" 
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FolderKanban className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors block">
                              {project.name}
                            </span>
                            {project.description && (
                              <span className="text-xs text-gray-400 line-clamp-1">{project.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge color={project.status === 'active' ? 'green' : 'gray'} className="capitalize">
                          {project.status || 'active'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-9">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          {project.members?.length || 0} members
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 inline-block group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-1">No projects found</h3>
          <p className="text-gray-500 text-center max-w-sm text-[14px]">
            {searchTerm ? "No projects match your search." : (user?.role === 'admin' 
              ? "Get started by creating a new project for your team." 
              : "You haven't been assigned to any projects yet.")}
          </p>
          {!searchTerm && user?.role === 'admin' && (
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              Create Project
            </Button>
          )}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Projects;
