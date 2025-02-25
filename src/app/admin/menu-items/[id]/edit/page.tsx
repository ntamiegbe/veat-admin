// src/app/admin/menu-items/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MenuItemForm from '@/components/menu-items/MenuItemForm'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { useMenuItems } from '@/services/useMenuItems'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

export default function EditMenuItemPage() {
    const params = useParams()
    const router = useRouter()
    const menuItemId = params.id as string
    const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const { getMenuItemById } = useMenuItems()

    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                setIsLoading(true)
                const menuItemData = await getMenuItemById(menuItemId)
                setMenuItem(menuItemData)
            } catch (err) {
                console.error('Error fetching menu item:', err)
                setError(err instanceof Error ? err : new Error('Failed to fetch menu item'))
            } finally {
                setIsLoading(false)
            }
        }

        if (menuItemId) {
            fetchMenuItem()
        }
    }, [menuItemId, getMenuItemById])

    if (isLoading) {
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

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-semibold">Error loading menu item</h3>
                    </div>
                    <p className="mt-2">{error.message}</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/menu-items')}
                        className="mt-4"
                    >
                        Back to Menu Items
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!menuItem) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Menu item not found</h3>
                        <p className="text-muted-foreground mt-2">
                            The menu item you&apos;re trying to edit could not be found.
                        </p>
                        <Button
                            onClick={() => router.push('/admin/menu-items')}
                            className="mt-4"
                        >
                            Back to Menu Items
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return <MenuItemForm menuItem={menuItem} />
}