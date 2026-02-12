'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react';

export const SessionExpiredModal = () => {
    const { showSessionModal, setShowSessionModal, login, logout, user } = useAuth();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReauthenticate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;

        setLoading(true);
        setError(null);
        try {
            await login({ email: user.email, password });
            setPassword('');
            setShowSessionModal(false);
        } catch (err: any) {
            setError(err.message || 'Invalid password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setShowSessionModal(false);
    };

    return (
        <Dialog open={showSessionModal} onOpenChange={(open) => {
            if (!open) return;
            setShowSessionModal(open);
        }}>
            <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
                        <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-center text-xl">Admin Session Expired</DialogTitle>
                    <DialogDescription className="text-center">
                        Your administrative session has timed out. Please re-enter your password to continue.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleReauthenticate} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                            id="admin-email"
                            value={user?.email || ''}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                            id="admin-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                        ) : (
                            'Verify Identity'
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout and return to login
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
