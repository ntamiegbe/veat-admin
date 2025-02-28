'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, BarChart } from 'lucide-react'
import MenuItemsFilter, { MenuItemFilters } from '@/components/menu-items/MenuItemsFilter'
import MenuItemsGrid from '@/components/menu-items/MenuItemsGrid'
import MenuItemsDashboard from '@/components/menu-items/MenuItemsDashboard'

export default function MenuItemsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialRestaurantId = searchParams.get('restaurant') || undefined

    // State for active tab
    const [activeTab, setActiveTab] = useState<'grid' | 'dashboard'>('grid')

    // State for filters
    const [filters, setFilters] = useState<MenuItemFilters>({
        searchTerm: '',
        restaurantId: initialRestaurantId,
        categoryId: undefined,
        isAvailable: true,
        isFeatured: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
    })

    // Handle filter changes
    const handleFilterChange = (newFilters: MenuItemFilters) => {
        setFilters(newFilters)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
                    <p className="text-muted-foreground">
                        Manage all menu items across restaurants
                    </p>
                </div>
                <Button onClick={() => router.push('/admin/menu-items/new')} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                </Button>
            </div>

            <Tabs defaultValue="grid" value={activeTab} onValueChange={(value) => setActiveTab(value as 'grid' | 'dashboard')}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <TabsList>
                        <TabsTrigger value="grid">Menu Items</TabsTrigger>
                        <TabsTrigger value="dashboard" className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Dashboard
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="grid" className="space-y-6">
                    <MenuItemsFilter filters={filters} onFilterChange={handleFilterChange} />
                    <MenuItemsGrid filters={filters} />
                </TabsContent>

                <TabsContent value="dashboard">
                    <MenuItemsDashboard restaurantId={filters.restaurantId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}