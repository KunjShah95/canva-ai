import React, { useState, useEffect } from 'react';
import { getProjects, deleteProject } from '../utils/projectService';

const MyProjects = ({ onLoadProject, onClose }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleDelete = async (e, projectId) => {
        e.stopPropagation();
        if (window.confirm('Delete this design forever?')) {
            try {
                await deleteProject(projectId);
                setProjects(projects.filter(p => p.id !== projectId));
            } catch (error) {
                console.error("Failed to delete project", error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">Recent Designs</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Project Library</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-400 hover:text-ink dark:hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Opening Vault...</span>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-ink dark:text-white mb-2">No Designs Found</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">Your creative journey starts with a single click. Go ahead and create something amazing!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => {
                                        onLoadProject(project);
                                        onClose();
                                    }}
                                    className="group flex items-center gap-6 p-5 border border-gray-100 dark:border-white/5 bg-white dark:bg-black rounded-2xl hover:border-brand hover:shadow-xl hover:shadow-brand/5 cursor-pointer transition-all relative overflow-hidden"
                                >
                                    {/* Subtle hover gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Thumbnail */}
                                    <div className="w-28 h-20 bg-gray-50 dark:bg-[#111] rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5 relative z-10">
                                        {project.thumbnail ? (
                                            <img
                                                src={project.thumbnail}
                                                alt={project.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <h3 className="font-bold text-ink dark:text-white group-hover:text-brand transition-colors truncate">{project.name || 'Unnamed Project'}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                                            <span>{project.width}x{project.height}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-white/10"></span>
                                            <span>{formatDate(project.lastModified)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={(e) => handleDelete(e, project.id)}
                                        className="relative z-20 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>{projects.length} Saved Design{projects.length !== 1 ? 's' : ''}</span>
                    <span className="font-mono opacity-50 italic">C_AI_VAULT_v.0.8</span>
                </div>
            </div>
        </div>
    );
};

export default MyProjects;
