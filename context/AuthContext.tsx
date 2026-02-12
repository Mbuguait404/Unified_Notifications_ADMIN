'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/auth.service';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    tokenExpiresAt: string | null;
    showSessionModal: boolean;
    setShowSessionModal: (show: boolean) => void;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        const storedExpiresAt = typeof window !== 'undefined' ? localStorage.getItem('tokenExpiresAt') : null;
        if (storedUser) {
            setUser(storedUser);
        }
        if (storedExpiresAt) {
            setTokenExpiresAt(storedExpiresAt);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const handleUnauthorized = () => {
            if (pathname === '/login') return;
            setShowSessionModal(true);
        };

        window.addEventListener('admin-auth-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('admin-auth-unauthorized', handleUnauthorized);
    }, [pathname]);

    // Proactively show session modal when token expires
    useEffect(() => {
        if (!tokenExpiresAt) return;

        const expiresAtTime = new Date(tokenExpiresAt).getTime();
        const now = Date.now();
        const delay = expiresAtTime - now;

        if (isNaN(expiresAtTime)) return;

        if (delay <= 0) {
            if (pathname !== '/login') {
                setShowSessionModal(true);
            }
            return;
        }

        const timerId = window.setTimeout(() => {
            if (pathname !== '/login') {
                setShowSessionModal(true);
            }
        }, delay);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [tokenExpiresAt, pathname]);

    const handleLogin = async (credentials: { email: string; password: string }) => {
        const data = await authService.login(credentials);
        setUser(data.user);
        if (data.expiresAt) {
            setTokenExpiresAt(data.expiresAt);
        }
        setShowSessionModal(false);
        router.push('/');
        router.refresh();
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setTokenExpiresAt(null);
        setShowSessionModal(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                tokenExpiresAt,
                showSessionModal,
                setShowSessionModal,
                login: handleLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
