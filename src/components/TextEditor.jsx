import React, { useState, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';

const TextEditor = ({ canvas }) => {
    const [selectedText, setSelectedText] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [content, setContent] = useState('');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [fontSize, setFontSize] = useState(48);
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [textAlign, setTextAlign] = useState('left');
    const [textColor, setTextColor] = useState('#000000');
    const [lineHeight, setLineHeight] = useState(1.1);
    const [charSpacing, setCharSpacing] = useState(0);
    const textTimeoutRef = React.useRef(null);

    const fonts = [
        { name: 'Inter', family: 'Inter, sans-serif' },
        { name: 'Serif', family: 'Source Serif 4, serif' },
        { name: 'Mono', family: 'JetBrains Mono, monospace' }
    ];

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = () => {
            const active = canvas.getActiveObject();
            if (active && (active.type === 'i-text' || active.type === 'text')) {
                setSelectedText(active);
                setContent(active.text || '');
                setFontFamily(active.fontFamily || 'Inter');
                setFontSize(active.fontSize || 48);
                setFontWeight(active.fontWeight || 'normal');
                setFontStyle(active.fontStyle || 'normal');
                setTextAlign(active.textAlign || 'left');
                setTextColor(active.fill || '#000000');
                setLineHeight(active.lineHeight || 1.1);
                setCharSpacing(active.charSpacing || 0);
            } else {
                setSelectedText(null);
            }
        };

        const handleEditing = () => {
            const active = canvas.getActiveObject();
            setIsEditing(!!(active && active.isEditing));
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);
        canvas.on('text:editing', handleEditing);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelection);
            canvas.off('text:editing', handleEditing);
        };
    }, [canvas]);

    const applyTextChange = (property, value) => {
        const active = canvas.getActiveObject();
        if (!active) return;


        const update = () => {
            active.set(property === 'fontSize' ? { fontSize: value, scaleX: 1, scaleY: 1 } : { [property]: value });
            canvas.requestRenderAll();
        };

        if (['fontSize', 'lineHeight', 'charSpacing'].includes(property)) {
            if (textTimeoutRef.current) clearTimeout(textTimeoutRef.current);
            textTimeoutRef.current = setTimeout(update, 10);
        } else {
            update();
        }

        switch (property) {
            case 'text': setContent(value); break;
            case 'fontFamily': setFontFamily(value); break;
            case 'fontSize': setFontSize(value); break;
            case 'fontWeight': setFontWeight(value); break;
            case 'fontStyle': setFontStyle(value); break;
            case 'textAlign': setTextAlign(value); break;
            case 'fill': setTextColor(value); break;
            case 'lineHeight': setLineHeight(value); break;
            case 'charSpacing': setCharSpacing(value); break;
        }
    };

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double click to edit', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            textAlign: textAlign,
            fill: textColor,
            lineHeight: lineHeight,
            charSpacing: charSpacing,
            originX: 'center',
            originY: 'center',
            editable: true
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <button
                onClick={addText}
                className="w-full py-4 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-3"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Add Text Layer
            </button>

            {selectedText ? (
                <div className="space-y-10">
                    <ToolSection label="Content">
                        <textarea
                            value={content}
                            onChange={(e) => applyTextChange('text', e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-brand focus:outline-none transition-all resize-none"
                            rows={3}
                            placeholder="Type something..."
                        />
                    </ToolSection>

                    <ToolSection label="Typography">
                        <div className="grid grid-cols-3 gap-2">
                            {fonts.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => applyTextChange('fontFamily', font.family)}
                                    className={`py-2 px-1 text-[10px] font-bold border rounded-lg transition-all ${fontFamily.includes(font.name)
                                        ? 'bg-brand text-white border-brand'
                                        : 'border-gray-100 dark:border-white/10 text-gray-400 hover:border-brand/40'
                                        }`}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    </ToolSection>

                    <ToolSection label="Style & Align">
                        <div className="flex gap-4">
                            <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl flex-1">
                                <StyleBtn
                                    active={fontWeight === 'bold'}
                                    onClick={() => applyTextChange('fontWeight', fontWeight === 'bold' ? 'normal' : 'bold')}
                                    label="B"
                                />
                                <StyleBtn
                                    active={fontStyle === 'italic'}
                                    onClick={() => applyTextChange('fontStyle', fontStyle === 'italic' ? 'normal' : 'italic')}
                                    label="I"
                                    className="italic"
                                />
                            </div>
                            <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl flex-1">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => applyTextChange('textAlign', align)}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${textAlign === align ? 'bg-white dark:bg-black shadow-sm text-brand' : 'text-gray-400'
                                            }`}
                                    >
                                        <AlignIcon type={align} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ToolSection>

                    <ToolSection label="Properties">
                        <div className="space-y-6">
                            <Slider label="Size" value={fontSize} min={8} max={200} step={1} onChange={(v) => applyTextChange('fontSize', parseInt(v))} />
                            <Slider label="Line Height" value={lineHeight} min={0.5} max={2.5} step={0.1} onChange={(v) => applyTextChange('lineHeight', parseFloat(v))} />
                            <Slider label="Spacing" value={charSpacing} min={-100} max={1000} step={10} onChange={(v) => applyTextChange('charSpacing', parseInt(v))} />
                        </div>
                    </ToolSection>

                    <ToolSection label="Visual">
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => applyTextChange('fill', e.target.value)}
                                className="w-12 h-12 cursor-pointer bg-transparent"
                            />
                            <input
                                type="text"
                                value={textColor.toUpperCase()}
                                onChange={(e) => applyTextChange('fill', e.target.value)}
                                className="flex-1 h-11 px-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[11px] font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </ToolSection>

                    <button
                        onClick={() => {
                            canvas.remove(selectedText);
                            canvas.requestRenderAll();
                        }}
                        className="w-full py-4 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        Remove Layer
                    </button>
                </div>
            ) : (
                <div className="text-center py-20 grayscale opacity-30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4">
                        <path d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Select text to edit</p>
                </div>
            )}
        </div>
    );
};

const ToolSection = ({ label, children }) => (
    <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">{label}</h4>
        {children}
    </div>
);

const StyleBtn = ({ active, onClick, label, className = "" }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${active ? 'bg-white dark:bg-black shadow-sm text-brand' : 'text-gray-400 hover:text-gray-600'
            } ${className}`}
    >
        {label}
    </button>
);

const AlignIcon = ({ type }) => {
    if (type === 'left') return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 10H3M21 6H3M13 14H3M19 18H3" /></svg>;
    if (type === 'center') return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 10H6M21 6H3M15 14H9M19 18H5" /></svg>;
    return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10H7M21 6H3M21 14H11M21 18H5" /></svg>;
};

const Slider = ({ label, value, min, max, step, onChange }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
            <span className="text-[10px] font-mono font-bold text-brand">{typeof value === 'number' ? value.toFixed(1) : value}</span>
        </div>
        <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-1 bg-gray-100 dark:bg-white/10 appearance-none cursor-pointer accent-brand rounded-full"
        />
    </div>
);

export default TextEditor;
