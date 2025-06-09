'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/services/useAuth'
import { useMenuItems } from '@/services/useMenuItems'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import type { Database } from '@/types/supabase'

type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export default function EditMenuItemPage() {
    const params = useParams()
    const router = useRouter()
    const menuItemId = params.id as string
    const { userRestaurants } = useAuth()
    const restaurantId = userRestaurants?.[0]?.id
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<MenuItemUpdate>({
        name: '',
        description: '',
        price: 0,
        preparation_time: 0,
        is_available: true,
        is_featured: false,
        restaurant_id: restaurantId || '',
    })

    const { getMenuItemById, updateMenuItem } = useMenuItems({
        restaurantId,
    })

    // Fetch menu item data
    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                const data = await getMenuItemById(menuItemId)
                if (data) {
                    setFormData({
                        id: data.id,
                        name: data.name,
                        description: data.description || '',
                        price: data.price,
                        preparation_time: data.preparation_time || 0,
                        is_available: data.is_available || false,
                        is_featured: data.is_featured || false,
                        restaurant_id: data.restaurant_id,
                    })
                }
            } catch (error) {
                console.error('Error fetching menu item:', error)
                toast.error('Failed to load menu item data')
            } finally {
                setIsLoading(false)
            }
        }

        if (menuItemId !== 'new') {
            fetchMenuItem()
        } else {
            setIsLoading(false)
        }
    }, [menuItemId, getMenuItemById])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleNumericChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string
    ) => {
        const value = parseFloat(e.target.value) || 0
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSwitchChange = (field: 'is_available' | 'is_featured') => (
        checked: boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: checked,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            await updateMenuItem.mutateAsync(formData)
            toast.success('Menu item updated successfully')
            router.push('/restaurant-owner/menu')
        } catch (error) {
            console.error('Error updating menu item:', error)
            toast.error('Failed to update menu item')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push('/restaurant-owner/menu')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {menuItemId === 'new' ? 'Add Menu Item' : 'Edit Menu Item'}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Item Information</CardTitle>
                    <CardDescription>
                        {menuItemId === 'new'
                            ? 'Add a new menu item to your restaurant'
                            : 'Update your menu item details'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="menu-item-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Item Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter item name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                placeholder="Brief description of the menu item"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Price ($) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleNumericChange(e, 'price')}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preparation_time">
                                    Preparation Time (minutes)
                                </Label>
                                <Input
                                    id="preparation_time"
                                    type="number"
                                    min="0"
                                    value={formData.preparation_time || 0}
                                    onChange={(e) =>
                                        handleNumericChange(e, 'preparation_time')
                                    }
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_available">Availability</Label>
                                <p className="text-sm text-muted-foreground">
                                    Unavailable items won&apos;t be shown to customers
                                </p>
                            </div>
                            <Switch
                                id="is_available"
                                checked={formData.is_available ?? false}
                                onCheckedChange={handleSwitchChange('is_available')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_featured">Featured Item</Label>
                                <p className="text-sm text-muted-foreground">
                                    Featured items appear at the top of the menu
                                </p>
                            </div>
                            <Switch
                                id="is_featured"
                                checked={formData.is_featured ?? false}
                                onCheckedChange={handleSwitchChange('is_featured')}
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/restaurant-owner/menu')}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" form="menu-item-form" disabled={isSaving}>
                        {isSaving ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 