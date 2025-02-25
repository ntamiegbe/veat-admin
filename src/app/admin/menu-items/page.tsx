'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import MenuItemsListContent from '@/components/menu-items/MenuItemsListContent' 

export default function MenuItemsPage() {
    return (
        <Suspense fallback={<MenuItemsListSkeleton />}>
            <MenuItemsListContent />
        </Suspense>
    )
}

function MenuItemsListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                ))}
            </div>
        </div>
    )
}