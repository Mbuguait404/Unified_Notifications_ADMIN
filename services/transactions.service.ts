// admin/services/transactions.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

export interface Transaction {
    _id: string;
    organizationId: {
        _id: string;
        name: string;
    };
    userId: string;
    amount: number;
    tokens: number;
    paymentMethod: string;
    paymentMethodId: {
        _id: string;
        name: string;
        provider: string;
    };
    status: 'pending' | 'completed' | 'failed';
    mpesaReference?: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface InitiatePaymentDto {
    amount: number;
    phoneNumber: string;
    paymentMethodId?: string;
    organizationId?: string;
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

export const transactionsService = {
    /**
     * Get all transactions (Super Admin)
     */
    async getAllTransactions(): Promise<Transaction[]> {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        return response.json();
    },

    /**
     * Get transactions for an organization
     */
    async getOrganizationTransactions(orgId: string): Promise<Transaction[]> {
        const response = await fetch(`${API_URL}/transactions/organization/${orgId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch organization transactions');
        }

        return response.json();
    },

    /**
     * Get a single transaction
     */
    async getTransaction(id: string): Promise<Transaction> {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transaction details');
        }

        return response.json();
    },

    /**
     * Initiate a payment
     */
    async initiatePayment(data: InitiatePaymentDto): Promise<Transaction> {
        const response = await fetch(`${API_URL}/transactions/purchase`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to initiate payment');
        }

        return response.json();
    },
};
