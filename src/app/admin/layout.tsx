'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'
import { useUser } from '@supabase/auth-helpers-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()
    const user = useUser()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    console.log('user', user)
    return (
        <div>
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                Admin Dashboard
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleSignOut}
                                className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    )
}