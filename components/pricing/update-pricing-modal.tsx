'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Organization, organizationService } from '@/services/organizations.service';
import { toast } from 'sonner';

interface UpdatePricingModalProps {
    organization: Organization | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function UpdatePricingModal({
    organization,
    isOpen,
    onClose,
    onUpdate,
}: UpdatePricingModalProps) {
    const [rates, setRates] = useState({
        sms: 1,
        whatsapp: 1,
        email: 0.5,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (organization?.rates) {
            setRates(organization.rates);
        } else {
            setRates({
                sms: 1,
                whatsapp: 1,
                email: 0.5,
            });
        }
    }, [organization]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) return;

        setLoading(true);
        try {
            await organizationService.updateOrganization(organization._id, {
                rates,
            });
            toast.success('Pricing updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update pricing:', error);
            toast.error('Failed to update pricing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Pricing: {organization?.name}</DialogTitle>
                    <DialogDescription>
                        Set custom rates for this organization. 1 token = 1 KSH.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sms">SMS Rate (Tokens per message)</Label>
                            <Input
                                id="sms"
                                type="number"
                                step="0.1"
                                value={rates.sms}
                                onChange={(e) => setRates({ ...rates, sms: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp Rate (Tokens per message)</Label>
                            <Input
                                id="whatsapp"
                                type="number"
                                step="0.1"
                                value={rates.whatsapp}
                                onChange={(e) => setRates({ ...rates, whatsapp: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Rate (Tokens per message)</Label>
                            <Input
                                id="email"
                                type="number"
                                step="0.1"
                                value={rates.email}
                                onChange={(e) => setRates({ ...rates, email: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
