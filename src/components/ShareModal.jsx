import React, { useState, useEffect } from 'react';

const API_URL = '/api';

const ShareModal = ({ projectId, projectName, onClose }) => {
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [canEdit, setCanEdit] = useState(false);
    const [expiresIn, setExpiresIn] = useState('');

    useEffect(() => {
        fetchShares();
    }, [projectId]);

    const fetchShares = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/projects/${projectId}/shares`, {
                credentials: 'include'
            });
            const data = await response.json();
            setShares(data);
        } catch (error) {
            console.error('Failed to load shares', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShare = async () => {
        try {
            setCreating(true);
            const expires = expiresIn ? parseInt(expiresIn) : null;
            const response = await fetch(`${API_URL}/projects/${projectId}/share`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ canEdit, expiresIn: expires })
            });
            const data = await response.json();
            setShareLink(data.shareUrl);
            fetchShares();
        } catch (error) {
            console.error('Failed to create share', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteShare = async (shareId) => {
        if (!window.confirm('Remove this share link?')) return;
        
        try {
            await fetch(`${API_URL}/projects/${projectId}/shares/${shareId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchShares();
        } catch (error) {
            console.error('Failed to delete share', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">Share Design</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Collaborate & Share</p>
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

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Create New Link</h3>
                        
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={canEdit}
                                    onChange={(e) => setCanEdit(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                                />
                                Allow editing
                            </label>
                        </div>

                        <select
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm"
                        >
                            <option value="">No expiration</option>
                            <option value="3600">1 hour</option>
                            <option value="86400">24 hours</option>
                            <option value="604800">7 days</option>
                            <option value="2592000">30 days</option>
                        </select>

                        <button
                            onClick={handleCreateShare}
                            disabled={creating}
                            className="w-full py-3 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Generate Link
                                </>
                            )}
                        </button>

                        {shareLink && (
                            <div className="p-4 bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(shareLink)}
                                        className="px-4 py-2 bg-brand text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Links</h3>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : shares.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No active share links</p>
                        ) : (
                            <div className="space-y-2">
                                {shares.map((share) => (
                                    <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-ink dark:text-white">
                                                    {share.canEdit ? 'Can edit' : 'View only'}
                                                </span>
                                                {share.expiresAt && new Date(share.expiresAt) < new Date() && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-500 text-[8px] font-bold uppercase rounded">Expired</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400">Expires: {formatDate(share.expiresAt)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteShare(share.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
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
                </div>

                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>{shares.length} Active Link{shares.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
