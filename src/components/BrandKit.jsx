import React, { useState } from 'react';
import * as fabric from 'fabric';

const BrandKit = ({ canvas, onClose }) => {
    const [brandColors, setBrandColors] = useState(() => {
        const saved = localStorage.getItem('brandColors');
        return saved ? JSON.parse(saved) : ['#5F5FFD', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    });

    const [brandLogos, setBrandLogos] = useState(() => {
        const saved = localStorage.getItem('brandLogos');
        return saved ? JSON.parse(saved) : [];
    });

    const [newColor, setNewColor] = useState('#5F5FFD');

    const addColor = () => {
        const updated = [...brandColors, newColor];
        setBrandColors(updated);
        localStorage.setItem('brandColors', JSON.stringify(updated));
    };

    const removeColor = (index) => {
        const updated = brandColors.filter((_, i) => i !== index);
        setBrandColors(updated);
        localStorage.setItem('brandColors', JSON.stringify(updated));
    };

    const applyColor = (color) => {
        const activeObject = canvas?.getActiveObject();
        if (activeObject) {
            if (activeObject.type === 'i-text' || activeObject.type === 'text') {
                activeObject.set('fill', color);
            } else {
                activeObject.set('fill', color);
            }
            canvas?.requestRenderAll();
        }
    };

    const addLogo = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (f) => {
                    const updated = [...brandLogos, f.target.result];
                    setBrandLogos(updated);
                    localStorage.setItem('brandLogos', JSON.stringify(updated));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const removeLogo = (index) => {
        const updated = brandLogos.filter((_, i) => i !== index);
        setBrandLogos(updated);
        localStorage.setItem('brandLogos', JSON.stringify(updated));
    };

    const addLogoToCanvas = (logoData) => {
        const img = new Image();
        img.src = logoData;
        img.onload = () => {
            const fabricImage = new fabric.FabricImage(img);
            fabricImage.scaleToWidth(150);
            canvas.add(fabricImage);
            canvas.centerObject(fabricImage);
            canvas.setActiveObject(fabricImage);
            canvas.requestRenderAll();
        };
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">Brand Kit</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Your Brand Assets</p>
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
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand Colors</h3>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                            {brandColors.map((color, index) => (
                                <div key={index} className="relative group">
                                    <button
                                        onClick={() => applyColor(color)}
                                        className="w-10 h-10 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                    />
                                    <button
                                        onClick={() => removeColor(index)}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0"
                            />
                            <input
                                type="text"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="flex-1 px-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm"
                                placeholder="#000000"
                            />
                            <button
                                onClick={addColor}
                                className="px-4 bg-brand text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logos</h3>
                            <button
                                onClick={addLogo}
                                className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline"
                            >
                                + Add Logo
                            </button>
                        </div>

                        {brandLogos.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No logos added yet
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {brandLogos.map((logo, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={logo}
                                            alt={`Logo ${index + 1}`}
                                            onClick={() => addLogoToCanvas(logo)}
                                            className="w-full h-16 object-contain bg-gray-50 dark:bg-white/5 rounded-lg cursor-pointer hover:border-brand border-2 border-transparent transition-all"
                                        />
                                        <button
                                            onClick={() => removeLogo(index)}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>{brandColors.length} Colors, {brandLogos.length} Logos</span>
                </div>
            </div>
        </div>
    );
};

export default BrandKit;
