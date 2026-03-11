import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Canvas from '../components/Canvas';
import * as fabric from 'fabric';

const SharePage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        const fetchSharedProject = async () => {
            try {
                const response = await fetch(`/api/share/${token}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Share link not found');
                    } else if (response.status === 410) {
                        setError('This share link has expired');
                    } else {
                        setError('Failed to load shared project');
                    }
                    return;
                }
                const data = await response.json();
                setProject(data.project);
                setCanEdit(data.canEdit);
            } catch (err) {
                setError('Failed to load shared project');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchSharedProject();
        }
    }, [token]);

    const handleCanvasReady = (canvasInstance) => {
        setCanvas(canvasInstance);
        
        if (project?.data) {
            canvasInstance.loadFromJSON(project.data).then(() => {
                canvasInstance.renderAll();
                if (!canEdit) {
                    canvasInstance.forEachObject((obj) => {
                        obj.selectable = false;
                        obj.evented = false;
                    });
                }
            });
        }
        
        if (project?.width && project?.height) {
            canvasInstance.setDimensions({ width: project.width, height: project.height });
        }
    };

    const handleSaveCopy = async () => {
        if (!canvas || !canEdit) return;

        const token = localStorage.getItem('canvas-ai-token');
        if (!token) {
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: `${project.name} (Copy)`,
                    data: canvas.toJSON(),
                    thumbnail: canvas.toDataURL({ format: 'png', multiplier: 0.2 }),
                    width: canvas.width,
                    height: canvas.height
                })
            });

            if (response.ok) {
                const savedProject = await response.json();
                navigate(`/editor/${savedProject.id}`);
            }
        } catch (error) {
            console.error('Failed to save copy', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Project...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                            <path d="M12 9v4m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.53 20h14.94a2 2 0 001.74-3l-7.5-13a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-serif text-ink dark:text-white mb-2">Unable to Load</h1>
                    <p className="text-sm text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-screen bg-[#FDFDFD] dark:bg-black overflow-hidden">
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="h-14 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-brand uppercase tracking-[0.3em] leading-none">
                                {canEdit ? 'Editing' : 'Viewing'}
                            </span>
                            <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1 text-ink dark:text-white">
                                {project?.name || 'Shared Project'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSaveCopy}
                            disabled={!canEdit}
                            className="px-4 py-2 bg-brand text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save as Copy
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative dot-grid opacity-20 flex flex-col bg-[#FAFAFA] dark:bg-[#050505]">
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-full h-full max-w-5xl max-h-[80vh] bg-white dark:bg-black shadow-2xl rounded-sm border border-gray-100 dark:border-white/5 overflow-hidden relative">
                            <Canvas onCanvasReady={handleCanvasReady} />
                        </div>
                    </div>
                </div>

                <div className="h-10 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black flex items-center px-8 justify-between text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    <span>Shared via Canvas AI</span>
                    <span>{canEdit ? 'You can edit this project' : 'View only mode'}</span>
                </div>
            </main>
        </div>
    );
};

export default SharePage;
