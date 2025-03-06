'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                    <CardDescription>
                        You don&apos;t have permission to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>
                        This area requires specific permissions that your account doesn&apos;t have.
                        If you believe this is an error, please contact the administrator.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button
                        className="w-full"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/')}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Return to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 