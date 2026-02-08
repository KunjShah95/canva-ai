import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useTheme } from '../context/ThemeContext';

const Canvas = ({ onCanvasReady, setEditorZoom }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const { theme } = useTheme();
    const [objectCount, setObjectCount] = useState(0);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Fabric Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: containerRef.current.clientWidth > 100 ? containerRef.current.clientWidth - 80 : 800,
            height: containerRef.current.clientHeight > 100 ? containerRef.current.clientHeight - 80 : 600,
            backgroundColor: theme === 'dark' ? '#111' : '#ffffff',
            preserveObjectStacking: true,
            selectionColor: 'rgba(95, 95, 253, 0.1)',
            selectionBorderColor: '#5F5FFD',
            selectionLineWidth: 1.5
        });

        fabricCanvasRef.current = canvas;

        // Custom corner styles for premium student feel
        fabric.FabricObject.prototype.set({
            transparentCorners: false,
            cornerColor: '#5F5FFD',
            cornerStrokeColor: '#ffffff',
            cornerStyle: 'circle',
            cornerSize: 10,
            padding: 12,
            borderDashArray: [4, 4],
            borderColor: '#5F5FFD',
            borderScaleFactor: 2
        });

        // Resize handler
        const handleResize = () => {
            if (fabricCanvasRef.current && containerRef.current) {
                fabricCanvasRef.current.setDimensions({
                    width: containerRef.current.clientWidth - 80,
                    height: containerRef.current.clientHeight - 80
                });
                fabricCanvasRef.current.requestRenderAll();
            }
        };

        window.addEventListener('resize', handleResize);

        // Zoom and Pan Logic
        canvas.on('mouse:wheel', function (opt) {
            const delta = opt.e.deltaY;
            let zoomLevel = canvas.getZoom();
            zoomLevel *= 0.999 ** delta;
            if (zoomLevel > 10) zoomLevel = 10;
            if (zoomLevel < 0.1) zoomLevel = 0.1;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoomLevel);
            setZoom(Math.round(zoomLevel * 100));
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        canvas.on('after:render', () => {
            const newZoom = Math.round(canvas.getZoom() * 100);
            if (setEditorZoom) setEditorZoom(newZoom);
        });

        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        canvas.on('mouse:down', function (opt) {
            const evt = opt.e;
            if (evt.altKey === true || opt.target === null) {
                isDragging = true;
                canvas.selection = false;
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;

                // Temporarily disable drawing if active
                if (canvas.isDrawingMode) {
                    canvas._wasDrawingBeforePan = true;
                    canvas.isDrawingMode = false;
                }
            }
        });

        canvas.on('mouse:move', function (opt) {
            if (isDragging) {
                const e = opt.e;
                const vpt = canvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
            }
        });

        canvas.on('mouse:up', function (opt) {
            canvas.setViewportTransform(canvas.viewportTransform);
            isDragging = false;
            canvas.selection = true;

            // Restore drawing mode if it was active
            if (canvas._wasDrawingBeforePan) {
                canvas.isDrawingMode = true;
                canvas._wasDrawingBeforePan = false;
            }
        });

        // Initial resize to capture correct dimensions after first render
        setTimeout(handleResize, 100);

        // Notify parent that canvas is ready
        if (onCanvasReady) {
            onCanvasReady(canvas);
        }

        // Add a listener for object changes to track emptiness
        const updateEmptiness = () => {
            setObjectCount(canvas.getObjects().length);
        };
        canvas.on('object:added', updateEmptiness);
        canvas.on('object:removed', updateEmptiness);
        canvas.on('canvas:cleared', updateEmptiness);

        // Initial check
        updateEmptiness();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.off('object:added', updateEmptiness);
            canvas.off('object:removed', updateEmptiness);
            canvas.off('canvas:cleared', updateEmptiness);
            canvas.dispose();
        };
    }, [onCanvasReady]); // Removed theme to prevent re-init on theme change

    // Update background color when theme changes
    useEffect(() => {
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.backgroundColor = theme === 'dark' ? '#111' : '#ffffff';
            fabricCanvasRef.current.requestRenderAll();
        }
    }, [theme]);

    return (
        <div ref={containerRef} className="flex-1 bg-[#F9F9F9] dark:bg-[#050505] flex items-center justify-center overflow-hidden relative transition-colors duration-500">

            <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white dark:bg-black">
                <canvas ref={canvasRef} />

                {/* EMPTY STATE OVERLAY */}
                {objectCount === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-12 text-center animate-fade-in z-0">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 dark:text-gray-700 mb-6 border border-gray-100 dark:border-white/5 shadow-inner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-ink dark:text-white mb-3">Canvas Ready</h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest max-w-[200px] leading-[2] font-medium">
                            Drag your assets here <br />
                            or use the <span className="text-brand">Toolbar</span> <br />
                            to start designing
                        </p>

                        <div className="mt-8 flex gap-3 opacity-30">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                        </div>
                    </div>
                )}

                {/* Visual Frame Detail */}
                <div className="absolute inset-0 pointer-events-none border border-gray-100 dark:border-white/5"></div>
            </div>

            {/* FLOATING ACTION OVERLAY */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 px-5 py-2.5 rounded-full shadow-2xl transition-all">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (!fabricCanvasRef.current) return;
                            fabricCanvasRef.current.setZoom(1);
                            fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
                            fabricCanvasRef.current.requestRenderAll();
                        }}
                        className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-brand transition-colors"
                        title="Reset View"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                    </button>
                    <button
                        onClick={() => {
                            if (!fabricCanvasRef.current) return;
                            const objects = fabricCanvasRef.current.getObjects();
                            if (objects.length > 0) {
                                fabricCanvasRef.current.centerObject(objects[objects.length - 1]);
                                fabricCanvasRef.current.requestRenderAll();
                            }
                        }}
                        className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-brand transition-colors"
                        title="Center Selected"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M3 12h3m12 0h3M12 3v3m0 12v3" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Hint */}
            <div className="absolute top-6 right-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 dark:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                Hold <span className="text-brand">Alt</span> to Pan
            </div>
        </div>
    );
};

export default Canvas;
