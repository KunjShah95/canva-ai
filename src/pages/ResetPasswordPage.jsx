import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
    const { resetPassword } = useAuth();
    const [params] = useSearchParams();
    const token = useMemo(() => params.get('token') || '', [params]);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Missing reset token');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await resetPassword(token, password);

        if (!result.success) {
            setError(result.error);
        } else {
            setMessage('Password reset successful. You can now sign in.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-6">
            <div className="w-full max-w-md bg-white dark:bg-[#111]/90 border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-xl">
                <h1 className="text-xl font-bold uppercase tracking-widest text-ink dark:text-white mb-2">Reset Password</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose a strong new password for your account.</p>

                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="New password"
                        className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/10 rounded-xl"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Confirm new password"
                        className="w-full p-4 bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/10 rounded-xl"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link className="text-brand font-bold hover:underline" to="/login">Back to login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
