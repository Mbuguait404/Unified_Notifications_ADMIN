'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building2, CreditCard, Hash, Calendar, Phone, Package } from 'lucide-react'

interface PaymentDetailsModalProps {
    payment: {
        id: string
        organizationId: string
        organizationName: string
        amount: number
        tokens: number
        paymentMethod: string
        transactionRef: string
        status: string
        createdAt: string
        package: string
        phoneNumber: string
    } | null
    isOpen: boolean
    onClose: () => void
}

export function PaymentDetailsModal({ payment, isOpen, onClose }: PaymentDetailsModalProps) {
    if (!payment) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; color: string }> = {
            completed: { variant: 'default', label: 'Completed', color: 'text-green-500' },
            pending: { variant: 'secondary', label: 'Pending', color: 'text-yellow-500' },
            failed: { variant: 'destructive', label: 'Failed', color: 'text-red-500' },
        }

        const config = variants[status] || variants.pending
        return (
            <Badge variant={config.variant} className="capitalize">
                {config.label}
            </Badge>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Payment Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Amount */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Transaction Status</p>
                            {getStatusBadge(payment.status)}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-primary">
                                {formatCurrency(payment.amount)}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Transaction Information */}
                    <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Transaction Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                                <p className="font-mono text-sm font-medium">{payment.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">M-Pesa Reference</p>
                                <p className="font-mono text-sm font-medium">{payment.transactionRef}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                <p className="font-medium">{payment.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                                <p className="font-medium">{payment.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Organization Information */}
                    <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Organization Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Organization Name</p>
                                <p className="font-medium">{payment.organizationName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Organization ID</p>
                                <p className="font-mono text-sm font-medium">{payment.organizationId}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Purchase Information */}
                    <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Purchase Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Package</p>
                                <p className="font-medium">{payment.package}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Tokens Purchased</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-base">
                                        {payment.tokens.toLocaleString()} tokens
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Rate</p>
                                <p className="font-medium">1 KES = 1 Token</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Transaction Date</p>
                                <p className="font-medium text-sm">{formatDate(payment.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">Transaction Timeline</h3>
                        </div>
                        <div className="space-y-2 ml-6">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Initiated:</span>
                                <span className="font-medium">{formatDate(payment.createdAt)}</span>
                            </div>
                            {payment.status === 'completed' && (
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-muted-foreground">Completed:</span>
                                    <span className="font-medium">{formatDate(payment.createdAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
