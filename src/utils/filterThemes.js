import * as fabric from 'fabric';

/**
 * Applies a specific theme to the active object on the canvas.
 * @param {fabric.Canvas} canvas - The fabric canvas instance.
 * @param {string} themeId - The ID of the theme to apply.
 */
export const applyTheme = (canvas, themeId) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
        // console.warn('No image selected to apply theme.'); 
        // Suppress warning or handle UI feedback elsewhere
        return;
    }

    // Clear existing filters first
    activeObject.filters = [];

    switch (themeId) {
        case 'original':
            // Already cleared.
            break;

        case 'vintage':
            activeObject.filters.push(
                new fabric.filters.Sepia(),
                new fabric.filters.Contrast({ contrast: 0.1 }),
                new fabric.filters.Noise({ noise: 10 })
            );
            break;

        case 'bw':
            activeObject.filters.push(
                new fabric.filters.Grayscale(),
                new fabric.filters.Contrast({ contrast: 0.2 })
            );
            break;

        case 'warm':
            activeObject.filters.push(
                new fabric.filters.BlendColor({
                    color: '#feb048',
                    mode: 'overlay',
                    alpha: 0.3
                }),
                new fabric.filters.Saturation({ saturation: 0.1 })
            );
            break;

        case 'cool':
            activeObject.filters.push(
                new fabric.filters.BlendColor({
                    color: '#00addc',
                    mode: 'overlay',
                    alpha: 0.3
                }),
                new fabric.filters.Contrast({ contrast: 0.1 })
            );
            break;

        case 'polaroid':
            activeObject.filters.push(
                new fabric.filters.Saturation({ saturation: -0.2 }),
                new fabric.filters.Contrast({ contrast: 0.1 }),
                new fabric.filters.Brightness({ brightness: 0.1 }),
                new fabric.filters.BlendColor({
                    color: '#ffaa00',
                    mode: 'overlay',
                    alpha: 0.1
                })
            );
            break;

        case 'technicolor':
            activeObject.filters.push(
                new fabric.filters.Saturation({ saturation: 0.5 }),
                new fabric.filters.Contrast({ contrast: 0.2 })
            );
            break;

        case 'kodachrome':
            activeObject.filters.push(
                new fabric.filters.Contrast({ contrast: 0.2 }),
                new fabric.filters.Saturation({ saturation: 0.3 }),
                new fabric.filters.Brightness({ brightness: -0.05 })
            );
            break;

        default:
            break;
    }

    activeObject.applyFilters();
    canvas.requestRenderAll();
};

export const THEMES = [
    { id: 'original', name: 'Original', color: '#ffffff' },
    { id: 'vintage', name: 'Vintage', color: '#e4d5b7' },
    { id: 'bw', name: 'B&W', color: '#333333' },
    { id: 'warm', name: 'Warm', color: '#feb048' },
    { id: 'cool', name: 'Cool', color: '#00addc' },
    { id: 'polaroid', name: 'Polaroid', color: '#fbecd6' },
    { id: 'technicolor', name: 'Technicolor', color: '#ff5722' },
    { id: 'kodachrome', name: 'Kodachrome', color: '#c62828' },
];
