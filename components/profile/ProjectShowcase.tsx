
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiService } from '../../services/api';
import { PortfolioProject, User } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { toast } from '../Toast';
import { DeleteModal } from '../DeleteModal';

interface ProjectShowcaseProps {
  currentUser?: User | null;
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ currentUser }) => {
  const { language } = useTranslation();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<PortfolioProject>>({});
  const [projectToDelete, setProjectToDelete] = useState<PortfolioProject | null>(null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isVip = currentUser?.vip && currentUser?.private_token === 'ilovechenfangting';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await apiService.getPortfolioProjects();
      setProjects(data);
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalized = (obj: any, field: string) => {
    return language === 'zh' ? (obj[`${field}_zh`] || obj[`${field}_en`]) : (obj[`${field}_en`] || obj[`${field}_zh`]);
  };

  const handleCreate = () => {
    setCurrentProject({
      title_zh: '', title_en: '',
      summary_zh: '', summary_en: '',
      description_zh: '', description_en: '',
      techStack: [],
      repoUrl: '', demoUrl: '', coverImage: '',
      order: 0, isVisible: true
    });
    setIsEditing(true);
  };

  const handleEdit = (project: PortfolioProject) => {
    setCurrentProject({ ...project });
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await apiService.deleteProject(projectToDelete._id);
      loadProjects();
      setProjectToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProject._id) {
        await apiService.updateProject(currentProject._id, currentProject);
      } else {
        await apiService.createProject(currentProject);
      }
      setIsEditing(false);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentProject(prev => ({
      ...prev,
      techStack: val.split(',').map(s => s.trim()).filter(s => s)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await apiService.uploadImage(file);
      setCurrentProject(prev => ({ ...prev, coverImage: url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        ))}
      </div>
    );
  }

  // Styles for the "Kraft Paper" vs "Star Chart" theme in editor
  const modalBaseClass = "fixed z-[9999] inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";
  const editorClass = "w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl border bg-white text-slate-900 border-slate-200 dark:bg-[#020617] dark:text-slate-100 dark:border-slate-700 animate-slide-up";
  const inputClass = "w-full p-3 rounded-lg outline-none border focus:border-primary-500 bg-slate-50 border-slate-200 dark:bg-[#1e293b] dark:border-slate-700";

  return (
    <div className="relative pb-20">
      <DeleteModal 
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Project?"
      />

      {isVip && (
        <div className="mb-8 flex justify-end">
          <button 
            onClick={handleCreate}
            className="px-6 py-2 bg-primary-600 dark:bg-amber-500 text-white dark:text-black rounded-xl font-bold uppercase text-sm hover:bg-primary-700 dark:hover:bg-amber-400 transition-colors shadow-lg shadow-primary-500/20 dark:shadow-amber-500/20"
          >
            <i className="fas fa-plus mr-2"></i> Add Project
          </button>
        </div>
      )}

      {/* Edit Modal - Portal to Body for Centering */}
      {isEditing && createPortal(
        <div className={modalBaseClass}>
          <div className={editorClass}>
            <h2 className="text-2xl font-bold mb-6 font-display">
              {currentProject._id ? 'Edit Project' : 'New Project'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider opacity-60 border-b border-current pb-2">Chinese Content</h3>
                  <input 
                    className={inputClass}
                    placeholder="Title (ZH)"
                    value={currentProject.title_zh || ''}
                    onChange={e => setCurrentProject(p => ({...p, title_zh: e.target.value}))}
                    required
                  />
                  <textarea 
                    className={`${inputClass} h-24`}
                    placeholder="Summary (ZH)"
                    value={currentProject.summary_zh || ''}
                    onChange={e => setCurrentProject(p => ({...p, summary_zh: e.target.value}))}
                  />
                  <textarea 
                    className={`${inputClass} h-40 font-mono text-sm`}
                    placeholder="Description Markdown (ZH)"
                    value={currentProject.description_zh || ''}
                    onChange={e => setCurrentProject(p => ({...p, description_zh: e.target.value}))}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider opacity-60 border-b border-current pb-2">English Content</h3>
                  <input 
                    className={inputClass}
                    placeholder="Title (EN)"
                    value={currentProject.title_en || ''}
                    onChange={e => setCurrentProject(p => ({...p, title_en: e.target.value}))}
                    required
                  />
                  <textarea 
                    className={`${inputClass} h-24`}
                    placeholder="Summary (EN)"
                    value={currentProject.summary_en || ''}
                    onChange={e => setCurrentProject(p => ({...p, summary_en: e.target.value}))}
                  />
                  <textarea 
                    className={`${inputClass} h-40 font-mono text-sm`}
                    placeholder="Description Markdown (EN)"
                    value={currentProject.description_en || ''}
                    onChange={e => setCurrentProject(p => ({...p, description_en: e.target.value}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-current opacity-80">
                 <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase opacity-60">Tech Stack (comma separated)</label>
                    <input 
                      className={inputClass}
                      placeholder="React, Node.js, TypeScript"
                      value={currentProject.techStack?.join(', ') || ''}
                      onChange={handleTechStackChange}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase opacity-60">Links & Media</label>
                    <input 
                      className={inputClass}
                      placeholder="Demo URL"
                      value={currentProject.demoUrl || ''}
                      onChange={e => setCurrentProject(p => ({...p, demoUrl: e.target.value}))}
                    />
                    <input 
                      className={inputClass}
                      placeholder="Repo URL"
                      value={currentProject.repoUrl || ''}
                      onChange={e => setCurrentProject(p => ({...p, repoUrl: e.target.value}))}
                    />
                    
                    <div className="flex gap-2">
                      <input 
                        className={inputClass}
                        placeholder="Cover Image URL"
                        value={currentProject.coverImage || ''}
                        onChange={e => setCurrentProject(p => ({...p, coverImage: e.target.value}))}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center min-w-[3rem]"
                        title="Upload Image"
                      >
                        {isUploading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-upload"></i>}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload} 
                      />
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-6 pt-4">
                 <div className="flex items-center gap-2">
                    <label className="text-sm font-bold">Order Priority:</label>
                    <input 
                      type="number" 
                      className={`${inputClass} w-24 text-center`}
                      value={currentProject.order || 0}
                      onChange={e => setCurrentProject(p => ({...p, order: parseInt(e.target.value)}))}
                    />
                 </div>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={currentProject.isVisible ?? true}
                      onChange={e => setCurrentProject(p => ({...p, isVisible: e.target.checked}))}
                      className="accent-primary-500 w-5 h-5"
                    />
                    <span className="text-sm font-bold">Visible</span>
                 </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-current opacity-80">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-lg font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black rounded-lg font-bold shadow-lg shadow-primary-500/20 dark:shadow-amber-500/20 transition-all"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div 
            key={project._id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            {/* Admin Controls */}
            {isVip && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <i className="fas fa-pencil-alt text-xs"></i>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            )}

            {/* Cover Image */}
            <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
              {project.coverImage ? (
                <img 
                  src={project.coverImage} 
                  alt={getLocalized(project, 'title')} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  <i className="fas fa-cube text-4xl text-slate-300 dark:text-slate-600"></i>
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              
              {/* Tech Stack Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white rounded border border-white/10">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-500 transition-colors">
                {getLocalized(project, 'title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {getLocalized(project, 'summary')}
              </p>

              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                {project.demoUrl && (
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                  >
                    <i className="fas fa-external-link-alt"></i> Live Demo
                  </a>
                )}
                {project.repoUrl && (
                  <a 
                    href={project.repoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                  >
                    <i className="fab fa-github"></i> Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
