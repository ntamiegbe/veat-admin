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
import RestaurantImagesForm from '@/components/resturants/RestaurantImagesForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export default function EditRestaurantPage() {
    const params = useParams()
    const restaurantId = params.id as string
    const { user, isLoading: isAuthLoading } = useAuth()
    const [restaurant, setRestaurant] = useState<Restaurant | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const supabase = createClientComponentClient<Database>()

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

    const handleImagesUpdate = async (updates: { logo_url?: string | null; banner_url?: string | null }) => {
        try {
            const { error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', restaurantId)

            if (error) throw error

            // Update local state
            setRestaurant(prev => prev ? { ...prev, ...updates } : undefined)
        } catch (error) {
            console.error('Error updating restaurant images:', error)
            throw error
        }
    }

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
            <Card>
                <CardContent className="flex items-center gap-2 text-destructive py-6">
                    <AlertCircle className="h-4 w-4" />
                    <p>Failed to load restaurant: {error.message}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <RestaurantForm restaurant={restaurant} user={user} />

            {restaurant && (
                <RestaurantImagesForm
                    restaurantId={restaurant.id}
                    logoUrl={restaurant.logo_url}
                    bannerUrl={restaurant.banner_url}
                    onImagesUpdate={handleImagesUpdate}
                />
            )}
        </div>
    )
}