const API_URL = '/api/projects';

const getAuthHeaders = () => {
    const token = localStorage.getItem('canvas-ai-token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getProjects = async (page = 1, limit = 20) => {
    try {
        const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get projects');
        }

        return data;
    } catch (error) {
        console.error('Error getting projects:', error);
        throw error;
    }
};

export const saveProject = async (projectData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save project');
        }

        return data;
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
};

export const getProject = async (projectId) => {
    try {
        const response = await fetch(`${API_URL}/${projectId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get project');
        }

        return data;
    } catch (error) {
        console.error('Error getting project:', error);
        throw error;
    }
};

export const updateProject = async (projectId, projectData) => {
    try {
        const response = await fetch(`${API_URL}/${projectId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update project');
        }

        return data;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await fetch(`${API_URL}/${projectId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete project');
        }

        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

export const saveProjectVersion = async (projectId, versionData) => {
    try {
        const response = await fetch(`${API_URL}/${projectId}/versions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(versionData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save version');
        }

        return data;
    } catch (error) {
        console.error('Error saving version:', error);
        throw error;
    }
};

export const getProjectVersions = async (projectId) => {
    try {
        const response = await fetch(`${API_URL}/${projectId}/versions`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get versions');
        }

        return data;
    } catch (error) {
        console.error('Error getting versions:', error);
        throw error;
    }
};

export const getProjectVersion = async (projectId, versionId) => {
    try {
        const response = await fetch(`${API_URL}/${projectId}/versions/${versionId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get version');
        }

        return data;
    } catch (error) {
        console.error('Error getting version:', error);
        throw error;
    }
};
