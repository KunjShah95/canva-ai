import React from 'react';
import * as fabric from 'fabric';
import templates from '../data/templates.json';
import { clearCanvas } from '../utils/imageUtils';

const TemplateLibrary = ({ canvas }) => {

    const applyTemplate = (template) => {
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
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic mb-6">Student Templates</h3>
            <div className="grid grid-cols-1 gap-4">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="group cursor-pointer border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-brand hover:shadow-xl transition-all bg-white dark:bg-black p-4"
                    >
                        <div
                            className="w-full h-32 bg-gray-50 dark:bg-[#111] rounded-xl mb-4 overflow-hidden relative flex items-center justify-center border border-gray-50 dark:border-white/5 shadow-inner"
                            style={{ backgroundColor: `${template.backgroundColor}22` }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-brand/10 backdrop-blur-[2px]">
                                <span className="bg-white text-brand text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Use Template</span>
                            </div>

                            {/* Abstract Preview */}
                            <div className="w-2/3 h-1/2 rounded border border-brand/20 relative" style={{ backgroundColor: template.backgroundColor }}>
                                <div className="absolute top-2 left-2 w-1/3 h-1 bg-white/30 rounded-full"></div>
                                <div className="absolute top-4 left-2 w-1/2 h-1 bg-white/20 rounded-full"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full border border-white/40"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <span className="text-[11px] font-bold text-ink dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors">{template.name}</span>
                                <p className="text-[9px] text-gray-400 font-mono uppercase mt-0.5">{template.category}</p>
                            </div>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">{template.width}x{template.height}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateLibrary;
