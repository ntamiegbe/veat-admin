'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    Filter,
    LayoutGrid,
    List
} from 'lucide-react'

export type UserFilterValues = {
    searchTerm: string
    userType: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin' | undefined
    isPhoneVerified: boolean | undefined
    sortBy: 'full_name' | 'created_at' | 'email' | 'phone_number'
    sortOrder: 'asc' | 'desc'
    viewMode: 'table' | 'grid'
}

interface UserFiltersProps {
    filters: UserFilterValues
    onFiltersChange: (filters: UserFilterValues) => void
    filterTypes?: Array<'userType' | 'verification' | 'sorting' | 'viewMode'>
    showViewModeToggle?: boolean
}

export default function UserFilters({
    filters,
    onFiltersChange,
    filterTypes = ['userType', 'verification', 'sorting', 'viewMode'],
    showViewModeToggle = true
}: UserFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.searchTerm)

    // Apply search after user stops typing
    const handleSearch = () => {
        onFiltersChange({ ...filters, searchTerm: searchInput })
    }

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Reset all filters
    const resetFilters = () => {
        onFiltersChange({
            searchTerm: '',
            userType: undefined,
            isPhoneVerified: undefined,
            sortBy: 'created_at',
            sortOrder: 'desc',
            viewMode: filters.viewMode // Preserve view mode
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
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSearch}
                        />
                    </div>

                    {/* User type filter */}
                    {filterTypes.includes('userType') && (
                        <Select
                            value={filters.userType || 'all'}
                            onValueChange={(value) => onFiltersChange({
                                ...filters,
                                userType: value === 'all' ? undefined : value as UserFilterValues['userType']
                            })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="User Type" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="user">Customers</SelectItem>
                                <SelectItem value="restaurant_owner">Restaurant Owners</SelectItem>
                                <SelectItem value="delivery_rider">Delivery Riders</SelectItem>
                                <SelectItem value="admin">Admins</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    {/* Verification filter */}
                    {filterTypes.includes('verification') && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="verified-filter"
                                checked={filters.isPhoneVerified !== undefined}
                                onCheckedChange={(checked) => onFiltersChange({
                                    ...filters,
                                    isPhoneVerified: checked ? true : undefined
                                })}
                            />
                            <Label htmlFor="verified-filter">
                                {filters.isPhoneVerified !== undefined ? 'Verified Only' : 'All Users'}
                            </Label>
                        </div>
                    )}

                    {/* Sorting options */}
                    {filterTypes.includes('sorting') && (
                        <div className="flex gap-2">
                            <Select
                                value={filters.sortBy}
                                onValueChange={(value) => onFiltersChange({
                                    ...filters,
                                    sortBy: value as UserFilterValues['sortBy']
                                })}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full_name">Name</SelectItem>
                                    <SelectItem value="created_at">Date Joined</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone_number">Phone</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.sortOrder}
                                onValueChange={(value) => onFiltersChange({
                                    ...filters,
                                    sortOrder: value as UserFilterValues['sortOrder']
                                })}
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
                    )}

                    {/* View mode toggle */}
                    {filterTypes.includes('viewMode') && showViewModeToggle && (
                        <div className="flex gap-2">
                            <Button
                                variant={filters.viewMode === 'table' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => onFiltersChange({ ...filters, viewMode: 'table' })}
                                className="h-9 w-9"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => onFiltersChange({ ...filters, viewMode: 'grid' })}
                                className="h-9 w-9"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Reset button */}
                    <Button variant="ghost" onClick={resetFilters} className="flex-shrink-0">
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}