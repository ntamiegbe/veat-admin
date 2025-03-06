import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']

export function useAuth() {
    const supabase = createClientComponentClient<Database>()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(true)

    // Get current user with profile data
    const { data: currentUser, isLoading: isUserLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            // First get the session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return null

            // Then get the user profile data
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (error) throw error

            return user as User
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Get restaurants owned by current user
    const { data: userRestaurants, isLoading: isRestaurantsLoading } = useQuery({
        queryKey: ['userRestaurants'],
        queryFn: async () => {
            if (!currentUser || currentUser.user_type !== 'restaurant_owner') return []

            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', currentUser.id)

            if (error) throw error

            return data
        },
        enabled: !!currentUser && currentUser.user_type === 'restaurant_owner',
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Check if user is authenticated
    const isAuthenticated = !!currentUser

    // Check if user has a specific role
    const hasRole = (role: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin') => {
        return currentUser?.user_type === role
    }

    // Check if user owns a specific restaurant
    const ownsRestaurant = (restaurantId: string) => {
        return userRestaurants?.some(restaurant => restaurant.id === restaurantId) || false
    }

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut()
        queryClient.clear() // Clear all queries from cache
        router.push('/login')
    }

    // Redirect if not authenticated
    const requireAuth = () => {
        useEffect(() => {
            const checkAuth = async () => {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push('/login')
                } else {
                    setIsLoading(false)
                }
            }

            checkAuth()
        }, [router])

        return { isLoading }
    }

    // Redirect if not authorized for a role
    const requireRole = (role: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin') => {
        useEffect(() => {
            const checkRole = async () => {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push('/login')
                    return
                }

                const { data: user, error } = await supabase
                    .from('users')
                    .select('user_type')
                    .eq('id', session.user.id)
                    .single()

                if (error || user?.user_type !== role) {
                    router.push('/unauthorized')
                } else {
                    setIsLoading(false)
                }
            }

            checkRole()
        }, [router, role])

        return { isLoading }
    }

    return {
        currentUser,
        userRestaurants,
        isLoading: isUserLoading || isRestaurantsLoading,
        isAuthenticated,
        hasRole,
        ownsRestaurant,
        signOut,
        requireAuth,
        requireRole
    }
} 