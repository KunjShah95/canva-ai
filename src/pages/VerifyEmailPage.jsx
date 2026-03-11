import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
    const { verifyEmail } = useAuth();
    const [params] = useSearchParams();
    const token = useMemo(() => params.get('token') || '', [params]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const runVerification = async () => {
            if (!token) {
                setError('Missing verification token');
                setLoading(false);
                return;
            }

            const result = await verifyEmail(token);
            if (!result.success) {
                setError(result.error);
            } else {
                setMessage(result.data?.message || 'Email verified successfully');
            }
            setLoading(false);
        };

        runVerification();
    }, [token, verifyEmail]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-6">
            <div className="w-full max-w-md bg-white dark:bg-[#111]/90 border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-xl text-center">
                <h1 className="text-xl font-bold uppercase tracking-widest text-ink dark:text-white mb-3">Email Verification</h1>
                {loading && <p className="text-sm text-gray-500">Verifying your email...</p>}
                {!loading && error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                {!loading && message && <p className="text-sm text-green-600 mb-4">{message}</p>}

                <Link className="text-brand font-bold hover:underline text-sm" to="/login">
                    Continue to login
                </Link>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
