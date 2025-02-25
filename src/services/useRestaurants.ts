import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { useCallback } from 'react'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']

type RestaurantFilters = {
    searchTerm?: string
    isActive?: boolean
    isFeatured?: boolean
    cuisineTypes?: string[]
    sortBy?: 'name' | 'created_at' | 'average_rating' | 'total_orders'
    sortOrder?: 'asc' | 'desc'
    limit?: number
}

export function useRestaurants(filters?: RestaurantFilters) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const defaultFilters: RestaurantFilters = {
        searchTerm: '',
        isActive: undefined,
        isFeatured: undefined,
        cuisineTypes: [],
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: undefined,
        ...filters
    }

    // Fetch all restaurants with filters
    const {
        data: restaurants,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['restaurants', defaultFilters],
        queryFn: async () => {
            let query = supabase
                .from('restaurants')
                .select('*')

            // Apply filters
            if (defaultFilters.isActive !== undefined) {
                query = query.eq('is_active', defaultFilters.isActive)
            }

            if (defaultFilters.isFeatured !== undefined) {
                query = query.eq('is_featured', defaultFilters.isFeatured)
            }

            // Apply cuisine type filter if any
            if (defaultFilters.cuisineTypes && defaultFilters.cuisineTypes.length > 0) {
                query = query.contains('cuisine_types', defaultFilters.cuisineTypes)
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

            // Apply limit if specified
            if (defaultFilters.limit) {
                query = query.limit(defaultFilters.limit)
            }

            const { data, error } = await query

            if (error) throw error
            return data
        }
    })

    const getRestaurantById = useCallback(async (id: string) => {
        // Check if the data is already in the cache
        const cachedData = queryClient.getQueryData<Restaurant>(['restaurant', id])
        if (cachedData) return cachedData

        // If not cached, fetch from API
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        // Cache the result
        queryClient.setQueryData(['restaurant', id], data)
        return data
    }, [supabase, queryClient])


    // Create restaurant
    const createRestaurant = useMutation<Restaurant, PostgrestError, RestaurantInsert>({
        mutationFn: async (newRestaurant: RestaurantInsert) => {
            const { data, error } = await supabase
                .from('restaurants')
                .insert(newRestaurant)
                .select()
                .single()

            if (error) {
                console.error('Creation Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from creation')
            }

            return data
        },
        onSuccess: (newRestaurant) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants', defaultFilters], (old) =>
                old ? [newRestaurant, ...old] : [newRestaurant]
            )
        }
    })

    // Update restaurant
    const updateRestaurant = useMutation<Restaurant, PostgrestError, RestaurantUpdate>({
        mutationFn: async (updatedRestaurant: RestaurantUpdate) => {
            const { data, error } = await supabase
                .from('restaurants')
                .update(updatedRestaurant)
                .eq('id', updatedRestaurant.id as string)
                .select()
                .single()

            if (error) {
                console.error('Update Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from update')
            }

            return data
        },
        onSuccess: (updatedRestaurant) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants', defaultFilters], (old) => {
                if (!old) return [updatedRestaurant]
                return old.map(restaurant =>
                    restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
                )
            })
        }
    })

    // Delete restaurant
    const deleteRestaurant = useMutation<string, PostgrestError, string>({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('restaurants')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Deletion Error:', error)
                throw error
            }

            return id
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants', defaultFilters], (old) => {
                if (!old) return []
                return old.filter(restaurant => restaurant.id !== id)
            })
        }
    })

    // Toggle restaurant active status
    const toggleRestaurantStatus = useMutation<Restaurant, PostgrestError, { id: string, isActive: boolean }>({
        mutationFn: async ({ id, isActive }) => {
            const { data, error } = await supabase
                .from('restaurants')
                .update({ is_active: isActive })
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error('Status Toggle Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from status update')
            }

            return data
        },
        onSuccess: (updatedRestaurant) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants', defaultFilters], (old) => {
                if (!old) return [updatedRestaurant]
                return old.map(restaurant =>
                    restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
                )
            })
        }
    })

    // Toggle restaurant featured status
    const toggleRestaurantFeatured = useMutation<Restaurant, PostgrestError, { id: string, isFeatured: boolean }>({
        mutationFn: async ({ id, isFeatured }) => {
            const { data, error } = await supabase
                .from('restaurants')
                .update({ is_featured: isFeatured })
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error('Featured Toggle Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from featured update')
            }

            return data
        },
        onSuccess: (updatedRestaurant) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants', defaultFilters], (old) => {
                if (!old) return [updatedRestaurant]
                return old.map(restaurant =>
                    restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
                )
            })
        }
    })

    // Get restaurant statistics
    const getRestaurantStats = async (restaurantId: string) => {
        // Get order count
        const { count: orderCount, error: orderError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)

        if (orderError) throw orderError

        // Get menu item count
        const { count: menuItemCount, error: menuError } = await supabase
            .from('menu_items')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)

        if (menuError) throw menuError

        // Get analytics
        const { data: analytics, error: analyticsError } = await supabase
            .from('restaurant_analytics')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('date', { ascending: false })
            .limit(30)

        if (analyticsError) throw analyticsError

        return {
            orderCount: orderCount || 0,
            menuItemCount: menuItemCount || 0,
            analytics: analytics || []
        }
    }

    return {
        restaurants,
        isLoading,
        fetchError,
        createRestaurant,
        updateRestaurant,
        deleteRestaurant,
        getRestaurantById,
        toggleRestaurantStatus,
        toggleRestaurantFeatured,
        getRestaurantStats,
        refetch
    }
}