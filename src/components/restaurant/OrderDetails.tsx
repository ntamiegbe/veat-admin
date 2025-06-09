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

type OrderDetailsProps = {
    order: {
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
    open: boolean
    onClose: () => void
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

export function OrderDetails({ order, open, onClose }: OrderDetailsProps) {
    const subtotal = order.order_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

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
                        Order placed on {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{order.user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{order.user.phone_number}</p>
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
                        <div className="space-y-4">
                            {order.order_items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">
                                            {item.quantity}x {item.menu_item.name}
                                        </p>
                                        {item.special_instructions && (
                                            <p className="text-sm text-gray-500">
                                                Note: {item.special_instructions}
                                            </p>
                                        )}
                                    </div>
                                    <p className="font-medium">
                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <p className="text-gray-500">Subtotal</p>
                                <p className="font-medium">${subtotal.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-500">Delivery Fee</p>
                                <p className="font-medium">${order.delivery_fee.toFixed(2)}</p>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <p className="font-semibold">Total</p>
                                <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 