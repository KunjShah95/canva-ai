import React, { useState } from 'react';

const AIBackgroundPanel = ({ canvas, setStatus, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedBackgrounds, setGeneratedBackgrounds] = useState([]);

    const presetBackgrounds = [
        { name: 'Sunset', colors: ['#FF6B6B', '#FFA07A', '#FFD93D'] },
        { name: 'Ocean', colors: ['#4ECDC4', '#45B7D1', '#96CEB4'] },
        { name: 'Forest', colors: ['#2D5A27', '#4A7C59', '#8FBC8F'] },
        { name: 'Purple Haze', colors: ['#667eea', '#764ba2', '#f093fb'] },
        { name: 'Neon', colors: ['#f093fb', '#f5576c', '#ff9a9e'] },
        { name: 'Midnight', colors: ['#0f2027', '#203a43', '#2c5364'] },
        { name: 'Warmth', colors: ['#f12711', '#f5af19', '#f12711'] },
        { name: 'Cool Blue', colors: ['#2193b0', '#6dd5ed', '#ffffff'] },
    ];

    const applyBackground = (colors, type = 'linear') => {
        if (!canvas) return;
        
        let backgroundStyle;
        if (type === 'linear') {
            backgroundStyle = `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]})`;
        } else if (type === 'radial') {
            backgroundStyle = `radial-gradient(circle, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]})`;
        }
        
        canvas.backgroundColor = backgroundStyle;
        canvas.requestRenderAll();
        setStatus('Background Applied');
        setTimeout(() => setStatus('Ready'), 2000);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setStatus('Enter a prompt first');
            return;
        }

        setGenerating(true);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const colors = generateFromPrompt(prompt);
        
        const newBg = {
            id: Date.now(),
            name: prompt.substring(0, 20),
            colors
        };
        
        setGeneratedBackgrounds(prev => [newBg, ...prev].slice(0, 6));
        setPrompt('');
        setGenerating(false);
    };

    const generateFromPrompt = (text) => {
        const hash = text.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const hue1 = Math.abs(hash % 360);
        const hue2 = Math.abs((hash * 2) % 360);
        const hue3 = Math.abs((hash * 3) % 360);
        
        return [
            `hsl(${hue1}, 70%, 60%)`,
            `hsl(${hue2}, 60%, 50%)`,
            `hsl(${hue3}, 80%, 70%)`
        ];
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">AI Backgrounds</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Generate & Apply</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-400 hover:text-ink dark:hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Describe Your Background</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., sunset over mountains, neon city, abstract geometric..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm h-24 resize-none"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            className="w-full py-4 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                    </svg>
                                    Generate Background
                                </>
                            )}
                        </button>
                    </div>

                    {generatedBackgrounds.length > 0 && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generated</label>
                            <div className="grid grid-cols-2 gap-2">
                                {generatedBackgrounds.map((bg) => (
                                    <button
                                        key={bg.id}
                                        onClick={() => applyBackground(bg.colors)}
                                        className="h-16 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-brand transition-all"
                                        style={{ background: `linear-gradient(135deg, ${bg.colors.join(', ')})` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preset Backgrounds</label>
                        <div className="grid grid-cols-2 gap-2">
                            {presetBackgrounds.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyBackground(preset.colors)}
                                    className="h-16 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-brand hover:scale-105 transition-all"
                                    style={{ background: `linear-gradient(135deg, ${preset.colors.join(', ')})` }}
                                >
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-white drop-shadow-md">{preset.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Solid Colors</label>
                        <div className="grid grid-cols-5 gap-2">
                            {['#ffffff', '#000000', '#5F5FFD', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFD93D', '#A855F7', '#EC4899'].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        canvas.backgroundColor = color;
                                        canvas.requestRenderAll();
                                        setStatus('Background Applied');
                                        setTimeout(() => setStatus('Ready'), 2000);
                                    }}
                                    className="h-10 rounded-lg border border-gray-100 dark:border-white/10 hover:border-brand hover:scale-110 transition-all"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>AI Background Generator</span>
                </div>
            </div>
        </div>
    );
};

export default AIBackgroundPanel;
