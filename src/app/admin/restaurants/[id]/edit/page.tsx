'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { useRestaurants } from '@/services/useRestaurants'
import RestaurantForm from '@/components/resturants/RestaurantForm'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export default function EditRestaurantPage() {
    const params = useParams()
    const restaurantId = params.id as string
    const { user, isLoading: isAuthLoading } = useAuth()
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const { getRestaurantById } = useRestaurants()

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setIsLoading(true)
                const restaurantData = await getRestaurantById(restaurantId)
                setRestaurant(restaurantData)
            } catch (err) {
                console.error('Error fetching restaurant:', err)
                setError(err instanceof Error ? err : new Error('Failed to fetch restaurant'))
            } finally {
                setIsLoading(false)
            }
        }

        if (restaurantId) {
            fetchRestaurant()
        }
    }, [restaurantId, getRestaurantById])

    if (isAuthLoading || isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[500px] w-full" />
                    <div className="space-y-6">
                        <Skeleton className="h-[200px] w-full" />
                        <Skeleton className="h-[250px] w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-semibold">Error loading restaurant</h3>
                    </div>
                    <p className="mt-2">{error.message}</p>
                </CardContent>
            </Card>
        )
    }

    if (!restaurant) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Restaurant not found</h3>
                        <p className="text-muted-foreground mt-2">
                            The restaurant you&apos;re trying to edit could not be found.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return <RestaurantForm restaurant={restaurant} user={user} />
}