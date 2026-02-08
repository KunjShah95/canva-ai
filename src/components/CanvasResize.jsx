import React, { useState } from 'react';

const CanvasResize = ({ canvas, onClose }) => {
    const [width, setWidth] = useState(canvas?.width || 800);
    const [height, setHeight] = useState(canvas?.height || 600);
    const [preserveContent, setPreserveContent] = useState(true);

    const presets = [
        { name: 'Instagram Post', width: 1080, height: 1080 },
        { name: 'Instagram Story', width: 1080, height: 1920 },
        { name: 'Twitter Header', width: 1500, height: 500 },
        { name: 'LinkedIn Banner', width: 1584, height: 396 },
        { name: 'YouTube Thumbnail', width: 1280, height: 720 },
        { name: 'Facebook Cover', width: 820, height: 312 },
        { name: 'HD', width: 1920, height: 1080 },
        { name: 'Square', width: 1000, height: 1000 }
    ];

    const handleResize = () => {
        if (!canvas) return;

        const currentWidth = canvas.width;
        const currentHeight = canvas.height;

        canvas.setDimensions({ width, height });

        if (preserveContent) {
            const scaleX = width / currentWidth;
            const scaleY = height / currentHeight;

            canvas.getObjects().forEach(obj => {
                obj.set({
                    left: obj.left * scaleX,
                    top: obj.top * scaleY,
                    scaleX: obj.scaleX * scaleX,
                    scaleY: obj.scaleY * scaleY
                });
            });
        }

        canvas.requestRenderAll();
        onClose();
    };

    const applyPreset = (preset) => {
        setWidth(preset.width);
        setHeight(preset.height);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold uppercase tracking-wider">Resize Canvas</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Width (px)</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(parseInt(e.target.value) || 100)}
                                    min="100"
                                    max="4096"
                                    className="w-full p-3 border border-border rounded-lg bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-blueprint"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Height (px)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(parseInt(e.target.value) || 100)}
                                    min="100"
                                    max="4096"
                                    className="w-full p-3 border border-border rounded-lg bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-blueprint"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="preserve"
                                    checked={preserveContent}
                                    onChange={(e) => setPreserveContent(e.target.checked)}
                                    className="w-4 h-4 accent-blueprint"
                                />
                                <label htmlFor="preserve" className="text-sm">Preserve content positions</label>
                            </div>
                            <button
                                onClick={handleResize}
                                className="w-full py-3 bg-blueprint text-white rounded-lg font-bold uppercase tracking-wider hover:bg-blueprint/90"
                            >
                                Apply Size
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-muted-foreground">Quick Presets</label>
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className="p-3 border border-border rounded-lg text-left hover:border-blueprint hover:bg-secondary/20 transition-all"
                                    >
                                        <div className="font-bold text-sm">{preset.name}</div>
                                        <div className="text-xs text-muted-foreground">{preset.width} x {preset.height}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-secondary/20 border border-border rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Aspect Ratio:</span>
                            <span className="font-mono">{(width / height).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Current Size:</span>
                            <span className="font-mono">{canvas?.width} x {canvas?.height}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanvasResize;
