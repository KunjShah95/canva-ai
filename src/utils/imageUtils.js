import * as fabric from 'fabric';

export const applyFilter = (canvas, filterType, options = {}) => {
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
            filter = new fabric.filters.Convolute({
                matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
            });
            break;
        case 'emboss':
            filter = new fabric.filters.Convolute({
                matrix: [-2, -1, 0, -1, 1, 1, 0, 1, 2]
            });
            break;
        case 'edge':
            filter = new fabric.filters.Convolute({
                matrix: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
            });
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
};

export const enhanceImage = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
        return;
    }

    activeObject.filters = [
        new fabric.filters.Brightness({ brightness: 0.1 }),
        new fabric.filters.Contrast({ contrast: 0.15 }),
        new fabric.filters.Saturation({ saturation: 0.05 })
    ];

    activeObject.applyFilters();
    canvas.requestRenderAll();
};

export const resetFilters = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') return;

    activeObject.filters = [];
    activeObject.applyFilters();
    canvas.requestRenderAll();
};

export const rotateObject = (canvas, angle) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    activeObject.rotate((activeObject.angle || 0) + angle);
    canvas.requestRenderAll();
};

export const flipObject = (canvas, direction) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    if (direction === 'horizontal') {
        activeObject.set('flipX', !activeObject.flipX);
    } else {
        activeObject.set('flipY', !activeObject.flipY);
    }
    canvas.requestRenderAll();
};

export const deleteSelected = (canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects.length) return;
    canvas.discardActiveObject();
    activeObjects.forEach(obj => canvas.remove(obj));
    canvas.requestRenderAll();
};

export const duplicateSelected = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned) => {
        cloned.set({
            left: activeObject.left + 20,
            top: activeObject.top + 20,
            evented: true
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
    });
};

export const bringToFront = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringToFront(activeObject);
        canvas.requestRenderAll();
    }
};

export const sendToBack = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendToBack(activeObject);
        canvas.requestRenderAll();
    }
};

export const groupObjects = (canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) return;

    canvas.discardActiveObject();
    const group = new fabric.Group(activeObjects, {
        evented: true,
        selection: true
    });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
};

export const ungroupObjects = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    const items = activeObject.getObjects();
    canvas.remove(activeObject);
    items.forEach(item => {
        canvas.add(item);
    });
    canvas.requestRenderAll();
};

export const lockObject = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set({
            selectable: false,
            evented: false
        });
        canvas.requestRenderAll();
    }
};

export const unlockObject = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set({
            selectable: true,
            evented: true
        });
        canvas.requestRenderAll();
    }
};

export const addRect = (canvas) => {
    const rect = new fabric.Rect({
        left: canvas.width / 2,
        top: canvas.height / 2,
        fill: '#5F5FFD',
        width: 100,
        height: 100,
        rx: 10,
        ry: 10,
        originX: 'center',
        originY: 'center'
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
};

export const addCircle = (canvas) => {
    const circle = new fabric.Circle({
        left: canvas.width / 2,
        top: canvas.height / 2,
        fill: '#5F5FFD',
        radius: 50,
        originX: 'center',
        originY: 'center'
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
};

export const addTriangle = (canvas) => {
    const triangle = new fabric.Triangle({
        left: canvas.width / 2,
        top: canvas.height / 2,
        fill: '#5F5FFD',
        width: 100,
        height: 100,
        originX: 'center',
        originY: 'center'
    });
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.requestRenderAll();
};

export const toggleDrawingMode = (canvas, isDrawing, options = {}) => {
    canvas.isDrawingMode = isDrawing;
    if (isDrawing) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = options.width || 5;
        canvas.freeDrawingBrush.color = options.color || '#5F5FFD';
    }
};

export const clearCanvas = (canvas) => {
    canvas.getObjects().forEach(obj => {
        if (obj !== canvas.backgroundImage) {
            canvas.remove(obj);
        }
    });
    canvas.requestRenderAll();
};
