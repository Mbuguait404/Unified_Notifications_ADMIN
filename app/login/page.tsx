'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LayoutDashboard } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            // Set cookie for mock authentication
            document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax";

            router.push('/')
            router.refresh()
        }, 1000)
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="flex flex-col gap-2 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold">Admin Login</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to login to your account
                        </p>
                    </div>
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle>Sign in</CardTitle>
                            <CardDescription>
                                Use your organization email to access the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                        </div>
                                        <Input id="password" type="password" required />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            Protected Area using mock auth
                        </p>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block">
                <div className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale bg-zinc-900 flex items-center justify-center" >
                    <div className="text-center p-10">
                        <h2 className="text-2xl font-bold text-white mb-4">Unified Notifications Admin</h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Manage organizations, monitor system health, and oversee notification traffic from a single centralized dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
