import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
// type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']

export function useRestaurants() {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()

    // Fetch all restaurants
    const { data: restaurants, isLoading, error: fetchError } = useQuery({
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
            queryClient.setQueryData<Restaurant[]>(['restaurants'], (old) =>
                old ? [newRestaurant, ...old] : [newRestaurant]
            )
        }
    })

    return {
        restaurants,
        isLoading,
        fetchError,
        createRestaurant
    }
}