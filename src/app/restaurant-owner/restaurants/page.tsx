'use client'

import { useAuth, useRequireRole } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getProxiedImageUrl } from '@/lib/imageUtils'
import {
    Utensils,
    ShoppingBag,
    Settings,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Image as ImageIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ImageManager } from '@/components/resturants/ImageManager'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import type { Database } from '@/types/supabase'

type OpeningHours = {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
        open: string
        close: string
        is_closed: boolean
    }
}

export default function RestaurantOwnerRestaurants() {
    const router = useRouter()
    const { userRestaurants, isLoading, refreshUserData } = useAuth()
    const { isLoading: isAuthChecking } = useRequireRole('restaurant_owner')
    const restaurant = userRestaurants?.[0]
    const { toast } = useToast()
    const supabase = createClientComponentClient<Database>()

    if (isLoading || isAuthChecking) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>No Restaurant Found</CardTitle>
                        <CardDescription>
                            You don&apos;t have a restaurant associated with your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            To get started, you need to create an account or contact an administrator
                            to assign a restaurant to your account.
                        </p>
                    </CardContent>
                    <CardFooter>
                        {/* Add contact information here */}

                    </CardFooter>
                </Card>
            </div>
        )
    }

    const handleImageUpdate = async (updates: { logo_url?: string, banner_url?: string }) => {
        try {
            const { error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', restaurant.id)

            if (error) throw error

            await refreshUserData()

            toast({
                title: 'Success',
                description: 'Restaurant images updated successfully',
            })
        } catch (error) {
            console.error('Error updating restaurant:', error)
            toast({
                title: 'Error',
                description: 'Failed to update restaurant images',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Restaurant</h1>
                    <p className="text-muted-foreground">
                        Manage your restaurant and view performance metrics
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="w-full">
                    {restaurant.banner_url && (
                        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                            <Image
                                src={getProxiedImageUrl(restaurant.banner_url)}
                                alt={`${restaurant.name} banner`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2">
                                    {restaurant.name}
                                    <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                                        {restaurant.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>{restaurant.description || 'No description provided'}</CardDescription>
                            </div>
                            {restaurant.logo_url && (
                                <div className="relative w-16 h-16">
                                    <Image
                                        src={getProxiedImageUrl(restaurant.logo_url)}
                                        alt={restaurant.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-medium">Contact Information</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {restaurant.address}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="mr-2 h-4 w-4" />
                                        {restaurant.phone_number}
                                    </div>
                                    {restaurant.email && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="mr-2 h-4 w-4" />
                                            {restaurant.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Opening Hours</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {Object.entries((restaurant.opening_hours as OpeningHours)).map(([day, hours]) => (
                                        <div key={day} className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            <span className="capitalize w-24">{day}:</span>
                                            {hours.is_closed ? (
                                                <span>Closed</span>
                                            ) : (
                                                <span>{hours.open} - {hours.close}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{restaurant.total_orders || 0}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Rating</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{restaurant.average_rating?.toFixed(1) || 'N/A'}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${restaurant.id}/menu`)}
                                    >
                                        <div className="flex items-center">
                                            <Utensils className="mr-2 h-4 w-4" />
                                            Manage Menu
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${restaurant.id}/orders`)}
                                    >
                                        <div className="flex items-center">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            View Orders
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${restaurant.id}/edit`)}
                                    >
                                        <div className="flex items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Restaurant Images
                        </CardTitle>
                        <CardDescription>
                            Manage your restaurant&apos;s logo and banner images
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ImageManager
                            restaurantId={restaurant.id}
                            logoUrl={restaurant.logo_url}
                            bannerUrl={restaurant.banner_url}
                            onUpdate={handleImageUpdate}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 