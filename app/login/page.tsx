'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LayoutDashboard, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login({ email, password });
            // Redirect happens in AuthContext.handleLogin
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-[400px] flex flex-col gap-8">
                    <div className="flex flex-col gap-4 text-center">
                        <div className="flex justify-center">
                            <div className="relative w-26 h-26 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src="/logo/uniflow-logo.png"
                                    alt="Uniflow Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Login</h1>
                            <p className="text-muted-foreground">
                                Enter your credentials to access the admin panel
                            </p>
                        </div>
                    </div>

                    <Card className="border-border shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-xl">Sign in</CardTitle>
                            <CardDescription>
                                Access the Unified Notifications dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="admin@uniflow.com"
                                            required
                                            className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                        </div>

                                        <div className="relative group">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                className="pr-10 h-10 transition-all focus:ring-2 focus:ring-primary/20"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                            <p className="text-xs text-destructive font-medium text-center">{error}</p>
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full h-10 font-medium transition-all hover:opacity-90 active:scale-[0.98]" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Authenticating...
                                            </>
                                        ) : (
                                            'Sign in to Dashboard'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                            Secure Enterprise Portal
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block relative overflow-hidden bg-[#02006D]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#02006D] via-[#02006D] to-[#5555E7] opacity-90" />

                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-3xl" />

                <div className="relative h-full w-full flex flex-col items-center justify-center p-12 text-center text-white">
                    <div className="relative w-64 h-64 mb-8 animate-in fade-in zoom-in duration-1000">
                        <Image
                            src="/logo/uniflow-logo.png"
                            alt="Uniflow Logo"
                            fill
                            className="object-contain drop-shadow-2xl brightness-0 invert"
                            priority
                        />
                    </div>

                    <div className="max-w-md space-y-4">
                        {/* <h2 className="text-4xl font-bold tracking-tight">
                            Unified Notifications
                        </h2> */}
                        <p className="text-lg text-blue-100/80 leading-relaxed">
                            Control and monitor your entire notification ecosystem from one powerful, centralized administrative interface.
                        </p>
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-xs text-blue-100/40">
                        <p>© {new Date().getFullYear()} Lancola Tech</p>
                        <div className="flex gap-4">
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

