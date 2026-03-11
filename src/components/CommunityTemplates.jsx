import React, { useState, useEffect } from 'react';

const CommunityTemplates = ({ canvas, onClose, onLoadTemplate }) => {
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchTemplates();
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [selectedCategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/templates/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (searchQuery) params.append('search', searchQuery);
            
            const response = await fetch(`/api/templates?${params}`);
            const data = await response.json();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadTemplate = (template) => {
        if (onLoadTemplate) {
            onLoadTemplate(template);
        }
        onClose();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">Community Templates</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Browse & Use Templates</p>
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

                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.name} ({cat.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading Templates...</span>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-ink dark:text-white mb-2">No Templates Found</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                {searchQuery ? 'Try adjusting your search' : 'No public templates available yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => handleLoadTemplate(template)}
                                    className="group cursor-pointer border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-brand hover:shadow-xl hover:shadow-brand/5 transition-all"
                                >
                                    <div 
                                        className="h-32 relative"
                                        style={{ backgroundColor: template.backgroundColor || '#ffffff' }}
                                    >
                                        {template.thumbnail ? (
                                            <img
                                                src={template.thumbnail}
                                                alt={template.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                Use Template
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50/50 dark:bg-white/5">
                                        <h4 className="font-bold text-ink dark:text-white text-sm truncate">{template.name}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 uppercase tracking-widest">
                                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{template.category}</span>
                                            <span>{template.width}x{template.height}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>{templates.length} Template{templates.length !== 1 ? 's' : ''}</span>
                    <span>Community Library</span>
                </div>
            </div>
        </div>
    );
};

export default CommunityTemplates;
