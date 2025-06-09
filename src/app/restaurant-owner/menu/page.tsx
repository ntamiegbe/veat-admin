'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/services/useAuth'
import { useMenuItems } from '@/services/useMenuItems'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash,
    Star,
} from 'lucide-react'

export default function MenuItemsPage() {
    const router = useRouter()
    const { userRestaurants } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')

    // Get the first restaurant ID (assuming owner has at least one restaurant)
    const restaurantId = userRestaurants?.[0]?.id

    const {
        menuItems,
        isLoading,
        fetchError,
        deleteMenuItem,
        toggleMenuItemAvailability,
        toggleMenuItemFeatured,
    } = useMenuItems({
        restaurantId,
        searchTerm,
    })

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteMenuItem.mutateAsync(id)
            toast.success('Menu item deleted successfully')
        } catch (error) {
            console.error('Error deleting menu item:', error)
            toast.error('Failed to delete menu item')
        }
    }

    const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
        try {
            await toggleMenuItemAvailability.mutateAsync({
                id,
                isAvailable: !currentStatus,
            })
            toast.success('Availability updated successfully')
        } catch (error) {
            console.error('Error updating availability:', error)
            toast.error('Failed to update availability')
        }
    }

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            await toggleMenuItemFeatured.mutateAsync({
                id,
                isFeatured: !currentStatus,
            })
            toast.success('Featured status updated successfully')
        } catch (error) {
            console.error('Error updating featured status:', error)
            toast.error('Failed to update featured status')
        }
    }

    if (fetchError) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive">
                    Error loading menu items. Please try again later.
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
                <Button onClick={() => router.push('/restaurant-owner/menu/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Items List</CardTitle>
                    <CardDescription>
                        Manage your restaurant&apos;s menu items
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead>Featured</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menuItems?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.name}
                                        </TableCell>
                                        <TableCell>
                                            {item.menu_categories?.name || 'Uncategorized'}
                                        </TableCell>
                                        <TableCell>
                                            ${item.price.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={item.is_available ?? false}
                                                onCheckedChange={() =>
                                                    handleToggleAvailability(item.id, !!item.is_available)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleToggleFeatured(item.id, !!item.is_featured)
                                                }
                                            >
                                                <Star
                                                    className={`h-4 w-4 ${item.is_featured
                                                        ? 'fill-primary text-primary'
                                                        : 'text-muted-foreground'
                                                        }`}
                                                />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.push(
                                                                `/restaurant-owner/menu/${item.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {menuItems?.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            No menu items found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 