const HISTORY_KEY = 'canvas-ai-history';
const MAX_HISTORY = 50;

export const createHistoryManager = (canvas) => {
    let undoStack = [];
    let redoStack = [];
    let isRestoring = false;

    let saveTimeout = null;
    const saveState = () => {
        if (isRestoring) return;

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            const json = JSON.stringify(canvas.toJSON());
            undoStack.push(json);

            if (undoStack.length > MAX_HISTORY) {
                undoStack.shift();
            }

            redoStack = [];
        }, 500); // 500ms debounce
    };

    const undo = () => {
        if (undoStack.length === 0) return false;

        const currentState = JSON.stringify(canvas.toJSON());
        redoStack.push(currentState);

        const previousState = undoStack.pop();
        isRestoring = true;

        canvas.loadFromJSON(previousState).then(() => {
            canvas.requestRenderAll();
            isRestoring = false;
        });

        return true;
    };

    const redo = () => {
        if (redoStack.length === 0) return false;

        const currentState = JSON.stringify(canvas.toJSON());
        undoStack.push(currentState);

        const nextState = redoStack.pop();
        isRestoring = true;

        canvas.loadFromJSON(nextState).then(() => {
            canvas.requestRenderAll();
            isRestoring = false;
        });

        return true;
    };

    const clearHistory = () => {
        undoStack = [];
        redoStack = [];
        localStorage.removeItem(HISTORY_KEY);
    };

    const canUndo = () => undoStack.length > 0;
    const canRedo = () => redoStack.length > 0;

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    return { undo, redo, clearHistory, canUndo, canRedo };
};

export const handleKeyboardShortcuts = (e, canvas, historyManager) => {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        historyManager?.undo();
    } else if ((isMod && e.key === 'z' && e.shiftKey) || (isMod && e.key === 'y')) {
        e.preventDefault();
        historyManager?.redo();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas?.getActiveObject();
        if (active) {
            canvas?.remove(active);
            canvas?.requestRenderAll();
        }
    } else if (e.key === 's' && isMod) {
        e.preventDefault();
    }
};
