'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import type { Database } from '@/types/supabase'

type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']

export default function AddMenuItemPage() {
    const router = useRouter()
    const { userRestaurants } = useAuth()
    const restaurantId = userRestaurants?.[0]?.id
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<MenuItemInsert>({
        name: '',
        description: '',
        price: 0,
        preparation_time: 0,
        is_available: true,
        is_featured: false,
        restaurant_id: restaurantId || '',
    })

    const { createMenuItem } = useMenuItems({
        restaurantId,
    })

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
            await createMenuItem.mutateAsync(formData)
            toast.success('Menu item created successfully')
            router.push('/restaurant-owner/menu')
        } catch (error) {
            console.error('Error creating menu item:', error)
            toast.error('Failed to create menu item')
        } finally {
            setIsSaving(false)
        }
    }

    if (!restaurantId) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive">
                    You need to create a restaurant first before adding menu items.
                </div>
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
                <h1 className="text-3xl font-bold tracking-tight">Add Menu Item</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Item Information</CardTitle>
                    <CardDescription>
                        Add a new menu item to your restaurant
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
                                Create Item
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 