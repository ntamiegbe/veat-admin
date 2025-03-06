/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Utensils,
    Search,
    Filter,
    Plus,
    RefreshCcw,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Building2,
    Tag,
    ChevronDown,
    AlertCircle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { Database } from '@/types/supabase'
import { useMenuItems } from '@/services/useMenuItems'
import { useRestaurants } from '@/services/useRestaurants'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getProxiedImageUrl } from '@/lib/imageUtils'

type MenuItem = Database['public']['Tables']['menu_items']['Row'] & {
    restaurant?: { id: string, name: string } | null,
    category?: { id: string, name: string } | null
}

interface MenuItemsListContentProps {
    initialRestaurantId?: string
}

// Custom Image component with fallback
const ImageWithFallback = ({ src, alt, ...props }: any) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [nextImageFailed, setNextImageFailed] = useState(false);
    const [regularImgFailed, setRegularImgFailed] = useState(false);

    useEffect(() => {
        // Convert Supabase URLs to our proxy URLs
        const proxiedUrl = getProxiedImageUrl(src);
        setImgSrc(proxiedUrl);
        setNextImageFailed(false);
        setRegularImgFailed(false);

    }, [src]);

    // If both image approaches fail, show fallback
    if (!imgSrc || (nextImageFailed && regularImgFailed)) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Utensils className="h-10 w-10 text-muted-foreground" />
            </div>
        );
    }

    // Try Next.js Image first
    if (!nextImageFailed) {
        return (
            <Image
                {...props}
                src={imgSrc}
                alt={alt}
                onError={(e) => {
                    console.error(`Next.js Image failed to load: ${imgSrc}`, e);
                    setNextImageFailed(true);
                }}
                unoptimized
                loading="lazy"
            />
        );
    }

    // If Next.js Image fails, try regular img tag
    return (
        <div className="relative h-full w-full">
            <Image
                src={imgSrc}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`${props.className || ''} object-cover`}
                onError={(e) => {
                    console.error(`Image failed to load: ${imgSrc}`, e);
                }}
            />
        </div>
    );
};

