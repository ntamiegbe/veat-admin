'use client'

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

export default function UserStats() {
    const [stats, setStats] = useState<{
        totalUsers: number;
        verifiedUsers: number;
        typeCounts: Record<string, number>;
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const { getUserStats } = useUsers()

    // Fetch user stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true)
                const data = await getUserStats()
                setStats(data)
            } catch (error) {
                console.error('Error fetching user stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [getUserStats])

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
                title="Total Users"
                value={stats?.totalUsers.toLocaleString() || ""}
                description="All registered users"
                icon={<Users size={18} />}
                index={0}
                loading={isLoading}
            />

            <StatCard
                title="Verified Users"
                value={stats?.verifiedUsers.toLocaleString() || ""}
                description="Users with verified phones"
                icon={<UserCheck size={18} />}
                change={stats ? (stats.verifiedUsers / stats.totalUsers * 100) : undefined}
                index={1}
                loading={isLoading}
            />

            <StatCard
                title="Restaurant Owners"
                value={stats?.typeCounts?.restaurant_owner.toLocaleString() || ""}
                description="Restaurant managers"
                icon={<ChefHat size={18} />}
                index={2}
                loading={isLoading}
            />

            <StatCard
                title="Delivery Riders"
                value={stats?.typeCounts?.delivery_rider.toLocaleString() || ""}
                description="Active delivery personnel"
                icon={<Bike size={18} />}
                index={3}
                loading={isLoading}
            />

            <StatCard
                title="Customers"
                value={stats?.typeCounts?.user.toLocaleString() || ""}
                description="Regular app users"
                icon={<ShieldCheck size={18} />}
                index={4}
                loading={isLoading}
            />
        </div>
    )
}