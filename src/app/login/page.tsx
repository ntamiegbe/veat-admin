import { Suspense } from 'react'
import { Card } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import LoginForm from '@/components/auth/LoginForm'

export default function Login() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-50 dark:from-primary-950/20 dark:via-background dark:to-primary-950/20 flex items-center justify-center p-4">
            <Suspense fallback={<LoginSkeleton />}>
                <LoginForm />
            </Suspense>
        </div>
    )
}

function LoginSkeleton() {
    return (
        <Card className="w-full max-w-md p-8">
            <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <Skeleton className="h-8 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </Card>
    )
}