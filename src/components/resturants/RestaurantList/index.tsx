/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MapPin,
    Phone,
    Mail,
    Star,
    Edit,
    Eye,
    MoreHorizontal
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'
import { useRestaurants } from '@/services/useRestaurants'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export default function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
    const router = useRouter()
    const { toggleRestaurantStatus, toggleRestaurantFeatured } = useRestaurants()

    // Convert opening hours for display
    const formatOpeningHours = (openingHours: Record<string, any>) => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        const todayHours = openingHours[today]

        if (!todayHours) return 'Hours not available'
        if (todayHours.is_closed) return 'Closed today'

        return `Today: ${todayHours.open} - ${todayHours.close}`
    }

    // Toggle restaurant active status
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleRestaurantStatus.mutateAsync({
                id,
                isActive: !currentStatus
            })

            toast.success(`Restaurant ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        } catch (error) {
            toast.error('Failed to update restaurant status')
            console.error('Toggle Status Error:', error)
        }
    }

    // Toggle restaurant featured status
    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            await toggleRestaurantFeatured.mutateAsync({
                id,
                isFeatured: !currentStatus
            })

            toast.success(`Restaurant ${!currentStatus ? 'featured' : 'unfeatured'} successfully`)
        } catch (error) {
            toast.error('Failed to update featured status')
            console.error('Toggle Featured Error:', error)
        }
    }

    // Handle restaurant edit
    const handleEdit = (id: string) => {
        router.push(`/admin/restaurants/edit/${id}`)
    }

    // Handle restaurant view
    const handleView = (id: string) => {
        router.push(`/admin/restaurants/${id}`)
    }

    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    }

    if (restaurants.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium">No restaurants found</h3>
                <p className="text-muted-foreground mt-1">
                    Try adjusting your filters or add a new restaurant
                </p>
                <Button
                    className="mt-6"
                    onClick={() => router.push('/admin/restaurants/new')}
                >
                    Add Restaurant
                </Button>
            </div>
        )
    }

    return (
        <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={listVariants}
        >
            {restaurants.map((restaurant) => (
                <motion.div key={restaurant.id} variants={itemVariants}>
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="line-clamp-1">{restaurant.name}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleView(restaurant.id)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEdit(restaurant.id)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Restaurant
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleToggleStatus(restaurant.id, restaurant.is_active || false)}
                                        >
                                            <Switch
                                                className="mr-2"
                                                checked={restaurant.is_active || false}
                                                onCheckedChange={() => { }}
                                            />
                                            {restaurant.is_active ? 'Active' : 'Inactive'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleToggleFeatured(restaurant.id, restaurant.is_featured || false)}
                                        >
                                            <Switch
                                                className="mr-2"
                                                checked={restaurant.is_featured || false}
                                                onCheckedChange={() => { }}
                                            />
                                            {restaurant.is_featured ? 'Featured' : 'Not Featured'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">
                                    {restaurant.average_rating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                    ({restaurant.total_orders || 0} orders)
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start">
                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{restaurant.address}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{restaurant.phone_number}</span>
                                </div>
                                {restaurant.email && (
                                    <div className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span className="line-clamp-1">{restaurant.email}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {restaurant.cuisine_types?.map((cuisine, index) => (
                                        <Badge key={index} variant="secondary">
                                            {cuisine}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                                {typeof restaurant.opening_hours === 'object' && restaurant.opening_hours !== null ? formatOpeningHours(restaurant.opening_hours as Record<string, any>) : 'Hours not available'}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(restaurant.id)}
                            >
                                View
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}