'use client'

import { useSearchParams } from 'next/navigation'
import MenuItemForm from '@/components/menu-items/MenuItemForm'

export default function NewMenuItemForm() {
    const searchParams = useSearchParams()
    const restaurantId = searchParams.get('restaurant') || undefined

    return <MenuItemForm restaurantId={restaurantId} />
}