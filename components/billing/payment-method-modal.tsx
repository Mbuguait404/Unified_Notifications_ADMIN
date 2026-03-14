'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Smartphone, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
    paymentMethodsService,
    PaymentMethod,
    CreatePaymentMethodDto,
    UpdatePaymentMethodDto,
} from '@/services/payment-methods.service'

interface PaymentMethodModalProps {
    isOpen: boolean
    onClose: () => void
    method?: PaymentMethod | null
    onSave: (data: CreatePaymentMethodDto | UpdatePaymentMethodDto) => void
}

export function PaymentMethodModal({
    isOpen,
    onClose,
    method,
    onSave,
}: PaymentMethodModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        shortcode: '',
        passkey: '',
        consumerKey: '',
        consumerSecret: '',
        environment: 'production',
        provider: 'urchin',
        clientId: '6985e21adb150991d2cf33af',
        mpesaType: 'paybill',
        storeNumber: '',
        isActive: true,
        isDefault: false,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (method) {
            setFormData({
                name: method.name,
                shortcode: method.shortcode || '',
                passkey: method.passkey || '',
                consumerKey: method.consumerKey || '',
                consumerSecret: method.consumerSecret || '',
                environment: method.environment,
                provider: method.provider || 'urchin',
                clientId: (method as any).clientId || '',
                mpesaType: method.mpesaType || 'paybill',
                storeNumber: method.storeNumber || '',
                isActive: method.isActive,
                isDefault: method.isDefault,
            })
        } else {
            setFormData({
                name: '',
                shortcode: '',
                passkey: '',
                consumerKey: '',
                consumerSecret: '',
                environment: 'production',
                provider: 'urchin',
                clientId: '6985e21adb150991d2cf33af',
                mpesaType: 'paybill',
                storeNumber: '',
                isActive: true,
                isDefault: false,
            })
        }
        setErrors({})
    }, [method, isOpen])

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (formData.provider !== 'urchin') {
            if (!formData.shortcode.trim()) {
                newErrors.shortcode = 'Shortcode is required'
            } else if (!/^\d+$/.test(formData.shortcode)) {
                newErrors.shortcode = 'Shortcode must contain only numbers'
            }

            if (!formData.passkey.trim()) {
                newErrors.passkey = 'Passkey is required'
            }

            if (!formData.consumerKey.trim()) {
                newErrors.consumerKey = 'Consumer Key is required'
            }

            if (!formData.consumerSecret.trim()) {
                newErrors.consumerSecret = 'Consumer Secret is required'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData as any)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl">
                                {method ? 'Edit Payment Method' : 'Add Payment Method'}
                            </DialogTitle>
                            <DialogDescription>
                                Configure M-Pesa STK Push payment integration
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Info Alert */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            You can get your M-Pesa credentials from the{' '}
                            <a
                                href="https://developer.safaricom.co.ke/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline"
                            >
                                Safaricom Developer Portal
                            </a>
                            . Make sure to keep these credentials secure.
                        </AlertDescription>
                    </Alert>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Payment Method Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Main M-Pesa Paybill"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="environment">Environment</Label>
                            <Select
                                value={formData.environment}
                                onValueChange={(value) => handleChange('environment', value)}
                            >
                                <SelectTrigger id="environment">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                                    <SelectItem value="production">Production (Live)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Use sandbox for testing without real money
                            </p>
                        </div>
                    </div>

                    {/* Backend Provider */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Processor Settings</h3>
                        <div className="space-y-2">
                            <Label htmlFor="provider">Processor</Label>
                            <Select
                                value={formData.provider}
                                onValueChange={(value) => handleChange('provider', value)}
                            >
                                <SelectTrigger id="provider">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urchin">Urchin (Default & recommended fallback)</SelectItem>
                                    <SelectItem value="mpesa">Safaricom Native (Direct)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Urchin provides a more resilient wrapper around M-Pesa APIs.
                            </p>
                        </div>

                        {formData.provider === 'urchin' && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 pt-2">
                              <Label htmlFor="clientId">Urchin Client ID</Label>
                              <Input
                                  id="clientId"
                                  placeholder="e.g., 6985e21adb..."
                                  value={formData.clientId}
                                  onChange={(e) => handleChange('clientId', e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                  Provided by Lancola Tech for your Urchin account.
                              </p>
                          </div>
                        )}
                    </div>

                    {/* M-Pesa Credentials */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">M-Pesa Credentials</h3>
                            {formData.provider === 'urchin' && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">
                                    Optional with Urchin
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground -mt-3">
                            {formData.provider === 'urchin' 
                                ? "These are not required when using Urchin as the processor."
                                : "Required to connect directly to Safaricom's Daraja API."}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mpesaType">Account Type</Label>
                                <Select
                                    value={formData.mpesaType}
                                    onValueChange={(value) => handleChange('mpesaType', value)}
                                >
                                    <SelectTrigger id="mpesaType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="paybill">Paybill</SelectItem>
                                        <SelectItem value="till">Buy Goods (Till)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shortcode">
                                    {formData.mpesaType === 'paybill' ? 'Paybill Number' : 'Till Number'} 
                                    {formData.provider !== 'urchin' && <span className="text-red-500"> *</span>}
                                </Label>
                                <Input
                                    id="shortcode"
                                    placeholder={formData.mpesaType === 'paybill' ? 'e.g., 174379' : 'e.g., 4006947'}
                                    value={formData.shortcode}
                                    onChange={(e) => handleChange('shortcode', e.target.value)}
                                    className={errors.shortcode ? 'border-red-500' : ''}
                                />
                                {errors.shortcode && (
                                    <p className="text-sm text-red-500">{errors.shortcode}</p>
                                )}
                            </div>
                        </div>

                        {formData.mpesaType === 'till' && (
                            <div className="space-y-2">
                                <Label htmlFor="storeNumber">
                                    Store Number <span className="text-muted-foreground">(Optional if same as Till)</span>
                                </Label>
                                <Input
                                    id="storeNumber"
                                    placeholder="Enter store number if different from till"
                                    value={formData.storeNumber}
                                    onChange={(e) => handleChange('storeNumber', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    For Till Numbers, the BusinessShortCode in STK Push is often the Store Number.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="consumerKey">
                                Consumer Key {formData.provider !== 'urchin' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="consumerKey"
                                placeholder="Enter your consumer key"
                                value={formData.consumerKey}
                                onChange={(e) => handleChange('consumerKey', e.target.value)}
                                className={errors.consumerKey ? 'border-red-500' : ''}
                                type="password"
                            />
                            {errors.consumerKey && (
                                <p className="text-sm text-red-500">{errors.consumerKey}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="consumerSecret">
                                Consumer Secret {formData.provider !== 'urchin' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="consumerSecret"
                                placeholder="Enter your consumer secret"
                                value={formData.consumerSecret}
                                onChange={(e) => handleChange('consumerSecret', e.target.value)}
                                className={errors.consumerSecret ? 'border-red-500' : ''}
                                type="password"
                            />
                            {errors.consumerSecret && (
                                <p className="text-sm text-red-500">{errors.consumerSecret}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="passkey">
                                Passkey {formData.provider !== 'urchin' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="passkey"
                                placeholder="Enter your passkey"
                                value={formData.passkey}
                                onChange={(e) => handleChange('passkey', e.target.value)}
                                className={errors.passkey ? 'border-red-500' : ''}
                                type="password"
                            />
                            {errors.passkey && (
                                <p className="text-sm text-red-500">{errors.passkey}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Used for generating security credentials
                            </p>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Settings</h3>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive" className="text-base">
                                    Active
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable this payment method for transactions
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleChange('isActive', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label htmlFor="isDefault" className="text-base">
                                    Set as Default
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Use this as the primary payment method
                                </p>
                            </div>
                            <Switch
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) => handleChange('isDefault', checked)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {method ? 'Update' : 'Add'} Payment Method
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
