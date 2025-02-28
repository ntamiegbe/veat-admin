'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Utensils,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    EyeOff,
    AlertCircle,
    Tag,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { useMenuItems } from '@/services/useMenuItems'
import type { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row'] & {
    restaurant?: { id: string, name: string } | null,
    category?: { id: string, name: string } | null
}

interface RestaurantMenuItemsProps {
    restaurantId: string
}

export default function RestaurantMenuItems({ restaurantId }: RestaurantMenuItemsProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Fetch menu items for this restaurant
    const {
        menuItems,
        isLoading,
        fetchError,
        deleteMenuItem,
        toggleAvailability,
        refetch
    } = useMenuItems({
        restaurantId,
        searchTerm,
        isAvailable: undefined, // Show all, regardless of availability
    })

    // Handle delete action
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

    // Handle toggle availability action
    const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
        try {
            await toggleAvailability.mutateAsync({ id, isAvailable: !isAvailable })
            toast.success(`Menu item ${!isAvailable ? 'enabled' : 'disabled'} successfully`)
        } catch (error) {
            toast.error("Failed to update menu item availability")
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Menu Items</CardTitle>
                        <CardDescription>
                            Manage menu items for this restaurant
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push(`/admin/menu-items/new?restaurant=${restaurantId}`)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin/restaurants-categories')}
                        >
                            Manage Categories
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search menu items..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <Card className="bg-destructive/10 border-destructive">
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
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No menu items found</h3>
                            <p className="text-muted-foreground mt-2 max-w-md">
                                {searchTerm ? 'Try adjusting your search' : 'Get started by adding items to your menu'}
                            </p>
                            <Button
                                onClick={() => router.push(`/admin/menu-items/new?restaurant=${restaurantId}`)}
                                className="mt-4"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Menu Item
                            </Button>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {menuItems?.map((item) => (
                                <motion.div key={item.id} variants={itemVariants}>
                                    <Card className="overflow-hidden h-full flex flex-col">
                                        <div className="relative aspect-video w-full bg-muted overflow-hidden">
                                            {item.image_url ? (
                                                <Image
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
                                                {!item.is_available && (
                                                    <Badge variant="secondary">Unavailable</Badge>
                                                )}
                                                {item.is_featured && (
                                                    <Badge variant="default">Featured</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="line-clamp-1 text-lg">{item.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 flex-grow">
                                            <p className="font-semibold text-lg">{formatPrice(item.price)}</p>

                                            {item.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                            )}

                                            {item.category && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />
                                                    <span className="truncate max-w-[100px]">{item.category.name}</span>
                                                </Badge>
                                            )}
                                        </CardContent>
                                        <CardFooter className="border-t pt-4 flex justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/admin/menu-items/${item.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/admin/menu-items/${item.id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleAvailability(item.id, item.is_available || false)}
                                                >
                                                    {item.is_available ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </CardContent>
            </Card>

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