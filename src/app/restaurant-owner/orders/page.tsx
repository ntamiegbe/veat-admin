'use client'

import { useState } from 'react'
import { useAuth, useRequireRole } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Eye, ShoppingBag, ArrowLeft, Clock, Search } from 'lucide-react'
import { useOrders } from '@/services/useOrders'
import { useRouter } from 'next/navigation'
import { statusColors } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { OrderDetails } from '@/components/restaurant/OrderDetails'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'

type Order = {
    id: string
    created_at: string | null
    updated_at: string | null
    order_status: string
    total_amount: number
    delivery_fee: number
    delivery_address: string
    delivery_instructions: string | null
    estimated_delivery_time: string | null
    actual_delivery_time: string | null
    user: {
        id: string | null
        full_name: string | null
        phone_number: string | null
        email: string | null
    } | null
    items?: Array<{
        id: string
        name: string
        price: number
        quantity: number
        restaurantId: string
    }>
}

type Priority = 'high' | 'normal'

export default function OrdersPage() {
    useRequireRole('restaurant_owner')
    const { userRestaurants, isLoading: isAuthLoading } = useAuth()
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    const restaurantId = userRestaurants?.[0]?.id

    // Enable real-time updates
    useOrderRealtime(restaurantId)

    const {
        orders: allOrders,
        isLoading: isOrdersLoading,
        updateOrderStatus: updateStatus,
        refetch: refetchOrders,
        error: fetchError
    } = useOrders({
        restaurantId,
        sortBy: 'created_at',
        sortOrder: 'desc'
    })

    // Filter orders based on status and search term
    const filteredOrders = allOrders?.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter
        const matchesSearch = !searchTerm ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesStatus && matchesSearch
    }) || []

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateStatus.mutateAsync({
                id: orderId,
                order_status: newStatus
            })

            toast({
                title: 'Success',
                description: 'Order status updated successfully',
            })

            refetchOrders()
        } catch (error) {
            console.error('Error updating order status:', error)
            toast({
                title: 'Error',
                description: 'Failed to update order status',
                variant: 'destructive',
            })
        }
    }

    // Group orders by priority
    const groupedOrders = filteredOrders.reduce((groups, order) => {
        let priority: Priority = 'normal'
        const createdTime = new Date(order.created_at || Date.now()).getTime()
        const waitingTime = (Date.now() - createdTime) / 1000 / 60 // minutes

        if (order.order_status === 'pending' && waitingTime > 5) {
            priority = 'high'
        } else if (order.order_status === 'confirmed' && waitingTime > 10) {
            priority = 'high'
        } else if (order.order_status === 'preparing' && waitingTime > 20) {
            priority = 'high'
        }

        if (!groups[priority]) {
            groups[priority] = []
        }
        groups[priority].push(order)
        return groups
    }, { high: [] as Order[], normal: [] as Order[] })

    // Show loading state while auth or orders are loading
    if (isAuthLoading || isOrdersLoading) {
        return (
            <div className="container mx-auto py-10 px-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-10 w-[180px]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Skeleton className="h-9 w-[120px]" />
                                                    <Skeleton className="h-9 w-9" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Show error if no restaurant is found
    if (!restaurantId) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="text-center py-10">
                        <p className="text-red-500">No restaurant found. Please make sure you have a restaurant registered.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Show error if orders failed to load
    if (fetchError) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="text-center py-10">
                        <p className="text-red-500">Failed to load orders. Please try again later.</p>
                        <p className="text-sm text-gray-500 mt-2">{(fetchError as Error).message}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/restaurant-owner/dashboard')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl">Orders</CardTitle>
                            <CardDescription>Manage your restaurant&apos;s orders</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="all" className="gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    All Orders
                                    {filteredOrders.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filteredOrders.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="confirmed" className="gap-2">
                                    Confirmed
                                    {filteredOrders.filter(o => o.order_status === 'confirmed').length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filteredOrders.filter(o => o.order_status === 'confirmed').length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="preparing" className="gap-2">
                                    Preparing
                                    {filteredOrders.filter(o => o.order_status === 'preparing').length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filteredOrders.filter(o => o.order_status === 'preparing').length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="ready" className="gap-2">
                                    Ready
                                    {filteredOrders.filter(o => o.order_status === 'ready').length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filteredOrders.filter(o => o.order_status === 'ready').length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* High Priority Orders */}
                    {groupedOrders.high && groupedOrders.high.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-red-600 mb-4">High Priority Orders</h3>
                            <div className="rounded-md border border-red-200 bg-red-50">
                                <Table>
                                    <TableBody>
                                        {groupedOrders.high.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-red-100">
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-red-600" />
                                                        {format(new Date(order.created_at || ''), 'h:mm a')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{order.user?.full_name || 'N/A'}</TableCell>
                                                <TableCell>{order.items?.length || 0} items</TableCell>
                                                <TableCell>₦{order.total_amount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                                                        {order.order_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedOrder(order)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Normal Priority Orders */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedOrders.normal.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>
                                            {format(new Date(order.created_at || ''), 'h:mm a')}
                                        </TableCell>
                                        <TableCell>{order.user?.full_name || 'N/A'}</TableCell>
                                        <TableCell>{order.items?.length || 0} items</TableCell>
                                        <TableCell>₦{order.total_amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                                                {order.order_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    open={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={(status) => {
                        updateOrderStatus(selectedOrder.id, status)
                        setSelectedOrder(null)
                    }}
                />
            )}
        </div>
    )
} 