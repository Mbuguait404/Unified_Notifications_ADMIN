import { api } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'user' | 'superadmin';
    organization?: {
        _id: string;
        name: string;
    };
}

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!res.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await res.json();

        // Store token in cookie
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `admin_session=true; path=/; max-age=86400; SameSite=Lax`;

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    },

    logout: () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        localStorage.removeItem('user');
    }
};
