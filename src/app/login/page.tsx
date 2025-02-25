'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAuth } from '@/context/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect') || '/admin/dashboard'

    const { signIn, isLoading, session } = useAuth()

    // If already authenticated, redirect
    useEffect(() => {
        if (session) {
            router.replace('/admin/dashboard')
        }
    }, [session, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            await signIn(email, password)
            router.push(redirectPath)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred during login')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">VEat Admin</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Protected food delivery admin portal
                </CardFooter>
            </Card>
        </div>
    )
}