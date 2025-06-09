/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    ArrowLeft,
    Utensils,
    Building2,
    Tag,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Clock,
    AlertCircle,
    Pencil
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
import { useMenuItems } from '@/services/useMenuItems'

type MenuItem = Database['public']['Tables']['menu_items']['Row'] & {
    restaurant?: { id: string, name: string } | null,
    category?: { id: string, name: string } | null
}

export default function MenuItemDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const menuItemId = params.id as string
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const supabase = createClientComponentClient<Database>()
    const [localMenuItem, setLocalMenuItem] = useState<MenuItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Custom fetch function with localStorage caching
    const fetchMenuItem = useCallback(async () => {
        try {
            setIsLoading(true)

            // Try to get from localStorage first
            const cachedData = localStorage.getItem(`menu-item-${menuItemId}`)
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData)
                const isStale = Date.now() - timestamp > 5 * 60 * 1000 // 5 minutes

                if (!isStale) {
                    console.log('Using cached menu item data')
                    setLocalMenuItem(data)
                    setIsLoading(false)
                    return
                }
            }

            // Fetch from API if no cache or cache is stale
            console.log('Fetching menu item from API')
            const { data, error } = await supabase
                .from('menu_items')
                .select(`
                    *,
                    restaurant:restaurant_id(id, name),
                    category:category_id(id, name)
                `)
                .eq('id', menuItemId)
                .single()

            if (error) throw error

            // Save to localStorage with timestamp
            localStorage.setItem(`menu-item-${menuItemId}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }))

            setLocalMenuItem(data)
        } catch (err) {
            console.error('Error fetching menu item:', err)
            setError(err instanceof Error ? err : new Error('Failed to fetch menu item'))
        } finally {
            setIsLoading(false)
        }
    }, [menuItemId, supabase])

    // Fetch data on mount
    useEffect(() => {
        fetchMenuItem()
    }, [fetchMenuItem])

    const {
        deleteMenuItem,
        toggleMenuItemAvailability: toggleAvailability,
        toggleMenuItemFeatured: toggleFeatured
    } = useMenuItems()

    const handleDelete = async () => {
        if (!localMenuItem) return

        try {
            await deleteMenuItem.mutateAsync(localMenuItem.id)
            toast.success('Menu item deleted successfully')

            // Remove from localStorage
            localStorage.removeItem(`menu-item-${menuItemId}`)

            router.push('/admin/menu-items')
        } catch (error) {
            toast.error('Failed to delete menu item')
            console.error(error)
        } finally {
            setIsDeleteDialogOpen(false)
        }
    }

    const handleToggleAvailability = async () => {
        if (!localMenuItem) return

        try {
            const updatedItem = await toggleAvailability.mutateAsync({
                id: localMenuItem.id,
                isAvailable: !localMenuItem.is_available
            })

            // Update local state
            setLocalMenuItem(prev => prev ? { ...prev, is_available: !prev.is_available } : null)

            // Update localStorage
            localStorage.setItem(`menu-item-${menuItemId}`, JSON.stringify({
                data: { ...localMenuItem, is_available: !localMenuItem.is_available },
                timestamp: Date.now()
            }))

            toast.success(`Menu item ${!localMenuItem.is_available ? 'enabled' : 'disabled'} successfully`)
        } catch (error) {
            toast.error('Failed to update availability')
            console.error(error)
        }
    }

    const handleToggleFeatured = async () => {
        if (!localMenuItem) return

        try {
            const updatedItem = await toggleFeatured.mutateAsync({
                id: localMenuItem.id,
                isFeatured: !localMenuItem.is_featured
            })

            // Update local state
            setLocalMenuItem(prev => prev ? { ...prev, is_featured: !prev.is_featured } : null)

            // Update localStorage
            localStorage.setItem(`menu-item-${menuItemId}`, JSON.stringify({
                data: { ...localMenuItem, is_featured: !localMenuItem.is_featured },
                timestamp: Date.now()
            }))

            toast.success(`Menu item ${!localMenuItem.is_featured ? 'featured' : 'unfeatured'} successfully`)
        } catch (error) {
            toast.error('Failed to update featured status')
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
                        <h3 className="font-semibold">Error loading menu item</h3>
                    </div>
                    <p className="mt-2">{(error as Error).message}</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/menu-items')}
                        className="mt-4"
                    >
                        Back to Menu Items
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!localMenuItem) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Menu item not found</h3>
                        <p className="text-muted-foreground mt-2">
                            The menu item you're looking for could not be found.
                        </p>
                        <Button
                            onClick={() => router.push('/admin/menu-items')}
                            className="mt-4"
                        >
                            Back to Menu Items
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
                            onClick={() => router.push('/admin/menu-items')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">{localMenuItem.name}</h1>
                        <div>
                            {localMenuItem.is_featured && (
                                <Badge variant="default" className="ml-2">Featured</Badge>
                            )}
                            <Badge
                                variant={localMenuItem.is_available ? "outline" : "secondary"}
                                className="ml-2"
                            >
                                {localMenuItem.is_available ? 'Available' : 'Unavailable'}
                            </Badge>
                        </div>
                    </div>
                    {localMenuItem.restaurant && (
                        <p className="text-muted-foreground flex items-center mt-1">
                            <Building2 className="h-3 w-3 mr-1" />
                            {localMenuItem.restaurant.name}
                        </p>
                    )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={localMenuItem.is_available ? "outline" : "default"}
                        onClick={handleToggleAvailability}
                        disabled={toggleAvailability.isPending}
                        className="flex-1 sm:flex-auto"
                    >
                        {localMenuItem.is_available ? (
                            <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Mark Unavailable
                            </>
                        ) : (
                            <>
                                <Eye className="mr-2 h-4 w-4" />
                                Mark Available
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/menu-items/${localMenuItem.id}/edit`)}
                        className="flex-1 sm:flex-auto"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex-1 sm:flex-auto"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <div className="aspect-video w-full bg-muted relative overflow-hidden">
                        {localMenuItem.image_url ? (
                            <Image
                                src={localMenuItem.image_url}
                                alt={localMenuItem.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <Utensils className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <CardHeader>
                        <CardTitle>{localMenuItem.name}</CardTitle>
                        <CardDescription>
                            {localMenuItem.description || 'No description provided'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="text-2xl font-bold">{formatPrice(localMenuItem.price)}</p>
                            </div>

                            {localMenuItem.preparation_time && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{localMenuItem.preparation_time} min prep time</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {localMenuItem.restaurant && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{localMenuItem.restaurant.name}</span>
                                </Badge>
                            )}

                            {localMenuItem.category && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    <span>{localMenuItem.category.name}</span>
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button
                            variant={localMenuItem.is_featured ? "outline" : "secondary"}
                            onClick={handleToggleFeatured}
                            disabled={toggleFeatured.isPending}
                            className="flex-1"
                        >
                            <Star className="mr-2 h-4 w-4" />
                            {localMenuItem.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="space-y-6">
                    {localMenuItem.customization_options &&
                        Array.isArray(localMenuItem.customization_options) &&
                        localMenuItem.customization_options.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Customization Options</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/admin/menu-items/${localMenuItem.id}/edit`)}
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {localMenuItem.customization_options.map((option: any, index: number) => (
                                    <div key={option.id || index} className="border rounded-md p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">{option.name}</h3>
                                            <div className="flex gap-2">
                                                <Badge variant="outline">
                                                    {option.type === 'single' ? 'Single Select' : 'Multiple Select'}
                                                </Badge>
                                                {option.required && (
                                                    <Badge>Required</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            {option.choices && option.choices.map((choice: any, choiceIndex: number) => (
                                                <div key={choice.id || choiceIndex} className="flex justify-between items-center">
                                                    <span>{choice.name}</span>
                                                    {choice.price_adjustment !== 0 && (
                                                        <Badge variant="outline">
                                                            {choice.price_adjustment > 0 ? '+' : ''}
                                                            {formatPrice(choice.price_adjustment)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customization Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center text-center p-4">
                                    <p className="text-muted-foreground">
                                        No customization options available for this item.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/admin/menu-items/${localMenuItem.id}/edit`)}
                                        className="mt-4"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Add Customization Options
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Item Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                                    <p className="text-2xl font-semibold">{localMenuItem.total_orders || 0}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                                    <div className="flex items-center">
                                        <Star className="h-5 w-5 text-amber-500 mr-1" />
                                        <span className="text-2xl font-semibold">
                                            {localMenuItem.average_rating?.toFixed(1) || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Favorites</p>
                                    <p className="text-2xl font-semibold">{localMenuItem.favorites_count || 0}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Added On</p>
                                    <p className="text-lg font-semibold">
                                        {new Date(localMenuItem.created_at || '').toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{localMenuItem.name}"? This action cannot be undone.
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
                            {deleteMenuItem.isPending ? 'Deleting...' : 'Delete Menu Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}