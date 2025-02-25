'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Search, Filter, ChevronDown } from 'lucide-react'

type RestaurantFilterProps = {
    filters: {
        searchTerm: string
        isActive: boolean | undefined
        isFeatured: boolean | undefined
        cuisineTypes: string[]
        sortBy: 'name' | 'created_at' | 'average_rating' | 'total_orders'
        sortOrder: 'asc' | 'desc'
    }
    setFilters: React.Dispatch<React.SetStateAction<{
        searchTerm: string
        isActive: boolean | undefined
        isFeatured: boolean | undefined
        cuisineTypes: string[]
        sortBy: 'name' | 'created_at' | 'average_rating' | 'total_orders'
        sortOrder: 'asc' | 'desc'
    }>>
}

export default function RestaurantFilters({ filters, setFilters }: RestaurantFilterProps) {
    // Common cuisine types
    const cuisineOptions = [
        'Nigerian', 'Fast Food', 'Chinese', 'Italian',
        'Indian', 'Seafood', 'Vegetarian', 'Desserts', 'Drinks'
    ]

    // For local state when typing in search field
    const [searchInput, setSearchInput] = useState(filters.searchTerm)

    // Apply search after user stops typing
    const handleSearch = () => {
        setFilters(prev => ({ ...prev, searchTerm: searchInput }))
    }

    // Handle cuisine type selection
    const handleCuisineToggle = (cuisine: string) => {
        setFilters(prev => {
            const currentCuisines = [...prev.cuisineTypes]

            if (currentCuisines.includes(cuisine)) {
                return {
                    ...prev,
                    cuisineTypes: currentCuisines.filter(c => c !== cuisine)
                }
            } else {
                return {
                    ...prev,
                    cuisineTypes: [...currentCuisines, cuisine]
                }
            }
        })
    }

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            isActive: undefined,
            isFeatured: undefined,
            cuisineTypes: [],
            sortBy: 'created_at',
            sortOrder: 'desc'
        })
        setSearchInput('')
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search restaurants..."
                            className="pl-8"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onBlur={handleSearch}
                        />
                    </div>

                    {/* Status filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-shrink-0">
                                <Filter className="mr-2 h-4 w-4" />
                                Status
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={filters.isActive === true}
                                onCheckedChange={() => setFilters(prev => ({
                                    ...prev,
                                    isActive: prev.isActive === true ? undefined : true
                                }))}
                            >
                                Active
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filters.isActive === false}
                                onCheckedChange={() => setFilters(prev => ({
                                    ...prev,
                                    isActive: prev.isActive === false ? undefined : false
                                }))}
                            >
                                Inactive
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filters.isFeatured === true}
                                onCheckedChange={() => setFilters(prev => ({
                                    ...prev,
                                    isFeatured: prev.isFeatured === true ? undefined : true
                                }))}
                            >
                                Featured
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Cuisine type filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-shrink-0">
                                <Filter className="mr-2 h-4 w-4" />
                                Cuisine
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filter by Cuisine</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {cuisineOptions.map(cuisine => (
                                <DropdownMenuCheckboxItem
                                    key={cuisine}
                                    checked={filters.cuisineTypes.includes(cuisine)}
                                    onCheckedChange={() => handleCuisineToggle(cuisine)}
                                >
                                    {cuisine}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort options */}
                    <div className="flex gap-2">
                        <Select
                            value={filters.sortBy}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                sortBy: value as typeof filters.sortBy
                            }))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="created_at">Date Added</SelectItem>
                                <SelectItem value="average_rating">Rating</SelectItem>
                                <SelectItem value="total_orders">Popularity</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sortOrder}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                sortOrder: value as typeof filters.sortOrder
                            }))}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reset button */}
                    <Button variant="ghost" onClick={resetFilters} className="flex-shrink-0">
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}