import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { useAuth } from '../context/AuthContext';
import { getProject } from '../utils/projectService';

const EditorPage = () => {
    const { id } = useParams();
    const [canvas, setCanvas] = useState(null);
    const [status, setStatus] = useState('Ready');
    const [zoom, setZoom] = useState(100);
    const { user } = useAuth();
    const [currentProject, setCurrentProject] = useState(null);
    const [isProjectLoading, setIsProjectLoading] = useState(Boolean(id));
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleCanvasReady = React.useCallback((canvasInstance) => {
        setCanvas(canvasInstance);
    }, []);

    useEffect(() => {
        if (id && canvas) {
            const loadProject = async () => {
                setIsProjectLoading(true);
                setStatus('Loading Project...');
                try {
                    const project = await getProject(id);
                    setCurrentProject(project);
                    if (project.data) {
                        if (project.width && project.height) {
                            canvas.setDimensions({ width: project.width, height: project.height });
                        }
                        await canvas.loadFromJSON(project.data);
                        canvas.renderAll();
                    }
                    setStatus('Project Loaded');
                    setTimeout(() => setStatus('Ready'), 2000);
                } catch (error) {
                    console.error("Failed to load project", error);
                    setStatus('Error Loading Project');
                } finally {
                    setIsProjectLoading(false);
                }
            };
            loadProject();
        } else if (!id) {
            setCurrentProject(null);
            setIsProjectLoading(false);
        }
    }, [id, canvas]);

    const navigate = useNavigate();

    const handleProjectSaved = (newProject) => {
        navigate(`/editor/${newProject.id}`, { replace: true });
    };

    return (
        <div className="flex w-full h-[calc(100vh-64px)] bg-[#FDFDFD] dark:bg-black overflow-hidden mt-16">
            {/* Mobile sidebar toggle */}
            {isMobile && (
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-brand text-white rounded-full shadow-lg flex items-center justify-center md:hidden"
                >
                    {sidebarOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            )}

            {/* Sidebar */}
            <aside className={`
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-[340px]' : 'w-[340px]'}
                flex-shrink-0 border-r border-gray-100 dark:border-white/5 bg-white dark:bg-black relative z-20 flex flex-col
                transition-transform duration-300 ease-in-out
            `}>
                <Toolbar
                    canvas={canvas}
                    status={status}
                    setStatus={setStatus}
                    currentProject={currentProject}
                    projectId={id}
                    isProjectLoading={isProjectLoading}
                    onProjectSaved={handleProjectSaved}
                />
            </aside>

            {/* Overlay for mobile */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="h-14 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-brand uppercase tracking-[0.3em] leading-none hidden sm:block">Draft</span>
                            <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1 text-ink dark:text-white truncate max-w-[120px] md:max-w-none">
                                {currentProject?.name || 'Untitled Project'}
                            </h2>
                        </div>
                        <div className="w-px h-6 bg-gray-100 dark:bg-white/10 hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hidden md:inline">AI Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest hidden sm:inline">v1.0</span>
                    </div>
                </div>

                <div className="flex-1 relative dot-grid opacity-20 flex flex-col bg-[#FAFAFA] dark:bg-[#050505]">
                    <div className="flex-1 flex items-center justify-center p-4 md:p-12">
                        <div className="w-full h-full max-w-5xl max-h-[80vh] bg-white dark:bg-black shadow-2xl rounded-sm border border-gray-100 dark:border-white/5 overflow-hidden relative">
                            <Canvas onCanvasReady={handleCanvasReady} setEditorZoom={setZoom} />
                        </div>
                    </div>

                    <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-brand/20 hidden md:block"></div>
                    <div className="absolute top-10 right-10 w-4 h-4 border-t border-r border-brand/20 hidden md:block"></div>
                    <div className="absolute bottom-10 left-10 w-4 h-4 border-b border-l border-brand/20 hidden md:block"></div>
                    <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-brand/20 hidden md:block"></div>
                </div>

                <div className="h-10 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black flex items-center px-4 md:px-8 justify-between text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    <div className="flex gap-4 md:gap-6">
                        <span className="flex items-center gap-2">
                            <span className="opacity-40 hidden sm:inline">Zoom:</span>
                            <span className="text-ink dark:text-white">{zoom}%</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="opacity-40 hidden sm:inline">Status:</span>
                            <span className={`transition-colors duration-300 ${status.includes('Error') ? 'text-red-500' : 'text-brand'}`}>
                                {status}
                            </span>
                        </span>
                    </div>
                    <div className="hidden md:flex gap-8">
                        <span>Canvas AI</span>
                        <span>{user?.name || 'Guest'}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditorPage;
