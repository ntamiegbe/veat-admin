'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Utensils, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import MenuItemCard from '@/components/menu-items/MenuItemCard'
import { useMenuItems } from '@/services/useMenuItems'
import type { Database } from '@/types/supabase'
import type { MenuItemFilters } from '@/components/menu-items/MenuItemsFilter'

type MenuItem = Database['public']['Tables']['menu_items']['Row'] & {
    restaurant?: { id: string, name: string } | null,
    category?: { id: string, name: string } | null
}

interface MenuItemsGridProps {
    filters: MenuItemFilters
}

export default function MenuItemsGrid({ filters }: MenuItemsGridProps) {
    const router = useRouter()
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const {
        menuItems,
        isLoading,
        fetchError,
        deleteMenuItem,
        refetch
    } = useMenuItems(filters)

    const handleDeleteClick = (item: MenuItem) => {
        setSelectedItem(item)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!selectedItem) return

        try {
            await deleteMenuItem.mutateAsync(selectedItem.id)
            toast.success("Menu item deleted successfully")
            setIsDeleteDialogOpen(false)
            setSelectedItem(null)
        } catch (error) {
            toast.error("Failed to delete menu item")
            console.error(error)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                ))}
            </div>
        )
    }

    if (fetchError) {
        return (
            <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <h3 className="text-lg font-medium mb-2 text-destructive">Error loading menu items</h3>
                    <p className="text-muted-foreground mb-4">
                        {fetchError.message || "An error occurred while loading menu items"}
                    </p>
                    <Button onClick={() => refetch()} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!menuItems?.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                    <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No menu items found</h3>
                    <p className="text-muted-foreground mb-4">
                        {filters.searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding a new menu item'}
                    </p>
                    <Button onClick={() => router.push('/admin/menu-items/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Menu Item
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {menuItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{selectedItem?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteMenuItem.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMenuItem.isPending}
                        >
                            {deleteMenuItem.isPending ? 'Deleting...' : 'Delete Menu Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}