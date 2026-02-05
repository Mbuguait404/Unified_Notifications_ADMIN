import { api } from './api';

export interface Organization {
    _id: string;
    name: string;
    slug: string; // "subdomain" in UI
    createdAt: string;
    plan: string;
    notificationsMTD?: number; // Might not be in backend response yet
    status: string;
    color?: string; // UI specific, might need mapping
}

export const organizationService = {
    getAllOrganizations: async (): Promise<Organization[]> => {
        return api.get<Organization[]>('/organizations');
    },
};
