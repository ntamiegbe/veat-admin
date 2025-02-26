'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import LoginForm from '@/components/auth/LoginForm'

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">VEat Admin</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<LoginFormSkeleton />}>
                        <LoginForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

function LoginFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}