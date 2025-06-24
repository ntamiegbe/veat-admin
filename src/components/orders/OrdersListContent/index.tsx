/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    ShoppingBag,
    Search,
    Filter,
    RefreshCcw,
    Edit,
    Eye,
    ChevronDown,
    AlertCircle,
    Clock,
    User,
    Building2,
    MapPin,
    Bike,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useOrders } from '@/services/useOrders'
import { useRestaurants } from '@/services/useRestaurants'
import { useUsers } from '@/services/useUsers'
import { useLocations } from '@/services/useLocations'
import { format } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'

interface OrdersListContentProps {
    initialRestaurantId?: string
    initialUserId?: string
    initialRiderId?: string
    initialStatus?: string
}

export default function OrdersListContent({
    initialRestaurantId,
    initialUserId,
    initialRiderId,
    initialStatus
}: OrdersListContentProps) {
    // Log when the component renders
    useEffect(() => {
        console.log('OrdersListContent rendered');
    }, []);

    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [filters, setFilters] = useState<{
        restaurantId: string | undefined,
        userId: string | undefined,
        riderId: string | undefined,
        status: string | undefined,
        locationId: string | undefined,
        startDate: string | undefined,
        endDate: string | undefined,
        sortBy: 'created_at' | 'total_amount' | 'estimated_delivery_time',
        sortOrder: 'asc' | 'desc'
    }>({
        restaurantId: initialRestaurantId,
        userId: initialUserId,
        riderId: initialRiderId,
        status: initialStatus,
        locationId: undefined,
        startDate: undefined,
        endDate: undefined,
        sortBy: 'created_at' as const,
        sortOrder: 'desc' as const
    })

    // Update date range filters when dateRange changes
    useEffect(() => {
        if (dateRange?.from) {
            setFilters(prev => ({
                ...prev,
                startDate: dateRange.from?.toISOString(),
                endDate: dateRange.to ? dateRange.to.toISOString() : undefined
            }))
        } else {
            setFilters(prev => ({
                ...prev,
                startDate: undefined,
                endDate: undefined
            }))
        }
    }, [dateRange])

    // Fetch orders with filters
    const {
        orders,
        isLoading,
        error: fetchError,
        updateOrderStatus,
        refetch
    } = useOrders({
        searchTerm,
        ...filters
    })

    // Fetch restaurants for filter dropdown
    const { restaurants } = useRestaurants({
        isActive: true
    })

    // Fetch riders for filter dropdown
    const { users: riders } = useUsers({
        userType: 'delivery_rider'
    })

    // Fetch locations for filter dropdown
    const { locations } = useLocations()

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateOrderStatus.mutateAsync({ id, order_status: status })
            toast.success(`Order status updated to ${status}`)
        } catch (error) {
            toast.error("Failed to update order status")
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">
                        Manage all orders across restaurants
                    </p>
                </div>
                <Button onClick={() => router.push('/admin/orders/new')} className="w-full sm:w-auto">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Create Order
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search orders by ID or address..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="w-full sm:w-auto"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="w-10 sm:w-10 p-0"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="restaurant-filter">Restaurant</Label>
                                        <Select
                                            value={filters.restaurantId || 'all'}
                                            onValueChange={(value) => {
                                                setFilters({
                                                    ...filters,
                                                    restaurantId: value === 'all' ? undefined : value
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="restaurant-filter">
                                                <SelectValue placeholder="All restaurants" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All restaurants</SelectItem>
                                                {restaurants?.map((restaurant) => (
                                                    <SelectItem key={restaurant.id} value={restaurant.id}>
                                                        {restaurant.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status-filter">Status</Label>
                                        <Select
                                            value={filters.status || 'all'}
                                            onValueChange={(value) => {
                                                setFilters({
                                                    ...filters,
                                                    status: value === 'all' ? undefined : value
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="status-filter">
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All statuses</SelectItem>
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

                                    <div className="space-y-2">
                                        <Label htmlFor="rider-filter">Delivery Rider</Label>
                                        <Select
                                            value={filters.riderId || 'all'}
                                            onValueChange={(value) => {
                                                setFilters({
                                                    ...filters,
                                                    riderId: value === 'all' ? undefined : value
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="rider-filter">
                                                <SelectValue placeholder="All riders" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All riders</SelectItem>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {riders?.map((rider) => (
                                                    <SelectItem key={rider.id} value={rider.id}>
                                                        {rider.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location-filter">Delivery Location</Label>
                                        <Select
                                            value={filters.locationId || 'all'}
                                            onValueChange={(value) => {
                                                setFilters({
                                                    ...filters,
                                                    locationId: value === 'all' ? undefined : value
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="location-filter">
                                                <SelectValue placeholder="All locations" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All locations</SelectItem>
                                                {locations?.map((location: any) => (
                                                    <SelectItem key={location.id} value={location.id}>
                                                        {location.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date-filter">Date Range</Label>
                                        <DatePickerWithRange
                                            date={dateRange}
                                            setDate={setDateRange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sort-by">Sort By</Label>
                                        <Select
                                            value={`${filters.sortBy}-${filters.sortOrder}`}
                                            onValueChange={(value) => {
                                                const [sortBy, sortOrder] = value.split('-');
                                                setFilters({
                                                    ...filters,
                                                    sortBy: sortBy as any,
                                                    sortOrder: sortOrder as 'asc' | 'desc'
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="sort-by">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at-desc">Newest First</SelectItem>
                                                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                                                <SelectItem value="total_amount-desc">Price (High to Low)</SelectItem>
                                                <SelectItem value="total_amount-asc">Price (Low to High)</SelectItem>
                                                <SelectItem value="estimated_delivery_time-asc">Delivery Time (Soonest)</SelectItem>
                                                <SelectItem value="estimated_delivery_time-desc">Delivery Time (Latest)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setFilters({
                                                    restaurantId: undefined,
                                                    userId: undefined,
                                                    riderId: undefined,
                                                    status: undefined,
                                                    locationId: undefined,
                                                    startDate: undefined,
                                                    endDate: undefined,
                                                    sortBy: 'created_at',
                                                    sortOrder: 'desc'
                                                });
                                                setDateRange(undefined);
                                            }}
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-0">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : fetchError ? (
                <Card className="bg-destructive/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="font-semibold">Error loading orders</h3>
                        </div>
                        <p className="mt-2">{fetchError.message}</p>
                        <Button className="mt-4" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : orders?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm || Object.values(filters).some(v => v !== undefined)
                                ? 'Try adjusting your search or filters'
                                : 'Get started by creating a new order'}
                        </p>
                        <Button onClick={() => router.push('/admin/orders/new')}>
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Create Order
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {orders?.map((order: any) => (
                        <motion.div key={order.id} variants={itemVariants}>
                            <Card className="overflow-hidden h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1 text-lg">
                                            Order #{order.id.substring(0, 8)}
                                        </CardTitle>
                                        <Badge variant="default">
                                            {getStatusDisplayName(order.order_status)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(order.created_at)}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-2 flex-grow">
                                    <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>

                                    <div className="space-y-1">
                                        {order.restaurant && (
                                            <div className="flex items-center text-sm">
                                                <Building2 className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                                <span className="truncate">{order.restaurant.name}</span>
                                            </div>
                                        )}

                                        {order.user && (
                                            <div className="flex items-center text-sm">
                                                <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                                <span className="truncate">{order.user.full_name}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm">
                                            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                            <span className="truncate">{order.delivery_address}</span>
                                        </div>

                                        {order.delivery_rider ? (
                                            <div className="flex items-center text-sm">
                                                <Bike className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                                <span className="truncate">{order.delivery_rider.full_name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Bike className="h-3.5 w-3.5 mr-1" />
                                                <span>No rider assigned</span>
                                            </div>
                                        )}

                                        {order.estimated_delivery_time && (
                                            <div className="flex items-center text-sm">
                                                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                                <span>Est. delivery: {formatDate(order.estimated_delivery_time)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm font-medium">Items: {order.order_items?.length || 0}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}/edit`)}>
                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                            {order.order_status !== 'pending' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'pending')}>
                                                    Mark as Pending
                                                </DropdownMenuItem>
                                            )}
                                            {order.order_status !== 'confirmed' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'confirmed')}>
                                                    Mark as Confirmed
                                                </DropdownMenuItem>
                                            )}
                                            {order.order_status !== 'preparing' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                                                    Mark as Preparing
                                                </DropdownMenuItem>
                                            )}
                                            {order.order_status !== 'ready_for_pickup' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}>
                                                    Mark as Ready for Pickup
                                                </DropdownMenuItem>
                                            )}
                                            {order.order_status !== 'out_for_delivery' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}>
                                                    Mark as Out for Delivery
                                                </DropdownMenuItem>
                                            )}
                                            {order.order_status !== 'delivered' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                                                    Mark as Delivered
                                                </DropdownMenuItem>
                                            )}
                                            {order.order_status !== 'cancelled' && (
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                >
                                                    Mark as Cancelled
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
} 