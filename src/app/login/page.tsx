'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Database } from '@/types/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    // const [isChecking, setIsChecking] = useState(true)
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    // useEffect(() => {
    //     let mounted = true

    //     const checkUser = async () => {
    //         try {
    //             const { data: { session }, error } = await supabase.auth.getSession()
    //             if (error) throw error

    //             if (session && mounted) {
    //                 router.replace('/admin/dashboard')
    //             }
    //         } catch (error) {
    //             console.error('Session check error:', error)
    //         } finally {
    //             if (mounted) {
    //                 setIsChecking(false)
    //             }
    //         }
    //     }

    //     checkUser()

    //     return () => {
    //         mounted = false
    //     }
    // }, [router, supabase.auth])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isLoading) return

        setIsLoading(true)
        setError(null)

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError

            if (data.session) {
                router.refresh() // Refresh the router to update auth state
                router.replace('/admin/dashboard')
            } else {
                throw new Error('No session created')
            }

        } catch (error) {
            console.error('Login error:', error)
            setError(error instanceof Error ? error.message : 'An error occurred during login')
        } finally {
            setIsLoading(false)
        }
    }

    // // Show loading state while checking session
    // if (isChecking) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <Loader2 className="h-8 w-8 animate-spin" />
    //         </div>
    //     )
    // }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
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
            </Card>
        </div>
    )
}