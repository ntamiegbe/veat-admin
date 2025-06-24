'use client'

import { useParams, useRouter } from 'next/navigation'
import { useOrders } from '@/services/useOrders'
import { useAuth, useRequireRole } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { statusColors } from '@/lib/utils'


export default function OrderDetailsPage() {
    useRequireRole('restaurant_owner')
    const params = useParams()
    const router = useRouter()
    const { userRestaurants, isLoading: isAuthLoading } = useAuth()
    const orderId = params.id as string

    const {
        orders,
        isLoading: isOrderLoading,
        updateOrderStatus,
        refetch: refetchOrder
    } = useOrders({
        orderId,
        restaurantId: userRestaurants?.[0]?.id
    })

    const order = orders?.[0]

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateOrderStatus.mutateAsync({
                id: orderId,
                order_status: newStatus
            })
            toast.success('Order status updated successfully')
            refetchOrder()
        } catch (error) {
            console.error('Error updating order status:', error)
            toast.error('Failed to update order status')
        }
    }

    if (isAuthLoading || isOrderLoading) {
        return (
            <div className="container mx-auto py-10 px-4 space-y-8">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto py-10 px-4">
                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">Order not found</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/restaurant-owner/orders')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/restaurant-owner/orders')}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Button>
                    <h1 className="text-3xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground">
                        Order #{orderId.substring(0, 8)} • {format(new Date(order.created_at || ''), 'PPP')}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                        {order.order_status}
                    </Badge>
                    <Select
                        value={order.order_status}
                        onValueChange={handleStatusUpdate}
                        disabled={!['confirmed', 'preparing'].includes(order.order_status)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                            {order.order_status === 'confirmed' && (
                                <SelectItem value="preparing">Start Preparing</SelectItem>
                            )}
                            {order.order_status === 'preparing' && (
                                <SelectItem value="ready">Mark as Ready</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5"><MapPin className="h-4 w-4 text-muted-foreground" /></div>
                            <div>
                                <div className="font-medium">Delivery Address</div>
                                <div className="text-muted-foreground">{order.delivery_address}</div>
                                {order.delivery_instructions && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Note: {order.delivery_instructions}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Phone Number</div>
                                <div className="text-muted-foreground">{order.user?.phone_number || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Email</div>
                                <div className="text-muted-foreground">{order.user?.email || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Estimated Delivery</div>
                                <div className="text-muted-foreground">
                                    {order.estimated_delivery_time
                                        ? format(new Date(order.estimated_delivery_time), 'h:mm a')
                                        : 'Not set'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                                    </div>
                                    <div className="text-right">
                                        <div>₦{(item.price * item.quantity).toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">
                                            ₦{item.price.toLocaleString()} each
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-4 mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₦{(Number(order.total_amount) - Number(order.delivery_fee)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span>₦{Number(order.delivery_fee).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium text-lg pt-2">
                                    <span>Total</span>
                                    <span>₦{Number(order.total_amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 