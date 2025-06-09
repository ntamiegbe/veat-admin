'use client'

import { useEffect, useState } from 'react'
import { useAuth, useRequireRole } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { OrderDetails } from '@/components/restaurant/OrderDetails'
import { Eye } from 'lucide-react'

type Order = {
    id: string
    created_at: string
    order_status: string
    total_amount: number
    delivery_fee: number
    delivery_address: string
    delivery_instructions?: string
    estimated_delivery_time?: string
    user: {
        full_name: string
        phone_number: string
    }
    order_items: {
        id: string
        quantity: number
        unit_price: number
        special_instructions?: string
        menu_item: {
            name: string
        }
    }[]
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready_for_pickup: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
    useRequireRole('restaurant_owner')
    const { currentUser } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const supabase = createClientComponentClient()
    const { toast } = useToast()

    useEffect(() => {
        if (!currentUser?.id) return
        loadOrders()
    }, [currentUser, statusFilter])

    const loadOrders = async () => {
        try {
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', currentUser?.id)
                .single()

            if (!restaurant) {
                toast({
                    title: 'Error',
                    description: 'Restaurant not found',
                    variant: 'destructive',
                })
                return
            }

            let query = supabase
                .from('orders')
                .select(`
                    *,
                    user:user_id (
                        full_name,
                        phone_number
                    ),
                    order_items (
                        id,
                        quantity,
                        unit_price,
                        special_instructions,
                        menu_item:menu_item_id (
                            name
                        )
                    )
                `)
                .eq('restaurant_id', restaurant.id)
                .order('created_at', { ascending: false })

            if (statusFilter !== 'all') {
                query = query.eq('order_status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setOrders(data)
        } catch (error) {
            console.error('Error loading orders:', error)
            toast({
                title: 'Error',
                description: 'Failed to load orders',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            toast({
                title: 'Success',
                description: 'Order status updated successfully',
            })

            loadOrders()
        } catch (error) {
            console.error('Error updating order status:', error)
            toast({
                title: 'Error',
                description: 'Failed to update order status',
                variant: 'destructive',
            })
        }
    }

    if (loading) {
        return <Skeleton className="w-full h-[200px]" />
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>Manage your restaurant orders</CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.user.full_name}</div>
                                            <div className="text-sm text-gray-500">{order.user.phone_number}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px]">
                                            {order.order_items.map((item) => (
                                                <div key={item.id} className="text-sm">
                                                    {item.quantity}x {item.menu_item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                                            {order.order_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Select
                                                value={order.order_status}
                                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Update status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="confirmed">Confirm Order</SelectItem>
                                                    <SelectItem value="preparing">Start Preparing</SelectItem>
                                                    <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                                                    <SelectItem value="cancelled">Cancel Order</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    open={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    )
} 