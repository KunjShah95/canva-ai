import React, { useState, useEffect } from 'react';
import { getProjectVersions, getProjectVersion } from '../utils/projectService';

const VersionHistoryPanel = ({ canvas, projectId, onClose }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchVersions();
        }
    }, [projectId]);

    const fetchVersions = async () => {
        try {
            setLoading(true);
            const data = await getProjectVersions(projectId);
            setVersions(data);
        } catch (error) {
            console.error('Failed to load versions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (version) => {
        if (!window.confirm(`Restore to "${version.name}"? Current changes will be lost.`)) {
            return;
        }

        try {
            setRestoring(version.id);
            const fullVersion = await getProjectVersion(projectId, version.id);
            
            if (canvas && fullVersion.data) {
                await canvas.loadFromJSON(fullVersion.data);
                canvas.renderAll();
                onClose();
            }
        } catch (error) {
            console.error('Failed to restore version', error);
        } finally {
            setRestoring(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">Version History</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Restore Previous</p>
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

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-ink dark:text-white mb-2">No Versions Yet</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">Version snapshots will appear here as you save your project.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:border-brand/40 transition-all"
                                >
                                    <div className="w-16 h-12 bg-gray-50 dark:bg-[#111] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5">
                                        {version.thumbnail ? (
                                            <img
                                                src={version.thumbnail}
                                                alt={version.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-ink dark:text-white truncate">{version.name || 'Unnamed Version'}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{formatDate(version.createdAt)}</p>
                                    </div>

                                    <button
                                        onClick={() => handleRestore(version)}
                                        disabled={restoring === version.id}
                                        className="px-4 py-2 bg-brand text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50"
                                    >
                                        {restoring === version.id ? 'Restoring...' : 'Restore'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>{versions.length} Version{versions.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
