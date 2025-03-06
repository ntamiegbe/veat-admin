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
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        gcTime: 1000 * 60 * 10, // 10 minutes
    })

    // Get a menu item by ID with localStorage caching
    const getMenuItemById = async (id: string) => {
        // Try to get from localStorage first
        const cachedData = typeof window !== 'undefined' ? localStorage.getItem(`menu-item-${id}`) : null;
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                const isStale = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

                if (!isStale) {
                    console.log(`Using cached data for menu item ${id}`);
                    return data;
                }
            } catch (e) {
                console.error('Error parsing cached menu item data:', e);
                // Continue to fetch from API if parsing fails
            }
        }

        console.log(`Fetching menu item ${id} from API`);
        const { data, error } = await supabase
            .from('menu_items')
            .select(`
                *,
                restaurant:restaurant_id(id, name),
                category:category_id(id, name)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Save to localStorage with timestamp
        if (typeof window !== 'undefined') {
            localStorage.setItem(`menu-item-${id}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        }

        return data;
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
        onSuccess: (id) => {
            // Remove the specific menu item from the cache
            queryClient.removeQueries({ queryKey: ['menu-item', id] })

            // Update the menu items list cache to remove the deleted item
            queryClient.setQueriesData({ queryKey: ['menu-items'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.filter((item: MenuItem) => item.id !== id)
            })
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
        onSuccess: (data) => {
            // Only invalidate the specific menu item query
            queryClient.invalidateQueries({ queryKey: ['menu-item', data.id] })

            // Update the menu item in the cache without refetching
            queryClient.setQueryData(['menu-item', data.id], data)

            // Update the menu item in the menu-items list cache if it exists
            queryClient.setQueriesData({ queryKey: ['menu-items'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((item: MenuItem) =>
                    item.id === data.id ? { ...item, ...data } : item
                )
            })
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
        onSuccess: (data) => {
            // Only invalidate the specific menu item query
            queryClient.invalidateQueries({ queryKey: ['menu-item', data.id] })

            // Update the menu item in the cache without refetching
            queryClient.setQueryData(['menu-item', data.id], data)

            // Update the menu item in the menu-items list cache if it exists
            queryClient.setQueriesData({ queryKey: ['menu-items'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((item: MenuItem) =>
                    item.id === data.id ? { ...item, ...data } : item
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