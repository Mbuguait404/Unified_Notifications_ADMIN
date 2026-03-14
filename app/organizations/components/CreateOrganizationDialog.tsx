'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Mail, MessageSquare, Key, Copy, Check, AlertCircle } from 'lucide-react'
import { organizationService } from '@/services/organizations.service'
import { toast } from 'sonner'

type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => Promise<void> | void
}

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  countryCode: '+254',
  phoneNumber: '',
  companyName: '',
  sector: '',
  country: '',
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOrganizationDialogProps) {
  const [createForm, setCreateForm] = useState(initialFormState)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  // Notification & API key toggles
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [sendWelcomeSms, setSendWelcomeSms] = useState(false)
  const [createApiKey, setCreateApiKey] = useState(true)

  // Generated API key result
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      // Reset everything when dialog closes
      setGeneratedApiKey(null)
      setApiKeyCopied(false)
      setCreateError(null)
      setCreateSuccess(null)
    }
    onOpenChange(isOpen)
  }

  async function copyApiKey() {
    if (!generatedApiKey) return
    try {
      await navigator.clipboard.writeText(generatedApiKey)
      setApiKeyCopied(true)
      toast.success('API key copied to clipboard')
      setTimeout(() => setApiKeyCopied(false), 3000)
    } catch {
      toast.error('Failed to copy API key')
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setGeneratedApiKey(null)
    setApiKeyCopied(false)

    const requiredFields: (keyof typeof createForm)[] = [
      'firstName',
      'lastName',
      'email',
      'password',
      'phoneNumber',
      'companyName',
      'sector',
      'country',
    ]

    const missingField = requiredFields.find((field) => !createForm[field])
    if (missingField) {
      setCreateError('Please fill in all required fields.')
      return
    }

    try {
      setCreateLoading(true)
      const response = await organizationService.createOrganization({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        countryCode: createForm.countryCode,
        phoneNumber: createForm.phoneNumber,
        companyName: createForm.companyName,
        sector: createForm.sector,
        country: createForm.country,
        sendWelcomeEmail,
        sendWelcomeSms,
        createApiKey,
      })

      // Build success message
      const notifications: string[] = []
      if (sendWelcomeEmail) notifications.push('welcome email')
      if (sendWelcomeSms) notifications.push('welcome SMS')

      let successMsg = 'Organization created successfully.'
      if (notifications.length > 0) {
        successMsg += ` ${notifications.join(' and ')} sent.`
      }
      setCreateSuccess(successMsg)

      // Show the API key if one was generated
      if (response?.apiKey) {
        setGeneratedApiKey(response.apiKey)
      } else {
        // No API key to show, close after a brief moment
        if (onCreated) await onCreated()
        setTimeout(() => {
          handleClose(false)
          setCreateForm(initialFormState)
        }, 1500)
      }

      if (onCreated) {
        await onCreated()
      }
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organization.')
    } finally {
      setCreateLoading(false)
    }
  }

  function handleDoneWithApiKey() {
    handleClose(false)
    setCreateForm(initialFormState)
    setGeneratedApiKey(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new organization</DialogTitle>
          <DialogDescription>
            Provision a new organization and primary admin user. Configure welcome notifications and API key generation below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {createError && (
            <div className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {createError}
            </div>
          )}
          {createSuccess && (
            <div className="rounded-md border border-green-500/40 bg-green-500/5 px-3 py-2 text-xs text-green-700">
              {createSuccess}
            </div>
          )}

          {/* Show the API Key result card after successful creation */}
          {generatedApiKey && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  API Key Generated
                </h4>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Copy this API key now. It will <strong>never be shown again</strong> for security reasons.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-background border border-border px-3 py-2 text-xs font-mono text-foreground break-all select-all">
                  {generatedApiKey}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={copyApiKey}
                >
                  {apiKeyCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-end pt-1">
                <Button type="button" size="sm" onClick={handleDoneWithApiKey}>
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Only show the form when we haven't generated an API key yet */}
          {!generatedApiKey && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name">First name*</Label>
                  <Input
                    id="first-name"
                    value={createForm.firstName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name">Last name*</Label>
                  <Input
                    id="last-name"
                    value={createForm.lastName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="email">Work email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="password">Password*</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Country code*</Label>
                  <Select
                    value={createForm.countryCode}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, countryCode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+254">🇰🇪 +254</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number*</Label>
                  <Input
                    id="phone"
                    value={createForm.phoneNumber}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="company-name">Company name*</Label>
                  <Input
                    id="company-name"
                    value={createForm.companyName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sector*</Label>
                  <Select
                    value={createForm.sector}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, sector: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Country*</Label>
                  <Select
                    value={createForm.country}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ── Notification & API Key Toggles ── */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Onboarding Options</h4>

                {/* Send Welcome Email */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="toggle-email" className="text-sm font-medium cursor-pointer">
                        Send Welcome Email
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Send a welcome email with onboarding instructions
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="toggle-email"
                    checked={sendWelcomeEmail}
                    onCheckedChange={setSendWelcomeEmail}
                  />
                </div>

                {/* Send Welcome SMS */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <Label htmlFor="toggle-sms" className="text-sm font-medium cursor-pointer">
                        Send Welcome SMS
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Send a welcome SMS to the admin&apos;s phone number
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="toggle-sms"
                    checked={sendWelcomeSms}
                    onCheckedChange={setSendWelcomeSms}
                  />
                </div>

                {/* Create API Key */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                      <Key className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <Label htmlFor="toggle-apikey" className="text-sm font-medium cursor-pointer">
                        Create API Key
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-generate an API key and share it with the organization
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="toggle-apikey"
                    checked={createApiKey}
                    onCheckedChange={setCreateApiKey}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create organization'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
