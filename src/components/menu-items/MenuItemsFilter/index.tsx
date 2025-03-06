'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    Building2,
    Tag,
    RefreshCcw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export type MenuItemFilters = {
    searchTerm: string
    restaurantId?: string
    categoryId?: string
    isAvailable?: boolean
    isFeatured?: boolean
    minPrice?: number
    maxPrice?: number
    sortBy: 'name' | 'price' | 'created_at' | 'total_orders' | 'average_rating'
    sortOrder: 'asc' | 'desc'
}

interface MenuItemsFilterProps {
    filters: MenuItemFilters
    onFilterChange: (filters: MenuItemFilters) => void
}

export default function MenuItemsFilter({ filters, onFilterChange }: MenuItemsFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [localFilters, setLocalFilters] = useState<MenuItemFilters>(filters)
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.minPrice || 0,
        filters.maxPrice || 10000
    ])
    const supabase = createClientComponentClient<Database>()

    // Fetch restaurants for filter
    const { data: restaurants } = useQuery({
        queryKey: ['restaurants-simple'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            return data
        }
    })

    // Fetch categories for the selected restaurant
    const { data: categories } = useQuery({
        queryKey: ['categories-simple', filters.restaurantId],
        queryFn: async () => {
            let query = supabase
                .from('menu_categories')
                .select('id, name')
                .order('name')

            if (filters.restaurantId) {
                query = query.eq('restaurant_id', filters.restaurantId)
            }

            const { data, error } = await query
            if (error) throw error
            return data
        },
        enabled: !!filters.restaurantId
    })

    // Update local filters when props change
    useEffect(() => {
        setLocalFilters(filters)
        setPriceRange([
            filters.minPrice || 0,
            filters.maxPrice || 10000
        ])
    }, [filters])

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalFilters(prev => ({ ...prev, searchTerm: e.target.value }))
    }

    // Handle search submission
    const handleSearch = () => {
        onFilterChange({ ...filters, searchTerm: localFilters.searchTerm })
    }

    // Handle restaurant selection
    const handleRestaurantChange = (value: string) => {
        const newFilters = {
            ...localFilters,
            restaurantId: value === 'all' ? undefined : value,
            categoryId: undefined  // Reset category when restaurant changes
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    // Handle category selection
    const handleCategoryChange = (value: string) => {
        const newFilters = {
            ...localFilters,
            categoryId: value === 'all' ? undefined : value
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    // // Handle price range changes
    // const handlePriceRangeChange = (values: number[]) => {
    //     setPriceRange(values as [number, number])
    // }

    // Apply price range filter
    const applyPriceRange = () => {
        const newFilters = {
            ...localFilters,
            minPrice: priceRange[0],
            maxPrice: priceRange[1]
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    // Handle availability toggle
    const handleAvailabilityChange = (checked: boolean) => {
        const newFilters = {
            ...localFilters,
            isAvailable: checked ? true : undefined
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    // Handle featured toggle
    const handleFeaturedChange = (checked: boolean) => {
        const newFilters = {
            ...localFilters,
            isFeatured: checked ? true : undefined
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    // Handle sort changes
    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-') as [MenuItemFilters['sortBy'], MenuItemFilters['sortOrder']]
        const newFilters = {
            ...localFilters,
            sortBy,
            sortOrder
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    // Reset all filters
    const resetFilters = () => {
        const resetFilters = {
            searchTerm: '',
            restaurantId: undefined,
            categoryId: undefined,
            isAvailable: undefined,
            isFeatured: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            sortBy: 'name' as const,
            sortOrder: 'asc' as const
        }
        setLocalFilters(resetFilters)
        setPriceRange([0, 10000])
        onFilterChange(resetFilters)
    }

    // Format price as currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search menu items..."
                        className="pl-10"
                        value={localFilters.searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full sm:w-auto"
                    >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>

                    <Select
                        value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                            <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                            <SelectItem value="created_at-desc">Newest First</SelectItem>
                            <SelectItem value="created_at-asc">Oldest First</SelectItem>
                            <SelectItem value="total_orders-desc">Most Ordered</SelectItem>
                            <SelectItem value="average_rating-desc">Highest Rated</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetFilters}
                        title="Reset Filters"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Restaurant
                                        </Label>
                                        <Select
                                            value={localFilters.restaurantId || ''}
                                            onValueChange={handleRestaurantChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All restaurants" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All restaurants</SelectItem>
                                                {restaurants?.map(restaurant => (
                                                    <SelectItem key={restaurant.id} value={restaurant.id}>
                                                        {restaurant.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Category
                                        </Label>
                                        <Select
                                            value={localFilters.categoryId || ''}
                                            onValueChange={handleCategoryChange}
                                            disabled={!localFilters.restaurantId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={localFilters.restaurantId ? "All categories" : "Select a restaurant first"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {localFilters.restaurantId && (
                                                    <SelectItem value="all">All categories</SelectItem>
                                                )}
                                                {categories?.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Price Range</Label>
                                        <div className="pt-6 px-2">
                                            <div className="flex justify-between mb-2">
                                                <span>{formatPrice(priceRange[0])}</span>
                                                <span>{formatPrice(priceRange[1])}</span>
                                            </div>
                                            <div className="py-4">
                                                {/* Replace with your Slider component */}
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        type="number"
                                                        value={priceRange[0]}
                                                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                                        className="w-24"
                                                    />
                                                    <div className="flex-1 h-1 bg-muted rounded"></div>
                                                    <Input
                                                        type="number"
                                                        value={priceRange[1]}
                                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                        className="w-24"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2"
                                                onClick={applyPriceRange}
                                            >
                                                Apply Price Range
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="available-only">Show only available items</Label>
                                            <Switch
                                                id="available-only"
                                                checked={!!localFilters.isAvailable}
                                                onCheckedChange={handleAvailabilityChange}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="featured-only">Show only featured items</Label>
                                            <Switch
                                                id="featured-only"
                                                checked={!!localFilters.isFeatured}
                                                onCheckedChange={handleFeaturedChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 flex items-end">
                                        <Button className="mt-auto" onClick={resetFilters}>
                                            Reset All Filters
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
