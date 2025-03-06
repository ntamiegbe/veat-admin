'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export default function CreateOrderPage() {
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-8 w-8"
                        onClick={() => router.push('/admin/orders')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        New Order
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        The order creation form is currently under development. Please check back later.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/orders')}
                    >
                        Back to Orders
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 