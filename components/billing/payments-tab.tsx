'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, Eye, Download, Filter } from 'lucide-react'
import { PaymentDetailsModal } from './payment-details-modal'

// Mock payment data
const mockPayments = [
    {
        id: 'TXN-2024-001',
        organizationId: 'org-001',
        organizationName: 'Acme Corporation',
        amount: 50000,
        tokens: 50000,
        paymentMethod: 'M-Pesa',
        transactionRef: 'QA12BC34DE',
        status: 'completed',
        createdAt: '2024-02-10T10:30:00Z',
        package: 'Token Purchase',
        phoneNumber: '+254712345678',
    },
    {
        id: 'TXN-2024-002',
        organizationId: 'org-002',
        organizationName: 'Tech Solutions Ltd',
        amount: 25000,
        tokens: 25000,
        paymentMethod: 'M-Pesa',
        transactionRef: 'QA56FG78HI',
        status: 'completed',
        createdAt: '2024-02-10T09:15:00Z',
        package: 'Token Purchase',
        phoneNumber: '+254723456789',
    },
    {
        id: 'TXN-2024-003',
        organizationId: 'org-003',
        organizationName: 'Global Enterprises',
        amount: 100000,
        tokens: 100000,
        paymentMethod: 'M-Pesa',
        transactionRef: 'QA90JK12LM',
        status: 'pending',
        createdAt: '2024-02-10T08:45:00Z',
        package: 'Token Purchase',
        phoneNumber: '+254734567890',
    },
    {
        id: 'TXN-2024-004',
        organizationId: 'org-001',
        organizationName: 'Acme Corporation',
        amount: 75000,
        tokens: 75000,
        paymentMethod: 'M-Pesa',
        transactionRef: 'QA34NO56PQ',
        status: 'completed',
        createdAt: '2024-02-09T16:20:00Z',
        package: 'Token Purchase',
        phoneNumber: '+254712345678',
    },
    {
        id: 'TXN-2024-005',
        organizationId: 'org-004',
        organizationName: 'Innovation Hub',
        amount: 15000,
        tokens: 15000,
        paymentMethod: 'M-Pesa',
        transactionRef: 'QA78RS90TU',
        status: 'failed',
        createdAt: '2024-02-09T14:10:00Z',
        package: 'Token Purchase',
        phoneNumber: '+254745678901',
    },
]

export function PaymentsTab() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filteredPayments = mockPayments.filter((payment) => {
        const matchesSearch =
            payment.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleViewDetails = (payment: typeof mockPayments[0]) => {
        setSelectedPayment(payment)
        setIsModalOpen(true)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            completed: { variant: 'default', label: 'Completed' },
            pending: { variant: 'secondary', label: 'Pending' },
            failed: { variant: 'destructive', label: 'Failed' },
        }

        const config = variants[status] || variants.pending
        return (
            <Badge variant={config.variant} className="capitalize">
                {config.label}
            </Badge>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(amount)
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div>
                        <CardTitle className="text-xl font-bold">Payment Transactions</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            View all payment transactions and purchase history
                        </p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by organization, transaction ID, or reference..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Tokens</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{payment.organizationName}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {payment.organizationId}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {payment.tokens.toLocaleString()} tokens
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{payment.paymentMethod}</TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(payment.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="hover:text-primary"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredPayments.length} of {mockPayments.length} transactions
                        </p>
                        <div className="flex gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-semibold">
                                    {formatCurrency(
                                        filteredPayments.reduce((sum, p) => sum + p.amount, 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PaymentDetailsModal
                payment={selectedPayment}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
