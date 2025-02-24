/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import type { Database } from '../types/supabase' // You'll need to generate these types

export function useSupabase<T>(
    tableName: keyof Database['public']['Tables'],
    options = {}
) {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: result, error } = await supabase
                    .from(tableName)
                    .select('*')

                if (error) throw error

                setData(result as T[])
            } catch (e) {
                setError(e as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [tableName])

    return { data, loading, error }
}