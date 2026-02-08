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

    const handleCanvasReady = React.useCallback((canvasInstance) => {
        setCanvas(canvasInstance);
    }, []);

    useEffect(() => {
        if (id && canvas) {
            const loadProject = async () => {
                setStatus('Loading Project...');
                try {
                    const project = await getProject(id);
                    setCurrentProject(project);
                    if (project.data) {
                        canvas.loadFromJSON(project.data, () => {
                            canvas.renderAll();
                            setStatus('Project Loaded');
                            setTimeout(() => setStatus('Ready'), 2000);
                        });
                    }
                } catch (error) {
                    console.error("Failed to load project", error);
                    setStatus('Error Loading Project');
                }
            };
            loadProject();
        }
    }, [id, canvas]);

    const navigate = useNavigate();

    const handleProjectSaved = (newProject) => {
        navigate(`/editor/${newProject.id}`, { replace: true });
    };

    return (
        <div className="flex w-full h-[calc(100vh-64px)] bg-[#FDFDFD] dark:bg-black overflow-hidden mt-16">
            <aside className="w-[340px] flex-shrink-0 border-r border-gray-100 dark:border-white/5 bg-white dark:bg-black relative z-20 flex flex-col">
                <Toolbar
                    canvas={canvas}
                    status={status}
                    setStatus={setStatus}
                    currentProject={currentProject}
                    projectId={id}
                    onProjectSaved={handleProjectSaved}
                />
            </aside>

            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="h-14 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-brand uppercase tracking-[0.3em] leading-none">Draft</span>
                            <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1 text-ink dark:text-white">Untitled Project</h2>
                        </div>
                        <div className="w-px h-6 bg-gray-100 dark:bg-white/10"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">AI Engine Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">v1.0</span>
                    </div>
                </div>

                <div className="flex-1 relative dot-grid opacity-20 flex flex-col bg-[#FAFAFA] dark:bg-[#050505]">
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-full h-full max-w-5xl max-h-[80vh] bg-white dark:bg-black shadow-2xl rounded-sm border border-gray-100 dark:border-white/5 overflow-hidden relative">
                            <Canvas onCanvasReady={handleCanvasReady} setEditorZoom={setZoom} />
                        </div>
                    </div>

                    <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-brand/20"></div>
                    <div className="absolute top-10 right-10 w-4 h-4 border-t border-r border-brand/20"></div>
                    <div className="absolute bottom-10 left-10 w-4 h-4 border-b border-l border-brand/20"></div>
                    <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-brand/20"></div>
                </div>

                <div className="h-10 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black flex items-center px-8 justify-between text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <span className="opacity-40">Zoom:</span>
                            <span className="text-ink dark:text-white">{zoom}%</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="opacity-40">Status:</span>
                            <span className={`transition-colors duration-300 ${status.includes('Error') ? 'text-red-500' : 'text-brand'}`}>
                                {status}
                            </span>
                        </span>
                    </div>
                    <div className="flex gap-8">
                        <span>Canvas AI Editor</span>
                        <span>User: {user?.name || 'Guest'}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditorPage;
