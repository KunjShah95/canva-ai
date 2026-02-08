const API_URL = '/api';

export const api = {
    // Auth
    signup: async (userData) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return await response.json();
    },
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return await response.json();
    },

    // Projects
    getProjects: async () => {
        const token = localStorage.getItem('canvas-ai-token');
        const response = await fetch(`${API_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return await response.json();
    },
    createProject: async (projectData) => {
        const token = localStorage.getItem('canvas-ai-token');
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData),
        });
        return await response.json();
    },
    updateProject: async (id, projectData) => {
        const token = localStorage.getItem('canvas-ai-token');
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData),
        });
        return await response.json();
    },
    deleteProject: async (id) => {
        const token = localStorage.getItem('canvas-ai-token');
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return await response.json();
    }
};
