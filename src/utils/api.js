const API_URL = '/api';

const credentialsOptions = { credentials: 'include' };

export const api = {
    // Auth
    signup: async (userData) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            ...credentialsOptions,
            body: JSON.stringify(userData),
        });
        return await response.json();
    },
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            ...credentialsOptions,
            body: JSON.stringify(credentials),
        });
        return await response.json();
    },

    logout: async () => {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            ...credentialsOptions,
        });
        return await response.json();
    },

    // Projects
    getProjects: async () => {
        const response = await fetch(`${API_URL}/projects`, {
            ...credentialsOptions,
        });
        return await response.json();
    },
    createProject: async (projectData) => {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            ...credentialsOptions,
            body: JSON.stringify(projectData),
        });
        return await response.json();
    },
    updateProject: async (id, projectData) => {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            ...credentialsOptions,
            body: JSON.stringify(projectData),
        });
        return await response.json();
    },
    deleteProject: async (id) => {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            ...credentialsOptions,
        });
        return await response.json();
    }
};
