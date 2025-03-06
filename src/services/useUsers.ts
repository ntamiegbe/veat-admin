import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

type UserFilters = {
    searchTerm?: string
    userType?: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin' | undefined
    isPhoneVerified?: boolean | undefined
    sortBy?: 'full_name' | 'created_at' | 'email' | 'phone_number'
    sortOrder?: 'asc' | 'desc'
    limit?: number
}

export function useUsers(filters?: UserFilters) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const defaultFilters: UserFilters = {
        searchTerm: '',
        userType: undefined,
        isPhoneVerified: undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: undefined,
        ...filters
    }

    // Fetch all users with filters
    const {
        data: users,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['users', defaultFilters],
        queryFn: async () => {
            let query = supabase
                .from('users')
                .select(`
                    *,
                    default_delivery_location:default_delivery_location_id(id, name, is_campus)
                `)

            // Apply user type filter
            if (defaultFilters.userType !== undefined) {
                query = query.eq('user_type', defaultFilters.userType)
            }

            // Apply phone verification filter
            if (defaultFilters.isPhoneVerified !== undefined) {
                query = query.eq('is_phone_verified', defaultFilters.isPhoneVerified)
            }

            // Apply search
            if (defaultFilters.searchTerm) {
                query = query.or(
                    `full_name.ilike.%${defaultFilters.searchTerm}%,` +
                    `email.ilike.%${defaultFilters.searchTerm}%,` +
                    `phone_number.ilike.%${defaultFilters.searchTerm}%`
                )
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
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Get a user by ID
    const getUserById = async (id: string) => {
        // Check if the data is already in the cache
        const cachedData = queryClient.getQueryData<User>(['user', id])
        if (cachedData) return cachedData

        // If not cached, fetch from API
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                default_delivery_location:default_delivery_location_id(id, name, is_campus)
            `)
            .eq('id', id)
            .single()

        if (error) throw error

        // Cache the result
        queryClient.setQueryData(['user', id], data)
        return data
    }

    // Create user
    const createUser = useMutation<User, PostgrestError, UserInsert>({
        mutationFn: async (newUser: UserInsert) => {
            const { data, error } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single()

            if (error) {
                console.error('User Creation Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from creation')
            }

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        }
    })

    // Update user
    const updateUser = useMutation<User, PostgrestError, UserUpdate>({
        mutationFn: async (updatedUser: UserUpdate) => {
            const { data, error } = await supabase
                .from('users')
                .update(updatedUser)
                .eq('id', updatedUser.id as string)
                .select()
                .single()

            if (error) {
                console.error('User Update Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from update')
            }

            return data
        },
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
        }
    })

    // Verify phone number
    const verifyPhone = useMutation<User, PostgrestError, { id: string }>({
        mutationFn: async ({ id }) => {
            const { data, error } = await supabase
                .from('users')
                .update({ is_phone_verified: true })
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error('Phone Verification Error:', error)
                throw error
            }

            if (!data) {
                throw new Error('No data returned from verification')
            }

            return data
        },
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
        }
    })

    // Update user profile image
    const updateProfileImage = async (userId: string, file: File) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}.${fileExt}`
        const filePath = `profile-images/${fileName}`

        // Upload image to storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        if (!publicUrlData.publicUrl) {
            throw new Error('Failed to get public URL')
        }

        // Update user profile with new image URL
        const { data, error } = await supabase
            .from('users')
            .update({ profile_image_url: publicUrlData.publicUrl })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error

        // Update cache
        queryClient.invalidateQueries({ queryKey: ['users'] })
        queryClient.invalidateQueries({ queryKey: ['user', userId] })

        return data
    }

    // Get users by type
    const getUsersByType = async (userType: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin') => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_type', userType)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    // Get user stats
    const getUserStats = async () => {
        // Get total user count
        const { count: totalUsers, error: totalError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

        if (totalError) throw totalError

        // Get verified users count
        const { count: verifiedUsers, error: verifiedError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_phone_verified', true)

        if (verifiedError) throw verifiedError

        // Get user type counts
        const typePromises = ['user', 'restaurant_owner', 'delivery_rider', 'admin'].map(async (type) => {
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('user_type', type)

            if (error) throw error
            return { type, count: count || 0 }
        })

        const typeCounts = await Promise.all(typePromises)
        const typeCountsObj = Object.fromEntries(typeCounts.map(item => [item.type, item.count]))

        // Return in the format expected by UserStats component
        return {
            total: totalUsers || 0,
            verified: verifiedUsers || 0,
            customers: typeCountsObj['user'] || 0,
            restaurantOwners: typeCountsObj['restaurant_owner'] || 0,
            riders: typeCountsObj['delivery_rider'] || 0,
            admins: typeCountsObj['admin'] || 0
        }
    }

    return {
        users,
        isLoading,
        fetchError,
        getUserById,
        createUser,
        updateUser,
        verifyPhone,
        updateProfileImage,
        getUsersByType,
        getUserStats,
        refetch
    }
}