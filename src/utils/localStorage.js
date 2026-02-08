const STORAGE_KEY = 'canvas-ai-projects';

export const getProjects = () => {
    try {
        const projects = localStorage.getItem(STORAGE_KEY);
        return projects ? JSON.parse(projects) : [];
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
};

export const saveProject = (project) => {
    try {
        const projects = getProjects();
        const existingIndex = projects.findIndex(p => p.id === project.id);

        if (existingIndex >= 0) {
            projects[existingIndex] = { ...project, lastModified: new Date().toISOString() };
        } else {
            projects.push({
                ...project,
                id: project.id || `proj-${Date.now()}`,
                lastModified: new Date().toISOString()
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return project.id || `proj-${Date.now()}`;
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
};

export const deleteProject = (projectId) => {
    try {
        const projects = getProjects();
        const filtered = projects.filter(p => p.id !== projectId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

export const getProject = (projectId) => {
    try {
        const projects = getProjects();
        return projects.find(p => p.id === projectId) || null;
    } catch (error) {
        console.error('Error getting project:', error);
        return null;
    }
};

export const saveCanvasState = (canvas, projectName) => {
    const json = canvas.toJSON();
    const thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.3,
        multiplier: 0.2
    });

    const project = {
        name: projectName,
        canvasState: json,
        thumbnail: thumbnail,
        width: canvas.width,
        height: canvas.height
    };

    return saveProject(project);
};

export const loadCanvasState = (canvas, project) => {
    if (project.canvasState) {
        canvas.loadFromJSON(project.canvasState).then(() => {
            canvas.requestRenderAll();
        });
    }
};
