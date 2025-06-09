/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { useStorage } from './useStorage'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

type MenuItemFilters = {
    restaurantId?: string
    categoryId?: string
    foodCategoryId?: string
    searchTerm?: string
    isAvailable?: boolean
    isFeatured?: boolean
    sortBy?: 'name' | 'price' | 'created_at' | 'average_rating' | 'total_orders'
    sortOrder?: 'asc' | 'desc'
    limit?: number
}

export function useMenuItems(filters?: MenuItemFilters) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const { uploadFile } = useStorage()
    const defaultFilters: MenuItemFilters = {
        searchTerm: '',
        isAvailable: undefined,
        isFeatured: undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: undefined,
        ...filters
    }

    // Fetch menu items with filters
    const {
        data: menuItems,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['menuItems', defaultFilters],
        queryFn: async () => {
            let query = supabase
                .from('menu_items')
                .select(`
                    *,
                    food_categories (
                        id,
                        name
                    ),
                    menu_categories (
                        id,
                        name
                    )
                `)

            // Apply restaurant filter
            if (defaultFilters.restaurantId) {
                query = query.eq('restaurant_id', defaultFilters.restaurantId)
            }

            // Apply category filters
            if (defaultFilters.categoryId) {
                query = query.eq('category_id', defaultFilters.categoryId)
            }

            if (defaultFilters.foodCategoryId) {
                query = query.eq('food_category_id', defaultFilters.foodCategoryId)
            }

            // Apply availability filter
            if (defaultFilters.isAvailable !== undefined) {
                query = query.eq('is_available', defaultFilters.isAvailable)
            }

            // Apply featured filter
            if (defaultFilters.isFeatured !== undefined) {
                query = query.eq('is_featured', defaultFilters.isFeatured)
            }

            // Apply search
            if (defaultFilters.searchTerm) {
                query = query.ilike('name', `%${defaultFilters.searchTerm}%`)
            }

            // Apply sorting
            if (defaultFilters.sortBy) {
                query = query.order(defaultFilters.sortBy, {
                    ascending: defaultFilters.sortOrder === 'asc'
                })
            }

            // Apply limit
            if (defaultFilters.limit) {
                query = query.limit(defaultFilters.limit)
            }

            const { data, error } = await query

            if (error) throw error
            return data
        }
    })

    // Get menu item by ID
    const getMenuItemById = async (id: string) => {
        const { data, error } = await supabase
            .from('menu_items')
            .select(`
                *,
                food_categories (
                    id,
                    name
                ),
                menu_categories (
                    id,
                    name
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    // Create menu item
    const createMenuItem = useMutation<MenuItem, PostgrestError, MenuItemInsert>({
        mutationFn: async (newMenuItem: MenuItemInsert) => {
            const { data, error } = await supabase
                .from('menu_items')
                .insert(newMenuItem)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('No data returned from creation')

            return data
        },
        onSuccess: (newMenuItem) => {
            queryClient.setQueryData<MenuItem[]>(['menuItems', defaultFilters], (old) =>
                old ? [newMenuItem, ...old] : [newMenuItem]
            )
        }
    })

    // Update menu item
    const updateMenuItem = useMutation<MenuItem, PostgrestError, MenuItemUpdate>({
        mutationFn: async (updatedMenuItem: MenuItemUpdate) => {
            const { data, error } = await supabase
                .from('menu_items')
                .update(updatedMenuItem)
                .eq('id', updatedMenuItem.id as string)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('No data returned from update')

            return data
        },
        onSuccess: (updatedMenuItem) => {
            queryClient.setQueryData<MenuItem[]>(['menuItems', defaultFilters], (old) => {
                if (!old) return [updatedMenuItem]
                return old.map(item =>
                    item.id === updatedMenuItem.id ? updatedMenuItem : item
                )
            })
        }
    })

    // Delete menu item
    const deleteMenuItem = useMutation<string, PostgrestError, string>({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: (id) => {
            queryClient.setQueryData<MenuItem[]>(['menuItems', defaultFilters], (old) => {
                if (!old) return []
                return old.filter(item => item.id !== id)
            })
        }
    })

    // Toggle menu item availability
    const toggleMenuItemAvailability = useMutation<MenuItem, PostgrestError, { id: string, isAvailable: boolean }>({
        mutationFn: async ({ id, isAvailable }) => {
            const { data, error } = await supabase
                .from('menu_items')
                .update({ is_available: isAvailable })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('No data returned from update')

            return data
        },
        onSuccess: (updatedMenuItem) => {
            queryClient.setQueryData<MenuItem[]>(['menuItems', defaultFilters], (old) => {
                if (!old) return [updatedMenuItem]
                return old.map(item =>
                    item.id === updatedMenuItem.id ? updatedMenuItem : item
                )
            })
        }
    })

    // Toggle menu item featured status
    const toggleMenuItemFeatured = useMutation<MenuItem, PostgrestError, { id: string, isFeatured: boolean }>({
        mutationFn: async ({ id, isFeatured }) => {
            const { data, error } = await supabase
                .from('menu_items')
                .update({ is_featured: isFeatured })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('No data returned from update')

            return data
        },
        onSuccess: (updatedMenuItem) => {
            queryClient.setQueryData<MenuItem[]>(['menuItems', defaultFilters], (old) => {
                if (!old) return [updatedMenuItem]
                return old.map(item =>
                    item.id === updatedMenuItem.id ? updatedMenuItem : item
                )
            })
        }
    })

    // Upload menu item image using our fixed storage service
    const uploadImage = async (file: File, path: string) => {
        try {
            return await uploadFile(file, 'menu-images', path)
        } catch (error) {
            console.error('Error in uploadImage:', error)
            throw error
        }
    }

    return {
        menuItems,
        isLoading,
        fetchError,
        getMenuItemById,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        toggleMenuItemFeatured,
        uploadImage,
        refetch
    }
}