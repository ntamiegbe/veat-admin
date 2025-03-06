'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Search,
    Filter,
    RefreshCcw,
    Plus,
    Grid,
    List
} from 'lucide-react'
import { useUsers } from '@/services/useUsers'
import UsersList from '@/components/users/UsersList'
import UserStats from '@/components/users/UserStats'
import UserFilters from '@/components/users/UserFilters'
import { UserFilterValues } from '@/components/users/UserFilters'

export default function UsersListContent() {
    // Log when the component renders
    useEffect(() => {
        console.log('UsersListContent rendered');
    }, []);

    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [activeTab, setActiveTab] = useState<string>('all')
    const [filters, setFilters] = useState<{
        userType: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin' | undefined,
        isPhoneVerified: boolean | undefined,
        sortBy: 'full_name' | 'created_at' | 'email' | 'phone_number',
        sortOrder: 'asc' | 'desc'
    }>({
        userType: undefined,
        isPhoneVerified: undefined,
        sortBy: 'created_at',
        sortOrder: 'desc'
    })

    // Update filters when tab changes
    useEffect(() => {
        switch (activeTab) {
            case 'customers':
                setFilters(prev => ({ ...prev, userType: 'user' }))
                break
            case 'restaurant-owners':
                setFilters(prev => ({ ...prev, userType: 'restaurant_owner' }))
                break
            case 'riders':
                setFilters(prev => ({ ...prev, userType: 'delivery_rider' }))
                break
            case 'admins':
                setFilters(prev => ({ ...prev, userType: 'admin' }))
                break
            default:
                setFilters(prev => ({ ...prev, userType: undefined }))
        }
    }, [activeTab])

    // Convert our filters state to match UserFilterValues type
    const userFilterValues = {
        searchTerm: searchTerm,
        userType: filters.userType,
        isPhoneVerified: filters.isPhoneVerified,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        viewMode: viewMode
    }

    // Handle filter changes from UserFilters component
    const handleFiltersChange = (newFilters: UserFilterValues) => {
        setSearchTerm(newFilters.searchTerm);
        setViewMode(newFilters.viewMode);
        setFilters({
            userType: newFilters.userType,
            isPhoneVerified: newFilters.isPhoneVerified,
            sortBy: newFilters.sortBy,
            sortOrder: newFilters.sortOrder
        });
    }

    // Fetch users with filters
    const {
        users,
        isLoading,
        fetchError,
        refetch
    } = useUsers({
        searchTerm,
        ...filters
    })

    // Fetch user stats
    const { getUserStats } = useUsers()
    const [stats, setStats] = useState<{
        total: number,
        customers: number,
        restaurantOwners: number,
        riders: number,
        admins: number,
        verified: number
    }>({
        total: 0,
        customers: 0,
        restaurantOwners: 0,
        riders: 0,
        admins: 0,
        verified: 0
    })

    // Fetch stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsData = await getUserStats()
                setStats(statsData)
            } catch (error) {
                console.error('Error fetching user stats:', error)
            }
        }

        fetchStats()
    }, [getUserStats])

    const handleRefresh = () => {
        refetch()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage all users in the system
                    </p>
                </div>
                <Button onClick={() => router.push('/admin/users/new')} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            <UserStats stats={stats} />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search users by name, email, or phone..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="w-full sm:w-auto"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="w-10 sm:w-10 p-0"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <div className="border rounded-md flex">
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-r-none"
                            onClick={() => handleFiltersChange({ ...userFilterValues, viewMode: 'table' })}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-l-none"
                            onClick={() => handleFiltersChange({ ...userFilterValues, viewMode: 'grid' })}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <UserFilters
                            filters={userFilterValues}
                            onFiltersChange={handleFiltersChange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Users</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="restaurant-owners">Restaurant Owners</TabsTrigger>
                    <TabsTrigger value="riders">Delivery Riders</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                    <UsersList
                        users={users ?? null}
                        isLoading={isLoading}
                        error={fetchError}
                        viewMode={viewMode}
                        showActions={true}
                        showType={true}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="customers" className="mt-0">
                    <UsersList
                        users={users ?? null}
                        isLoading={isLoading}
                        error={fetchError}
                        viewMode={viewMode}
                        showActions={true}
                        showType={false}
                        userType="user"
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="restaurant-owners" className="mt-0">
                    <UsersList
                        users={users ?? null}
                        isLoading={isLoading}
                        error={fetchError}
                        viewMode={viewMode}
                        showActions={true}
                        showType={false}
                        userType="restaurant_owner"
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="riders" className="mt-0">
                    <UsersList
                        users={users ?? null}
                        isLoading={isLoading}
                        error={fetchError}
                        viewMode={viewMode}
                        showActions={true}
                        showType={false}
                        userType="delivery_rider"
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="admins" className="mt-0">
                    <UsersList
                        users={users ?? null}
                        isLoading={isLoading}
                        error={fetchError}
                        viewMode={viewMode}
                        showActions={true}
                        showType={false}
                        userType="admin"
                        onRefresh={handleRefresh}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
} 