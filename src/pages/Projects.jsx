import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/project.service';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { Plus, FolderKanban, Search, LayoutGrid, List as ListIcon, ArrowRight, Users } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      // Fetching stats for each project might be needed for progress, but we assume we have tasks attached or we can just show dummy or existing progress. 
      // Actually backend might not return task counts in `getProjects`, let's see. If not, we just show what we have.
      setProjects(data);
    } catch (error) {
      showToast('Failed to fetch projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-[24px] space-y-4 sm:space-y-[24px] max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Projects</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage your team's projects</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 h-[38px] text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-shadow"
            />
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>New Project</span>
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-[12px]" />)}
        </div>
      ) : filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                onClick={() => navigate(`/projects/${project._id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-[12px] overflow-x-auto shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[13px] font-semibold text-gray-500">
                  <th className="px-5 py-3 font-medium">Project Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium">Team</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map(project => {
                  const pct = project.progress || 0; // assuming progress might be calculated elsewhere or not available, fallback to 0
                  return (
                    <tr key={project._id} className="hover:bg-gray-50 cursor-pointer transition-colors group" onClick={() => navigate(`/projects/${project._id}`)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FolderKanban className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="font-semibold text-[14px] text-gray-900">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge color={project.status === 'active' ? 'green' : 'gray'}>{project.status === 'active' ? 'Active' : project.status}</Badge>
                      </td>
                      <td className="px-5 py-4 w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-[13px] font-medium text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          {project.members?.length || 0} members
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 inline-block transition-colors" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[12px] border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-[18px] font-semibold text-gray-900 mb-1">No projects found</h3>
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

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default Projects;
