/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Calendar,
    Edit,
    Trash2,
    Star,
    ShoppingBag,
    Utensils,
    Users,
    AlertCircle,
    Eye,
    EyeOff,
    User
} from 'lucide-react'
import type { Database } from '@/types/supabase'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'

// type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
//     location?: { id: string, name: string, is_campus: boolean | null } | null,
//     owner?: { id: string, full_name: string, email: string | null } | null,
//     menu_categories?: Array<{ id: string, name: string, display_order: number | null }>
// }

export default function RestaurantDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const restaurantId = params.id as string
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()

    // Fetch restaurant with related data
    const {
        data: restaurant,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['restaurant', restaurantId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select(`
          id, name, description, address, phone_number, email,
          is_active, is_featured, cuisine_types, average_rating, total_orders,
          created_at, opening_hours, location_id, logo_url, banner_url,
          location:location_id(id, name, is_campus),
          menu_categories(id, name, display_order),
          owner:owner_id(id, full_name, email)
        `)
                .eq('id', restaurantId)
                .single()

            if (error) throw error
            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })

    // Fetch menu items count
    const { data: menuItemsCount } = useQuery({
        queryKey: ['restaurant-menu-count', restaurantId],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('menu_items')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', restaurantId)

            if (error) throw error
            return count || 0
        },
        enabled: !!restaurant,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Toggle restaurant status mutation
    const toggleStatus = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            const { data, error } = await supabase
                .from('restaurants')
                .update({ is_active: isActive })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['restaurant', restaurantId], data)
            toast.success(`Restaurant ${data.is_active ? 'activated' : 'deactivated'} successfully`)
        },
        onError: () => {
            toast.error('Failed to update restaurant status')
        }
    })

    // Toggle featured status mutation
    // const toggleFeatured = useMutation({
    //     mutationFn: async ({ id, isFeatured }: { id: string, isFeatured: boolean }) => {
    //         const { data, error } = await supabase
    //             .from('restaurants')
    //             .update({ is_featured: isFeatured })
    //             .eq('id', id)
    //             .select()
    //             .single()

    //         if (error) throw error
    //         return data
    //     },
    //     onSuccess: (data) => {
    //         queryClient.setQueryData(['restaurant', restaurantId], data)
    //         toast.success(`Restaurant ${data.is_featured ? 'featured' : 'unfeatured'} successfully`)
    //     },
    //     onError: () => {
    //         toast.error('Failed to update featured status')
    //     }
    // })

    // Delete restaurant mutation
    const deleteRestaurant = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('restaurants')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            toast.success('Restaurant deleted successfully')
            router.push('/admin/restaurants')
        },
        onError: () => {
            toast.error('Failed to delete restaurant')
            setIsDeleteDialogOpen(false)
        }
    })

    const handleToggleStatus = () => {
        if (!restaurant) return

        toggleStatus.mutate({
            id: restaurant.id,
            isActive: !restaurant.is_active
        })
    }

    const handleDelete = () => {
        if (!restaurant) return
        deleteRestaurant.mutate(restaurant.id)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-10 w-20" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
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
                    <p className="mt-2">{(error as Error).message}</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/restaurants')}
                        className="mt-4"
                    >
                        Back to Restaurants
                    </Button>
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
                            The restaurant you&apos;re looking for could not be found.
                        </p>
                        <Button
                            onClick={() => router.push('/admin/restaurants')}
                            className="mt-4"
                        >
                            Back to Restaurants
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8"
                            onClick={() => router.push('/admin/restaurants')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                        <div>
                            {restaurant.is_featured && (
                                <Badge variant="default" className="ml-2">Featured</Badge>
                            )}
                            <Badge
                                variant={restaurant.is_active ? "outline" : "secondary"}
                                className="ml-2"
                            >
                                {restaurant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                    {restaurant.location && (
                        <p className="text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {restaurant.location.name} {restaurant.location.is_campus ? '(Campus)' : ''}
                        </p>
                    )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={restaurant.is_active ? "outline" : "default"}
                        onClick={handleToggleStatus}
                        disabled={toggleStatus.isPending}
                        className="flex-1 sm:flex-auto"
                    >
                        {restaurant.is_active ? (
                            <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activate
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/restaurants/${restaurant.id}/edit`)}
                        className="flex-1 sm:flex-auto"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex-1 sm:flex-auto"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-medium">{restaurant.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {restaurant.description || 'No description provided'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-medium">Address</h3>
                                        <p className="text-sm">{restaurant.address}</p>
                                        {restaurant.location && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Location: {restaurant.location.name}
                                                {restaurant.location.is_campus ? ' (Campus)' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-medium">Contact</h3>
                                        <p className="text-sm">Phone: {restaurant.phone_number}</p>
                                        {restaurant.email && (
                                            <p className="text-sm">Email: {restaurant.email}</p>
                                        )}
                                    </div>
                                </div>

                                {restaurant.owner && (
                                    <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium">Owner</h3>
                                            <p className="text-sm">{restaurant.owner.full_name}</p>
                                            {restaurant.owner.email && (
                                                <p className="text-sm text-muted-foreground">{restaurant.owner.email}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                                    <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                        <Utensils className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium">Cuisine Types</h3>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {restaurant.cuisine_types.map((cuisine, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {cuisine}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Hours</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {restaurant.opening_hours &&
                                            Object.entries(restaurant.opening_hours as Record<string, any>).map(([day, hours]) => (
                                                <div key={day} className="flex justify-between">
                                                    <span className="font-medium capitalize">{day}</span>
                                                    <span>
                                                        {hours.is_closed ? (
                                                            <span className="text-muted-foreground">Closed</span>
                                                        ) : (
                                                            `${hours.open} - ${hours.close}`
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Rating</p>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-amber-500 mr-1" />
                                                <span className="font-medium">{restaurant.average_rating?.toFixed(1) || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total Orders</p>
                                            <div className="flex items-center">
                                                <ShoppingBag className="h-4 w-4 text-primary mr-1" />
                                                <span className="font-medium">{restaurant.total_orders || 0}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Menu Items</p>
                                            <div className="flex items-center">
                                                <Utensils className="h-4 w-4 text-primary mr-1" />
                                                <span className="font-medium">{menuItemsCount || 0}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Added On</p>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-primary mr-1" />
                                                <span className="font-medium">
                                                    {new Date(restaurant.created_at || '').toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {restaurant.menu_categories && restaurant.menu_categories.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Menu Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {restaurant.menu_categories
                                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                        .map(category => (
                                            <Badge key={category.id} variant="outline" className="text-sm py-1 px-3">
                                                {category.name}
                                            </Badge>
                                        ))
                                    }
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push('/admin/restaurants-categories')}
                                >
                                    Manage Categories
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>

                {/* Menu Tab */}
                <TabsContent value="menu">
                    <Card>
                        <CardHeader>
                            <CardTitle>Menu Items</CardTitle>
                            <CardDescription>
                                Manage menu items for {restaurant.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center text-center p-6">
                                <Utensils className="h-10 w-10 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Menu Management</h3>
                                <p className="text-muted-foreground mt-2 max-w-md">
                                    Here you can manage all menu items for this restaurant.
                                    {restaurant.menu_categories && restaurant.menu_categories.length === 0 && (
                                        <span className="block mt-2 font-medium">
                                            You should create some categories first before adding menu items.
                                        </span>
                                    )}
                                </p>
                                <div className="flex gap-4 mt-4">
                                    <Button onClick={() => router.push(`/admin/menu-items?restaurant=${restaurant.id}`)}>
                                        Manage Menu Items
                                    </Button>
                                    {restaurant.menu_categories && restaurant.menu_categories.length === 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/admin/restaurants-categories')}
                                        >
                                            Create Categories
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
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
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
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
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Restaurant</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {restaurant.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteRestaurant.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteRestaurant.isPending}
                        >
                            {deleteRestaurant.isPending ? 'Deleting...' : 'Delete Restaurant'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}