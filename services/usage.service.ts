// admin/services/usage.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

export interface UsageStats {
    organizationId: string;
    organizationName: string;
    remainingCredits: number;
    usedTokens: number;
    smsCount: number;
    emailCount: number;
    whatsappCount: number;
    lastActivity: string | null;
    trend?: string;
    trendValue?: string;
}

export interface GlobalStats {
    smsCount: number;
    emailCount: number;
    whatsappCount: number;
}

const getAuthHeaders = () => {
    const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const usageService = {
    /**
     * Get usage stats for all organizations
     */
    async getAllUsage(): Promise<UsageStats[]> {
        const response = await fetch(`${API_URL}/usage/organizations`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch usage statistics');
        }

        return response.json();
    },

    /**
     * Get global stats
     */
    async getGlobalStats(): Promise<GlobalStats> {
        const response = await fetch(`${API_URL}/usage/stats`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch global stats');
        }

        return response.json();
    },
};
