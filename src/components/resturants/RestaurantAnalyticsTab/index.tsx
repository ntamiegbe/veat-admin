/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

type RestaurantDetails = {
    id: string;
    name: string;
    [key: string]: any; // Allow for additional properties
}

interface RestaurantAnalyticsTabProps {
    restaurant: RestaurantDetails
}
export default function RestaurantAnalyticsTab({ restaurant }: RestaurantAnalyticsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Analytics</CardTitle>
                <CardDescription>
                    Performance insights for {restaurant.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-6">
                    <Users className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Here you can view detailed analytics for this restaurant.
                        Analytics feature is under development.
                    </p>
                    <Button className="mt-4">
                        View Analytics Dashboard
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}