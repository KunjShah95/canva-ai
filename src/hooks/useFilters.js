import { useState, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

export const useFilters = (canvas) => {
    const filterTimeoutRef = useRef(null);
    const [adjustments, setAdjustments] = useState({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0
    });

    const applyFilter = useCallback((canvas, filterType, options = {}) => {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;

        let filter;
        switch (filterType) {
            case 'brightness':
                filter = new fabric.filters.Brightness({ brightness: options.value || 0 });
                break;
            case 'contrast':
                filter = new fabric.filters.Contrast({ contrast: options.value || 0 });
                break;
            case 'saturation':
                filter = new fabric.filters.Saturation({ saturation: options.value || 0 });
                break;
            case 'hue':
                filter = new fabric.filters.HueRotation({ rotation: options.value || 0 });
                break;
            case 'blur':
                filter = new fabric.filters.Blur({ blur: options.value || 0 });
                break;
            case 'sharpen':
                filter = new fabric.filters.Convolute({ matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] });
                break;
            case 'emboss':
                filter = new fabric.filters.Convolute({ matrix: [-2, -1, 0, -1, 1, 1, 0, 1, 2] });
                break;
            case 'edge':
                filter = new fabric.filters.Convolute({ matrix: [-1, -1, -1, -1, 8, -1, -1, -1, -1] });
                break;
            case 'noise':
                filter = new fabric.filters.Noise({ noise: (options.value || 0.1) * 100 });
                break;
            case 'pixelate':
                filter = new fabric.filters.Pixelate({ blockSize: options.value || 4 });
                break;
            case 'grayscale':
                filter = new fabric.filters.Grayscale();
                break;
            case 'sepia':
                filter = new fabric.filters.Sepia();
                break;
            case 'invert':
                filter = new fabric.filters.Invert();
                break;
            case 'vintage':
                filter = new fabric.filters.Vintage();
                break;
            case 'technicolor':
                filter = new fabric.filters.Technicolor();
                break;
            case 'polaroid':
                filter = new fabric.filters.Polaroid();
                break;
            case 'brownie':
                filter = new fabric.filters.Brownie();
                break;
            case 'kodachrome':
                filter = new fabric.filters.Kodachrome();
                break;
            case 'blackwhite':
                filter = new fabric.filters.BlackWhite();
                break;
            default:
                return;
        }

        const index = activeObject.filters.findIndex(f => f.type === filter.type);
        if (index !== -1) {
            activeObject.filters[index] = filter;
        } else {
            activeObject.filters.push(filter);
        }

        activeObject.applyFilters();
        canvas.requestRenderAll();
    }, []);

    const enhanceImage = useCallback((canvas) => {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;

        activeObject.filters = [
            new fabric.filters.Brightness({ brightness: 0.1 }),
            new fabric.filters.Contrast({ contrast: 0.15 }),
            new fabric.filters.Saturation({ saturation: 0.05 })
        ];
        activeObject.applyFilters();
        canvas.requestRenderAll();
    }, []);

    const resetFilters = useCallback((canvas) => {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;
        activeObject.filters = [];
        activeObject.applyFilters();
        canvas.requestRenderAll();
    }, []);

    const handleAdjustmentChange = useCallback((type, value) => {
        setAdjustments(prev => ({ ...prev, [type]: value }));

        if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
        filterTimeoutRef.current = setTimeout(() => {
            if (canvas) {
                applyFilter(canvas, type, { value: parseFloat(value) });
            }
        }, 50);
    }, [canvas, applyFilter]);

    return {
        adjustments,
        setAdjustments,
        applyFilter,
        enhanceImage,
        resetFilters,
        handleAdjustmentChange,
        filterTimeoutRef
    };
};
