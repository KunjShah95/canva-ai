import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [devResetUrl, setDevResetUrl] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setDevResetUrl('');
        setLoading(true);

        const result = await forgotPassword(email);

        if (!result.success) {
            setError(result.error);
        } else {
            setMessage(result.data?.message || 'If the account exists, a reset link has been created.');
            setDevResetUrl(result.data?.resetUrl || '');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-6">
            <div className="w-full max-w-md bg-white dark:bg-[#111]/90 border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-xl">
                <h1 className="text-xl font-bold uppercase tracking-widest text-ink dark:text-white mb-2">Forgot Password</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">We’ll generate a secure password reset link.</p>

                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
                {devResetUrl && (
                    <div className="mb-4 p-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20">
                        <p className="text-xs text-blue-700 dark:text-blue-300 break-all">
                            Dev reset link: <a className="underline" href={devResetUrl}>{devResetUrl}</a>
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/10 rounded-xl"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link className="text-brand font-bold hover:underline" to="/login">Back to login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