export default function MenuItemsListContent({ initialRestaurantId }: MenuItemsListContentProps) {
    // Log when the component renders
    useEffect(() => {
        console.log('MenuItemsListContent rendered');
    }, []);

    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
    const [filters, setFilters] = useState<{
        restaurantId: string | undefined,
        categoryId: string | undefined,
        isAvailable: boolean | undefined,
        isFeatured: boolean | undefined,
        minPrice: number | undefined,
        maxPrice: number | undefined,
        sortBy: 'name' | 'price' | 'created_at',
        sortOrder: 'asc' | 'desc'
    }>({
        restaurantId: initialRestaurantId,
        categoryId: undefined,
        isAvailable: true,
        isFeatured: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
    })

    // Fetch menu items with filters
    const {
        menuItems,
        isLoading,
        fetchError,
        deleteMenuItem,
        toggleAvailability,
        toggleFeatured,
        refetch
    } = useMenuItems(filters)

    // Fetch restaurants for filter dropdown
    const { restaurants } = useRestaurants({
        isActive: true
    })

    // Fetch categories for filter dropdown
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['menu-categories-simple', filters.restaurantId],
        queryFn: async () => {
            const supabase = createClientComponentClient<Database>()

            let query = supabase
                .from('menu_categories')
                .select('id, name, restaurant_id')
                .order('name')

            if (filters.restaurantId) {
                query = query.eq('restaurant_id', filters.restaurantId)
            }

            const { data, error } = await query

            if (error) throw error
            return data
        },
        enabled: !!filters.restaurantId
    })

    const handleDelete = async () => {
        if (!selectedItem) return

        try {
            await deleteMenuItem.mutateAsync(selectedItem.id)
            toast.success("Menu item deleted successfully")
            setIsDeleteDialogOpen(false)
            setSelectedItem(null)
        } catch (error) {
            toast.error("Failed to delete menu item")
            console.error(error)
        }
    }

    const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
        try {
            await toggleAvailability.mutateAsync({ id, isAvailable: !isAvailable })
            toast.success(`Menu item ${!isAvailable ? 'enabled' : 'disabled'} successfully`)
        } catch (error) {
            toast.error("Failed to update menu item availability")
            console.error(error)
        }
    }

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        try {
            await toggleFeatured.mutateAsync({ id, isFeatured: !isFeatured })
            toast.success(`Menu item ${!isFeatured ? 'featured' : 'unfeatured'} successfully`)
        } catch (error) {
            toast.error("Failed to update featured status")
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
                    <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
                    <p className="text-muted-foreground">
                        Manage all menu items across restaurants
                    </p>
                </div>
                <Button onClick={() => router.push('/admin/menu-items/new')} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search menu items..."
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
                                                    restaurantId: value === 'all' ? undefined : value,
                                                    categoryId: undefined // Reset category when restaurant changes
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
                                        <Label htmlFor="category-filter">Category</Label>
                                        <Select
                                            value={filters.categoryId || 'all'}
                                            onValueChange={(value) => {
                                                setFilters({
                                                    ...filters,
                                                    categoryId: value === 'all' ? undefined : value
                                                });
                                            }}
                                            disabled={!filters.restaurantId || isLoadingCategories}
                                        >
                                            <SelectTrigger id="category-filter">
                                                <SelectValue placeholder={filters.restaurantId ? "All categories" : "Select a restaurant first"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filters.restaurantId && (
                                                    <SelectItem value="all">All categories</SelectItem>
                                                )}
                                                {categories?.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                                <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                                <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                                                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                                                <SelectItem value="created_at-desc">Newest First</SelectItem>
                                                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="available-filter"
                                            checked={filters.isAvailable !== undefined}
                                            onCheckedChange={(checked) =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    isAvailable: checked ? true : undefined
                                                }))
                                            }
                                        />
                                        <Label htmlFor="available-filter">
                                            Show only available items
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="featured-filter"
                                            checked={filters.isFeatured !== undefined}
                                            onCheckedChange={(checked) =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    isFeatured: checked ? true : undefined
                                                }))
                                            }
                                        />
                                        <Label htmlFor="featured-filter">
                                            Show only featured items
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setFilters({
                                                    restaurantId: undefined,
                                                    categoryId: undefined,
                                                    isAvailable: true,
                                                    isFeatured: undefined,
                                                    minPrice: undefined,
                                                    maxPrice: undefined,
                                                    sortBy: 'name',
                                                    sortOrder: 'asc'
                                                });
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
                            <div className="aspect-video w-full bg-muted">
                                <Skeleton className="h-full w-full" />
                            </div>
                            <CardHeader className="pb-0">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-full" />
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
                            <h3 className="font-semibold">Error loading menu items</h3>
                        </div>
                        <p className="mt-2">{fetchError.message}</p>
                        <Button className="mt-4" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : menuItems?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No menu items found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding a new menu item'}
                        </p>
                        <Button onClick={() => router.push('/admin/menu-items/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Menu Item
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
                    {menuItems?.map((item) => (
                        <motion.div key={item.id} variants={itemVariants}>
                            <Card className="overflow-hidden h-full flex flex-col">
                                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                                    {item.image_url ? (
                                        <ImageWithFallback
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Utensils className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {item.is_featured && (
                                            <Badge variant="default">Featured</Badge>
                                        )}
                                        {!item.is_available && (
                                            <Badge variant="secondary">Unavailable</Badge>
                                        )}
                                    </div>
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1 text-lg">{item.name}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 flex-grow">
                                    <p className="font-semibold text-lg">{formatPrice(item.price)}</p>

                                    {item.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {item.restaurant && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                <span className="truncate max-w-[100px]">{item.restaurant.name}</span>
                                            </Badge>
                                        )}

                                        {item.category && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                <span className="truncate max-w-[100px]">{item.category.name}</span>
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin/menu-items/${item.id}`)}
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
                                            <DropdownMenuItem onClick={() => router.push(`/admin/menu-items/${item.id}/edit`)}>
                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => item.is_available !== null && handleToggleAvailability(item.id, item.is_available)}>
                                                {item.is_available ? (
                                                    <>
                                                        <EyeOff className="h-4 w-4 mr-2" /> Mark as Unavailable
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-4 w-4 mr-2" /> Mark as Available
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => item.is_featured !== null && handleToggleFeatured(item.id, item.is_featured)}>
                                                {item.is_featured ? (
                                                    <>
                                                        <Star className="h-4 w-4 mr-2" /> Remove Featured
                                                    </>
                                                ) : (
                                                    <>
                                                        <Star className="h-4 w-4 mr-2" /> Mark as Featured
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => {
                                                    setSelectedItem(item)
                                                    setIsDeleteDialogOpen(true)
                                                }}
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
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{selectedItem?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteMenuItem.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMenuItem.isPending}
                        >
                            {deleteMenuItem.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}