/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import type { Database } from '@/types/supabase'

type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuCategoryInsert = Database['public']['Tables']['menu_categories']['Insert']
type MenuCategoryUpdate = Database['public']['Tables']['menu_categories']['Update']

export default function RestaurantCategoriesPage() {
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState<MenuCategory | null>(null)
    const [formData, setFormData] = useState<{
        name: string;
        description: string | null;
        restaurant_id: string | null;
        display_order: number;
    }>({
        name: '',
        description: null,
        restaurant_id: null,
        display_order: 0
    })

    // Fetch categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ['menu-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('menu_categories')
                .select('*, restaurants(name)')
                .order('name')

            if (error) throw error
            return data
        }
    })

    // Fetch restaurants for dropdown
    const { data: restaurants } = useQuery({
        queryKey: ['restaurants-simple'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name')
                .order('name')

            if (error) throw error
            return data
        }
    })

    // Create category
    const createCategory = useMutation({
        mutationFn: async (newCategory: MenuCategoryInsert) => {
            const { data, error } = await supabase
                .from('menu_categories')
                .insert(newCategory)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
            toast.success('Category created successfully')
            setIsFormOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(`Failed to create category: ${error.message}`)
        }
    })

    // Update category
    const updateCategory = useMutation({
        mutationFn: async (category: MenuCategoryUpdate) => {
            const { data, error } = await supabase
                .from('menu_categories')
                .update(category)
                .eq('id', category.id as string)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
            toast.success('Category updated successfully')
            setIsFormOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(`Failed to update category: ${error.message}`)
        }
    })

    // Delete category
    const deleteCategory = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('menu_categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
            toast.success('Category deleted successfully')
            setIsDeleteDialogOpen(false)
            setCurrentCategory(null)
        },
        onError: (error) => {
            toast.error(`Failed to delete category: ${error.message}`)
        }
    })

    const resetForm = () => {
        setFormData({
            name: '',
            description: null,
            restaurant_id: null,
            display_order: 0
        })
        setCurrentCategory(null)
    }

    const handleEditCategory = (category: MenuCategory) => {
        setCurrentCategory(category)
        setFormData({
            name: category.name,
            description: category.description,
            restaurant_id: category.restaurant_id,
            display_order: category.display_order || 0
        })
        setIsFormOpen(true)
    }

    const handleDeleteCategory = (category: MenuCategory) => {
        setCurrentCategory(category)
        setIsDeleteDialogOpen(true)
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.restaurant_id) {
            toast.error('Please select a restaurant')
            return
        }

        if (currentCategory) {
            updateCategory.mutate({
                id: currentCategory.id,
                ...formData,
                restaurant_id: formData.restaurant_id || undefined
            })
        } else {
            createCategory.mutate(formData as MenuCategoryInsert)
        }
    }

    // Filter categories based on search term
    const filteredCategories = categories?.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (category.restaurants as any)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Restaurant Categories</h1>
                    <p className="text-muted-foreground">
                        Manage food categories for restaurants
                    </p>
                </div>
                <Button onClick={() => {
                    resetForm()
                    setIsFormOpen(true)
                }} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/restaurants')}
                    className="w-full sm:w-auto"
                >
                    Back to Restaurants
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : filteredCategories?.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            {searchTerm ? 'No categories found matching your search' : 'No categories yet. Add one to get started.'}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Restaurant</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories?.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{(category.restaurants as any)?.name || 'Unknown'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{category.description || 'No description'}</TableCell>
                                            <TableCell>{category.display_order || 0}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Category Dialog */}
            <Dialog open={isFormOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsFormOpen(open);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        <DialogDescription>
                            {currentCategory
                                ? 'Update this menu category for the restaurant'
                                : 'Create a new menu category for a restaurant'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="restaurant" className="block text-sm font-medium">
                                Restaurant <span className="text-destructive">*</span>
                            </label>
                            <select
                                id="restaurant"
                                value={formData.restaurant_id || ''}
                                onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value || null })}
                                className="w-full p-2 border rounded-md"
                                required
                            >
                                <option value="">Select a restaurant</option>
                                {restaurants?.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium">
                                Category Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Appetizers, Main Course, Desserts"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium">
                                Description
                            </label>
                            <Input
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                                placeholder="Short description of this category"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="display_order" className="block text-sm font-medium">
                                Display Order
                            </label>
                            <Input
                                id="display_order"
                                type="number"
                                min="0"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                placeholder="Order in which to display this category"
                            />
                            <p className="text-xs text-muted-foreground">
                                Categories are sorted from lowest to highest value
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                resetForm();
                                setIsFormOpen(false);
                            }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                                {createCategory.isPending || updateCategory.isPending
                                    ? 'Saving...'
                                    : currentCategory ? 'Update Category' : 'Create Category'
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the &quot;{currentCategory?.name}&quot; category?
                            This may affect menu items associated with this category.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteCategory.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => currentCategory && deleteCategory.mutate(currentCategory.id)}
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending ? 'Deleting...' : 'Delete Category'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}