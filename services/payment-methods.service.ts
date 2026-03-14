// admin/services/payment-methods.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

export interface PaymentMethod {
    _id: string;
    name: string;
    type: string;
    provider: string;
    shortcode?: string;
    passkey?: string;
    consumerKey?: string;
    consumerSecret?: string;
    environment: 'sandbox' | 'production';
    mpesaType: 'paybill' | 'till';
    storeNumber?: string;
    clientId?: string;
    isDefault: boolean;
    isActive: boolean;
    transactionCount: number;
    lastUsed: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentMethodDto {
    name: string;
    shortcode?: string;
    passkey?: string;
    consumerKey?: string;
    consumerSecret?: string;
    environment?: 'sandbox' | 'production';
    mpesaType?: 'paybill' | 'till';
    storeNumber?: string;
    clientId?: string;
    provider?: string;
    isActive?: boolean;
    isDefault?: boolean;
}

export interface UpdatePaymentMethodDto {
    name?: string;
    shortcode?: string;
    passkey?: string;
    consumerKey?: string;
    consumerSecret?: string;
    environment?: 'sandbox' | 'production';
    mpesaType?: 'paybill' | 'till';
    storeNumber?: string;
    clientId?: string;
    provider?: string;
    isActive?: boolean;
    isDefault?: boolean;
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

export const paymentMethodsService = {
    /**
     * Get all payment methods
     */
    async getAllPaymentMethods(): Promise<PaymentMethod[]> {
        const response = await fetch(`${API_URL}/payment-methods`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment methods');
        }

        return response.json();
    },

    /**
     * Get a single payment method by ID
     */
    async getPaymentMethod(id: string): Promise<PaymentMethod> {
        const response = await fetch(`${API_URL}/payment-methods/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment method');
        }

        return response.json();
    },

    /**
     * Get the default payment method
     */
    async getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
        const response = await fetch(`${API_URL}/payment-methods/default/active`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    },

    /**
     * Create a new payment method
     */
    async createPaymentMethod(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
        const response = await fetch(`${API_URL}/payment-methods`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create payment method');
        }

        return response.json();
    },

    /**
     * Update a payment method
     */
    async updatePaymentMethod(
        id: string,
        data: UpdatePaymentMethodDto
    ): Promise<PaymentMethod> {
        const response = await fetch(`${API_URL}/payment-methods/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update payment method');
        }

        return response.json();
    },

    /**
     * Set a payment method as default
     */
    async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
        const response = await fetch(`${API_URL}/payment-methods/${id}/default`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to set default payment method');
        }

        return response.json();
    },

    /**
     * Toggle active status
     */
    async toggleActivePaymentMethod(id: string): Promise<PaymentMethod> {
        const response = await fetch(`${API_URL}/payment-methods/${id}/toggle-active`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to toggle payment method status');
        }

        return response.json();
    },

    /**
     * Delete a payment method
     */
    async deletePaymentMethod(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/payment-methods/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete payment method');
        }
    },
};
