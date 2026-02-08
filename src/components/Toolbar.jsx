import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import {
    enhanceImage,
    resetFilters,
    applyFilter,
    rotateObject,
    flipObject,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    sendToBack,
    groupObjects,
    ungroupObjects,
    addRect,
    addCircle,
    addTriangle,
    toggleDrawingMode,
    clearCanvas
} from '../utils/imageUtils';
import { removeBackground } from '../utils/removeBgApi';
import { saveProject, getProjects, deleteProject, updateProject } from '../utils/projectService';
import { createHistoryManager, handleKeyboardShortcuts } from '../utils/history';
import TextEditor from './TextEditor';
import ExportModal from './ExportModal';
import CanvasResize from './CanvasResize';
import KeyboardShortcuts from './KeyboardShortcuts';
import ShapesPanel from './ShapesPanel';
import AIGenerationPanel from './AIGenerationPanel';
import templates from '../data/templates.json';
import MyProjects from './MyProjects';

const Toolbar = ({ canvas, status, setStatus, projectId, currentProject, onProjectSaved }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('removeBgKey') || '');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('assets');
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(5);
    const [brushColor, setBrushColor] = useState('#5F5FFD');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showResizeModal, setShowResizeModal] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);
    const [projectName, setProjectName] = useState('Untitled Project');
    const [adjustments, setAdjustments] = useState({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0
    });

    useEffect(() => {
        if (currentProject) {
            setProjectName(currentProject.name);
        }
    }, [currentProject]);
    const [historyManager, setHistoryManager] = useState(null);

    useEffect(() => {
        if (!canvas) return;

        const hm = createHistoryManager(canvas);
        setHistoryManager(hm);

        const handleKeyDown = (e) => handleKeyboardShortcuts(e, canvas, hm);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas]);

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = () => {
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
        };
    }, [canvas]);

    const filterTimeoutRef = useRef(null);
    const handleAdjustmentChange = (type, value) => {
        setAdjustments(prev => ({ ...prev, [type]: value }));

        if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);

        filterTimeoutRef.current = setTimeout(() => {
            if (canvas) {
                applyFilter(canvas, type, { value: parseFloat(value) });
            }
        }, 50); // Small 50ms buffer to bundle rapid sliding
    };

    const handleApiKeyChange = (e) => {
        const key = e.target.value;
        setApiKey(key);
        localStorage.setItem('removeBgKey', key);
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE = 10 * 1024 * 1024;
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            setStatus('Error: Use PNG or JPG');
            setTimeout(() => setStatus(''), 2000);
            return;
        }

        if (file.size > MAX_SIZE) {
            setStatus('Error: File too large (Max 10MB)');
            setTimeout(() => setStatus(''), 2000);
            return;
        }

        const reader = new FileReader();
        reader.onload = (f) => {
            const data = f.target.result;
            const img = new Image();
            img.src = data;
            img.onload = () => {
                const fabricImage = new fabric.FabricImage(img);
                if (fabricImage.width > canvas.width * 0.8) {
                    fabricImage.scaleToWidth(canvas.width * 0.8);
                }
                canvas.add(fabricImage);
                canvas.centerObject(fabricImage);
                canvas.setActiveObject(fabricImage);
                canvas.requestRenderAll();
                setStatus('Image Uploaded');
                setTimeout(() => setStatus(''), 2000);
            };
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveBg = async () => {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') {
            setStatus('Select an image first');
            setTimeout(() => setStatus(''), 2000);
            return;
        }

        if (!apiKey) {
            setStatus('API Key missing in Settings');
            setTimeout(() => setStatus(''), 2000);
            return;
        }

        setLoading(true);
        setStatus('AI Isolating Subject...');

        try {
            const dataURL = activeObject.toDataURL({ format: 'png' });
            const res = await fetch(dataURL);
            const blob = await res.blob();
            const processedBlob = await removeBackground(blob, apiKey);
            const newUrl = URL.createObjectURL(processedBlob);
            const img = new Image();
            img.src = newUrl;
            img.onload = () => {
                const newImg = new fabric.FabricImage(img);
                newImg.set({
                    left: activeObject.left,
                    top: activeObject.top,
                    scaleX: activeObject.scaleX,
                    scaleY: activeObject.scaleY,
                    angle: activeObject.angle
                });
                canvas.remove(activeObject);
                canvas.add(newImg);
                canvas.setActiveObject(newImg);
                setLoading(false);
                setStatus('Background Removed');
                setTimeout(() => setStatus(''), 2000);
            };
        } catch (error) {
            setLoading(false);
            setStatus('AI Processing Failed');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const handleLoadTemplate = (template) => {
        if (!canvas) return;

        clearCanvas(canvas);
        canvas.backgroundColor = template.backgroundColor || '#ffffff';
        canvas.setDimensions({ width: template.width, height: template.height });

        if (template.placeholders) {
            template.placeholders.forEach(ph => {
                if (ph.type === 'text') {
                    const text = new fabric.IText(ph.text, {
                        left: ph.x,
                        top: ph.y,
                        fontSize: ph.fontSize,
                        fontFamily: 'Inter',
                        fill: template.backgroundColor === '#ffffff' ? '#000000' : '#ffffff'
                    });
                    canvas.add(text);
                }
            });
        }
        canvas.requestRenderAll();
        setStatus(`Loaded ${template.name}`);
        setTimeout(() => setStatus(''), 2000);
    };

    const handleSaveProject = async () => {
        if (!canvas) return;
        try {
            const canvasData = canvas.toJSON();
            const thumbnail = canvas.toDataURL({ format: 'png', multiplier: 0.2 });

            if (projectId) {
                await updateProject(projectId, {
                    name: projectName,
                    data: canvasData,
                    thumbnail,
                    width: canvas.width,
                    height: canvas.height
                });
                setStatus('Project Updated');
            } else {
                const newProject = await saveProject({
                    name: projectName,
                    data: canvasData, // Ensure backend expects 'data' not 'canvasData' based on schema
                    thumbnail,
                    width: canvas.width,
                    height: canvas.height
                });
                setStatus('Project Saved');
                if (onProjectSaved) {
                    onProjectSaved(newProject);
                }
            }
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error(error);
            setStatus('Error: Save Failed');
            setTimeout(() => setStatus(''), 2000);
        }
    };

    const handleLoadProject = (project) => {
        if (!canvas || !project.canvasState) return;
        loadCanvasState(canvas, project);
        setProjectName(project.name);
        setStatus('Project Loaded');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleDeleteProject = (projectId) => {
        deleteProject(projectId);
        setShowMyProjects(false);
    };

    const advancedFilters = [
        { name: 'Sharpen', value: 'sharpen' },
        { name: 'Emboss', value: 'emboss' },
        { name: 'Edge', value: 'edge' },
        { name: 'Noise', value: 'noise' },
        { name: 'Pixelate', value: 'pixelate' },
        { name: 'Brownie', value: 'brownie' },
        { name: 'Kodachrome', value: 'kodachrome' },
        { name: 'B&W', value: 'blackwhite' }
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black border-r border-gray-100 dark:border-white/5 transition-all duration-500 overflow-hidden">

            <div className="flex border-b border-gray-100 dark:border-white/5 px-2">
                <TabButton active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} label="Assets" />
                <TabButton active={activeTab === 'shapes'} onClick={() => setActiveTab('shapes')} label="Shapes" />
                <TabButton active={activeTab === 'text'} onClick={() => setActiveTab('text')} label="Text" />
                <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI" />
                <TabButton active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} label="Edit" />
                <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Library" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">

                {activeTab === 'assets' && (
                    <div className="space-y-8 animate-fade-in">
                        <ToolSection label="Import Assets">
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl hover:border-brand hover:bg-brand/5 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-brand group-hover:text-white transition-all mb-4">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-brand">Upload Image</span>
                                </label>
                            </div>
                        </ToolSection>

                        <ToolSection label="Drawing Mode">
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => {
                                        const next = !isDrawing;
                                        setIsDrawing(next);
                                        toggleDrawingMode(canvas, next, { width: brushSize, color: brushColor });
                                        if (next) setStatus('Drawing Mode Active');
                                        else setStatus('Object Mode Active');
                                        setTimeout(() => setStatus('Ready'), 1500);
                                    }}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isDrawing ? 'bg-brand text-white border-brand' : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}
                                >
                                    <span className="w-5 h-5 mb-1"><PenIcon /></span>
                                    <span className="text-[10px] font-bold uppercase">Draw</span>
                                </button>
                            </div>

                            {isDrawing && (
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 animate-fade-in border brand/20">
                                    <Slider
                                        label="Brush Size"
                                        value={brushSize}
                                        min={1}
                                        max={50}
                                        step={1}
                                        onChange={(v) => {
                                            setBrushSize(v);
                                            toggleDrawingMode(canvas, true, { width: v, color: brushColor });
                                        }}
                                    />
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
                                        <input
                                            type="color"
                                            value={brushColor}
                                            onChange={(e) => {
                                                setBrushColor(e.target.value);
                                                toggleDrawingMode(canvas, true, { width: brushSize, color: e.target.value });
                                            }}
                                            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </ToolSection>

                        <ToolSection label="AI Tools">
                            <div className="grid gap-3">
                                <button
                                    onClick={handleRemoveBg}
                                    disabled={loading}
                                    className="w-full py-4 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-brand/20 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                        </svg>
                                    )}
                                    Remove Background
                                </button>
                                <button
                                    onClick={() => enhanceImage(canvas)}
                                    className="w-full py-4 border border-brand/20 text-brand rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand/5 transition-all flex items-center justify-center gap-3"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                    </svg>
                                    AI Auto-Enhance
                                </button>
                            </div>
                        </ToolSection>

                        <ToolSection label="AI Settings">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Remove.bg API Key</label>
                                        <a href="https://remove.bg" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-brand uppercase hover:underline">Get Key</a>
                                    </div>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={handleApiKeyChange}
                                        placeholder="Paste API Key here..."
                                        className="w-full h-11 px-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-brand focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </ToolSection>

                        <button
                            onClick={() => {
                                if (window.confirm('Clear all objects from canvas?')) {
                                    clearCanvas(canvas);
                                    setStatus('Canvas Cleared');
                                    setTimeout(() => setStatus('Ready'), 1500);
                                }
                            }}
                            className="w-full mt-4 py-3 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            Clear All
                        </button>
                    </div>
                )}

                {activeTab === 'shapes' && (
                    <div className="space-y-8 animate-fade-in">
                        <ShapesPanel canvas={canvas} setStatus={setStatus} />
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="space-y-8 animate-fade-in">
                        <AIGenerationPanel canvas={canvas} setStatus={setStatus} />
                    </div>
                )}

                {
                    activeTab === 'edit' && (
                        <div className="space-y-8 animate-fade-in">
                            <ToolSection label="History">
                                <div className="grid grid-cols-2 gap-3">
                                    <IconButton
                                        onClick={() => historyManager?.undo() || setStatus('Nothing to undo')}
                                        label="Undo"
                                        icon={<UndoIcon />}
                                    />
                                    <IconButton
                                        onClick={() => historyManager?.redo() || setStatus('Nothing to redo')}
                                        label="Redo"
                                        icon={<RedoIcon />}
                                    />
                                </div>
                            </ToolSection>

                            <ToolSection label="Transform">
                                <div className="grid grid-cols-3 gap-2">
                                    <IconButton onClick={() => rotateObject(canvas, -90)} label="-90°" icon={<RotateCcwIcon />} />
                                    <IconButton onClick={() => rotateObject(canvas, 90)} label="+90°" icon={<RotateCwIcon />} />
                                    <IconButton onClick={() => flipObject(canvas, 'horizontal')} label="Flip H" icon={<FlipHorizontalIcon />} />
                                    <IconButton onClick={() => flipObject(canvas, 'vertical')} label="Flip V" icon={<FlipVerticalIcon />} />
                                    <IconButton onClick={() => duplicateSelected(canvas)} label="Clone" icon={<DuplicateIcon />} />
                                    <IconButton onClick={() => deleteSelected(canvas)} label="Delete" icon={<TrashIcon />} danger />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <IconButton onClick={() => bringToFront(canvas)} label="Front" icon={<BringFrontIcon />} />
                                    <IconButton onClick={() => sendToBack(canvas)} label="Back" icon={<SendBackIcon />} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <IconButton
                                        onClick={() => {
                                            const obj = canvas.getActiveObject();
                                            if (obj) {
                                                obj.set({ selectable: false, evented: false });
                                                canvas.discardActiveObject();
                                                canvas.requestRenderAll();
                                                setStatus('Layer Locked');
                                                setTimeout(() => setStatus('Ready'), 1500);
                                            }
                                        }}
                                        label="Lock"
                                        icon={<LockIcon />}
                                    />
                                    <button
                                        onClick={() => {
                                            canvas.getObjects().forEach(o => {
                                                o.set({ selectable: true, evented: true });
                                            });
                                            canvas.requestRenderAll();
                                            setStatus('All Unlocked');
                                            setTimeout(() => setStatus('Ready'), 1500);
                                        }}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-brand/40 hover:bg-white dark:hover:bg-black transition-all group hover:text-brand"
                                    >
                                        <span className="w-5 h-5 mb-2 opacity-60 group-hover:opacity-100 transition-opacity"><UnlockIcon /></span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">Unlock All</span>
                                    </button>
                                </div>
                            </ToolSection>

                            <ToolSection label="Canvas">
                                <button
                                    onClick={() => setShowResizeModal(true)}
                                    className="w-full py-3 border border-gray-100 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                    </svg>
                                    Resize Canvas
                                </button>
                            </ToolSection>

                            <ToolSection label="Adjustments">
                                <div className="space-y-6">
                                    <Slider label="Brightness" value={adjustments.brightness} min="-1" max="1" step="0.01" onChange={(v) => handleAdjustmentChange('brightness', v)} />
                                    <Slider label="Contrast" value={adjustments.contrast} min="-1" max="1" step="0.01" onChange={(v) => handleAdjustmentChange('contrast', v)} />
                                    <Slider label="Saturation" value={adjustments.saturation} min="-1" max="1" step="0.01" onChange={(v) => handleAdjustmentChange('saturation', v)} />
                                    <Slider label="Hue" value={adjustments.hue} min="-1" max="1" step="0.01" onChange={(v) => handleAdjustmentChange('hue', v)} />
                                    <Slider label="Blur" value={adjustments.blur} min="0" max="1" step="0.01" onChange={(v) => handleAdjustmentChange('blur', v)} />
                                </div>
                            </ToolSection>

                            <ToolSection label="Color Filters">
                                <div className="grid grid-cols-2 gap-2">
                                    {['Grayscale', 'Sepia', 'Invert', 'Vintage', 'Technicolor', 'Polaroid'].map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => applyFilter(canvas, filter.toLowerCase())}
                                            className="h-10 text-[10px] font-bold border border-gray-100 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-500 uppercase tracking-widest"
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </ToolSection>

                            <ToolSection label="Advanced Filters">
                                <div className="grid grid-cols-2 gap-2">
                                    {advancedFilters.map(filter => (
                                        <button
                                            key={filter.value}
                                            onClick={() => applyFilter(canvas, filter.value)}
                                            className="h-10 text-[10px] font-bold border border-gray-100 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-500 uppercase tracking-widest"
                                        >
                                            {filter.name}
                                        </button>
                                    ))}
                                </div>
                            </ToolSection>
                        </div>
                    )
                }

                {
                    activeTab === 'text' && (
                        <div className="animate-fade-in">
                            <TextEditor canvas={canvas} />
                        </div>
                    )
                }

                {
                    activeTab === 'templates' && (
                        <div className="space-y-6 animate-fade-in">
                            <ToolSection label="Templates">
                                <div className="space-y-3">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => handleLoadTemplate(template)}
                                            className="cursor-pointer border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden hover:border-brand hover:shadow-lg transition-all"
                                        >
                                            <div
                                                className="h-20 w-full relative"
                                                style={{ backgroundColor: template.backgroundColor }}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white/80 uppercase">{template.name}</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                                                <span className="text-[10px] font-mono uppercase">{template.width}x{template.height}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase">{template.category}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ToolSection>

                            <ToolSection label="Project">
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        className="w-full p-3 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gray-50/50 dark:bg-white/5"
                                        placeholder="Project Name..."
                                    />
                                    <button
                                        onClick={handleSaveProject}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all"
                                    >
                                        Save Project
                                    </button>
                                    <button
                                        onClick={() => setShowMyProjects(true)}
                                        className="w-full py-3 border border-gray-100 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                    >
                                        My Projects
                                    </button>
                                </div>
                            </ToolSection>

                            <ToolSection label="Help">
                                <button
                                    onClick={() => setShowShortcuts(true)}
                                    className="w-full py-3 border border-gray-100 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                        <path d="M14 12h.01M12 14h.01M16 10h.01M8 14h.01M10 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Keyboard Shortcuts
                                </button>
                            </ToolSection>
                        </div>
                    )
                }

                {
                    status && (
                        <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center animate-fade-in ${status.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-brand/10 text-brand'}`}>
                            {status}
                        </div>
                    )
                }
            </div>

            {showExportModal && (
                <ExportModal
                    canvas={canvas}
                    onClose={() => setShowExportModal(false)}
                />
            )}

            {showResizeModal && (
                <CanvasResize
                    canvas={canvas}
                    onClose={() => setShowResizeModal(false)}
                />
            )}

            {showShortcuts && (
                <KeyboardShortcuts
                    onClose={() => setShowShortcuts(false)}
                />
            )}

            {showMyProjects && (
                <MyProjects
                    onLoadProject={(projectData) => {
                        if (canvas && projectData.canvasState) {
                            canvas.loadFromJSON(projectData.canvasState, () => {
                                canvas.renderAll();
                                canvas.setDimensions({ width: projectData.width, height: projectData.height });
                            });
                        }
                    }}
                    onClose={() => setShowMyProjects(false)}
                />
            )}

            <div className="p-6 border-t border-gray-100 dark:border-white/5">
                <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full py-4 bg-ink dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl hover:shadow-brand/20 active:scale-95"
                >
                    Export Creation
                </button>
            </div>
        </div>
    );
};



