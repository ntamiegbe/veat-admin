'use client'

import { useSearchParams } from 'next/navigation'
import MenuItemForm from '@/components/menu-items/MenuItemForm'

interface NewMenuItemFormProps {
    initialRestaurantId?: string
}

export default function NewMenuItemForm({ initialRestaurantId }: NewMenuItemFormProps) {
    const searchParams = useSearchParams()
    const restaurantId = initialRestaurantId || searchParams?.get('restaurant') || undefined

    return <MenuItemForm restaurantId={restaurantId} />
}