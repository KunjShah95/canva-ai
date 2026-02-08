import React, { useState } from 'react';
import * as fabric from 'fabric';

const stickers = [
    { name: 'Star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { name: 'Heart', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
    { name: 'Smile', path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z' },
    { name: 'Fire', path: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z' },
    { name: 'Lightning', path: 'M7 2v11h3v9l7-12h-4l4-8z' },
    { name: 'Cloud', path: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z' },
    { name: 'Check', path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
    { name: 'Plus', path: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
    { name: 'Flag', path: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z' },
    { name: ' Crown', path: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z' },
    { name: 'Diamond', path: 'M16 9V4l-8 6 8 6v-5l-6 4z' },
    { name: 'Moon', path: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z' },
    { name: 'Sun', path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z' },
    { name: 'Tree', path: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z' },
    { name: 'Car', path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' },
];

const shapes = [
    { name: 'Square', type: 'rect', width: 100, height: 100, rx: 0, ry: 0 },
    { name: 'Rounded', type: 'rect', width: 100, height: 100, rx: 20, ry: 20 },
    { name: 'Circle', type: 'circle', radius: 50 },
    { name: 'Triangle', type: 'triangle', width: 100, height: 100 },
    { name: 'Pentagon', type: 'polygon', points: '50,5 95,40 79,98 21,98 5,40' },
    { name: 'Hexagon', type: 'polygon', points: '50,5 95,27 95,73 50,95 5,73 5,27' },
    { name: 'Star', type: 'star', points: 5, innerRadius: 0.4 },
    { name: 'Arrow Right', type: 'path', path: 'M0,50 L60,50 M40,30 L60,50 L40,70' },
    { name: 'Line', type: 'line', points: [0, 50, 100, 50] },
    { name: 'Spiral', type: 'path', path: 'M50,50 m0,-5 a5,5 0 0,1 0,10 a10,10 0 0,1 0,-20 a15,15 0 0,1 0,30 a20,20 0 0,1 0,-40 a25,25 0 0,1 0,50' },
];

const fillColors = [
    '#5F5FFD', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
    '#85C1E9', '#F8B500', '#FF6F61', '#6B5B95', '#88B04B',
];

const stickerCategories = {
    'Basic': ['Star', 'Heart', 'Smile', 'Check', 'Plus', 'Flag', 'Crown'],
    'Nature': ['Cloud', 'Fire', 'Lightning', 'Moon', 'Sun', 'Tree'],
    'Symbols': ['Diamond', 'Heart', 'Star', 'Crown', 'Flag'],
    'Objects': ['Car', 'Tree', 'Cloud', 'Fire'],
};

export const addShape = (canvas, shape) => {
    if (!canvas) return;
    let obj;

    switch (shape.type) {
        case 'rect':
            obj = new fabric.Rect({
                width: shape.width,
                height: shape.height,
                rx: shape.rx,
                ry: shape.ry,
                fill: fillColors[0],
                stroke: '#333',
                strokeWidth: 1,
            });
            break;
        case 'circle':
            obj = new fabric.Circle({
                radius: shape.radius,
                fill: fillColors[1],
                stroke: '#333',
                strokeWidth: 1,
            });
            break;
        case 'triangle':
            obj = new fabric.Triangle({
                width: shape.width,
                height: shape.height,
                fill: fillColors[2],
                stroke: '#333',
                strokeWidth: 1,
            });
            break;
        case 'polygon':
            obj = new fabric.Polygon(
                shape.points.split(' ').map(p => {
                    const [x, y] = p.split(',').map(Number);
                    return { x, y };
                }),
                {
                    fill: fillColors[3],
                    stroke: '#333',
                    strokeWidth: 1,
                }
            );
            break;
        case 'star':
            obj = new fabric.Polygon(createStarPoints(5, 50, 25), {
                fill: fillColors[4],
                stroke: '#333',
                strokeWidth: 1,
            });
            break;
        case 'line':
            obj = new fabric.Line(shape.points, {
                stroke: '#333',
                strokeWidth: 3,
                strokeLineCap: 'round',
            });
            break;
        case 'path':
            obj = new fabric.Path(shape.path, {
                fill: null,
                stroke: '#333',
                strokeWidth: 3,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
            });
            break;
        default:
            return;
    }

    if (obj) {
        canvas.add(obj);
        canvas.centerObject(obj);
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
    }
};

export const addSticker = (canvas, sticker) => {
    if (!canvas) return;

    const pathData = sticker.path;
    const obj = new fabric.Path(pathData, {
        fill: fillColors[0],
        stroke: null,
        scaleX: 1.5,
        scaleY: 1.5,
    });

    canvas.add(obj);
    canvas.centerObject(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
};

function createStarPoints(numPoints, outerRadius, innerRadius) {
    const points = [];
    const step = Math.PI / numPoints;

    for (let i = 0; i < 2 * numPoints; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * step - Math.PI / 2;
        points.push({
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle),
        });
    }

    return points;
}

export const changeObjectColor = (canvas, color) => {
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return;

    if (activeObject.type === 'path' || activeObject.type === 'line') {
        activeObject.set('stroke', color);
    } else {
        activeObject.set('fill', color);
    }

    canvas.requestRenderAll();
};

export const changeObjectStroke = (canvas, color, width) => {
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return;

    activeObject.set('stroke', color);
    if (width) activeObject.set('strokeWidth', width);
    canvas.requestRenderAll();
};

export const ShapesPanel = ({ canvas, setStatus }) => {
    const [selectedColor, setSelectedColor] = useState(fillColors[0]);
    const [activeCategory, setActiveCategory] = useState('Basic');

    const handleAddShape = (shape) => {
        addShape(canvas, shape);
        setStatus(`Added ${shape.name}`);
        setTimeout(() => setStatus('Ready'), 1500);
    };

    const handleAddSticker = (sticker) => {
        addSticker(canvas, sticker);
        setStatus(`Added ${sticker.name}`);
        setTimeout(() => setStatus('Ready'), 1500);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">Color</h3>
                <div className="flex flex-wrap gap-1">
                    {fillColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => {
                                setSelectedColor(color);
                                changeObjectColor(canvas, color);
                            }}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                                selectedColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => {
                            setSelectedColor(e.target.value);
                            changeObjectColor(canvas, e.target.value);
                        }}
                        className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-2 border-transparent"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">Shapes</h3>
                <div className="grid grid-cols-5 gap-1">
                    {shapes.slice(0, 10).map((shape) => (
                        <button
                            key={shape.name}
                            onClick={() => handleAddShape(shape)}
                            className="aspect-square flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-brand/10 hover:border-brand border border-transparent transition-all"
                            title={shape.name}
                        >
                            <svg viewBox="0 0 100 100" className="w-8 h-8 text-gray-500">
                                {shape.type === 'rect' && <rect x="20" y="20" width="60" height="60" rx={shape.rx / 2} fill="currentColor" />}
                                {shape.type === 'circle' && <circle cx="50" cy="50" r="30" fill="currentColor" />}
                                {shape.type === 'triangle' && <polygon points="50,20 80,80 20,80" fill="currentColor" />}
                                {shape.type === 'polygon' && (
                                    <polygon
                                        points={shape.points}
                                        fill="currentColor"
                                        transform="scale(0.8) translate(10, 10)"
                                    />
                                )}
                                {shape.type === 'star' && <polygon points="50,10 61,40 95,40 68,60 79,90 50,72 21,90 32,60 5,40 39,40" fill="currentColor" />}
                                {shape.type === 'path' && (
                                    <path
                                        d={shape.path}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                    />
                                )}
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">Stickers</h3>
                <div className="flex gap-1 mb-2">
                    {Object.keys(stickerCategories).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${
                                activeCategory === cat
                                    ? 'bg-brand text-white'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-5 gap-1">
                    {stickers
                        .filter((s) => stickerCategories[activeCategory]?.includes(s.name))
                        .map((sticker) => (
                            <button
                                key={sticker.name}
                                onClick={() => handleAddSticker(sticker)}
                                className="aspect-square flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-brand/10 border border-transparent transition-all"
                                title={sticker.name}
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-500 fill-current">
                                    <path d={sticker.path} />
                                </svg>
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ShapesPanel;
