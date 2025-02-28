/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

type RestaurantDetails = {
    id: string;
    name: string;
    [key: string]: any; // Allow for additional properties
}

interface RestaurantOrdersTabProps {
    restaurant: RestaurantDetails
}

export default function RestaurantOrdersTab({ restaurant }: RestaurantOrdersTabProps) {
    const router = useRouter()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                    View and manage orders for {restaurant.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-6">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Order Management</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Here you can manage all orders for this restaurant.
                        Order management feature is under development.
                    </p>
                    <Button
                        onClick={() => router.push(`/admin/orders?restaurant=${restaurant.id}`)}
                        className="mt-4"
                    >
                        View Orders
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}