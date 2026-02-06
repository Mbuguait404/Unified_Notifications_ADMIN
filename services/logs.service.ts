import { api } from './api';

export interface MessageLog {
    _id: string;
    channel: 'sms' | 'whatsapp' | 'email';
    senderUserId: {
        _id: string;
        name: string;
        email: string;
    };
    senderOrgId: {
        _id: string;
        name: string;
    };
    network: string;
    recipients: {
        recipient: string;
        status: 'success' | 'failed' | 'pending';
        error?: string;
    }[];
    messagePreview: string;
    messageLength: number;
    cost: number;
    createdAt: string;
}

export interface SystemLog {
    _id: string;
    method: string;
    url: string;
    body: any;
    query: any;
    statusCode: number;
    duration: number;
    ip: string;
    userAgent: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
    orgId?: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export const logsService = {
    getAllLogs: async (filters: any = {}): Promise<MessageLog[]> => {
        const queryParams = new URLSearchParams();
        if (filters.channel) queryParams.append('channel', filters.channel);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

        return api.get<MessageLog[]>(`/message-logs/all?${queryParams.toString()}`);
    },

    getSystemLogs: async (filters: any = {}): Promise<SystemLog[]> => {
        const queryParams = new URLSearchParams();
        if (filters.method) queryParams.append('method', filters.method);
        if (filters.statusCode) queryParams.append('statusCode', filters.statusCode);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

        return api.get<SystemLog[]>(`/system-logs?${queryParams.toString()}`);
    },
};
