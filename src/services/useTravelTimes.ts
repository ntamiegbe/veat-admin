import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type LocationTravelTime = {
    id: string
    from_location_id: string
    to_location_id: string
    average_minutes: number
    created_at: string
    updated_at: string
    from_location?: {
        name: string
    }
    to_location?: {
        name: string
    }
}

type LocationTravelTimeInsert = Omit<LocationTravelTime, 'id' | 'created_at' | 'updated_at' | 'from_location' | 'to_location'>
type LocationTravelTimeUpdate = Partial<LocationTravelTimeInsert> & { id: string }

export function useTravelTimes() {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()

    // Fetch all travel times with location names
    const {
        data: travelTimes,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['location-travel-times'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('location_travel_times')
                .select(`
          *,
          from_location:from_location_id(name),
          to_location:to_location_id(name)
        `)
                .order('from_location_id')
                .order('to_location_id')

            if (error) throw error
            return data as unknown as LocationTravelTime[]
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })

    // Get travel time by from and to location IDs
    const getTravelTime = async (fromLocationId: string, toLocationId: string) => {
        const { data, error } = await supabase
            .from('location_travel_times')
            .select('*')
            .eq('from_location_id', fromLocationId)
            .eq('to_location_id', toLocationId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // No records found
            }
            throw error
        }

        return data as LocationTravelTime
    }

    // Create travel time
    const createTravelTime = useMutation<LocationTravelTime, PostgrestError, LocationTravelTimeInsert>({
        mutationFn: async (newTravelTime: LocationTravelTimeInsert) => {
            const { data, error } = await supabase
                .from('location_travel_times')
                .insert(newTravelTime)
                .select()
                .single()

            if (error) throw error
            return data as LocationTravelTime
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-travel-times'] })
        }
    })

    // Update travel time
    const updateTravelTime = useMutation<LocationTravelTime, PostgrestError, LocationTravelTimeUpdate>({
        mutationFn: async (updatedTravelTime: LocationTravelTimeUpdate) => {
            const { data, error } = await supabase
                .from('location_travel_times')
                .update({
                    average_minutes: updatedTravelTime.average_minutes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', updatedTravelTime.id)
                .select()
                .single()

            if (error) throw error
            return data as LocationTravelTime
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-travel-times'] })
        }
    })

    // Delete travel time
    const deleteTravelTime = useMutation<string, PostgrestError, string>({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('location_travel_times')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-travel-times'] })
        }
    })

    // Get estimated delivery time between two locations
    const getEstimatedDeliveryTime = async (fromLocationId: string, toLocationId: string) => {
        const travelTime = await getTravelTime(fromLocationId, toLocationId)

        if (travelTime) {
            return travelTime.average_minutes
        }

        // If no direct route, try to find a reverse route and add a small buffer
        const reverseTravelTime = await getTravelTime(toLocationId, fromLocationId)
        if (reverseTravelTime) {
            return Math.ceil(reverseTravelTime.average_minutes * 1.1) // Add 10% buffer for reverse route
        }

        // Default fallback value based on average delivery time
        return 20 // Default to 20 minutes if no route found
    }

    return {
        travelTimes,
        isLoading,
        fetchError,
        getTravelTime,
        getEstimatedDeliveryTime,
        createTravelTime,
        updateTravelTime,
        deleteTravelTime,
        refetch
    }
} 