const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${active ? 'text-brand' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
    >
        {label}
        {active && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand rounded-full shadow-[0_0_12px_rgba(95,95,253,0.4)]" />}
    </button>
);

const ToolSection = ({ label, children }) => (
    <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">{label}</h3>
        {children}
    </div>
);

const IconButton = ({ onClick, label, icon, danger }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-brand/40 hover:bg-white dark:hover:bg-black transition-all group ${danger ? 'hover:text-red-500 hover:border-red-500/20' : 'hover:text-brand'}`}
    >
        <span className={`w-5 h-5 mb-2 opacity-60 group-hover:opacity-100 transition-opacity ${danger ? 'group-hover:text-red-500' : ''}`}>{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">{label}</span>
    </button>
);

const Slider = ({ label, value, min, max, step, onChange }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
            <span>{label}</span>
            <span className="text-ink dark:text-white font-mono text-[10px]">{Math.round(value)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand"
        />
    </div>
);

const RotateCcwIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
const RotateCwIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h16" /></svg>;
const FlipHorizontalIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h3m8-18h3a2 2 0 012 2v14a2 2 0 01-2 2h-3M12 20V4" /></svg>;
const FlipVerticalIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 012-2h14a2 2 0 012 2v3m-18 8v3a2 2 0 002 2h14a2 2 0 002-2v-3M4 12h16" /></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>;
const UndoIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h10a5 5 0 0 1 5 5v2" /><path d="M3 10l5-5" /><path d="M3 10l5 5" /></svg>;
const RedoIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10H11a5 5 0 0 0-5 5v2" /><path d="M21 10l-5-5" /><path d="M21 10l-5 5" /></svg>;
const DuplicateIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const BringFrontIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="1" /><path d="M4 16V6a2 2 0 012-2h10" /></svg>;
const SendBackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="12" height="12" rx="1" /><path d="M20 8v10a2 2 0 01-2 2H8" /></svg>;

const RectIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
const CircleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /></svg>;
const TriangleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3L2 21h20L12 3z" /></svg>;
const PenIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l5 5" /><path d="M14 11l7-7" /></svg>;
const LockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const UnlockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>;

export default Toolbar;
