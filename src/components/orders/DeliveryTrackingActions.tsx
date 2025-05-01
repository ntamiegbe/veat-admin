/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrders } from '@/services/useOrders'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Navigation, Clock, MapPin } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { Progress } from '@radix-ui/react-progress'

type Order = Database['public']['Tables']['orders']['Row']

interface DeliveryTrackingActionsProps {
    order: Order
    isRider?: boolean
    onStatusUpdate?: () => void
}

export function DeliveryTrackingActions({
    order,
    isRider = false,
    onStatusUpdate
}: DeliveryTrackingActionsProps) {
    const {
        confirmOrderPickup,
        confirmOrderDelivery,
        getOrderDeliveryProgress,
        getOrderDeliveryStatusMessage,
        getEstimatedMinutesRemaining
    } = useOrders()

    const progress = getOrderDeliveryProgress(order)
    const statusMessage = getOrderDeliveryStatusMessage(order)
    const minutesRemaining = getEstimatedMinutesRemaining(order)

    // Only render the rider actions if this component is being used in the rider interface
    const handleConfirmPickup = async () => {
        if (!isRider) return

        try {
            await confirmOrderPickup.mutateAsync({
                id: order.id,
                restaurantId: order.restaurant_id,
                deliveryLocationId: order.delivery_location_id || ''
            })
            toast.success('Order pickup confirmed')
            if (onStatusUpdate) onStatusUpdate()
        } catch (error: unknown) {
            toast.error(`Failed to confirm pickup: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const handleConfirmDelivery = async () => {
        if (!isRider) return

        try {
            await confirmOrderDelivery.mutateAsync(order.id)
            toast.success('Order delivery confirmed')
            if (onStatusUpdate) onStatusUpdate()
        } catch (error: any) {
            toast.error(`Failed to confirm delivery: ${error.message}`)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
                <CardDescription>
                    Track the current status of this delivery
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        {progress === 100 ? (
                            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                        ) : (
                            <Navigation className="mr-2 h-5 w-5 text-primary" />
                        )}
                        <span className="font-medium">{statusMessage}</span>
                    </div>
                    {minutesRemaining !== null && progress < 100 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{minutesRemaining} min remaining</span>
                        </div>
                    )}
                </div>

                <Progress value={progress} className="h-2" />

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">From</span>
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span className="font-medium">Restaurant</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">To</span>
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span className="font-medium">Customer</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            {isRider && (
                <CardFooter className="flex justify-end space-x-2">
                    {order.order_status === 'preparing' && (
                        <Button
                            onClick={handleConfirmPickup}
                            disabled={confirmOrderPickup.isPending}
                        >
                            {confirmOrderPickup.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirm Pickup
                        </Button>
                    )}

                    {order.order_status === 'picked_up' && (
                        <Button
                            onClick={handleConfirmDelivery}
                            disabled={confirmOrderDelivery.isPending}
                        >
                            {confirmOrderDelivery.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirm Delivery
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
} 