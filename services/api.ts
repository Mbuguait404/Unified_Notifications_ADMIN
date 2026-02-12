
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

function getAuthToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (match) return match[2];
    return null;
}

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('admin-auth-unauthorized'));
        }
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
};

export const api = {
    get: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            method: 'GET',
            headers,
        });

        return handleResponse(response);
    },

    post: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
            headers,
        });

        return handleResponse(response);
    },

    patch: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
            headers,
        });

        return handleResponse(response);
    },

    put: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
            headers,
        });

        return handleResponse(response);
    },
};

