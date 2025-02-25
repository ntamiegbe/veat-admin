/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/menu-items/MenuItemForm.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
    Utensils,
    Save,
    Loader2,
    ArrowLeft,
    X,
    Plus,
    Minus,
    Tag,
    Building2,
    Image as ImageIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { useRestaurants } from '@/services/useRestaurants'
import { useMenuItems } from '@/services/useMenuItems'
import { useQuery } from '@tanstack/react-query'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
// type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

type CustomizationOption = {
    id: string;
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    choices: Array<{
        id: string;
        name: string;
        price_adjustment: number;
    }>;
}

interface MenuItemFormProps {
    menuItem?: MenuItem;
    restaurantId?: string;
}

export default function MenuItemForm({ menuItem, restaurantId: initialRestaurantId }: MenuItemFormProps) {
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isEditMode = !!menuItem

    // Get restaurants for selection
    const { restaurants, isLoading: isLoadingRestaurants } = useRestaurants()

    // State for restaurant and category selection
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
        initialRestaurantId || menuItem?.restaurant_id || null
    )

    // Get categories for the selected restaurant
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['menu-categories', selectedRestaurantId],
        queryFn: async () => {
            if (!selectedRestaurantId) return []

            const { data, error } = await supabase
                .from('menu_categories')
                .select('*')
                .eq('restaurant_id', selectedRestaurantId)
                .order('display_order', { ascending: true })

            if (error) throw error
            return data
        },
        enabled: !!selectedRestaurantId
    })

    // Restaurant operations
    const { createMenuItem, updateMenuItem, uploadImage } = useMenuItems()

    // Form state with all menu item fields
    const [formData, setFormData] = useState<{
        name: string;
        description: string | null;
        price: number;
        restaurant_id: string | null;
        category_id: string | null;
        image_url: string | null;
        is_available: boolean;
        is_featured: boolean;
        preparation_time: number | null;
        customization_options: CustomizationOption[];
    }>({
        name: '',
        description: null,
        price: 0,
        restaurant_id: initialRestaurantId || null,
        category_id: null,
        image_url: null,
        is_available: true,
        is_featured: false,
        preparation_time: 15,
        customization_options: []
    })

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Fill form with menu item data if in edit mode
    useEffect(() => {
        if (isEditMode && menuItem) {
            setFormData({
                name: menuItem.name,
                description: menuItem.description,
                price: menuItem.price,
                restaurant_id: menuItem.restaurant_id,
                category_id: menuItem.category_id,
                image_url: menuItem.image_url,
                is_available: menuItem.is_available ?? true,
                is_featured: menuItem.is_featured ?? false,
                preparation_time: menuItem.preparation_time,
                customization_options: menuItem.customization_options ?
                    JSON.parse(JSON.stringify(menuItem.customization_options)) : []
            })

            if (menuItem.image_url) {
                setImagePreview(menuItem.image_url)
            }
        }
    }, [isEditMode, menuItem])

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle numeric input changes with validation
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = e.target.value
        if (value === '') {
            setFormData(prev => ({
                ...prev,
                [field]: field === 'price' ? 0 : null
            }))
            return
        }

        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
            setFormData(prev => ({
                ...prev,
                [field]: numValue
            }))
        }
    }

    // Handle toggle changes
    const handleToggleChange = (field: 'is_available' | 'is_featured') => (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    // Handle restaurant selection
    const handleRestaurantChange = (restaurantId: string) => {
        setSelectedRestaurantId(restaurantId)
        setFormData(prev => ({
            ...prev,
            restaurant_id: restaurantId,
            // Reset category when restaurant changes
            category_id: null
        }))
    }

    // Handle category selection
    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            category_id: categoryId || null
        }))
    }

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB')
            return
        }

        setImageFile(file)

        // Create a preview
        const reader = new FileReader()
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    // Remove selected image
    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(formData.image_url)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Reset image to original
    const handleResetImage = () => {
        setImageFile(null)
        setImagePreview(menuItem?.image_url || null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Customization options management
    const addCustomizationOption = () => {
        const newOption: CustomizationOption = {
            id: `option-${Date.now()}`,
            name: '',
            type: 'single',
            required: false,
            choices: [
                {
                    id: `choice-${Date.now()}`,
                    name: '',
                    price_adjustment: 0
                }
            ]
        }

        setFormData(prev => ({
            ...prev,
            customization_options: [...prev.customization_options, newOption]
        }))
    }

    const removeCustomizationOption = (optionId: string) => {
        setFormData(prev => ({
            ...prev,
            customization_options: prev.customization_options.filter(
                option => option.id !== optionId
            )
        }))
    }

    const updateCustomizationOption = (
        optionId: string,
        field: keyof CustomizationOption,
        value: any
    ) => {
        setFormData(prev => ({
            ...prev,
            customization_options: prev.customization_options.map(option =>
                option.id === optionId ? { ...option, [field]: value } : option
            )
        }))
    }

    const addChoice = (optionId: string) => {
        setFormData(prev => ({
            ...prev,
            customization_options: prev.customization_options.map(option => {
                if (option.id === optionId) {
                    return {
                        ...option,
                        choices: [
                            ...option.choices,
                            {
                                id: `choice-${Date.now()}`,
                                name: '',
                                price_adjustment: 0
                            }
                        ]
                    }
                }
                return option
            })
        }))
    }

    const removeChoice = (optionId: string, choiceId: string) => {
        setFormData(prev => ({
            ...prev,
            customization_options: prev.customization_options.map(option => {
                if (option.id === optionId) {
                    return {
                        ...option,
                        choices: option.choices.filter(choice => choice.id !== choiceId)
                    }
                }
                return option
            })
        }))
    }

    const updateChoice = (
        optionId: string,
        choiceId: string,
        field: string,
        value: any
    ) => {
        setFormData(prev => ({
            ...prev,
            customization_options: prev.customization_options.map(option => {
                if (option.id === optionId) {
                    return {
                        ...option,
                        choices: option.choices.map(choice => {
                            if (choice.id === choiceId) {
                                return { ...choice, [field]: value }
                            }
                            return choice
                        })
                    }
                }
                return option
            })
        }))
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.restaurant_id) {
            toast.error('Please select a restaurant')
            return
        }

        if (formData.price <= 0) {
            toast.error('Price must be greater than zero')
            return
        }

        try {
            // Upload image if new file is selected
            let finalImageUrl = formData.image_url

            if (imageFile) {
                setIsUploading(true)
                const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`
                const filePath = `menu-items/${formData.restaurant_id}/${fileName}`

                try {
                    finalImageUrl = await uploadImage(imageFile, filePath)
                } catch (error) {
                    console.error('Image upload error:', error)
                    toast.error('Failed to upload image')
                    setIsUploading(false)
                    return
                } finally {
                    setIsUploading(false)
                }
            }

            // Prepare data for save
            const menuItemData = {
                ...formData,
                image_url: finalImageUrl,
                price: Number(formData.price)
            }

            if (isEditMode && menuItem) {
                await updateMenuItem.mutateAsync({
                    id: menuItem.id,
                    ...menuItemData,
                    restaurant_id: menuItemData.restaurant_id || undefined
                })
                toast.success('Menu item updated successfully')
            } else {
                await createMenuItem.mutateAsync(menuItemData as MenuItemInsert)
                toast.success('Menu item created successfully')
            }

            // Navigate back to menu items list
            router.push('/admin/menu-items')
        } catch (error) {
            console.error('Save error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save menu item')
        }
    }

    const isPending = createMenuItem.isPending || updateMenuItem.isPending || isUploading

    // Format currency input for price display
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Menu Item' : 'New Menu Item'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isEditMode
                            ? 'Update menu item information'
                            : 'Add a new item to your menu'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name <span className="text-destructive">*</span></Label>
                                <div className="flex items-center">
                                    <Utensils className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter menu item name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Item description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₦) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="50"
                                    placeholder="Item price"
                                    value={formData.price}
                                    onChange={(e) => handleNumericChange(e, 'price')}
                                    required
                                    disabled={isPending}
                                />
                                {formData.price > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Formatted: {formatCurrency(formData.price)}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preparation_time">Preparation Time (minutes)</Label>
                                <Input
                                    id="preparation_time"
                                    type="number"
                                    min="1"
                                    placeholder="Preparation time in minutes"
                                    value={formData.preparation_time || ''}
                                    onChange={(e) => handleNumericChange(e, 'preparation_time')}
                                    disabled={isPending}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Restaurant & Category</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_id">Restaurant <span className="text-destructive">*</span></Label>
                                    <div className="flex items-center">
                                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {isLoadingRestaurants ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
                                            <Select
                                                value={formData.restaurant_id || ''}
                                                onValueChange={handleRestaurantChange}
                                                disabled={isPending || isEditMode} // Disable in edit mode
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a restaurant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {restaurants?.map(restaurant => (
                                                        <SelectItem key={restaurant.id} value={restaurant.id}>
                                                            {restaurant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    {isEditMode && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Restaurant cannot be changed after creation
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <div className="flex items-center">
                                        <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {isLoadingCategories || !formData.restaurant_id ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
                                            <Select
                                                value={formData.category_id || ''}
                                                onValueChange={handleCategoryChange}
                                                disabled={isPending || !formData.restaurant_id}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">No Category</SelectItem>
                                                    {categories?.map(category => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    {!formData.restaurant_id && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Select a restaurant first to see available categories
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_available">Availability</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Unavailable items are hidden from customers
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_available"
                                        checked={formData.is_available}
                                        onCheckedChange={handleToggleChange('is_available')}
                                        disabled={isPending}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_featured">Featured Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Featured items appear at the top of the menu
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onCheckedChange={handleToggleChange('is_featured')}
                                        disabled={isPending}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Menu Item Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <div className="border rounded-md p-4">
                                    <div className="flex items-center justify-center aspect-video bg-muted rounded-md relative overflow-hidden">
                                        {imagePreview ? (
                                            <>
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={imageFile ? handleRemoveImage : () => setFormData(prev => ({ ...prev, image_url: null }))}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <ImageIcon className="h-10 w-10 mb-2" />
                                                <p className="text-sm">No image selected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="image" className="block mb-2">Upload Image</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="image"
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            disabled={isPending}
                                            className="flex-1"
                                        />
                                        {isEditMode && formData.image_url && imageFile && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResetImage}
                                                disabled={isPending}
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recommended size: 800x600px. Max file size: 2MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Customization Options</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomizationOption}
                            disabled={isPending}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {formData.customization_options.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No customization options added yet. Add options to let customers customize this item.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.customization_options.map((option, index) => (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border rounded-md p-4"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-medium">Option {index + 1}</h3>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCustomizationOption(option.id)}
                                                disabled={isPending}
                                                className="h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Option Name</Label>
                                                <Input
                                                    value={option.name}
                                                    onChange={(e) => updateCustomizationOption(option.id, 'name', e.target.value)}
                                                    placeholder="e.g., Toppings, Size, etc."
                                                    disabled={isPending}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Selection Type</Label>
                                                <Select
                                                    value={option.type}
                                                    onValueChange={(value) => updateCustomizationOption(option.id, 'type', value)}
                                                    disabled={isPending}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single Selection</SelectItem>
                                                        <SelectItem value="multiple">Multiple Selection</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`required-${option.id}`}
                                                    checked={option.required}
                                                    onCheckedChange={(checked) => updateCustomizationOption(option.id, 'required', checked)}
                                                    disabled={isPending}
                                                />
                                                <Label htmlFor={`required-${option.id}`}>Required</Label>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Label className="mb-2 block">Choices</Label>
                                            <div className="space-y-2">
                                                {option.choices.map((choice, choiceIndex) => (
                                                    <div key={choice.id} className="flex items-center gap-2">
                                                        <Input
                                                            value={choice.name}
                                                            onChange={(e) => updateChoice(option.id, choice.id, 'name', e.target.value)}
                                                            placeholder="Choice name"
                                                            disabled={isPending}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={choice.price_adjustment}
                                                            onChange={(e) => updateChoice(
                                                                option.id,
                                                                choice.id,
                                                                'price_adjustment',
                                                                parseFloat(e.target.value) || 0
                                                            )}
                                                            placeholder="Price adjustment"
                                                            disabled={isPending}
                                                            className="w-24"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeChoice(option.id, choice.id)}
                                                            disabled={isPending || option.choices.length <= 1}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addChoice(option.id)}
                                                disabled={isPending}
                                                className="mt-2"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Choice
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardFooter className="flex justify-between pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isUploading ? 'Uploading...' : isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditMode ? 'Update Menu Item' : 'Create Menu Item'}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}