import React, { useState } from 'react';
import * as fabric from 'fabric';

const AI_MODELS = [
    { id: 'dalle3', name: 'DALL-E 3', provider: 'OpenAI', description: 'High quality, detailed images' },
    { id: 'dalle2', name: 'DALL-E 2', provider: 'OpenAI', description: 'Fast generation' },
];

const ASPECT_RATIOS = [
    { id: '1:1', name: 'Square', width: 1024, height: 1024 },
    { id: '4:3', name: 'Landscape', width: 1024, height: 768 },
    { id: '3:4', name: 'Portrait', width: 768, height: 1024 },
    { id: '16:9', name: 'Wide', width: 1280, height: 720 },
    { id: '9:16', name: 'Tall', width: 720, height: 1280 },
];

const STYLE_PRESETS = [
    'photorealistic', 'anime', 'oil-painting', 'watercolor', 'sketch',
    '3d-render', 'vector', 'pixel-art', 'minimalist', 'cyberpunk',
    'vintage', 'pastel', 'neon', 'natural', 'abstract',
];

const generateImage = async (prompt, model, size, style, canvas, setStatus, onComplete) => {
    setStatus('Generating AI image...');

    try {
        const response = await fetch('/api/ai/generate-image', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                prompt,
                style,
                n: 1,
                size
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'AI generation failed');
        }

        const imageUrl = data?.images?.[0]?.url;

        if (!imageUrl) {
            throw new Error('No image returned from AI provider');
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = () => {
            const fabricImage = new fabric.FabricImage(img);
            fabricImage.scaleToWidth(Math.min(canvas.width * 0.8, 800));
            canvas.add(fabricImage);
            canvas.centerObject(fabricImage);
            canvas.setActiveObject(fabricImage);
            canvas.renderAll();
            setStatus('AI Image added to canvas');
            if (onComplete) onComplete();
        };
    } catch (error) {
        console.error('AI Generation error:', error);
        setStatus(error.message || 'AI Generation failed');
    }
};

export const AIGenerationPanel = ({ canvas, setStatus }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('dalle3');
    const [selectedSize, setSelectedSize] = useState('1024x1024');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [numImages, setNumImages] = useState(1);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setStatus('Enter a prompt');
            return;
        }
        setLoading(true);
        await generateImage(
            prompt,
            selectedModel,
            selectedSize,
            selectedStyle,
            canvas,
            setStatus,
            () => setLoading(false)
        );
        setLoading(false);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Prompt
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full h-24 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs resize-none focus:ring-2 focus:ring-brand focus:outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    AI Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {AI_MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                                selectedModel === model.id
                                    ? 'bg-brand/10 border-brand'
                                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand/50'
                            }`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                                {model.name}
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{model.provider}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Aspect Ratio
                </label>
                <div className="grid grid-cols-5 gap-1">
                    {ASPECT_RATIOS.map((ratio) => (
                        <button
                            key={ratio.id}
                            onClick={() => setSelectedSize(`${ratio.width}x${ratio.height}`)}
                            className={`p-2 rounded-lg border text-center transition-all ${
                                selectedSize === `${ratio.width}x${ratio.height}`
                                    ? 'bg-brand/10 border-brand'
                                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand/50'
                            }`}
                        >
                            <div className="text-[9px] font-bold uppercase">{ratio.name}</div>
                            <div className="text-[8px] text-gray-400">{ratio.id}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[10px] font-bold text-brand uppercase tracking-wider hover:underline"
                >
                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>

                {showAdvanced && (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl animate-fade-in">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Style
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {STYLE_PRESETS.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style === selectedStyle ? '' : style)}
                                        className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${
                                            selectedStyle === style
                                                ? 'bg-brand text-white'
                                                : 'bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Negative Prompt
                            </label>
                            <input
                                type="text"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="What to exclude from image..."
                                className="w-full p-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Guidance Scale: {guidanceScale}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="0.5"
                                value={guidanceScale}
                                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                                className="w-full accent-brand"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Images: {numImages}
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 4].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setNumImages(n)}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                            numImages === n
                                                ? 'bg-brand text-white'
                                                : 'bg-white dark:bg-black border border-gray-200 dark:border-white/10'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-blue-50/80 dark:bg-blue-500/10 rounded-xl border border-blue-200/50 dark:border-blue-500/20">
                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    AI generation uses your server-side provider key. No browser API key required.
                </p>
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        Generate AI Image
                    </>
                )}
            </button>

            <div className="p-3 bg-brand/5 rounded-xl border border-brand/20">
                <p className="text-[9px] text-gray-500 leading-relaxed">
                    <strong className="text-brand">Tip:</strong> Be specific in your prompt for better results.
                    Include style, mood, lighting, and composition details.
                </p>
            </div>
        </div>
    );
};

export default AIGenerationPanel;
