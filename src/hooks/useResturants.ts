import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']

export function useRestaurants() {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()

    // Fetch all restaurants
    const { data: restaurants, isLoading } = useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        }
    })

    // Create restaurant
    const createRestaurant = useMutation({
        mutationFn: async (newRestaurant: RestaurantInsert) => {
            const { data, error } = await supabase
                .from('restaurants')
                .insert(newRestaurant)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (newRestaurant) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants'], (old) =>
                old ? [newRestaurant, ...old] : [newRestaurant]
            )
        }
    })

    // Update restaurant
    const updateRestaurant = useMutation({
        mutationFn: async ({ id, ...updates }: RestaurantUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (updatedRestaurant) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants'], (old) =>
                old?.map(restaurant =>
                    restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
                )
            )
        }
    })

    // Delete restaurant
    const deleteRestaurant = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('restaurants')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData<Restaurant[]>(['restaurants'], (old) =>
                old?.filter(restaurant => restaurant.id !== deletedId)
            )
        }
    })

    return {
        restaurants,
        isLoading,
        createRestaurant,
        updateRestaurant,
        deleteRestaurant
    }
}