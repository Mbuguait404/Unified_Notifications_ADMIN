'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { organizationService } from '@/services/organizations.service'

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

  async function handleSubmit(e: any) {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)

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
      await organizationService.createOrganization({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        countryCode: createForm.countryCode,
        phoneNumber: createForm.phoneNumber,
        companyName: createForm.companyName,
        sector: createForm.sector,
        country: createForm.country,
      })

      setCreateSuccess('Organization created successfully.')
      if (onCreated) {
        await onCreated()
      }
      onOpenChange(false)
      setCreateForm(initialFormState)
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organization.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create new organization</DialogTitle>
          <DialogDescription>
            Provision a new organization and primary admin user. This reuses the same flow as the public signup experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {createError && (
            <div className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600">
              {createError}
            </div>
          )}
          {createSuccess && (
            <div className="rounded-md border border-green-500/40 bg-green-500/5 px-3 py-2 text-xs text-green-700">
              {createSuccess}
            </div>
          )}

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

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

