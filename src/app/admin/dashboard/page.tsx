'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import {
    ShoppingBag,
    TrendingUp,
    Building2,
    Users,
    Utensils,
    Bike,
    Star
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'

export default function DashboardOverview() {
    const supabase = createClientComponentClient<Database>()

    // Stats data fetching
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            // In a real app, you would fetch actual stats from your API or database
            // For demo purposes, we'll mock the response with random data

            // Example of how to fetch restaurant count:
            const { count: restaurantCount, error: restaurantError } = await supabase
                .from('restaurants')
                .select('*', { count: 'exact', head: true })

            if (restaurantError) throw restaurantError

            // For demo purposes, let's simulate fetching other stats
            return {
                totalOrders: Math.floor(Math.random() * 1000) + 500,
                totalRevenue: Math.floor(Math.random() * 10000) + 5000,
                restaurantCount: restaurantCount || 0,
                userCount: Math.floor(Math.random() * 500) + 100,
                menuItemCount: Math.floor(Math.random() * 2000) + 500,
                riderCount: Math.floor(Math.random() * 50) + 20,
                averageRating: (Math.random() * 2 + 3).toFixed(1), // Between 3.0 and 5.0
                trends: {
                    ordersChange: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10,
                    revenueChange: Math.random() > 0.6 ? Math.random() * 15 : -Math.random() * 8,
                    usersChange: Math.random() * 12,
                    restaurantsChange: Math.random() * 5
                }
            }
        },
        refetchInterval: false,
        refetchOnWindowFocus: false
    })
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your food delivery platform stats and performance
                </p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Orders"
                    value={isStatsLoading ? "" : stats?.totalOrders.toLocaleString() || ""}
                    description="Total orders across all restaurants"
                    icon={<ShoppingBag size={18} />}
                    change={stats?.trends.ordersChange}
                    index={0}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Revenue"
                    value={isStatsLoading ? "" : `₦${stats?.totalRevenue.toLocaleString()}` || ""}
                    description="Total platform revenue"
                    icon={<TrendingUp size={18} />}
                    change={stats?.trends.revenueChange}
                    index={1}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Restaurants"
                    value={isStatsLoading ? "" : stats?.restaurantCount.toLocaleString() || ""}
                    description="Active restaurants on platform"
                    icon={<Building2 size={18} />}
                    change={stats?.trends.restaurantsChange}
                    index={2}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Users"
                    value={isStatsLoading ? "" : stats?.userCount.toLocaleString() || ""}
                    description="Registered platform users"
                    icon={<Users size={18} />}
                    change={stats?.trends.usersChange}
                    index={3}
                    loading={isStatsLoading}
                />
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                <StatCard
                    title="Menu Items"
                    value={isStatsLoading ? "" : stats?.menuItemCount.toLocaleString() || ""}
                    description="Total items across all restaurants"
                    icon={<Utensils size={18} />}
                    index={4}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Delivery Riders"
                    value={isStatsLoading ? "" : stats?.riderCount.toLocaleString() || ""}
                    description="Active delivery personnel"
                    icon={<Bike size={18} />}
                    index={5}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Average Rating"
                    value={isStatsLoading ? "" : stats?.averageRating || ""}
                    description="Average restaurant rating"
                    icon={<Star size={18} />}
                    index={6}
                    loading={isStatsLoading}
                />
            </div>
        </div>
    )
}