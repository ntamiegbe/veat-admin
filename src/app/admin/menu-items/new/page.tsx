'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import NewMenuItemForm from '@/components/menu-items/NewMenuItemForm' 

export default function NewMenuItemPage() {
    return (
        <Suspense fallback={<MenuItemFormSkeleton />}>
            <NewMenuItemForm />
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