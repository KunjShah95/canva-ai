import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    
    const [removeBgKey, setRemoveBgKey] = useState('');
    const [apiKeysSaved, setApiKeysSaved] = useState(false);
    
    const [defaultFormat, setDefaultFormat] = useState(() => localStorage.getItem('defaultExportFormat') || 'png');
    const [defaultQuality, setDefaultQuality] = useState(() => parseInt(localStorage.getItem('defaultExportQuality') || '90'));
    const [autoSave, setAutoSave] = useState(() => localStorage.getItem('autoSave') !== 'false');
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        const savedKey = localStorage.getItem('removeBgKey');
        if (savedKey) setRemoveBgKey(savedKey);
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMessage('Profile updated successfully!');
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSaveApiKeys = () => {
        localStorage.setItem('removeBgKey', removeBgKey);
        setApiKeysSaved(true);
        setTimeout(() => setApiKeysSaved(false), 2000);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('defaultExportFormat', defaultFormat);
        localStorage.setItem('defaultExportQuality', defaultQuality.toString());
        localStorage.setItem('autoSave', autoSave.toString());
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        
        window.location.reload();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-black pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-3xl font-serif text-ink dark:text-white mb-2">Settings</h1>
                <p className="text-sm text-gray-400 mb-8">Manage your account and preferences</p>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                        {message}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl p-6">
                        <h2 className="text-lg font-bold text-ink dark:text-white mb-4">Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm opacity-50"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* API Keys Section */}
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl p-6">
                        <h2 className="text-lg font-bold text-ink dark:text-white mb-4">API Keys</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remove.bg API Key</label>
                                    <a href="https://remove.bg" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-brand uppercase hover:underline">Get Key</a>
                                </div>
                                <input
                                    type="password"
                                    value={removeBgKey}
                                    onChange={(e) => setRemoveBgKey(e.target.value)}
                                    placeholder="Enter your API key..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm"
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Used for AI background removal in the editor</p>
                            </div>
                            <button
                                onClick={handleSaveApiKeys}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all"
                            >
                                {apiKeysSaved ? 'Saved!' : 'Save API Keys'}
                            </button>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl p-6">
                        <h2 className="text-lg font-bold text-ink dark:text-white mb-4">Preferences</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-ink dark:text-white">Auto-save</label>
                                    <p className="text-[10px] text-gray-400">Automatically save projects while editing</p>
                                </div>
                                <button
                                    onClick={() => setAutoSave(!autoSave)}
                                    className={`w-12 h-6 rounded-full transition-colors ${autoSave ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-ink dark:text-white">Dark Mode</label>
                                    <p className="text-[10px] text-gray-400">Use dark theme throughout the app</p>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Default Export Format</label>
                                <select
                                    value={defaultFormat}
                                    onChange={(e) => setDefaultFormat(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm"
                                >
                                    <option value="png">PNG</option>
                                    <option value="jpeg">JPEG</option>
                                    <option value="webp">WebP</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Export Quality: {defaultQuality}%</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={defaultQuality}
                                    onChange={(e) => setDefaultQuality(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none accent-brand"
                                />
                            </div>

                            <button
                                onClick={handleSavePreferences}
                                className="px-6 py-3 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white dark:bg-[#0A0A0A] border border-red-100 dark:border-red-900/30 rounded-3xl p-6">
                        <h2 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-ink dark:text-white">Sign Out</label>
                                <p className="text-[10px] text-gray-400">Log out of your account</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 border border-red-500/20 text-red-500 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
