'use client'

import { useEffect, useState } from 'react'
import { useAuth, useRequireRole } from '@/services/useAuth'
import { useMenuItems } from '@/services/useMenuItems'
import { useOrders } from '@/services/useOrders'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Utensils,
    ShoppingBag,
    TrendingUp,
    Clock,
    Plus,
    Settings,
    ChevronRight,
    Bell,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'
import type { Database } from '@/types/supabase'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { statusColors } from '@/lib/utils'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type Order = Database['public']['Tables']['orders']['Row'] & {
    user?: {
        id: string | null
        full_name: string | null
        phone_number: string | null
        email: string | null
    } | null
    items: {
        id: string
        name: string
        price: number
        quantity: number
    }[]
}

const statusIcons = {
    pending: AlertCircle,
    payment_pending: Clock,
    confirmed: CheckCircle2,
    preparing: Utensils,
    ready: Bell,
    completed: CheckCircle2,
    cancelled: XCircle,
}

export default function RestaurantOwnerDashboard() {
    const router = useRouter()
    const { userRestaurants, isLoading } = useAuth()
    const { isLoading: isAuthChecking } = useRequireRole('restaurant_owner')
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

    // Set the first restaurant as selected when data loads
    useEffect(() => {
        if (userRestaurants && userRestaurants.length > 0 && !selectedRestaurant) {
            setSelectedRestaurant(userRestaurants[0])
        }
    }, [userRestaurants, selectedRestaurant])

    // Fetch menu items for the selected restaurant
    const { menuItems } = useMenuItems({
        restaurantId: selectedRestaurant?.id,
        isAvailable: undefined, // Show all items
    })

    // Fetch orders for the selected restaurant
    const {
        orders: recentOrders,
        updateOrderStatus: updateStatus,
        refetch: refetchOrders
    } = useOrders({
        restaurantId: selectedRestaurant?.id,
        sortBy: 'created_at',
        sortOrder: 'desc'
    })

    // Group orders by status
    const ordersByStatus = recentOrders?.reduce((acc, order) => {
        const status = order.order_status
        if (!acc[status]) {
            acc[status] = []
        }
        acc[status].push(order)
        return acc
    }, {} as Record<string, Order[]>) || {}

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateStatus.mutateAsync({
                id: orderId,
                order_status: newStatus
            })
            toast.success('Order status updated successfully')
            refetchOrders()
        } catch (error) {
            console.error('Error updating order status:', error)
            toast.error('Failed to update order status')
        }
    }

    // Play notification sound for new orders
    useEffect(() => {
        const audio = new Audio('/notification.mp3') // Add this sound file to public folder
        const pendingOrders = ordersByStatus['pending'] || []

        if (pendingOrders.length > 0) {
            audio.play().catch(e => console.log('Audio play failed:', e))
        }
    }, [ordersByStatus['pending']?.length])

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

    const getTotalRevenue = () => {
        return recentOrders?.reduce((sum, order) => {
            if (order.order_status !== 'cancelled') {
                return sum + Number(order.total_amount)
            }
            return sum
        }, 0) || 0
    }

    const getOrdersCount = (status?: string) => {
        if (!status) {
            return recentOrders?.length || 0
        }
        return ordersByStatus[status]?.length || 0
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
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2"
                            onClick={() => router.push('/restaurant-owner/orders')}
                        >
                            <ShoppingBag className="h-6 w-6" />
                            <span>View All Orders</span>
                            {getOrdersCount('pending') > 0 && (
                                <Badge variant="destructive">{getOrdersCount('pending')} New</Badge>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2"
                            onClick={() => router.push('/restaurant-owner/menu')}
                        >
                            <Utensils className="h-6 w-6" />
                            <span>Manage Menu</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2"
                            onClick={() => router.push('/restaurant-owner/restaurants/[id]/edit'.replace('[id]', selectedRestaurant.id))}
                        >
                            <Settings className="h-6 w-6" />
                            <span>Restaurant Settings</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2"
                            onClick={() => router.push('/restaurant-owner/analytics')}
                        >
                            <TrendingUp className="h-6 w-6" />
                            <span>View Analytics</span>
                        </Button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getOrdersCount()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {getOrdersCount('pending')} pending orders
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{getTotalRevenue().toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    From {getOrdersCount('completed')} completed orders
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                                <Utensils className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active menu items
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Prep Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedRestaurant.average_preparation_time}min</div>
                                <p className="text-xs text-muted-foreground">
                                    Average order preparation time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Orders</CardTitle>
                                <Button variant="outline" onClick={() => router.push('/restaurant-owner/orders')}>
                                    View All
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <Tabs defaultValue="all" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="all">
                                        All
                                        <Badge variant="secondary" className="ml-2">{getOrdersCount()}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="pending">
                                        Pending
                                        <Badge variant="destructive" className="ml-2">{getOrdersCount('pending')}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="confirmed">
                                        Confirmed
                                        <Badge variant="secondary" className="ml-2">{getOrdersCount('confirmed')}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="preparing">
                                        Preparing
                                        <Badge variant="secondary" className="ml-2">{getOrdersCount('preparing')}</Badge>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="all">
                                    <OrdersTable
                                        orders={recentOrders?.slice(0, 5) || []}
                                        updateStatus={updateOrderStatus}
                                        onViewOrder={(id) => router.push(`/restaurant-owner/orders/${id}`)}
                                    />
                                </TabsContent>
                                <TabsContent value="pending">
                                    <OrdersTable
                                        orders={ordersByStatus['pending']?.slice(0, 5) || []}
                                        updateStatus={updateOrderStatus}
                                        onViewOrder={(id) => router.push(`/restaurant-owner/orders/${id}`)}
                                    />
                                </TabsContent>
                                <TabsContent value="confirmed">
                                    <OrdersTable
                                        orders={ordersByStatus['confirmed']?.slice(0, 5) || []}
                                        updateStatus={updateOrderStatus}
                                        onViewOrder={(id) => router.push(`/restaurant-owner/orders/${id}`)}
                                    />
                                </TabsContent>
                                <TabsContent value="preparing">
                                    <OrdersTable
                                        orders={ordersByStatus['preparing']?.slice(0, 5) || []}
                                        updateStatus={updateOrderStatus}
                                        onViewOrder={(id) => router.push(`/restaurant-owner/orders/${id}`)}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardHeader>
                    </Card>
                </>
            )}
        </div>
    )
}

function OrdersTable({ orders, onViewOrder }: {
    orders: Order[]
    updateStatus: (id: string, status: string) => Promise<void>
    onViewOrder: (id: string) => void
}) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => {
                        const StatusIcon = statusIcons[order.order_status as keyof typeof statusIcons]
                        return (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                                <TableCell>{order.user?.full_name || 'N/A'}</TableCell>
                                <TableCell>{order.items?.length || 0} items</TableCell>
                                <TableCell>₦{order.total_amount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className="h-4 w-4" />
                                        <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                                            {order.order_status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onViewOrder(order.id)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                                No orders found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
} 