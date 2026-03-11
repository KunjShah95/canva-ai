import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = useMemo(() => searchParams.get('redirect') || '/dashboard', [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate(redirect);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-500 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 dot-grid opacity-[0.4] pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 h-full w-px bg-gray-200 dark:bg-white/5 -z-10 hidden lg:block"></div>
            <div className="absolute top-0 right-1/4 h-full w-px bg-gray-200 dark:bg-white/5 -z-10 hidden lg:block"></div>

            <div className="w-full max-w-md px-6 relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-white">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-serif font-bold text-2xl tracking-tight text-ink dark:text-white">Canvas AI</span>
                    </Link>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-ink dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to continue your creative journey</p>
                </div>

                <div className="bg-white/80 dark:bg-[#111]/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink dark:text-white placeholder:text-gray-400"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink dark:text-white placeholder:text-gray-400"
                                placeholder="••••••••"
                                required
                            />
                            <div className="text-right pt-1">
                                <Link to="/forgot-password" className="text-[11px] font-bold text-brand hover:underline uppercase tracking-wider">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-brand/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Signing In...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-white/5">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-brand font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-ink dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M19 12H5m7 7l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
