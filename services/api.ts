
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

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
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

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    },

    // Add other methods (PUT, DELETE) as needed
};
