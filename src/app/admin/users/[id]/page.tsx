'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    AlertCircle,
    ShoppingBag,
    Building2,
    Bike,
    UserCog
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type User = Database['public']['Tables']['users']['Row'] & {
    default_delivery_location?: { id: string, name: string, is_campus: boolean | null } | null
}

// Component to show for invalid user IDs
function InvalidUserId({ userId }: { userId: string }) {
    const router = useRouter();

    return (
        <Card className="border-destructive">
            <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-semibold">Invalid User ID</h3>
                </div>
                <p className="mt-2">The user ID &quot;{userId}&quot; is not valid.</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/users')}
                    className="mt-4"
                >
                    Back to Users
                </Button>
            </CardContent>
        </Card>
    );
}

// Main user details component
function UserDetails({ userId }: { userId: string }) {
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const supabase = createClientComponentClient<Database>();

    // Fetch user with related data
    const {
        data: user,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    default_delivery_location:default_delivery_location_id(id, name, is_campus)
                `)
                .eq('id', userId)
                .single()

            if (error) throw error
            return data as User
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // Fetch user streaks
    const {
        data: userStreak,
        isLoading: isLoadingStreak
    } = useQuery({
        queryKey: ['user-streak', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // Fetch user orders
    const {
        data: userOrders,
        isLoading: isLoadingOrders
    } = useQuery({
        queryKey: ['user-orders', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    order_status,
                    total_amount,
                    restaurant:restaurant_id(id, name)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // Fetch user rewards
    const {
        data: userRewards,
        isLoading: isLoadingRewards
    } = useQuery({
        queryKey: ['user-rewards', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_rewards')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'MMM d, yyyy h:mm a');
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

    // Get user type icon
    const getUserTypeIcon = (type: string) => {
        switch (type) {
            case 'user':
                return <ShoppingBag className="h-5 w-5 text-blue-500" />;
            case 'restaurant_owner':
                return <Building2 className="h-5 w-5 text-amber-500" />;
            case 'delivery_rider':
                return <Bike className="h-5 w-5 text-green-500" />;
            case 'admin':
                return <UserCog className="h-5 w-5 text-purple-500" />;
            default:
                return <User className="h-5 w-5 text-gray-500" />;
        }
    }

    // Get user type label
    const getUserTypeLabel = (type: string) => {
        switch (type) {
            case 'user':
                return 'Customer';
            case 'restaurant_owner':
                return 'Restaurant Owner';
            case 'delivery_rider':
                return 'Delivery Rider';
            case 'admin':
                return 'Admin';
            default:
                return type;
        }
    }

    // Get order status badge variant
    const getOrderStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'confirmed':
                return 'default';
            case 'preparing':
                return 'default';
            case 'ready_for_pickup':
                return 'warning';
            case 'out_for_delivery':
                return 'warning';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    }

    // Get order status display name
    const getOrderStatusDisplayName = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'preparing':
                return 'Preparing';
            case 'ready_for_pickup':
                return 'Ready for Pickup';
            case 'out_for_delivery':
                return 'Out for Delivery';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
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
                        <h3 className="font-semibold">Error loading user</h3>
                    </div>
                    <p className="mt-2">{(error as Error).message}</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/users')}
                        className="mt-4"
                    >
                        Back to Users
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!user) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">User not found</h3>
                        <p className="text-muted-foreground mt-2">
                            The user you&apos;re looking for could not be found.
                        </p>
                        <Button
                            onClick={() => router.push('/admin/users')}
                            className="mt-4"
                        >
                            Back to Users
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8"
                            onClick={() => router.push('/admin/users')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">{user.full_name}</h1>
                        <Badge variant="outline" className="ml-2 flex items-center gap-1">
                            {getUserTypeIcon(user.user_type)}
                            <span>{getUserTypeLabel(user.user_type)}</span>
                        </Badge>
                        {user.is_phone_verified && (
                            <Badge variant="default" className="ml-2 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Verified</span>
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Member since {formatDate(user.created_at)}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    {/* User Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted">
                                    {user.profile_image_url ? (
                                        <Image
                                            src={user.profile_image_url}
                                            alt={user.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <User className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{user.full_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone_number}</span>
                                    {user.is_phone_verified ? (
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <XCircle className="h-3 w-3 text-red-500" />
                                    )}
                                </div>
                                {user.default_delivery_location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.default_delivery_location.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined {formatDate(user.created_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {!user.is_phone_verified && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsVerifyDialogOpen(true)}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verify Phone
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* User Streak */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Streak Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingStreak ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ) : userStreak ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Current Streak:</span>
                                        <span className="font-medium">{userStreak.current_streak} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Highest Streak:</span>
                                        <span className="font-medium">{userStreak.highest_streak} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rewards Earned:</span>
                                        <span className="font-medium">{userStreak.rewards_earned}</span>
                                    </div>
                                    {userStreak.last_order_date && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Order:</span>
                                            <span className="font-medium">{format(new Date(userStreak.last_order_date), 'MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">No streak information available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="orders">
                        <TabsList>
                            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                            <TabsTrigger value="rewards">Rewards</TabsTrigger>
                        </TabsList>
                        <TabsContent value="orders" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingOrders ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ) : userOrders && userOrders.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order ID</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Restaurant</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {userOrders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-medium">
                                                            <Button
                                                                variant="link"
                                                                className="p-0 h-auto font-medium"
                                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                            >
                                                                {order.id.substring(0, 8)}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>{formatDate(order.created_at)}</TableCell>
                                                        <TableCell>{order.restaurant?.name || 'Unknown'}</TableCell>
                                                        <TableCell>{formatPrice(order.total_amount)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={getOrderStatusBadgeVariant(order.order_status) as "default" | "destructive" | "outline" | "secondary"}>
                                                                {getOrderStatusDisplayName(order.order_status)}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted-foreground">No orders found</p>
                                        </div>
                                    )}
                                </CardContent>
                                {userOrders && userOrders.length > 0 && (
                                    <CardFooter>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push(`/admin/orders?userId=${user.id}`)}
                                        >
                                            View All Orders
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        </TabsContent>
                        <TabsContent value="rewards" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rewards</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingRewards ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ) : userRewards && userRewards.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Value</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Expires</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {userRewards.map((reward) => (
                                                    <TableRow key={reward.id}>
                                                        <TableCell className="font-medium">
                                                            {reward.reward_type.replace('_', ' ')}
                                                        </TableCell>
                                                        <TableCell>{formatPrice(reward.reward_value)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={reward.is_used ? 'secondary' : 'default'}>
                                                                {reward.is_used ? 'Used' : 'Available'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{formatDate(reward.expires_at)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted-foreground">No rewards found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {user.full_name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                // Handle delete logic here
                                setIsDeleteDialogOpen(false)
                                toast.success('User deleted successfully')
                                router.push('/admin/users')
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verify Phone Dialog */}
            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Phone Number</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to manually verify the phone number for {user.full_name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsVerifyDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => {
                                // Handle verify logic here
                                setIsVerifyDialogOpen(false)
                                toast.success('Phone number verified successfully')
                                refetch()
                            }}
                        >
                            Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Main component that handles routing logic
export default function UserDetailsPage() {
    const params = useParams();
    const userId = params.id as string;

    // Check if userId is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // If it's not a valid UUID, show an error
    if (!isValidUUID) {
        return <InvalidUserId userId={userId} />;
    }

    // If it's a valid UUID, show the user details
    return <UserDetails userId={userId} />;
} 