'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import NewMenuItemForm from '@/components/menu-items/NewMenuItemForm'

// Client component to handle search params
function NewMenuItemFormWrapper() {
    const searchParams = useSearchParams()
    const restaurantId = searchParams.get('restaurant') || undefined

    return <NewMenuItemForm initialRestaurantId={restaurantId} />
}

export default function NewMenuItemPage() {
    return (
        <Suspense fallback={<MenuItemFormSkeleton />}>
            <NewMenuItemFormWrapper />
        </Suspense>
    )
}

function MenuItemFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-[500px] w-full" />
                <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[250px] w-full" />
                </div>
            </div>
        </div>
    )
}