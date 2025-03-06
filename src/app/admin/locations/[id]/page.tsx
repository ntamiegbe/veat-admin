'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocations } from '@/services/useLocations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    MapPin,
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Building,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Database } from '@/types/supabase'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


export default function LocationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const locationId = params.id as string
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const supabase = createClientComponentClient<Database>()

    const {
        getLocationById,
        deleteLocation,
        toggleLocationActive
    } = useLocations()

    // Fetch location data
    const {
        data: location,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['location', locationId],
        queryFn: () => getLocationById(locationId),
        enabled: !!locationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    })

    // Fetch related restaurants
    const {
        data: relatedRestaurants,
        isLoading: isLoadingRestaurants
    } = useQuery({
        queryKey: ['restaurants-by-location', locationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name, is_active')
                .eq('location_id', locationId)

            if (error) throw error
            return data
        },
        enabled: !!locationId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    })

    // Fetch related orders
    const {
        data: relatedOrders,
        isLoading: isLoadingOrders
    } = useQuery({
        queryKey: ['orders-by-location', locationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('id, created_at, order_status')
                .eq('delivery_location_id', locationId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            return data
        },
        enabled: !!locationId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    })

    const handleToggleActive = async () => {
        if (!location) return

        try {
            await toggleLocationActive.mutateAsync({
                id: location.id,
                isActive: !location.is_active
            })
            toast.success(`Location ${location.is_active ? 'deactivated' : 'activated'} successfully`)
            refetch()
        } catch (error) {
            toast.error('Failed to update location status')
            console.error(error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteLocation.mutateAsync(locationId)
            toast.success('Location deleted successfully')
            router.push('/admin/locations')
        } catch (error) {
            toast.error('Failed to delete location')
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" disabled>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !location) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/admin/locations')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Location Details</h1>
                </div>
                <Card className="bg-destructive/10">
                    <CardContent className="pt-6">
                        <p>Error: {error instanceof Error ? error.message : 'Failed to load location'}</p>
                        <Button className="mt-4" onClick={() => router.push('/admin/locations')}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const formattedCreatedAt = location.created_at
        ? new Date(location.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'N/A'

    const formattedUpdatedAt = location.updated_at
        ? new Date(location.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'N/A'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/admin/locations')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">{location.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={location.is_active ? "outline" : "default"}
                        onClick={handleToggleActive}
                        disabled={toggleLocationActive.isPending}
                    >
                        {location.is_active ? (
                            <ToggleRight className="h-4 w-4 mr-2" />
                        ) : (
                            <ToggleLeft className="h-4 w-4 mr-2" />
                        )}
                        {location.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/locations/edit/${locationId}`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Location Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {location.is_campus ? (
                                <Badge>Campus</Badge>
                            ) : (
                                <Badge variant="secondary">Off-Campus</Badge>
                            )}
                            {!location.is_active && (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>

                        {location.description && (
                            <div>
                                <h3 className="text-sm font-medium mb-1">Description</h3>
                                <p className="text-sm text-muted-foreground">{location.description}</p>
                            </div>
                        )}

                        {location.address && (
                            <div>
                                <h3 className="text-sm font-medium mb-1">Address</h3>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                    <p className="text-sm">{location.address}</p>
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium mb-1">Created</h3>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formattedCreatedAt}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formattedUpdatedAt}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Restaurants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingRestaurants ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-6 w-full" />
                                    ))}
                                </div>
                            ) : relatedRestaurants && relatedRestaurants.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedRestaurants.map((restaurant) => (
                                        <div key={restaurant.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{restaurant.name}</span>
                                            </div>
                                            {!restaurant.is_active && (
                                                <Badge variant="outline" className="text-xs">Inactive</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No restaurants at this location</p>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4"
                                onClick={() => router.push('/admin/restaurants')}
                            >
                                View All Restaurants
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingOrders ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-6 w-full" />
                                    ))}
                                </div>
                            ) : relatedOrders && relatedOrders.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Order #{order.id.substring(0, 8)}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">{order.order_status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent orders for this location</p>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4"
                                onClick={() => router.push('/admin/orders')}
                            >
                                View All Orders
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {location.name}? This action cannot be undone.
                            {relatedRestaurants && relatedRestaurants.length > 0 && (
                                <p className="text-destructive mt-2">
                                    Warning: This location has {relatedRestaurants.length} associated restaurant(s).
                                    Deleting it may affect these restaurants.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteLocation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteLocation.isPending}
                        >
                            {deleteLocation.isPending ? 'Deleting...' : 'Delete Location'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 