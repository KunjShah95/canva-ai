import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ isAuthenticated, onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const location = useLocation();

    const isEditorPage = location.pathname === '/editor';

    if (isEditorPage) {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="h-16 px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blueprint flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-bold uppercase tracking-wider">Canvas AI</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/settings"
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand transition-colors rounded-lg hover:bg-secondary"
                            title="Settings"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blueprint flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium">{user?.name || 'User'}</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={onLogout}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">

                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center relative">
                        <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7 text-ink dark:text-white">
                            <rect x="5" y="5" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="3" />
                            <rect x="13" y="13" width="22" height="22" rx="4" fill="#5F5FFD" className="opacity-80" />
                            <path d="M13 13 L35 35" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                        </svg>
                    </div>
                    <span className="font-sans font-black text-xl tracking-[-0.05em] uppercase text-ink dark:text-white">
                        CANVAS AI
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-10">
                    <Link to="/#features" className="text-[11px] font-bold text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand tracking-widest cursor-pointer transition-colors">
                        FEATURES
                    </Link>
                    <Link to="/#templates" className="text-[11px] font-bold text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand tracking-widest cursor-pointer transition-colors">
                        TEMPLATES
                    </Link>
                    <Link to="/#pricing" className="text-[11px] font-bold text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand tracking-widest cursor-pointer transition-colors">
                        PRICING
                    </Link>
                </nav>

                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-ink dark:hover:text-white transition-colors"
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <Link
                            to="/editor"
                            className="flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-blueprint flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="text-[11px] font-bold text-gray-400 hover:text-brand uppercase tracking-[0.2em] transition-colors"
                        >
                            LOG IN
                        </Link>
                    )}

                    <Link
                        to={isAuthenticated ? "/editor" : "/signup"}
                        className="bg-brand hover:bg-brand-dark text-white px-7 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-brand/20 active:scale-95"
                    >
                        {isAuthenticated ? 'OPEN STUDIO' : 'START FOR FREE'}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
