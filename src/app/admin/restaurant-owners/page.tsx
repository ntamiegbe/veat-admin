'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Search,
    User,
    Building2,
    CheckCircle,
    XCircle,
    RefreshCcw,
    Eye,
    Mail,
    Phone
} from 'lucide-react'
import type { Database } from '@/types/supabase'

type RestaurantOwner = Database['public']['Tables']['users']['Row'] & {
    restaurants: (Database['public']['Tables']['restaurants']['Row'] & {
        location: {
            id: string;
            name: string;
            is_campus: boolean | null;
        } | null;
    })[]
}

export default function RestaurantOwnersPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const supabase = createClientComponentClient<Database>()

    // Fetch restaurant owners
    const { data: restaurantOwners, isLoading, error, refetch } = useQuery({
        queryKey: ['restaurant-owners'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select(`
          *,
          restaurants:restaurants(
            *,
            location:location_id(
              id,
              name,
              is_campus
            )
          )
        `)
                .eq('user_type', 'restaurant_owner')

            if (error) throw error

            return data as RestaurantOwner[]
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Approve restaurant mutation
    const approveRestaurant = useMutation({
        mutationFn: async (restaurantId: string) => {
            const { error } = await supabase
                .from('restaurants')
                .update({ is_active: true })
                .eq('id', restaurantId)

            if (error) throw error

            return restaurantId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant-owners'] })
            toast.success('Restaurant approved successfully')
        },
        onError: (error) => {
            console.error('Error approving restaurant:', error)
            toast.error('Failed to approve restaurant')
        }
    })

    // Reject restaurant mutation
    const rejectRestaurant = useMutation({
        mutationFn: async (restaurantId: string) => {
            const { error } = await supabase
                .from('restaurants')
                .update({ is_active: false })
                .eq('id', restaurantId)

            if (error) throw error

            return restaurantId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant-owners'] })
            toast.success('Restaurant rejected')
        },
        onError: (error) => {
            console.error('Error rejecting restaurant:', error)
            toast.error('Failed to reject restaurant')
        }
    })

    // Filter restaurant owners based on search term and active tab
    const filteredOwners = restaurantOwners?.filter(owner => {
        const matchesSearch =
            owner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            owner.restaurants.some(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))

        if (activeTab === 'all') return matchesSearch
        if (activeTab === 'pending') return matchesSearch && owner.restaurants.some(r => r.is_active === false)
        if (activeTab === 'approved') return matchesSearch && owner.restaurants.some(r => r.is_active === true)

        return matchesSearch
    })

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Restaurant Owners</h1>
                    <Button onClick={() => refetch()}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </div>
                <Card className="bg-destructive/10">
                    <CardContent className="pt-6">
                        <p>Error: {error instanceof Error ? error.message : 'Failed to load restaurant owners'}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Restaurant Owners</h1>
                    <p className="text-muted-foreground">
                        Manage restaurant owners and approve their restaurants
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="w-full sm:w-auto"
                >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by name, email, or restaurant..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Owners</TabsTrigger>
                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    {renderOwnersList(filteredOwners, isLoading)}
                </TabsContent>

                <TabsContent value="pending" className="mt-4">
                    {renderOwnersList(filteredOwners, isLoading)}
                </TabsContent>

                <TabsContent value="approved" className="mt-4">
                    {renderOwnersList(filteredOwners, isLoading)}
                </TabsContent>
            </Tabs>
        </div>
    )

    function renderOwnersList(owners: RestaurantOwner[] | undefined, isLoading: boolean) {
        if (isLoading) {
            return (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-60" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 w-24" />
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
        }

        if (!owners || owners.length === 0) {
            return (
                <Card>
                    <CardContent className="p-6 text-center">
                        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No restaurant owners found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? 'Try adjusting your search' : 'There are no restaurant owners to display'}
                        </p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="grid gap-4">
                {owners.map((owner) => (
                    <Card key={owner.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold">
                                    {owner.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'RO'}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-medium">{owner.full_name}</h3>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {owner.email}
                                        </div>
                                        {owner.phone_number && (
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-1" />
                                                {owner.phone_number}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-2">Restaurants:</h4>
                                        <div className="space-y-2">
                                            {owner.restaurants.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No restaurants</p>
                                            ) : (
                                                owner.restaurants.map((restaurant) => (
                                                    <div key={restaurant.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-md bg-muted/50">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">{restaurant.name}</span>
                                                                <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                                                                    {restaurant.is_active ? 'Approved' : 'Pending'}
                                                                </Badge>
                                                                {restaurant.location?.is_campus && (
                                                                    <Badge variant="outline">Campus</Badge>
                                                                )}
                                                            </div>
                                                            {restaurant.address && (
                                                                <p className="text-xs text-muted-foreground ml-6">{restaurant.address}</p>
                                                            )}
                                                            {restaurant.location && (
                                                                <p className="text-xs text-muted-foreground ml-6">
                                                                    Location: {restaurant.location.name}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2 ml-6 sm:ml-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>

                                                            {!restaurant.is_active ? (
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() => approveRestaurant.mutate(restaurant.id)}
                                                                    disabled={approveRestaurant.isPending}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => rejectRestaurant.mutate(restaurant.id)}
                                                                    disabled={rejectRestaurant.isPending}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }
} 