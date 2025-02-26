'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
    session: Session | null
    user: User | null
    profile: Database['public']['Tables']['users']['Row'] | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    // Fetch user profile data
    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true)
                const { data: { session: currentSession }, error } = await supabase.auth.getSession()

                if (error) throw error

                if (currentSession) {
                    setSession(currentSession)
                    setUser(currentSession.user)

                    // Fetch user profile data
                    const profile = await fetchUserProfile(currentSession.user.id)
                    setProfile(profile)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            setSession(currentSession)
            setUser(currentSession?.user ?? null)

            // Update profile when session changes
            if (currentSession?.user) {
                const profile = await fetchUserProfile(currentSession.user.id)
                setProfile(profile)
            } else {
                setProfile(null)
            }

            // For sign in and sign out events, refresh the page
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router])

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (data.session) {
                router.push('/admin/dashboard')
                toast.success('Signed in successfully')
            } else {
                throw new Error('No session created')
            }
        } catch (error) {
            console.error('Sign in error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to sign in')
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            router.push('/login')
            toast.info('Signed out successfully')
        } catch (error) {
            console.error('Sign out error:', error)
            toast.error('Failed to sign out')
        } finally {
            setIsLoading(false)
        }
    }

    const refreshSession = async () => {
        try {
            setIsLoading(true)
            const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
            if (error) throw error

            if (refreshedSession) {
                setSession(refreshedSession)
                setUser(refreshedSession.user)
            }
        } catch (error) {
            console.error('Session refresh error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                isLoading,
                signIn,
                signOut,
                refreshSession
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}