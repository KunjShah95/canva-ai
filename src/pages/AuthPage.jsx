import React, { useState } from 'react';

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="bg-white dark:bg-black min-h-screen pt-32 pb-20 px-6 flex items-center justify-center selection:bg-brand selection:text-white">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-12">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-[0.4em] mb-4 block">
                        WELCOME TO CANVAS AI
                    </span>
                    <h1 className="text-4xl font-serif text-ink dark:text-white mb-4">
                        {isLogin ? 'Back to' : 'Join the'} <span className="italic font-light">Community</span>
                    </h1>
                    <p className="text-sm text-gray-400">
                        {isLogin ? 'Log in to access your student portfolio designs.' : 'Create an account to save your creative project assets.'}
                    </p>
                </div>

                <div className="bg-[#FAFAFA] dark:bg-[#050505] p-10 rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onAuthSuccess(); }}>
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Alex Student"
                                    className="w-full h-12 px-5 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-brand focus:outline-none transition-all"
                                    required
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="alex@university.edu"
                                className="w-full h-12 px-5 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-brand focus:outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full h-12 px-5 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-brand focus:outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 mt-4 active:scale-95"
                        >
                            {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[10px] font-bold text-gray-400 hover:text-brand transition-colors uppercase tracking-widest"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <button className="flex items-center gap-3 mx-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.90 3.33-2.03 4.44-1.33 1.33-3.38 2.78-6.98 2.78-6.14 0-10.97-4.96-10.97-11.06s4.83-11.06 10.97-11.06c3.54 0 6.06 1.39 7.82 3.08l2.3-2.3c-2.08-1.99-4.78-3.12-7.85-3.12-6.62 0-12 5.38-12 12s5.38 12 12 12c3.58 0 6.3-1.18 8.39-3.32 2.16-2.16 2.84-5.21 2.84-7.67 0-.72-.06-1.41-.17-2.05h-11.06z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
