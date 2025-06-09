import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Restaurant = Database['public']['Tables']['restaurants']['Row']

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userRestaurants, setUserRestaurants] = useState<Restaurant[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setCurrentUser(null)
                setUserRestaurants(null)
                setIsLoading(false)
                return
            }

            // Get user profile
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (userError) throw userError

            setCurrentUser(userData)

            // Get user's restaurants if they are a restaurant owner
            if (userData.user_type === 'restaurant_owner') {
                const { data: restaurantData, error: restaurantError } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('owner_id', user.id)

                if (restaurantError) throw restaurantError

                setUserRestaurants(restaurantData)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            setCurrentUser(null)
            setUserRestaurants(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUserData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN') {
                await fetchUserData()
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null)
                setUserRestaurants(null)
                router.push('/auth/login')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return {
        currentUser,
        userRestaurants,
        isLoading,
        refreshUserData: fetchUserData
    }
}

export function useRequireRole(requiredRole: 'restaurant_owner' | 'admin' | 'user') {
    const [isLoading, setIsLoading] = useState(true)
    const { currentUser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!currentUser && !isLoading) {
            router.push('/auth/login')
            return
        }

        if (currentUser && currentUser.user_type !== requiredRole) {
            router.push('/')
            return
        }

        setIsLoading(false)
    }, [currentUser, requiredRole])

    return { isLoading }
}

export function useRequireAuth() {
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClientComponentClient<Database>()
    const router = useRouter()

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
    }, []) // Remove router from dependencies

    return { isLoading }
} 