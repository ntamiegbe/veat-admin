/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    ArrowLeft,
    ShoppingBag,
    Building2,
    MapPin,
    User,
    Bike,
    AlertCircle,
    Utensils,
    Edit,
    Printer
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useOrders } from '@/services/useOrders'
import { useUsers } from '@/services/useUsers'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Order = Database['public']['Tables']['orders']['Row'] & {
    user?: { id: string, full_name: string, phone_number: string, email: string } | null,
    restaurant?: { id: string, name: string, address: string, phone_number: string } | null,
    delivery_rider?: { id: string, full_name: string, phone_number: string } | null,
    delivery_location?: { id: string, name: string, address: string } | null,
    order_items?: Array<{
        id: string,
        order_id: string,
        menu_item_id: string,
        quantity: number,
        unit_price: number,
        special_instructions: string | null,
        created_at: string,
        menu_item?: {
            id: string,
            name: string,
            description: string | null,
            price: number,
            image_url: string | null
        } | null
    }>
}

// Component to show when redirecting to the new order page
function RedirectingToNewOrder() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/orders/new');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
                <h2 className="text-lg font-medium">Redirecting...</h2>
                <p className="text-muted-foreground mt-2">Taking you to the new order page</p>
            </div>
        </div>
    );
}

// Component to show for invalid order IDs
function InvalidOrderId({ orderId }: { orderId: string }) {
    const router = useRouter();

    return (
        <Card className="border-destructive">
            <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-semibold">Invalid Order ID</h3>
                </div>
                <p className="mt-2">The order ID "{orderId}" is not valid.</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/orders')}
                    className="mt-4"
                >
                    Back to Orders
                </Button>
            </CardContent>
        </Card>
    );
}

