'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import MenuItemForm from '@/components/menu-items/MenuItemForm'
import { MenuItemFormSkeleton } from '@/components/menu-items/loading'

export default function EditRestaurantMenuItemPage() {
    const params = useParams()
    const restaurantId = params.id as string
    const menuItemId = params.menuItemId as string
    const supabase = createClientComponentClient<Database>()

    const { data: menuItem, isLoading } = useQuery({
        queryKey: ['menu-item', menuItemId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('id', menuItemId)
                .single()

            if (error) throw error
            return data
        }
    })

    if (isLoading) {
        return <MenuItemFormSkeleton />
    }

    return (
        <Suspense fallback={<MenuItemFormSkeleton />}>
            <MenuItemForm
                menuItem={menuItem}
                restaurantId={restaurantId}
                hideRestaurantSelection={true}
            />
        </Suspense>
    )
} 