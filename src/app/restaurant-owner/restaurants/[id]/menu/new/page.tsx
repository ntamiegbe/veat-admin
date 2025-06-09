'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import MenuItemForm from '@/components/menu-items/MenuItemForm'
import { MenuItemFormSkeleton } from '@/components/menu-items/loading'

export default function NewRestaurantMenuItemPage() {
    const params = useParams()
    const restaurantId = params.id as string

    return (
        <Suspense fallback={<MenuItemFormSkeleton />}>
            <MenuItemForm
                restaurantId={restaurantId}
                hideRestaurantSelection={true}
            />
        </Suspense>
    )
} 