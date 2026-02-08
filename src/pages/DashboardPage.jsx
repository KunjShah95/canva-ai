import React, { useState, useEffect } from 'react';
import { getProjects } from '../utils/projectService';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const onEdit = (id) => {
        if (id && typeof id !== 'object') {
            navigate(`/editor/${id}`);
        } else {
            navigate('/editor');
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="bg-white dark:bg-black min-h-screen pt-32 pb-20 px-6 selection:bg-brand selection:text-white">
            <div className="max-w-7xl mx-auto">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-in">
                    <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-[0.4em] mb-4 block">
                            WELCOME BACK
                        </span>
                        <h1 className="text-5xl md:text-6xl font-serif text-ink dark:text-white leading-tight">
                            My <span className="italic font-light">Creations</span>
                        </h1>
                    </div>
                    <button
                        onClick={onEdit}
                        className="bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105"
                    >
                        CREATE NEW PROJECT
                    </button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Empty State / Add New */}
                    <div
                        onClick={onEdit}
                        className="aspect-[4/3] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-brand group-hover:text-white transition-all">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Design</span>
                    </div>

                    {/* Project Cards */}
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="group relative aspect-[4/3] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                                <div className="absolute inset-0 bg-gray-50 dark:bg-[#111] -z-10"></div>
                                {project.thumbnail && (
                                    <img src={project.thumbnail} alt={project.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                )}

                                {/* Card Content Mockup */}
                                <div className="p-8 h-full flex flex-col relative z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                                    <div className="flex-grow"></div>

                                    <div className="flex items-end justify-between gap-4">
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-white shadow-black drop-shadow-md">{project.name}</h3>
                                            <p className="text-[10px] text-gray-300 mt-1 font-mono uppercase italic">{new Date(project.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => onEdit(project.id)}
                                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>

                {/* Subscription Status Card */}
                <div className="mt-32 p-12 bg-[#FAFAFA] dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-ink dark:text-white">Free Plan User</h4>
                            <p className="text-sm text-gray-500">Upgrade to remove watermarks from your <strong>3 projects</strong>.</p>
                        </div>
                    </div>
                    <button className="bg-brand text-white px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark shadow-xl shadow-brand/20">
                        UPGRADE FOR $3/MO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
