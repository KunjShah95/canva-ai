import * as fabric from 'fabric';

export const useImageUpload = (canvas, setStatus) => {
    const compressImage = (file, maxWidth = 2000, quality = 0.85) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvasEl = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvasEl.width = width;
                    canvasEl.height = height;
                    const ctx = canvasEl.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvasEl.toDataURL('image/jpeg', quality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE = 10 * 1024 * 1024;
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            setStatus('Error: Use PNG, JPG, or WebP');
            setTimeout(() => setStatus(''), 2000);
            return;
        }

        if (file.size > MAX_SIZE) {
            setStatus('Error: File too large (Max 10MB)');
            setTimeout(() => setStatus(''), 2000);
            return;
        }

        setStatus('Optimizing Image...');

        try {
            const compressedData = await compressImage(file, 2000, 0.85);
            const img = new Image();
            img.src = compressedData;
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
        } catch (error) {
            console.error('Image compression error:', error);
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
        }
    };

    return { handleUpload };
};
