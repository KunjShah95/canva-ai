import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleStart = () => {
        if (isAuthenticated) {
            navigate('/editor');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="bg-white dark:bg-black min-h-screen pt-16 selection:bg-brand selection:text-white">

            <section className="relative px-6 pt-24 pb-16 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">

                    <div className="z-10 animate-fade-in stagger-1">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-[0.4em] mb-6 block">
                            DESIGN LIKE A PRO, IN SECONDS
                        </span>
                        <h1 className="text-6xl md:text-8xl font-serif text-ink dark:text-white leading-[1.05] mb-8">
                            AI-Powered Graphics <br />
                            <span className="italic font-light">for Students & Portfolios</span>
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg mb-10 leading-relaxed font-sans">
                            The fastest way to create stunning social posts, LinkedIn banners, and portfolio assets. No design degree needed.
                        </p>
                        <div className="flex items-center gap-10">
                            <button
                                onClick={handleStart}
                                className="bg-brand hover:bg-brand-dark text-white px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-[1.02] active:scale-95 duration-300"
                            >
                                START DESIGNING
                            </button>
                            <Link
                                to={isAuthenticated ? "/editor" : "#templates"}
                                className="text-[11px] font-bold text-ink dark:text-white hover:text-brand dark:hover:text-brand uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group"
                            >
                                VIEW TEMPLATES
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14m-7-7l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-0 opacity-100 dark:opacity-90 animate-fade-in stagger-2">
                        <div className="relative w-full aspect-[4/3] max-w-[600px] ml-auto">
                            <CanvasIllustration />
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 left-1/4 h-full w-px bg-gray-50 dark:bg-gray-900 -z-10 hidden lg:block"></div>
                <div className="absolute top-0 right-1/4 h-full w-px bg-gray-50 dark:bg-gray-900 -z-10 hidden lg:block"></div>
                <div className="absolute inset-0 dot-grid opacity-[0.4] -z-20"></div>
            </section>

            <section id="features" className="px-6 py-40 border-t border-gray-100 dark:border-gray-900 bg-[#FAFAFA] dark:bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-up">
                    <span className="text-[11px] font-bold text-brand uppercase tracking-[0.5em] mb-6 block">
                        STUDENT-FIRST FEATURES
                    </span>
                    <h2 className="text-5xl md:text-6xl font-serif text-ink dark:text-white mb-8 leading-[1.1]">
                        Everything you need <br />
                        to <span className="text-brand italic">stand out</span> online.
                    </h2>
                    <p className="text-lg text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed font-sans">
                        We built Canvas AI specifically for students who need speed, not complex power tools. Create high-quality graphics for your portfolio in minutes.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-800 border-[0.5px] border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/5">
                    <FeatureCard
                        index="01"
                        title="AI BACKGROUND REMOVAL"
                        desc="Perfect for profile pics and product shots. One tap, zero fuss. Transparent exports ready for any design."
                        illustration={<BgRemoverIllustration />}
                    />
                    <FeatureCard
                        index="02"
                        title="ONE-CLICK ENHANCEMENT"
                        desc="AI-powered lighting and color correction. Make your photos pop and look professional instantly."
                        illustration={<EnhanceIllustration />}
                    />
                    <FeatureCard
                        index="03"
                        title="STUDENT TEMPLATE LIBRARY"
                        desc="LinkedIn banners, resume headers, and Instagram posts. Optimized for student impact."
                        illustration={<TemplateIllustration />}
                    />
                </div>
            </section>

            <section id="templates" className="px-6 py-32 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-bold text-brand uppercase tracking-[0.5em] mb-4 block">
                            TEMPLATE LIBRARY
                        </span>
                        <h2 className="text-5xl font-serif text-ink dark:text-white mb-6">
                            10+ Professional Templates
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            LinkedIn banners, Instagram posts, YouTube thumbnails, and more. All optimized for student success.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { name: 'LinkedIn Banner', size: '1584x396', color: '#0A66C2' },
                            { name: 'Instagram Post', size: '1080x1080', color: '#FF0055' },
                            { name: 'Twitter Header', size: '1500x500', color: '#1DA1F2' },
                            { name: 'YouTube Thumbnail', size: '1280x720', color: '#FF0000' },
                            { name: 'Facebook Cover', size: '820x312', color: '#1877F2' },
                            { name: 'Pinterest Pin', size: '1000x1500', color: '#E60023' },
                            { name: 'Story 9:16', size: '1080x1920', color: '#833AB4' },
                            { name: 'Presentation', size: '1920x1080', color: '#2D3436' }
                        ].map((template, i) => (
                            <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" style={{ backgroundColor: template.color }}>
                                <div className="h-full flex flex-col items-center justify-center text-white p-4">
                                    <span className="font-bold text-sm text-center">{template.name}</span>
                                    <span className="text-xs opacity-70 mt-1">{template.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <button
                            onClick={handleStart}
                            className="bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            USE ANY TEMPLATE
                        </button>
                    </div>
                </div>
            </section>

            <section id="pricing" className="px-6 py-32 bg-white dark:bg-black">
                <div className="max-w-3xl mx-auto text-center border-[0.5px] border-gray-100 dark:border-white/5 p-16 rounded-3xl shadow-sm">
                    <h3 className="text-3xl font-serif text-ink dark:text-white mb-6">Built for Student Budgets</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Free to use with no watermarks! <br />
                        Create unlimited designs for your portfolio and social media.
                    </p>
                    <button
                        onClick={handleStart}
                        className="bg-ink dark:bg-white text-white dark:text-black px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        START FOR FREE
                    </button>
                </div>
            </section>

            <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-bold uppercase tracking-wider">CANVAS AI</span>
                    </div>
                    <span className="text-sm text-gray-500">© 2026 Canvas AI. Made for students.</span>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ index, title, desc, illustration }) => (
    <div className="bg-white dark:bg-black p-16 transition-all hover:bg-paper-dim dark:hover:bg-[#0A0A0A] group relative">
        <span className="absolute top-8 right-8 text-[10px] font-mono font-bold text-brand opacity-40">
            {index}
        </span>
        <div className="mb-16">
            {illustration}
        </div>
        <h3 className="text-[11px] font-bold text-ink dark:text-white uppercase tracking-[0.3em] mb-6 group-hover:text-brand transition-colors">
            {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {desc}
        </p>
    </div>
);

const CanvasIllustration = () => (
    <svg viewBox="0 0 600 450" className="w-full h-auto text-ink dark:text-gray-300 drop-shadow-2xl">
        <rect x="50" y="50" width="500" height="350" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="100" x2="550" y2="100" stroke="currentColor" strokeWidth="1" />
        <rect x="70" y="130" width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="90" cy="150" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="70" y="190" width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M78 210 L88 200 L93 205 L102 195" stroke="currentColor" strokeWidth="1" fill="none" />
        <rect x="140" y="130" width="380" height="240" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M220 180 Q250 150 280 180 T340 180" stroke="#5F5FFD" strokeWidth="2" fill="none" className="animate-pulse" />
        <circle cx="280" cy="180" r="3" fill="#5F5FFD" />
        <circle cx="480" cy="150" r="2" fill="#5F5FFD" />
        <circle cx="500" cy="170" r="1.5" fill="#5F5FFD" />
        <circle cx="470" cy="180" r="1" fill="#5F5FFD" />
        <text x="170" y="320" className="font-serif italic text-3xl" fill="currentColor">Student Portfolio</text>
        <rect x="160" y="290" width="220" height="45" fill="none" stroke="#5F5FFD" strokeWidth="1" />
        <rect x="440" y="65" width="90" height="25" rx="12.5" fill="#5F5FFD" />
        <text x="455" y="82" fontSize="10" fontWeight="bold" fill="white">EXPORT</text>
    </svg>
);

const BgRemoverIllustration = () => (
    <div className="relative h-56 w-full flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full blur-2xl opacity-50"></div>
        <div className="relative z-10 w-32 h-44 bg-white dark:bg-[#111] border-[0.5px] border-gray-100 dark:border-white/10 rounded-xl shadow-2xl">
            <div className="h-2/3 w-full bg-gray-50 dark:bg-white/5 relative overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-gray-300">
                    <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    <path d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19 19c-1.5-4-3.5-5-7-5s-5.5 1-7 5" />
                </svg>
                <div className="absolute inset-x-0 top-0 h-1 bg-brand animate-[scan_2s_ease-in-out_infinite] pointer-events-none"></div>
            </div>
            <div className="p-4 space-y-2">
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded"></div>
                <div className="h-1.5 w-2/3 bg-gray-100 dark:bg-white/10 rounded"></div>
            </div>
        </div>
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-black rounded-lg border border-brand/50 shadow-xl flex items-center justify-center text-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M5 13l4 4L19 7" />
            </svg>
        </div>
    </div>
);

const EnhanceIllustration = () => (
    <div className="relative h-56 w-full flex items-center justify-center">
        <div className="w-48 h-32 bg-ink dark:bg-white overflow-hidden rounded-xl relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=400')] bg-cover"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12 animate-spin-[5s_linear_infinite]">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
            </div>
            <div className="absolute left-1/2 top-0 w-px h-full bg-white z-20 transition-all group-hover:left-full"></div>
        </div>
    </div>
);

const TemplateIllustration = () => (
    <div className="relative h-56 w-full flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-2 gap-3 w-40">
            <div className="h-16 bg-gray-50 dark:bg-white/5 rounded border-[0.5px] border-gray-200 dark:border-white/10 p-2">
                <div className="w-full h-1 bg-brand/20 rounded mb-1"></div>
                <div className="w-2/3 h-1 bg-brand/20 rounded"></div>
            </div>
            <div className="h-16 bg-brand/10 rounded border-[0.5px] border-brand/20 p-2 transform scale-110 z-10 shadow-xl">
                <div className="w-full h-2 bg-brand/40 rounded mb-2"></div>
                <div className="w-1/2 h-1 bg-brand/40 rounded"></div>
            </div>
            <div className="h-16 bg-gray-50 dark:bg-white/5 rounded border-[0.5px] border-gray-200 dark:border-white/10"></div>
            <div className="h-16 bg-gray-50 dark:bg-white/5 rounded border-[0.5px] border-gray-200 dark:border-white/10"></div>
        </div>
    </div>
);

export default LandingPage;
