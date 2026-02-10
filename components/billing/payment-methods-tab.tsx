'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Smartphone, Settings, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { PaymentMethodModal } from './payment-method-modal'
import {
    paymentMethodsService,
    PaymentMethod,
    CreatePaymentMethodDto,
    UpdatePaymentMethodDto,
} from '@/services/payment-methods.service'
import { toast } from 'sonner'

export function PaymentMethodsTab() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true)
            const data = await paymentMethodsService.getAllPaymentMethods()
            setPaymentMethods(data)
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
            toast.error('Failed to load payment methods')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPaymentMethods()
    }, [])

    const handleAddNew = () => {
        setSelectedMethod(null)
        setIsModalOpen(true)
    }

    const handleEdit = (method: PaymentMethod) => {
        setSelectedMethod(method)
        setIsModalOpen(true)
    }

    const handleSetDefault = async (methodId: string) => {
        try {
            await paymentMethodsService.setDefaultPaymentMethod(methodId)
            toast.success('Default payment method updated')
            fetchPaymentMethods()
        } catch (error: any) {
            console.error('Failed to set default:', error)
            toast.error(error.message || 'Failed to set default payment method')
        }
    }

    const handleToggleActive = async (methodId: string) => {
        try {
            await paymentMethodsService.toggleActivePaymentMethod(methodId)
            toast.success('Payment method status updated')
            fetchPaymentMethods()
        } catch (error: any) {
            console.error('Failed to toggle status:', error)
            toast.error(error.message || 'Failed to update payment method status')
        }
    }

    const handleSave = async (data: CreatePaymentMethodDto | UpdatePaymentMethodDto) => {
        try {
            if (selectedMethod) {
                await paymentMethodsService.updatePaymentMethod(selectedMethod._id, data)
                toast.success('Payment method updated successfully')
            } else {
                await paymentMethodsService.createPaymentMethod(data as CreatePaymentMethodDto)
                toast.success('Payment method created successfully')
            }
            setIsModalOpen(false)
            fetchPaymentMethods()
        } catch (error: any) {
            console.error('Failed to save payment method:', error)
            toast.error(error.message || 'Failed to save payment method')
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const maskCredential = (credential: string) => {
        if (credential.length <= 4) return '••••••••'
        return credential.substring(0, 3) + '••••••••••••••••'
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
            <div className="space-y-6">
                {/* Header Card */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Payment Method Configuration</h3>
                                <p className="text-sm text-muted-foreground max-w-2xl">
                                    Configure M-Pesa payment methods for accepting token purchases. You can set up
                                    multiple paybills and choose which one to use as default. STK Push integration
                                    allows customers to pay directly from their M-Pesa accounts.
                                </p>
                            </div>
                            <Button onClick={handleAddNew} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Payment Method
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods List */}
                {paymentMethods.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get started by adding your first M-Pesa payment method
                            </p>
                            <Button onClick={handleAddNew} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Payment Method
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {paymentMethods.map((method) => (
                            <Card
                                key={method._id}
                                className={method.isDefault ? 'border-primary shadow-sm' : ''}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`p-3 rounded-lg ${method.isActive ? 'bg-green-500/10' : 'bg-muted'
                                                    }`}
                                            >
                                                <Smartphone
                                                    className={`w-6 h-6 ${method.isActive ? 'text-green-500' : 'text-muted-foreground'
                                                        }`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{method.name}</CardTitle>
                                                    {method.isDefault && (
                                                        <Badge variant="default" className="text-xs">
                                                            Default
                                                        </Badge>
                                                    )}
                                                    {method.environment === 'sandbox' && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Sandbox
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{method.provider}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={method.isActive}
                                                onCheckedChange={() => handleToggleActive(method._id)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(method)}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Credentials Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Shortcode</p>
                                            <p className="font-mono text-sm font-medium">{method.shortcode}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Consumer Key</p>
                                            <p className="font-mono text-sm font-medium">
                                                {maskCredential(method.consumerKey)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Environment</p>
                                            <p className="font-medium text-sm capitalize">{method.environment}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                                            <div className="flex items-center gap-1">
                                                {method.isActive ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm font-medium text-green-500">Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            Inactive
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex gap-6 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Transactions: </span>
                                                <span className="font-semibold">
                                                    {method.transactionCount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created: </span>
                                                <span className="font-medium">{formatDate(method.createdAt)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Last Used: </span>
                                                <span className="font-medium">{formatDate(method.lastUsed)}</span>
                                            </div>
                                        </div>
                                        {!method.isDefault && method.isActive && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetDefault(method._id)}
                                            >
                                                Set as Default
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">About M-Pesa Integration</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>
                                    STK Push allows customers to receive payment prompts directly on their phones
                                </li>
                                <li>You can configure multiple paybills for different purposes or redundancy</li>
                                <li>The default payment method will be used for all new transactions</li>
                                <li>Sandbox environment is for testing without real money transactions</li>
                                <li>
                                    Keep your credentials secure - they are encrypted and masked in the interface
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <PaymentMethodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                method={selectedMethod}
                onSave={handleSave}
            />
        </>
    )
}