// Main order details component
function OrderDetails({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isRiderDialogOpen, setIsRiderDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedRiderId, setSelectedRiderId] = useState<string>('');
    const supabase = createClientComponentClient<Database>();

    const {
        updateOrderStatus,
        assignRider
    } = useOrders();

    // Fetch riders for assignment
    const { users: riders } = useUsers({
        userType: 'delivery_rider'
    });

    // Fetch order with related data
    const {
        data: order,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    user:user_id(id, full_name, phone_number, email),
                    restaurant:restaurant_id(id, name, address, phone_number),
                    delivery_rider:delivery_rider_id(id, full_name, phone_number),
                    delivery_location:delivery_location_id(id, name, address),
                    order_items(*, menu_item:menu_item_id(*))
                `)
                .eq('id', orderId)
                .single()

            if (error) throw error
            // Use unknown as an intermediate step for the type cast
            return data as unknown as Order
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.order_status)
            setSelectedRiderId(order.delivery_rider_id || '')
        }
    }, [order]);

    const handleUpdateStatus = async () => {
        if (!order) return

        try {
            await updateOrderStatus.mutateAsync({
                id: order.id,
                status: selectedStatus
            })

            toast.success(`Order status updated to ${getStatusDisplayName(selectedStatus)}`)
            setIsStatusDialogOpen(false)
            refetch()
        } catch (error) {
            toast.error('Failed to update order status')
            console.error(error)
        }
    }

    const handleAssignRider = async () => {
        if (!order) return

        try {
            await assignRider.mutateAsync({
                id: order.id,
                riderId: selectedRiderId
            })

            toast.success('Rider assigned successfully')
            setIsRiderDialogOpen(false)
            refetch()
        } catch (error) {
            toast.error('Failed to assign rider')
            console.error(error)
        }
    }

    // Format price as currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    }

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary'
            case 'confirmed':
                return 'default'
            case 'preparing':
                return 'default'
            case 'ready_for_pickup':
                return 'warning'
            case 'out_for_delivery':
                return 'warning'
            case 'delivered':
                return 'success'
            case 'cancelled':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    // Get status display name
    const getStatusDisplayName = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending'
            case 'confirmed':
                return 'Confirmed'
            case 'preparing':
                return 'Preparing'
            case 'ready_for_pickup':
                return 'Ready for Pickup'
            case 'out_for_delivery':
                return 'Out for Delivery'
            case 'delivered':
                return 'Delivered'
            case 'cancelled':
                return 'Cancelled'
            default:
                return status
        }
    }

    // Calculate subtotal
    const calculateSubtotal = (orderItems: Order['order_items']) => {
        if (!orderItems) return 0
        return orderItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0)
    }

    // Print order
    const handlePrint = () => {
        window.print()
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
                        <h3 className="font-semibold">Error loading order</h3>
                    </div>
                    <p className="mt-2">{(error as Error).message}</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/orders')}
                        className="mt-4"
                    >
                        Back to Orders
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!order) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Order not found</h3>
                        <p className="text-muted-foreground mt-2">
                            The order you're looking for could not be found.
                        </p>
                        <Button
                            onClick={() => router.push('/admin/orders')}
                            className="mt-4"
                        >
                            Back to Orders
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 print:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8"
                            onClick={() => router.push('/admin/orders')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h1>
                        <Badge variant="secondary">
                            {getStatusDisplayName(order.order_status)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        {formatDate(order.created_at || '')}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setIsStatusDialogOpen(true)}
                    >
                        Update Status
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Print header */}
            <div className="hidden print:block">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h1>
                        <p className="text-gray-500">{formatDate(order.created_at || '')}</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{getStatusDisplayName(order.order_status)}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order ID</p>
                                    <p className="font-medium">{order.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Date</p>
                                    <p className="font-medium">{formatDate(order.created_at || '')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={getStatusBadgeVariant(order.order_status) as "default" | "secondary" | "destructive" | "outline"}>
                                        {getStatusDisplayName(order.order_status)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="font-medium">{formatPrice(order.total_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Delivery Fee</p>
                                    <p className="font-medium">{formatPrice(order.delivery_fee)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Items</p>
                                    <p className="font-medium">{order.order_items?.length || 0} items</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Restaurant Information */}
                    {order.restaurant && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building2 className="mr-2 h-5 w-5" />
                                    Restaurant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{order.restaurant.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{order.restaurant.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{order.restaurant.phone_number}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Information */}
                    {order.user && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{order.user.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{order.user.phone_number}</p>
                                </div>
                                {order.user.email && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{order.user.email}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Delivery Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                Delivery Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Delivery Address</p>
                                <p className="font-medium">{order.delivery_address}</p>
                            </div>
                            {order.delivery_location && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{order.delivery_location.name}</p>
                                </div>
                            )}
                            {order.delivery_instructions && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Instructions</p>
                                    <p className="font-medium">{order.delivery_instructions}</p>
                                </div>
                            )}
                            {order.estimated_delivery_time && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Delivery Time</p>
                                    <p className="font-medium">{formatDate(order.estimated_delivery_time)}</p>
                                </div>
                            )}
                            {order.actual_delivery_time && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Actual Delivery Time</p>
                                    <p className="font-medium">{formatDate(order.actual_delivery_time)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rider Information */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="flex items-center">
                                <Bike className="mr-2 h-5 w-5" />
                                Delivery Rider
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRiderDialogOpen(true)}
                                className="print:hidden"
                            >
                                {order.delivery_rider ? 'Change' : 'Assign'} Rider
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.delivery_rider ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{order.delivery_rider.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{order.delivery_rider.phone_number}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-20 border rounded-md border-dashed">
                                    <p className="text-muted-foreground">No rider assigned</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Utensils className="mr-2 h-5 w-5" />
                        Order Items
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.order_items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.menu_item?.name || 'Unknown Item'}</span>
                                            {item.special_instructions && (
                                                <span className="text-xs text-muted-foreground mt-1">
                                                    Note: {item.special_instructions}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatPrice(item.unit_price)}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatPrice(item.unit_price * item.quantity)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex flex-col items-end space-y-2">
                    <div className="flex justify-between w-full md:w-1/3">
                        <span className="font-medium">Subtotal:</span>
                        <span>{formatPrice(calculateSubtotal(order.order_items))}</span>
                    </div>
                    <div className="flex justify-between w-full md:w-1/3">
                        <span className="font-medium">Delivery Fee:</span>
                        <span>{formatPrice(order.delivery_fee)}</span>
                    </div>
                    <Separator className="my-2 w-full md:w-1/3" />
                    <div className="flex justify-between w-full md:w-1/3">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold">{formatPrice(order.total_amount)}</span>
                    </div>
                </CardFooter>
            </Card>

            {/* Update Status Dialog */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>
                            Change the status of order #{order.id.substring(0, 8)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Select
                                value={selectedStatus}
                                onValueChange={setSelectedStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
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
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsStatusDialogOpen(false)}
                            disabled={updateOrderStatus.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updateOrderStatus.isPending || selectedStatus === order.order_status}
                        >
                            {updateOrderStatus.isPending ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Rider Dialog */}
            <Dialog open={isRiderDialogOpen} onOpenChange={setIsRiderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Delivery Rider</DialogTitle>
                        <DialogDescription>
                            {order.delivery_rider ? 'Change' : 'Assign'} the delivery rider for order #{order.id.substring(0, 8)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Select
                                value={selectedRiderId}
                                onValueChange={setSelectedRiderId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a rider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No rider (unassign)</SelectItem>
                                    {riders?.map((rider) => (
                                        <SelectItem key={rider.id} value={rider.id}>
                                            {rider.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRiderDialogOpen(false)}
                            disabled={assignRider.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignRider}
                            disabled={assignRider.isPending || selectedRiderId === order.delivery_rider_id}
                        >
                            {assignRider.isPending ? 'Assigning...' : 'Assign Rider'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Main component that handles routing logic
export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;

    // Check if orderId is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    // If the ID is "new", we're trying to create a new order, so redirect to the new order page
    if (orderId === "new") {
        return <RedirectingToNewOrder />;
    }

    // If it's some other invalid ID, show an error
    if (!isValidUUID) {
        return <InvalidOrderId orderId={orderId} />;
    }

    // If it's a valid UUID, show the order details
    return <OrderDetails orderId={orderId} />;
} 