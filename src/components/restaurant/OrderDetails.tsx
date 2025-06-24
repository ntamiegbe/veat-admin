'use client'

import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Check, X, ChefHat, Truck } from 'lucide-react'

type OrderDetailsProps = {
    order: {
        id: string
        created_at: string | null
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
        items?: {
            id: string
            name: string
            quantity: number
            price: number
        }[]
    }
    open: boolean
    onClose: () => void
    onUpdateStatus: (status: string) => void
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

const getNextStatus = (currentStatus: string): string | null => {
    const flow = {
        pending: 'confirmed',
        confirmed: 'preparing',
        preparing: 'ready_for_pickup',
        ready_for_pickup: 'out_for_delivery',
        out_for_delivery: 'delivered',
    }
    return flow[currentStatus as keyof typeof flow] || null
}

export function OrderDetails({ order, open, onClose, onUpdateStatus }: OrderDetailsProps) {
    const subtotal = order.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) ?? 0
    const nextStatus = getNextStatus(order.order_status)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Order Details</span>
                        <Badge className={statusColors[order.order_status as keyof typeof statusColors]}>
                            {order.order_status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        {order.created_at ? (
                            `Order placed on ${format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}`
                        ) : 'Order date not available'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="flex justify-between items-center">
                        {nextStatus && (
                            <Button
                                onClick={() => onUpdateStatus(nextStatus)}
                                className="gap-2"
                                variant="default"
                            >
                                {nextStatus === 'preparing' ? <ChefHat className="h-4 w-4" /> :
                                    nextStatus === 'out_for_delivery' ? <Truck className="h-4 w-4" /> :
                                        <Check className="h-4 w-4" />}
                                Mark as {nextStatus.replace(/_/g, ' ')}
                            </Button>
                        )}
                        {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                            <Button
                                onClick={() => onUpdateStatus('cancelled')}
                                variant="destructive"
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Cancel Order
                            </Button>
                        )}
                    </div>

                    {/* Customer Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{order.user?.full_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{order.user?.phone_number || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Delivery Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p className="font-medium">{order.delivery_address}</p>
                            </div>
                            {order.delivery_instructions && (
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Instructions</p>
                                    <p className="font-medium">{order.delivery_instructions}</p>
                                </div>
                            )}
                            {order.estimated_delivery_time && (
                                <div>
                                    <p className="text-sm text-gray-500">Estimated Delivery Time</p>
                                    <p className="font-medium">
                                        {format(new Date(order.estimated_delivery_time), 'h:mm a')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Order Items */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                        <Table>
                            <TableBody>
                                {order.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>₦{item.price.toLocaleString()}</TableCell>
                                        <TableCell>₦{(item.price * item.quantity).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <p className="text-gray-500">Subtotal</p>
                                <p className="font-medium">₦{subtotal.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-500">Delivery Fee</p>
                                <p className="font-medium">₦{order.delivery_fee.toLocaleString()}</p>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <p className="font-semibold">Total</p>
                                <p className="font-semibold">₦{order.total_amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 