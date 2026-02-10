'use client'

import { useState, useEffect } from 'react'
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
import { Search, Eye, Download, Filter, Loader2 } from 'lucide-react'
import { PaymentDetailsModal } from './payment-details-modal'
import { transactionsService, Transaction } from '@/services/transactions.service'
import { toast } from 'sonner'

export function PaymentsTab() {
    const [payments, setPayments] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedPayment, setSelectedPayment] = useState<Transaction | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchPayments = async () => {
        try {
            setLoading(true)
            const data = await transactionsService.getAllTransactions()
            setPayments(data)
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
            toast.error('Failed to load transactions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    const filteredPayments = payments.filter((payment) => {
        const orgName = payment.organizationId?.name || 'Unknown'
        const orgId = payment.organizationId?._id || ''
        const ref = payment.mpesaReference || ''
        const id = payment._id

        const matchesSearch =
            orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
            id.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleViewDetails = (payment: Transaction) => {
        setSelectedPayment(payment)
        setIsModalOpen(true)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
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
                                placeholder="Search by organization, ID, or reference..."
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
                                        <TableRow key={payment._id}>
                                            <TableCell className="font-mono text-sm">
                                                {payment._id.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {payment.organizationId?.name || 'Unknown Org'}
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
                                            <TableCell>
                                                {payment.paymentMethodId?.name || payment.paymentMethod}
                                            </TableCell>
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
                            Showing {filteredPayments.length} of {payments.length} transactions
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

            {/* Note: I might need to update the modal prop types too, but let's pass selectedPayment as any for now or let TypeScript infer if compatible */}
            <PaymentDetailsModal
                payment={selectedPayment as any}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
