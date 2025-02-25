import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type Location = Database['public']['Tables']['locations']['Row']
type LocationInsert = Database['public']['Tables']['locations']['Insert']
type LocationUpdate = Database['public']['Tables']['locations']['Update']

export function useLocations() {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()

    const {
        data: locations,
        isLoading,
        error: fetchError
    } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            return data
        }
    })

    const createLocation = useMutation<Location, PostgrestError, LocationInsert>({
        mutationFn: async (newLocation: LocationInsert) => {
            const { data, error } = await supabase
                .from('locations')
                .insert(newLocation)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('No data returned from creation')
            return data
        },
        onSuccess: (newLocation) => {
            queryClient.setQueryData<Location[]>(['locations'], (old) =>
                old ? [...old, newLocation] : [newLocation]
            )
        }
    })

    const updateLocation = useMutation<Location, PostgrestError, LocationUpdate>({
        mutationFn: async (updatedLocation: LocationUpdate) => {
            const { data, error } = await supabase
                .from('locations')
                .update(updatedLocation)
                .eq('id', updatedLocation.id as string)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('No data returned from update')
            return data
        },
        onSuccess: (updatedLocation) => {
            queryClient.setQueryData<Location[]>(['locations'], (old) => {
                if (!old) return [updatedLocation]
                return old.map(location =>
                    location.id === updatedLocation.id ? updatedLocation : location
                )
            })
        }
    })

    const deleteLocation = useMutation<string, PostgrestError, string>({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Location[]>(['locations'], (old) => {
                if (!old) return []
                return old.filter(location => location.id !== id)
            })
        }
    })

    return {
        locations,
        isLoading,
        fetchError,
        createLocation,
        updateLocation,
        deleteLocation
    }
}