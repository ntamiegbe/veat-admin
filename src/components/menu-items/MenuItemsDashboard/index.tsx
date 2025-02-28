/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CardContent, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    PieChart,
    Bar,
    BarChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import {
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    RefreshCcw,
    Utensils,
    Star,
    TrendingUp
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'

export default function MenuItemsDashboard({ restaurantId }: { restaurantId?: string }) {
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    // Fetch menu items stats
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['menu-items-stats', restaurantId],
        queryFn: async () => {
            // Total menu items count
            const { count: totalCount, error: countError } = await supabase
                .from('menu_items')
                .select('*', { count: 'exact', head: true })
                .eq(restaurantId ? 'restaurant_id' : 'id', restaurantId || '*')

            if (countError) throw countError

            // Available items count
            const { count: availableCount, error: availableError } = await supabase
                .from('menu_items')
                .select('*', { count: 'exact', head: true })
                .eq('is_available', true)
                .eq(restaurantId ? 'restaurant_id' : 'id', restaurantId || '*')

            if (availableError) throw availableError

            // Featured items count
            const { count: featuredCount, error: featuredError } = await supabase
                .from('menu_items')
                .select('*', { count: 'exact', head: true })
                .eq('is_featured', true)
                .eq(restaurantId ? 'restaurant_id' : 'id', restaurantId || '*')

            if (featuredError) throw featuredError

            // Top ordered items - This would be a more complex query in a real app
            // For now we'll just fetch all items and sort them
            const { data: topItems, error: topItemsError } = await supabase
                .from('menu_items')
                .select('id, name, total_orders, average_rating')
                .eq(restaurantId ? 'restaurant_id' : 'id', restaurantId || '*')
                .order('total_orders', { ascending: false })
                .limit(5)

            if (topItemsError) throw topItemsError

            // Category distribution
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('menu_items')
                .select(`
          category:category_id(id, name),
          category_id
        `)
                .eq(restaurantId ? 'restaurant_id' : 'id', restaurantId || '*')

            if (categoriesError) throw categoriesError

            // Process category distribution data
            const categoryData = categoriesData.reduce((acc, item) => {
                const categoryName = item.category ? (item.category as any).name : 'Uncategorized'

                if (!acc[categoryName]) {
                    acc[categoryName] = 0
                }

                acc[categoryName]++
                return acc
            }, {} as Record<string, number>)

            const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
                name,
                value
            }))

            return {
                totalItems: totalCount || 0,
                availableItems: availableCount || 0,
                featuredItems: featuredCount || 0,
                topItems: topItems || [],
                categoryDistribution: categoryChartData,
                // Add random change percentages for UI demonstration
                changes: {
                    totalChange: Math.random() > 0.5 ? Math.random() * 15 : -Math.random() * 8,
                    availableChange: Math.random() > 0.5 ? Math.random() * 12 : -Math.random() * 6,
                    featuredChange: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10
                }
            }
        },
        refetchOnWindowFocus: false
    })

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Menu Items Overview</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.refresh()}
                    className="gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                <StatCard
                    title="Total Menu Items"
                    value={isStatsLoading ? "" : stats?.totalItems.toString() || "0"}
                    description="Total items across all restaurants"
                    icon={<Utensils size={18} />}
                    change={stats?.changes.totalChange}
                    index={0}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Available Items"
                    value={isStatsLoading ? "" : stats?.availableItems.toString() || "0"}
                    description="Items currently available to order"
                    icon={<TrendingUp size={18} />}
                    change={stats?.changes.availableChange}
                    index={1}
                    loading={isStatsLoading}
                />

                <StatCard
                    title="Featured Items"
                    value={isStatsLoading ? "" : stats?.featuredItems.toString() || "0"}
                    description="Items highlighted to customers"
                    icon={<Star size={18} />}
                    change={stats?.changes.featuredChange}
                    index={2}
                    loading={isStatsLoading}
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-1"
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <BarChartIcon className="h-5 w-5 text-primary" />
                                    Top Ordered Items
                                </h3>
                            </div>
                            {isStatsLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={stats?.topItems.map(item => ({
                                            name: item.name,
                                            orders: item.total_orders || 0
                                        }))}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="orders" fill="#8884d8" name="Total Orders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-1"
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-primary" />
                                    Categories Distribution
                                </h3>
                            </div>
                            {isStatsLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={stats?.categoryDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {stats?.categoryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}