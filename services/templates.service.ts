import { api } from './api';

export interface Template {
    _id: string;
    name: string;
    category: string;
    channel: 'email' | 'sms' | 'whatsapp';
    subject?: string;
    content: string;
    variables?: string[];
    usage: number;
    createdAt: string;
    updatedAt: string;
}

export const templatesService = {
    getAllTemplates: async (): Promise<Template[]> => {
        return api.get<Template[]>('/templates');
    },

    getTemplateById: async (id: string): Promise<Template> => {
        return api.get<Template>(`/templates/${id}`);
    },

    createTemplate: async (data: Partial<Template>): Promise<Template> => {
        return api.post<Template>('/templates', data);
    },

    updateTemplate: async (id: string, data: Partial<Template>): Promise<Template> => {
        return api.put<Template>(`/templates/${id}`, data);
    },

    deleteTemplate: async (id: string): Promise<void> => {
        return api.delete(`/templates/${id}`);
    }
};
