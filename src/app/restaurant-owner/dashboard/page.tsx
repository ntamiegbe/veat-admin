'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/services/useAuth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Building2,
    Utensils,
    ShoppingBag,
    TrendingUp,
    Clock,
    Plus,
    Edit,
    Settings,
    ChevronRight
} from 'lucide-react'
import type { Database } from '@/types/supabase'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export default function RestaurantOwnerDashboard() {
    const router = useRouter()
    const { userRestaurants, isLoading, requireRole } = useAuth()
    const { isLoading: isAuthChecking } = requireRole('restaurant_owner')
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

    // Set the first restaurant as selected when data loads
    useEffect(() => {
        if (userRestaurants && userRestaurants.length > 0 && !selectedRestaurant) {
            setSelectedRestaurant(userRestaurants[0])
        }
    }, [userRestaurants, selectedRestaurant])

    if (isLoading || isAuthChecking) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!userRestaurants || userRestaurants.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>No Restaurants Found</CardTitle>
                        <CardDescription>
                            You don&apos;t have any restaurants associated with your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            To get started, you need to create a restaurant or contact an administrator
                            to assign a restaurant to your account.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={() => router.push('/restaurant-owner/restaurants/new')}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Restaurant
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your restaurant information and view analytics
                    </p>
                </div>

                {userRestaurants.length > 1 && (
                    <div className="flex items-center space-x-2">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedRestaurant?.id}
                            onChange={(e) => {
                                const selected = userRestaurants.find(r => r.id === e.target.value)
                                if (selected) setSelectedRestaurant(selected)
                            }}
                        >
                            {userRestaurants.map((restaurant) => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {restaurant.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {selectedRestaurant && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    +0% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$0.00</div>
                                <p className="text-xs text-muted-foreground">
                                    +0% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                                <Utensils className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    0 active items
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Preparation Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0 min</div>
                                <p className="text-xs text-muted-foreground">
                                    Based on recent orders
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="menu">Menu</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Restaurant Information</CardTitle>
                                    <CardDescription>
                                        Basic information about your restaurant
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium mb-1">Name</h3>
                                            <p>{selectedRestaurant.name}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium mb-1">Status</h3>
                                            <p>{selectedRestaurant.is_active ? 'Active' : 'Inactive'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium mb-1">Description</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedRestaurant.description || 'No description provided'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/edit`)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Information
                                    </Button>
                                </CardFooter>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/menu/new`)}
                                        >
                                            <div className="flex items-center">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Menu Item
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/orders`)}
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
                                            onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/settings`)}
                                        >
                                            <div className="flex items-center">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Restaurant Settings
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-center text-muted-foreground py-8">
                                            No recent activity to display
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="menu" className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Menu Items</CardTitle>
                                        <CardDescription>
                                            Manage your restaurant&apos;s menu
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/menu/new`)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-muted-foreground py-8">
                                        No menu items found. Add your first menu item to get started.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Orders</CardTitle>
                                    <CardDescription>
                                        View and manage your restaurant&apos;s orders
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-muted-foreground py-8">
                                        No orders found
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/orders`)}
                                    >
                                        View All Orders
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Restaurant Settings</CardTitle>
                                    <CardDescription>
                                        Manage your restaurant&apos;s settings and preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/edit`)}
                                    >
                                        <div className="flex items-center">
                                            <Building2 className="mr-2 h-4 w-4" />
                                            Basic Information
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => router.push(`/restaurant-owner/restaurants/${selectedRestaurant.id}/hours`)}
                                    >
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4" />
                                            Operating Hours
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => {
                                            toast.success(`Restaurant ${selectedRestaurant.is_active ? 'deactivated' : 'activated'}`)
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            {selectedRestaurant.is_active ? 'Deactivate Restaurant' : 'Activate Restaurant'}
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
} 