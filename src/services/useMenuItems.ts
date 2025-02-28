import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { useStorage } from './useStorage'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

type MenuItemFilters = {
    searchTerm?: string
    restaurantId?: string
    categoryId?: string
    isAvailable?: boolean
    isFeatured?: boolean
    minPrice?: number
    maxPrice?: number
    sortBy?: 'name' | 'price' | 'created_at' | 'total_orders' | 'average_rating'
    sortOrder?: 'asc' | 'desc'
}

export function useMenuItems(filters?: MenuItemFilters) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const { uploadFile } = useStorage()
    const defaultFilters: MenuItemFilters = {
        searchTerm: '',
        restaurantId: undefined,
        categoryId: undefined,
        isAvailable: undefined,
        isFeatured: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'name',
        sortOrder: 'asc',
        ...filters
    }

    // Fetch menu items with related data and filtering
    const {
        data: menuItems,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['menu-items', defaultFilters],
        queryFn: async () => {
            let query = supabase
                .from('menu_items')
                .select(`
          *,
          restaurant:restaurant_id(id, name),
          category:category_id(id, name)
        `)

            // Apply filters
            if (defaultFilters.restaurantId) {
                query = query.eq('restaurant_id', defaultFilters.restaurantId)
            }

            if (defaultFilters.categoryId) {
                query = query.eq('category_id', defaultFilters.categoryId)
            }

            if (defaultFilters.isAvailable !== undefined) {
                query = query.eq('is_available', defaultFilters.isAvailable)
            }

            if (defaultFilters.isFeatured !== undefined) {
                query = query.eq('is_featured', defaultFilters.isFeatured)
            }

            if (defaultFilters.minPrice !== undefined) {
                query = query.gte('price', defaultFilters.minPrice)
            }

            if (defaultFilters.maxPrice !== undefined) {
                query = query.lte('price', defaultFilters.maxPrice)
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

            const { data, error } = await query

            if (error) throw error
            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    })

    // Get a menu item by ID
    const getMenuItemById = async (id: string) => {
        const { data, error } = await supabase
            .from('menu_items')
            .select(`
        *,
        restaurant:restaurant_id(id, name),
        category:category_id(id, name)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    // Create menu item
    const createMenuItem = useMutation<MenuItem, PostgrestError, MenuItemInsert>({
        mutationFn: async (newMenuItem: MenuItemInsert) => {
            // First make sure we have the necessary fields
            if (!newMenuItem.name || !newMenuItem.restaurant_id) {
                throw new Error('Menu item name and restaurant are required')
            }

            const { data, error } = await supabase
                .from('menu_items')
                .insert(newMenuItem)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] })
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
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] })
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }
    })

    // Toggle menu item availability
    const toggleAvailability = useMutation<MenuItem, PostgrestError, { id: string, isAvailable: boolean }>({
        mutationFn: async ({ id, isAvailable }) => {
            const { data, error } = await supabase
                .from('menu_items')
                .update({ is_available: isAvailable })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }
    })

    // Toggle menu item featured status
    const toggleFeatured = useMutation<MenuItem, PostgrestError, { id: string, isFeatured: boolean }>({
        mutationFn: async ({ id, isFeatured }) => {
            const { data, error } = await supabase
                .from('menu_items')
                .update({ is_featured: isFeatured })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] })
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
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getMenuItemById,
        toggleAvailability,
        toggleFeatured,
        uploadImage,
        refetch
    }
}