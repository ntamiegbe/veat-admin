/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Building2,
    MapPin,
    Phone,
    Search,
    Star,
    Filter,
    Plus,
    RefreshCcw,
    Eye,
    Edit,
    Trash2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { useRestaurants } from '@/services/useRestaurants'

export default function RestaurantsPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState({
        isActive: true as boolean | null,
        isFeatured: false as boolean | null,
        sortBy: 'created_at',
        sortOrder: 'desc'
    })
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const {
        restaurants,
        isLoading,
        fetchError,
        deleteRestaurant,
        toggleRestaurantStatus,
        toggleRestaurantFeatured,
        refetch
    } = useRestaurants({
        searchTerm,
        isActive: filters.isActive === null ? undefined : filters.isActive,
        isFeatured: filters.isFeatured === null ? undefined : filters.isFeatured,
        sortBy: filters.sortBy as any,
        sortOrder: filters.sortOrder as any
    })

    const handleDelete = async (id: string) => {
        try {
            await deleteRestaurant.mutateAsync(id)
            toast.success("Restaurant deleted successfully")
            setConfirmDeleteId(null)
        } catch (error) {
            toast.error("Failed to delete restaurant")
            console.error(error)
        }
    }

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            await toggleRestaurantStatus.mutateAsync({ id, isActive: !isActive })
            toast.success(`Restaurant ${!isActive ? 'activated' : 'deactivated'} successfully`)
        } catch (error) {
            toast.error("Failed to update restaurant status")
            console.error(error)
        }
    }

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        try {
            await toggleRestaurantFeatured.mutateAsync({ id, isFeatured: !isFeatured })
            toast.success(`Restaurant ${!isFeatured ? 'featured' : 'unfeatured'} successfully`)
        } catch (error) {
            toast.error("Failed to update featured status")
            console.error(error)
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
                    <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
                    <p className="text-muted-foreground">
                        Manage all restaurants on the platform
                    </p>
                </div>
                <Button onClick={() => router.push('/admin/restaurants/new')} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurant
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search restaurants..."
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
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="active-filter"
                                                checked={filters.isActive !== null}
                                                onCheckedChange={(checked) =>
                                                    setFilters(prev => ({ ...prev, isActive: checked ? true : null }))
                                                }
                                            />
                                            <Label htmlFor="active-filter">
                                                {filters.isActive !== null ? 'Show Active Only' : 'Show All Status'}
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="featured-filter"
                                                checked={filters.isFeatured !== null}
                                                onCheckedChange={(checked) =>
                                                    setFilters(prev => ({ ...prev, isFeatured: checked ? true : null }))
                                                }
                                            />
                                            <Label htmlFor="featured-filter">
                                                {filters.isFeatured !== null ? 'Show Featured Only' : 'Show All Visibility'}
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sort-by">Sort By</Label>
                                            <Select
                                                value={filters.sortBy}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                                            >
                                                <SelectTrigger id="sort-by">
                                                    <SelectValue placeholder="Select field" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="name">Name</SelectItem>
                                                    <SelectItem value="created_at">Date Added</SelectItem>
                                                    <SelectItem value="average_rating">Rating</SelectItem>
                                                    <SelectItem value="total_orders">Total Orders</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sort-order">Sort Order</Label>
                                            <Select
                                                value={filters.sortOrder}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}
                                            >
                                                <SelectTrigger id="sort-order">
                                                    <SelectValue placeholder="Select order" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="asc">Ascending</SelectItem>
                                                    <SelectItem value="desc">Descending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-0">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Skeleton className="h-4 w-4 mt-1" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="flex items-start gap-2">
                                    <Skeleton className="h-4 w-4 mt-1" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <div className="flex items-start gap-2">
                                    <Skeleton className="h-4 w-4 mt-1" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
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
                        <p>Error: {fetchError.message}</p>
                        <Button className="mt-4" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : restaurants?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding a new restaurant'}
                        </p>
                        <Button onClick={() => router.push('/admin/restaurants/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Restaurant
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {restaurants?.map((restaurant) => (
                        <motion.div key={restaurant.id} variants={itemVariants}>
                            <Card className="overflow-hidden h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1">{restaurant.name}</CardTitle>
                                        <div className="flex gap-1">
                                            {restaurant.is_featured && (
                                                <Badge variant="default">Featured</Badge>
                                            )}
                                            <Badge variant={restaurant.is_active ? "outline" : "secondary"}>
                                                {restaurant.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 flex-grow">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                        <span className="text-sm line-clamp-2">{restaurant.address}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                        <span className="text-sm">{restaurant.phone_number}</span>
                                    </div>
                                    {restaurant.average_rating !== null && restaurant.average_rating > 0 && (
                                        <div className="flex items-start gap-2">
                                            <Star className="h-4 w-4 text-amber-500 shrink-0 mt-1" />
                                            <span className="text-sm">{restaurant.average_rating.toFixed(1)} rating ({restaurant.total_orders} orders)</span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                More
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/admin/restaurants/${restaurant.id}/edit`)}>
                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => restaurant.is_active !== null && handleToggleStatus(restaurant.id, restaurant.is_active)}>
                                                {restaurant.is_active ? (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-2" /> Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCcw className="h-4 w-4 mr-2" /> Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => restaurant.is_featured !== null && handleToggleFeatured(restaurant.id, restaurant.is_featured)}>
                                                {restaurant.is_featured ? (
                                                    <>
                                                        <Star className="h-4 w-4 mr-2" /> Unfeature
                                                    </>
                                                ) : (
                                                    <>
                                                        <Star className="h-4 w-4 mr-2" /> Feature
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => setConfirmDeleteId(restaurant.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this restaurant? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deleteRestaurant.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                            disabled={deleteRestaurant.isPending}
                        >
                            {deleteRestaurant.isPending ? (
                                <>Deleting...</>
                            ) : (
                                <>Delete</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}