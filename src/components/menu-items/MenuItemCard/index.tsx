'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Utensils,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    Star,
    MoreHorizontal,
    Building2,
    Tag,
} from 'lucide-react'
import { useMenuItems } from '@/services/useMenuItems'
import type { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row'] & {
    restaurant?: { id: string, name: string } | null,
    category?: { id: string, name: string } | null
}

interface MenuItemCardProps {
    item: MenuItem
    onDelete: (item: MenuItem) => void
}

export default function MenuItemCard({ item, onDelete }: MenuItemCardProps) {
    const router = useRouter()
    const { toggleMenuItemAvailability: toggleAvailability, toggleMenuItemFeatured: toggleFeatured } = useMenuItems()
    const [isUpdating, setIsUpdating] = useState(false)

    // Format price as currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const handleToggleAvailability = async () => {
        try {
            setIsUpdating(true)
            await toggleAvailability.mutateAsync({
                id: item.id,
                isAvailable: !item.is_available
            })
            toast.success(`Menu item ${!item.is_available ? 'enabled' : 'disabled'} successfully`)
        } catch (error) {
            toast.error('Failed to update availability')
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleToggleFeatured = async () => {
        try {
            setIsUpdating(true)
            await toggleFeatured.mutateAsync({
                id: item.id,
                isFeatured: !item.is_featured
            })
            toast.success(`Menu item ${!item.is_featured ? 'featured' : 'unfeatured'} successfully`)
        } catch (error) {
            toast.error('Failed to update featured status')
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card className="overflow-hidden h-full flex flex-col">
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <Utensils className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                        {item.is_featured && (
                            <Badge variant="default" className="bg-amber-500">Featured</Badge>
                        )}
                        {!item.is_available && (
                            <Badge variant="secondary">Unavailable</Badge>
                        )}
                    </div>
                </div>

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1 text-lg">{item.name}</CardTitle>
                        <p className="font-semibold text-lg">{formatPrice(item.price)}</p>
                    </div>
                </CardHeader>

                <CardContent className="space-y-2 flex-grow">
                    {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                        {item.restaurant && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{item.restaurant.name}</span>
                            </Badge>
                        )}

                        {item.category && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{item.category.name}</span>
                            </Badge>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="border-t pt-4 flex justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/menu-items/${item.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-1" /> View
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isUpdating}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/menu-items/${item.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleAvailability} disabled={isUpdating}>
                                {item.is_available ? (
                                    <>
                                        <EyeOff className="h-4 w-4 mr-2" /> Mark as Unavailable
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4 mr-2" /> Mark as Available
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleFeatured} disabled={isUpdating}>
                                {item.is_featured ? (
                                    <>
                                        <Star className="h-4 w-4 mr-2" /> Remove Featured
                                    </>
                                ) : (
                                    <>
                                        <Star className="h-4 w-4 mr-2" /> Mark as Featured
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete(item)}
                                disabled={isUpdating}
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        </motion.div>
    )
}