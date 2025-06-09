'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMenuItems } from '@/services/useMenuItems'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
    Plus,
    MoreVertical,
    Edit,
    Trash,
    Star,
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default function RestaurantMenuPage() {
    const router = useRouter()
    const params = useParams()
    const restaurantId = params.id as string
    const [searchTerm, setSearchTerm] = useState('')

    const {
        menuItems,
        isLoading,
        fetchError,
        deleteMenuItem,
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
                <Button onClick={() => router.push(`/restaurant-owner/restaurants/${restaurantId}/menu/new`)}>
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
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="max-w-sm"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Available</TableCell>
                                    <TableCell>Featured</TableCell>
                                    <TableCell className="text-right">Actions</TableCell>
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
                                            ₦{item.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.is_available ? "default" : "secondary"}>
                                                {item.is_available ? 'Available' : 'Unavailable'}
                                            </Badge>
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
                                                                `/restaurant-owner/restaurants/${restaurantId}/menu/${item.id}/edit`
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