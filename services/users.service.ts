import { api } from './api';

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByOrg: {
        _id: string;
        name: string;
        count: number;
    }[];
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'user' | 'superadmin';
    isActive: boolean;
    phoneNumber: string;
    countryCode: string;
    organization?: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export const usersService = {
    // Regular admin methods (scoped to their org)
    getUsers: async () => {
        return api.get<User[]>('/users');
    },

    // Super admin methods
    getAllUsers: async () => {
        return api.get<User[]>('/users/admin/all');
    },

    getStats: async () => {
        return api.get<UserStats>('/users/admin/stats');
    },

    updateUser: async (id: string, data: Partial<User>) => {
        return api.put<User>(`/users/admin/${id}`, data);
    },

    deactivateUser: async (id: string) => {
        return api.put<User>(`/users/admin/${id}/deactivate`, {});
    },

    reactivateUser: async (id: string) => {
        return api.put<User>(`/users/admin/${id}/reactivate`, {});
    },

    resetPassword: async (id: string, newPassword: string) => {
        return api.put<User>(`/users/admin/${id}/password`, { newPassword });
    },
};
