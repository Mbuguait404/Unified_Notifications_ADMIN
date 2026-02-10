'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Smartphone, Settings, CheckCircle2, XCircle } from 'lucide-react'
import { PaymentMethodModal } from './payment-method-modal'

// Mock payment methods data
const mockPaymentMethods = [
    {
        id: 'pm-001',
        name: 'Main M-Pesa Paybill',
        type: 'mpesa',
        provider: 'M-Pesa STK Push',
        shortcode: '174379',
        passkey: '••••••••••••••••••••',
        consumerKey: 'Xq8••••••••••••••••',
        consumerSecret: '••••••••••••••••••••',
        environment: 'production',
        isDefault: true,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        lastUsed: '2024-02-10T10:30:00Z',
        transactionCount: 1245,
    },
    {
        id: 'pm-002',
        name: 'Testing M-Pesa Paybill',
        type: 'mpesa',
        provider: 'M-Pesa STK Push',
        shortcode: '174379',
        passkey: '••••••••••••••••••••',
        consumerKey: 'Xq8••••••••••••••••',
        consumerSecret: '••••••••••••••••••••',
        environment: 'sandbox',
        isDefault: false,
        isActive: true,
        createdAt: '2024-01-10T08:00:00Z',
        lastUsed: '2024-02-09T15:20:00Z',
        transactionCount: 89,
    },
    {
        id: 'pm-003',
        name: 'Backup M-Pesa Paybill',
        type: 'mpesa',
        provider: 'M-Pesa STK Push',
        shortcode: '522533',
        passkey: '••••••••••••••••••••',
        consumerKey: 'Ab2••••••••••••••••',
        consumerSecret: '••••••••••••••••••••',
        environment: 'production',
        isDefault: false,
        isActive: false,
        createdAt: '2024-01-05T12:00:00Z',
        lastUsed: '2024-01-28T09:15:00Z',
        transactionCount: 523,
    },
]

export function PaymentMethodsTab() {
    const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState<typeof mockPaymentMethods[0] | null>(null)

    const handleAddNew = () => {
        setSelectedMethod(null)
        setIsModalOpen(true)
    }

    const handleEdit = (method: typeof mockPaymentMethods[0]) => {
        setSelectedMethod(method)
        setIsModalOpen(true)
    }

    const handleSetDefault = (methodId: string) => {
        setPaymentMethods((prev) =>
            prev.map((method) => ({
                ...method,
                isDefault: method.id === methodId,
            }))
        )
    }

    const handleToggleActive = (methodId: string) => {
        setPaymentMethods((prev) =>
            prev.map((method) =>
                method.id === methodId ? { ...method, isActive: !method.isActive } : method
            )
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
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
                <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                        <Card
                            key={method.id}
                            className={method.isDefault ? 'border-primary shadow-sm' : ''}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`p-3 rounded-lg ${method.isActive
                                                    ? 'bg-green-500/10'
                                                    : 'bg-muted'
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
                                            onCheckedChange={() => handleToggleActive(method.id)}
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
                                        <p className="font-mono text-sm font-medium">{method.consumerKey}</p>
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
                                            onClick={() => handleSetDefault(method.id)}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
                onSave={(data) => {
                    // Handle save logic here
                    console.log('Saving payment method:', data)
                    setIsModalOpen(false)
                }}
            />
        </>
    )
}
