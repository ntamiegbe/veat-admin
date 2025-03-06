import { useState, useEffect } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import {
    Users,
    UserCheck,
    ChefHat,
    Bike,
    ShieldCheck
} from 'lucide-react'
import { useUsers } from '@/services/useUsers'
import { useQueryClient } from '@tanstack/react-query'

export default function UserStats() {
    const queryClient = useQueryClient()
    const [stats, setStats] = useState<{
        totalUsers: number;
        verifiedUsers: number;
        typeCounts: Record<string, number>;
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const { getUserStats } = useUsers()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true)

                const data = await getUserStats()

                // Cache the stats
                queryClient.setQueryData(['userStats'], data)

                setStats(data)
            } catch (error) {
                console.error('Error fetching user stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, []) // Remove dependencies to prevent multiple calls

    // Safe value extraction with fallback
    const getStatValue = (key: string) => {
        if (!stats?.typeCounts) return 0
        return stats.typeCounts[key] || 0
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
                title="Total Users"
                value={stats?.totalUsers?.toLocaleString() || "0"}
                description="All registered users"
                icon={<Users size={18} />}
                index={0}
                loading={isLoading}
            />

            <StatCard
                title="Verified Users"
                value={stats?.verifiedUsers?.toLocaleString() || "0"}
                description="Users with verified phones"
                icon={<UserCheck size={18} />}
                change={stats && stats.totalUsers > 0
                    ? (stats.verifiedUsers / stats.totalUsers * 100)
                    : undefined}
                index={1}
                loading={isLoading}
            />

            <StatCard
                title="Restaurant Owners"
                value={getStatValue('restaurant_owner').toLocaleString()}
                description="Restaurant managers"
                icon={<ChefHat size={18} />}
                index={2}
                loading={isLoading}
            />

            <StatCard
                title="Delivery Riders"
                value={getStatValue('delivery_rider').toLocaleString()}
                description="Active delivery personnel"
                icon={<Bike size={18} />}
                index={3}
                loading={isLoading}
            />

            <StatCard
                title="Customers"
                value={getStatValue('user').toLocaleString()}
                description="Regular app users"
                icon={<ShieldCheck size={18} />}
                index={4}
                loading={isLoading}
            />
        </div>
    )
}