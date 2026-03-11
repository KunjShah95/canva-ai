import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = '/api/auth';
const withCredentials = { credentials: 'include' };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/me`, withCredentials);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to check auth:', error);
        }

        setLoading(false);
    };

    const signup = async (email, password, name) => {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Registration failed' };
            }

            setUser({ id: data.user.id, name: data.user.name, email: data.user.email });
            return {
                success: true,
                data: {
                    verificationRequired: data.verificationRequired,
                    verificationUrl: data.verificationUrl
                }
            };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            setUser({ id: data.user.id, name: data.user.name, email: data.user.email });
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Failed to submit forgot password request' };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const resetPassword = async (token, password) => {
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Failed to reset password' };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const verifyEmail = async (token) => {
        try {
            const response = await fetch(`${API_URL}/verify-email?token=${encodeURIComponent(token)}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Failed to verify email' };
            }

            await checkAuth();
            return { success: true, data };
        } catch (error) {
            console.error('Verify email error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const sendVerification = async () => {
        try {
            const response = await fetch(`${API_URL}/send-verification`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Failed to send verification' };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Send verification error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        setUser(null);
    };

    const getToken = () => {
        return null;
    };

    const value = {
        user,
        loading,
        signup,
        login,
        forgotPassword,
        resetPassword,
        verifyEmail,
        sendVerification,
        logout,
        getToken,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
