'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Search, Upload } from 'lucide-react'
import type { Database } from '@/types/supabase'
import Image from 'next/image'

type FoodCategory = Database['public']['Tables']['food_categories']['Row']
type FoodCategoryInsert = Database['public']['Tables']['food_categories']['Insert']
type FoodCategoryUpdate = Database['public']['Tables']['food_categories']['Update']

export default function FoodCategoriesPage() {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState<FoodCategory | null>(null)
    const [formData, setFormData] = useState<{
        name: string;
        image_url: string | null;
    }>({
        name: '',
        image_url: null,
    })

    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Fetch food categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ['food-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('food_categories')
                .select('*')
                .order('name')

            if (error) throw error
            return data
        }
    })

    // Create category
    const createCategory = useMutation({
        mutationFn: async (newCategory: FoodCategoryInsert) => {
            let finalImageUrl = newCategory.image_url

            // Upload image if selected
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop()
                const filePath = `food-categories/${Math.random().toString(36).substring(2, 15)}.${fileExt}`

                const { error: uploadError} = await supabase.storage
                    .from('menu-images')
                    .upload(filePath, selectedImage)

                if (uploadError) throw uploadError

                // Get the public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('menu-images')
                    .getPublicUrl(filePath)

                finalImageUrl = publicUrl
            }

            // Create the category with image URL
            const { data, error } = await supabase
                .from('food_categories')
                .insert({ ...newCategory, image_url: finalImageUrl })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-categories'] })
            toast.success('Food category created successfully')
            setIsFormOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(`Failed to create food category: ${error.message}`)
        }
    })

    // Update category
    const updateCategory = useMutation({
        mutationFn: async (category: FoodCategoryUpdate) => {
            let finalImageUrl = category.image_url

            // Upload image if selected
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop()
                const filePath = `food-categories/${Math.random().toString(36).substring(2, 15)}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('menu-images')
                    .upload(filePath, selectedImage)

                if (uploadError) throw uploadError

                // Get the public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('menu-images')
                    .getPublicUrl(filePath)

                finalImageUrl = publicUrl
            }

            const { data, error } = await supabase
                .from('food_categories')
                .update({ ...category, image_url: finalImageUrl })
                .eq('id', category.id as string)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-categories'] })
            toast.success('Food category updated successfully')
            setIsFormOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(`Failed to update food category: ${error.message}`)
        }
    })

    // Delete category
    const deleteCategory = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('food_categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-categories'] })
            toast.success('Food category deleted successfully')
            setIsDeleteDialogOpen(false)
            setCurrentCategory(null)
        },
        onError: (error) => {
            toast.error(`Failed to delete food category: ${error.message}`)
        }
    })

    const resetForm = () => {
        setFormData({
            name: '',
            image_url: null,
        })
        setCurrentCategory(null)
        setSelectedImage(null)
        setImagePreview(null)
    }

    const handleEditCategory = (category: FoodCategory) => {
        setCurrentCategory(category)
        setFormData({
            name: category.name,
            image_url: category.image_url,
        })
        setImagePreview(category.image_url)
        setIsFormOpen(true)
    }

    const handleDeleteCategory = (category: FoodCategory) => {
        setCurrentCategory(category)
        setIsDeleteDialogOpen(true)
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (currentCategory) {
            updateCategory.mutate({
                id: currentCategory.id,
                ...formData
            })
        } else {
            createCategory.mutate(formData as FoodCategoryInsert)
        }
    }

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if the file is an image
        if (!file.type.match('image.*')) {
            toast.error('Please select an image file')
            return
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        setSelectedImage(file)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }, [])

    // Filter categories based on search term
    const filteredCategories = categories?.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Food Categories</h1>
                <Button onClick={() => {
                    resetForm()
                    setIsFormOpen(true)
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Food Categories</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            No food categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>
                                                {category.image_url ? (
                                                    <div className="relative h-10 w-10">
                                                        <Image
                                                            src={category.image_url}
                                                            alt={category.name}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No image</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(category.created_at || '').toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditCategory(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCategory(category)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {currentCategory ? 'Edit Food Category' : 'Add Food Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentCategory
                                ? 'Update the details of the food category'
                                : 'Create a new food category for menu items'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Category name"
                                    className="col-span-3"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="image" className="text-right">
                                    Image
                                </Label>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-4 mb-2">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => document.getElementById('image')?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choose Image
                                        </Button>
                                        {selectedImage && (
                                            <span className="text-sm text-muted-foreground">
                                                {selectedImage.name}
                                            </span>
                                        )}
                                    </div>
                                    {imagePreview && (
                                        <div className="relative h-20 w-20 mt-2">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs"
                                                onClick={() => {
                                                    setSelectedImage(null)
                                                    setImagePreview(null)
                                                    setFormData({ ...formData, image_url: null })
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsFormOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                                {createCategory.isPending || updateCategory.isPending ? (
                                    <span>Saving...</span>
                                ) : currentCategory ? (
                                    'Update'
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Food Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this food category?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => currentCategory && deleteCategory.mutate(currentCategory.id)}
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 