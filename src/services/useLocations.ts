/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type Location = Database['public']['Tables']['locations']['Row']
type LocationInsert = Database['public']['Tables']['locations']['Insert']
type LocationUpdate = Database['public']['Tables']['locations']['Update']

type LocationFilters = {
    searchTerm?: string
    isCampus?: boolean
    isActive?: boolean
    sortBy?: 'name' | 'created_at'
    sortOrder?: 'asc' | 'desc'
}

export function useLocations(filters?: LocationFilters) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const defaultFilters: LocationFilters = {
        searchTerm: '',
        isCampus: undefined,
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc',
        ...filters
    }

    // Fetch locations with filtering
    const {
        data: locations,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['locations', defaultFilters],
        queryFn: async () => {
            // Try to get from localStorage first
            const cacheKey = `locations-${JSON.stringify(defaultFilters)}`;
            const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
            if (cachedData) {
                try {
                    const { data, timestamp } = JSON.parse(cachedData);
                    const isStale = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

                    if (!isStale) {
                        console.log(`Using cached locations data`);
                        return data;
                    }
                } catch (e) {
                    console.error('Error parsing cached locations data:', e);
                }
            }

            console.log(`Fetching locations with filters:`, defaultFilters);
            let query = supabase
                .from('locations')
                .select('*')

            // Apply filters
            if (defaultFilters.isCampus !== undefined) {
                query = query.eq('is_campus', defaultFilters.isCampus)
            }

            if (defaultFilters.isActive !== undefined) {
                query = query.eq('is_active', defaultFilters.isActive)
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

            // Save to localStorage with timestamp
            if (typeof window !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            }

            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        gcTime: 1000 * 60 * 10, // 10 minutes
    })

    // Get a location by ID
    const getLocationById = async (id: string) => {
        // Try to get from localStorage first
        const cachedData = typeof window !== 'undefined' ? localStorage.getItem(`location-${id}`) : null;
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                const isStale = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

                if (!isStale) {
                    console.log(`Using cached data for location ${id}`);
                    return data;
                }
            } catch (e) {
                console.error('Error parsing cached location data:', e);
                // Continue to fetch from API if parsing fails
            }
        }

        console.log(`Fetching location ${id} from API`);
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Save to localStorage with timestamp
        if (typeof window !== 'undefined') {
            localStorage.setItem(`location-${id}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        }

        return data;
    }

    // Create location
    const createLocation = useMutation<Location, PostgrestError, LocationInsert>({
        mutationFn: async (newLocation: LocationInsert) => {
            const { data, error } = await supabase
                .from('locations')
                .insert(newLocation)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] })
        }
    })

    // Update location
    const updateLocation = useMutation<Location, PostgrestError, LocationUpdate>({
        mutationFn: async (updatedLocation: LocationUpdate) => {
            const { data, error } = await supabase
                .from('locations')
                .update(updatedLocation)
                .eq('id', updatedLocation.id as string)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific location query
            queryClient.invalidateQueries({ queryKey: ['location', data.id] })

            // Update the location in the cache without refetching
            queryClient.setQueryData(['location', data.id], data)

            // Update the location in the locations list cache if it exists
            queryClient.setQueriesData({ queryKey: ['locations'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((location: Location) =>
                    location.id === data.id ? { ...location, ...data } : location
                )
            })
        }
    })

    // Toggle location active status
    const toggleLocationActive = useMutation<Location, PostgrestError, { id: string, isActive: boolean }>({
        mutationFn: async ({ id, isActive }) => {
            const { data, error } = await supabase
                .from('locations')
                .update({ is_active: isActive })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific location query
            queryClient.invalidateQueries({ queryKey: ['location', data.id] })

            // Update the location in the cache without refetching
            queryClient.setQueryData(['location', data.id], data)

            // Update the location in the locations list cache if it exists
            queryClient.setQueriesData({ queryKey: ['locations'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((location: Location) =>
                    location.id === data.id ? { ...location, ...data } : location
                )
            })
        }
    })

    // Delete location
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
            // Invalidate the specific location query
            queryClient.invalidateQueries({ queryKey: ['location', id] })

            // Remove the location from the locations list cache if it exists
            queryClient.setQueriesData({ queryKey: ['locations'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.filter((location: Location) => location.id !== id)
            })
        }
    })

    return {
        locations,
        isLoading,
        fetchError,
        getLocationById,
        createLocation,
        updateLocation,
        toggleLocationActive,
        deleteLocation,
        refetch
    }
}