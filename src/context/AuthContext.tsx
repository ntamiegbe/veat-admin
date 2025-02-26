'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type AuthContextType = {
    user: User | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_, session) => {
                setUser(session?.user || null)

                // No need to fetch additional profile data
                // Just use the basic user object from Supabase auth
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase.auth, router])

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Successful login - navigate to dashboard
            router.push('/admin/dashboard')

        } catch (error) {
            // Pass the error up to be handled by the login component
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async () => {
        setIsLoading(true)
        await supabase.auth.signOut()
        router.push('/login')
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signOut
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