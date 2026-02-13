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
    rates?: {
        sms: number;
        whatsapp: number;
        email: number;
    };
}

export const organizationService = {
    getAllOrganizations: async (): Promise<Organization[]> => {
        return api.get<Organization[]>('/organizations');
    },

    getOrganizationById: async (id: string): Promise<Organization & {
        sector?: string;
        country?: string;
        credits?: number;
        emailFromName?: string | null;
        updatedAt?: string;
        credentials?: any;
    }> => {
        return api.get(`/organizations/${id}`);
    },

    updateOrganization: async (id: string, payload: any) => {
        return api.patch(`/organizations/${id}`, payload);
    },

    updateOrganizationCredentials: async (id: string, credentials: any) => {
        return api.patch(`/organizations/${id}/credentials`, { credentials });
    },

    // Super admin: create a new organization + primary admin user
    createOrganization: async (payload: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        countryCode: string;
        phoneNumber: string;
        companyName: string;
        sector: string;
        country: string;
    }) => {
        // Reuse the public signup flow which also provisions an organization
        return api.post('/auth/signup', payload);
    },

    // Get organization stats with detailed information
    getOrganizationStats: async (id: string): Promise<{
        organization: Organization & {
            sector?: string;
            country?: string;
            credits?: number;
            emailFromName?: string | null;
            updatedAt?: string;
            credentials?: any;
        };
        stats: {
            totalUsers: number;
            totalContacts: number;
            totalGroups: number;
            messagesSent: {
                whatsapp: number;
                email: number;
                sms: number;
            };
            creditsSpent: number;
        };
        adminDetails: {
            name: string;
            email: string;
            phone: string;
        };
    }> => {
        return api.get(`/organizations/${id}/stats`);
    },
};
