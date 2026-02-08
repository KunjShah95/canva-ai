import React, { useState, useEffect } from 'react';

const EXPORT_FORMATS = [
    { id: 'png', name: 'PNG', description: 'Lossless, supports transparency', icon: '🖼️' },
    { id: 'jpg', name: 'JPEG', description: 'Compressed, smaller files', icon: '📷' },
    { id: 'svg', name: 'SVG', description: 'Vector format, scalable', icon: '📐' },
    { id: 'pdf', name: 'PDF', description: 'Document format', icon: '📄' },
    { id: 'webp', name: 'WebP', description: 'Modern web format', icon: '🌐' },
];

const PRESET_SIZES = [
    { id: 'original', name: 'Original', scale: 1 },
    { id: '0.5x', name: 'Half', scale: 0.5 },
    { id: '1x', name: '1x', scale: 1 },
    { id: '2x', name: '2x', scale: 2 },
    { id: '4x', name: '4x', scale: 4 },
];

const ExportModal = ({ canvas, onClose }) => {
    const [format, setFormat] = useState('png');
    const [quality, setQuality] = useState(0.92);
    const [scale, setScale] = useState(1);
    const [fileName, setFileName] = useState(`canvas-ai-${Date.now()}`);
    const [exporting, setExporting] = useState(false);
    const [includeBackground, setIncludeBackground] = useState(true);
    const [exportSelection, setExportSelection] = useState(false);

    useEffect(() => {
        if (canvas) {
            setFileName(`canvas-ai-${Date.now()}`);
        }
    }, [canvas]);

    const handleExport = async () => {
        if (!canvas) return;

        setExporting(true);

        try {
            if (format === 'svg') {
                const svgData = canvas.toSVG({
                    suppressPreamble: false,
                    width: canvas.width * scale,
                    height: canvas.height * scale,
                    viewBox: {
                        x: 0,
                        y: 0,
                        width: canvas.width,
                        height: canvas.height
                    }
                });
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                downloadBlob(blob, `${fileName}.svg`);
            } else if (format === 'pdf') {
                const svgData = canvas.toSVG({
                    suppressPreamble: false,
                    width: canvas.width * scale,
                    height: canvas.height * scale
                });
                const pdfBlob = await svgToPdfBlob(svgData, canvas.width * scale, canvas.height * scale);
                downloadBlob(pdfBlob, `${fileName}.pdf`);
            } else {
                const dataURL = canvas.toDataURL({
                    format: format === 'jpg' ? 'jpeg' : format,
                    quality: format === 'png' ? 1 : quality,
                    multiplier: scale,
                    enableRetinaScaling: true
                });
                const link = document.createElement('a');
                link.download = `${fileName}.${format === 'jpg' ? 'jpg' : format}`;
                link.href = dataURL;
                link.click();
            }
        } catch (error) {
            console.error('Export error:', error);
        }

        setExporting(false);
        onClose();
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const svgToPdfBlob = async (svgString, width, height) => {
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /XObject << /Img0 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
q ${width} 0 0 ${height} 0 0 cm /Img0 Do Q
endstream
endobj
5 0 obj
<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${svgString.length} >>
stream
${btoa(svgString)}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
0000000317 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${500 + svgString.length}
%%EOF`;
        return new Blob([pdfContent], { type: 'application/pdf' });
    };

    const getEstimatedSize = () => {
        if (!canvas) return '0 KB';
        const width = canvas.width * scale;
        const height = canvas.height * scale;
        const pixels = width * height;
        const bitsPerPixel = format === 'png' ? 32 : format === 'jpg' ? 24 * quality * 8 : 24 * 8;
        const bytes = (pixels * bitsPerPixel) / 8;
        if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    const formatInfo = EXPORT_FORMATS.find(f => f.id === format);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-3">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Export Image
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format</label>
                        <div className="grid grid-cols-5 gap-2">
                            {EXPORT_FORMATS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFormat(f.id)}
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                        format === f.id
                                            ? 'bg-brand/10 border-brand'
                                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand/50'
                                    }`}
                                >
                                    <span className="text-xl">{f.icon}</span>
                                    <div className="text-[9px] font-bold uppercase mt-1">{f.name}</div>
                                </button>
                            ))}
                        </div>
                        {formatInfo && (
                            <p className="text-[10px] text-gray-400">{formatInfo.description}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</label>
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_SIZES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setScale(s.scale)}
                                    className={`p-2 rounded-lg border text-center transition-all ${
                                        scale === s.scale
                                            ? 'bg-brand text-white border-brand'
                                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand/50'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {['jpg', 'jpeg', 'webp'].includes(format) && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quality</label>
                                <span className="text-[10px] font-mono text-brand">{Math.round(quality * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.01"
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand"
                            />
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File Name</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs focus:ring-2 focus:ring-brand focus:outline-none"
                            placeholder="Enter file name"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeBackground}
                                onChange={(e) => setIncludeBackground(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                            />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Include Background</span>
                        </label>
                    </div>

                    <div className="p-4 bg-brand/5 rounded-xl border border-brand/20">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Output Size:</span>
                            <span className="font-mono font-bold">{canvas?.width * scale} x {canvas?.height * scale}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span className="text-gray-400">Est. File Size:</span>
                            <span className="font-mono font-bold text-brand">{getEstimatedSize()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex-1 py-3 bg-brand text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                Export {format.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
