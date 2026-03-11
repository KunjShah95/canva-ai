import React, { useState, useEffect } from 'react';

const LayersPanel = ({ canvas, onClose }) => {
    const [layers, setLayers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (!canvas) return;

        const updateLayers = () => {
            const objects = canvas.getObjects();
            const newLayers = objects.map((obj, index) => ({
                id: obj.id || `layer-${index}`,
                type: obj.type,
                name: getLayerName(obj),
                visible: obj.visible !== false,
                locked: obj.selectable === false,
                object: obj
            })).reverse();
            setLayers(newLayers);
        };

        updateLayers();

        canvas.on('object:added', updateLayers);
        canvas.on('object:removed', updateLayers);
        canvas.on('object:modified', updateLayers);
        canvas.on('selection:created', (e) => {
            setSelectedId(e.selected[0]?.id || null);
        });
        canvas.on('selection:cleared', () => {
            setSelectedId(null);
        });

        return () => {
            canvas.off('object:added', updateLayers);
            canvas.off('object:removed', updateLayers);
            canvas.off('object:modified', updateLayers);
        };
    }, [canvas]);

    const getLayerName = (obj) => {
        if (obj.type === 'i-text' || obj.type === 'text') {
            return obj.text?.substring(0, 20) || 'Text';
        }
        if (obj.type === 'image') {
            return 'Image';
        }
        if (obj.type === 'rect') {
            return 'Rectangle';
        }
        if (obj.type === 'circle') {
            return 'Circle';
        }
        if (obj.type === 'triangle') {
            return 'Triangle';
        }
        if (obj.type === 'path') {
            return 'Drawing';
        }
        if (obj.type === 'group') {
            return 'Group';
        }
        return obj.type?.charAt(0).toUpperCase() + obj.type?.slice(1) || 'Object';
    };

    const handleSelectLayer = (layer) => {
        if (!layer.locked) {
            canvas.setActiveObject(layer.object);
            canvas.renderAll();
        }
    };

    const handleToggleVisibility = (layer, e) => {
        e.stopPropagation();
        layer.object.set('visible', !layer.visible);
        canvas.renderAll();
    };

    const handleToggleLock = (layer, e) => {
        e.stopPropagation();
        const newLocked = !layer.locked;
        layer.object.set({
            selectable: !newLocked,
            evented: !newLocked
        });
        if (newLocked && canvas.getActiveObject() === layer.object) {
            canvas.discardActiveObject();
        }
        canvas.renderAll();
    };

    const handleMoveUp = (layer, e) => {
        e.stopPropagation();
        canvas.bringObjectForward(layer.object);
        canvas.renderAll();
    };

    const handleMoveDown = (layer, e) => {
        e.stopPropagation();
        canvas.sendObjectBackwards(layer.object);
        canvas.renderAll();
    };

    const handleDeleteLayer = (layer, e) => {
        e.stopPropagation();
        canvas.remove(layer.object);
        canvas.renderAll();
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'i-text':
            case 'text':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                );
            case 'image':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'rect':
            case 'circle':
            case 'triangle':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                );
            case 'path':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-ink dark:text-white">Layers</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Object Stack</p>
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

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {layers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-400">No objects on canvas</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {layers.map((layer, index) => (
                                <div
                                    key={layer.id}
                                    onClick={() => handleSelectLayer(layer)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                        selectedId === layer.id
                                            ? 'border-brand bg-brand/5 dark:bg-brand/10'
                                            : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                    } ${layer.hidden ? 'opacity-50' : ''}`}
                                >
                                    <div className="text-gray-400">
                                        {getTypeIcon(layer.type)}
                                    </div>

                                    <span className="flex-1 text-sm font-medium text-ink dark:text-white truncate">
                                        {layer.name}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleToggleVisibility(layer, e)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                                layer.visible
                                                    ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                                    : 'text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                            }`}
                                            title={layer.visible ? 'Hide' : 'Show'}
                                        >
                                            {layer.visible ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>

                                        <button
                                            onClick={(e) => handleToggleLock(layer, e)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                                layer.locked
                                                    ? 'text-brand bg-brand/10'
                                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                            title={layer.locked ? 'Unlock' : 'Lock'}
                                        >
                                            {layer.locked ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>

                                        <button
                                            onClick={(e) => handleMoveUp(layer, e)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            title="Move Up"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={(e) => handleMoveDown(layer, e)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            title="Move Down"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={(e) => handleDeleteLayer(layer, e)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] flex justify-between items-center bg-gray-50/50 dark:bg-white/5 rounded-b-3xl">
                    <span>{layers.length} Layer{layers.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default LayersPanel;
