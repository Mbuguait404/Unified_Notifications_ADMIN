'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/auth.service';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    showSessionModal: boolean;
    setShowSessionModal: (show: boolean) => void;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
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

    const handleLogin = async (credentials: { email: string; password: string }) => {
        const data = await authService.login(credentials);
        setUser(data.user);
        setShowSessionModal(false);
        router.push('/');
        router.refresh();
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setShowSessionModal(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
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
