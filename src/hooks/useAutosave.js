import { useState, useEffect, useCallback, useRef } from 'react';

export const useAutosave = (canvas, projectId, projectName, onProjectSaved) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const autosaveTimeoutRef = useRef(null);
    const autosaveInFlightRef = useRef(false);
    const activeProjectIdRef = useRef(projectId || null);

    useEffect(() => {
        activeProjectIdRef.current = projectId || activeProjectIdRef.current || null;
    }, [projectId]);

    const persistProject = useCallback(async ({ auto = false } = {}) => {
        if (!canvas) return null;
        if (autosaveInFlightRef.current) return null;

        const hasCanvasContent = canvas.getObjects().length > 0;
        const resolvedProjectName = projectName?.trim() || 'Untitled Project';

        if (auto && !activeProjectIdRef.current && !hasCanvasContent) {
            return null;
        }

        autosaveInFlightRef.current = true;
        setIsSaving(true);

        try {
            const payload = {
                name: resolvedProjectName,
                data: canvas.toJSON(),
                thumbnail: hasCanvasContent ? canvas.toDataURL({ format: 'png', multiplier: 0.2 }) : null,
                width: canvas.width,
                height: canvas.height
            };

            let savedProject;
            const API_URL = '/api/projects';
            const requestOptions = {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (activeProjectIdRef.current) {
                const response = await fetch(`${API_URL}/${activeProjectIdRef.current}`, {
                    method: 'PUT',
                    ...requestOptions,
                    body: JSON.stringify(payload)
                });
                savedProject = await response.json();
            } else {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    ...requestOptions,
                    body: JSON.stringify(payload)
                });
                savedProject = await response.json();
                activeProjectIdRef.current = savedProject.id;
                if (onProjectSaved) onProjectSaved(savedProject);
            }

            setLastSavedAt(new Date());
            return savedProject;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            autosaveInFlightRef.current = false;
            setIsSaving(false);
        }
    }, [canvas, onProjectSaved, projectName]);

    useEffect(() => {
        if (!canvas) return;

        const scheduleAutosave = () => {
            if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
            autosaveTimeoutRef.current = setTimeout(() => {
                void persistProject({ auto: true });
            }, 1500);
        };

        canvas.on('object:added', scheduleAutosave);
        canvas.on('object:modified', scheduleAutosave);
        canvas.on('object:removed', scheduleAutosave);
        canvas.on('path:created', scheduleAutosave);

        return () => {
            canvas.off('object:added', scheduleAutosave);
            canvas.off('object:modified', scheduleAutosave);
            canvas.off('object:removed', scheduleAutosave);
            canvas.off('path:created', scheduleAutosave);
            if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
        };
    }, [canvas, persistProject]);

    return {
        isSaving,
        lastSavedAt,
        persistProject,
        activeProjectId: activeProjectIdRef
    };
};
