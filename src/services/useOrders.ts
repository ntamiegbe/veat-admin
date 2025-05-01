/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { useTravelTimes } from './useTravelTimes'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

type OrderFilters = {
    searchTerm?: string
    userId?: string
    restaurantId?: string
    riderId?: string
    status?: string
    locationId?: string
    startDate?: string
    endDate?: string
    sortBy?: 'created_at' | 'total_amount' | 'estimated_delivery_time'
    sortOrder?: 'asc' | 'desc'
}

export function useOrders(filters?: OrderFilters) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const { getEstimatedDeliveryTime } = useTravelTimes()
    const defaultFilters: OrderFilters = {
        searchTerm: '',
        userId: undefined,
        restaurantId: undefined,
        riderId: undefined,
        status: undefined,
        locationId: undefined,
        startDate: undefined,
        endDate: undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        ...filters
    }

    // Fetch orders with related data and filtering
    const {
        data: orders,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['orders', defaultFilters],
        queryFn: async () => {
            // Try to get from localStorage first
            const cacheKey = `orders-${JSON.stringify(defaultFilters)}`;
            const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
            if (cachedData) {
                try {
                    const { data, timestamp } = JSON.parse(cachedData);
                    const isStale = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

                    if (!isStale) {
                        console.log(`Using cached orders data`);
                        return data;
                    }
                } catch (e) {
                    console.error('Error parsing cached orders data:', e);
                }
            }

            console.log(`Fetching orders with filters:`, defaultFilters);
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    user:user_id(id, full_name, phone_number, email),
                    restaurant:restaurant_id(id, name, address, phone_number),
                    delivery_rider:delivery_rider_id(id, full_name, phone_number),
                    delivery_location:delivery_location_id(id, name, address),
                    order_items(*)
                `)

            // Apply filters
            if (defaultFilters.userId) {
                query = query.eq('user_id', defaultFilters.userId)
            }

            if (defaultFilters.restaurantId) {
                query = query.eq('restaurant_id', defaultFilters.restaurantId)
            }

            if (defaultFilters.riderId) {
                query = query.eq('delivery_rider_id', defaultFilters.riderId)
            }

            if (defaultFilters.status) {
                query = query.eq('order_status', defaultFilters.status)
            }

            if (defaultFilters.locationId) {
                query = query.eq('delivery_location_id', defaultFilters.locationId)
            }

            if (defaultFilters.startDate) {
                query = query.gte('created_at', defaultFilters.startDate)
            }

            if (defaultFilters.endDate) {
                query = query.lte('created_at', defaultFilters.endDate)
            }

            // Apply search
            if (defaultFilters.searchTerm) {
                query = query.or(`id.ilike.%${defaultFilters.searchTerm}%,delivery_address.ilike.%${defaultFilters.searchTerm}%`)
            }

            // Apply sorting
            if (defaultFilters.sortBy) {
                query = query.order(defaultFilters.sortBy, {
                    ascending: defaultFilters.sortOrder === 'asc'
                })
            }

            const { data, error } = await query

            if (error) throw error

            // Save to localStorage with timestamp
            if (typeof window !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            }

            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        gcTime: 1000 * 60 * 10, // 10 minutes
    })

    // Get an order by ID with localStorage caching
    const getOrderById = async (id: string) => {
        // Try to get from localStorage first
        const cachedData = typeof window !== 'undefined' ? localStorage.getItem(`order-${id}`) : null;
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                const isStale = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

                if (!isStale) {
                    console.log(`Using cached data for order ${id}`);
                    return data;
                }
            } catch (e) {
                console.error('Error parsing cached order data:', e);
                // Continue to fetch from API if parsing fails
            }
        }

        console.log(`Fetching order ${id} from API`);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:user_id(id, full_name, phone_number, email),
                restaurant:restaurant_id(id, name, address, phone_number),
                delivery_rider:delivery_rider_id(id, full_name, phone_number),
                delivery_location:delivery_location_id(id, name, address),
                order_items(*, menu_item:menu_item_id(*))
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Save to localStorage with timestamp
        if (typeof window !== 'undefined') {
            localStorage.setItem(`order-${id}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        }

        return data;
    }

    // Create order
    const createOrder = useMutation<Order, PostgrestError, OrderInsert>({
        mutationFn: async (newOrder: OrderInsert) => {
            const { data, error } = await supabase
                .from('orders')
                .insert(newOrder)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })

            // Update the order in the cache
            queryClient.setQueryData(['order', data.id], data)
        }
    })

    // Update order
    const updateOrder = useMutation<Order, PostgrestError, OrderUpdate>({
        mutationFn: async (updatedOrder: OrderUpdate) => {
            const { data, error } = await supabase
                .from('orders')
                .update(updatedOrder)
                .eq('id', updatedOrder.id as string)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific order query
            queryClient.invalidateQueries({ queryKey: ['order', data.id] })

            // Update the order in the cache without refetching
            queryClient.setQueryData(['order', data.id], data)

            // Update the order in the orders list cache if it exists
            queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((order: Order) =>
                    order.id === data.id ? { ...order, ...data } : order
                )
            })
        }
    })

    // Update order status
    const updateOrderStatus = useMutation<Order, PostgrestError, { id: string, status: string }>({
        mutationFn: async ({ id, status }) => {
            const { data, error } = await supabase
                .from('orders')
                .update({ order_status: status })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific order query
            queryClient.invalidateQueries({ queryKey: ['order', data.id] })

            // Update the order in the cache without refetching
            queryClient.setQueryData(['order', data.id], data)

            // Update the order in the orders list cache if it exists
            queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((order: Order) =>
                    order.id === data.id ? { ...order, ...data } : order
                )
            })
        }
    })

    // Assign rider to order
    const assignRider = useMutation<Order, PostgrestError, { id: string, riderId: string | null }>({
        mutationFn: async ({ id, riderId }) => {
            const { data, error } = await supabase
                .from('orders')
                .update({ delivery_rider_id: riderId })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific order query
            queryClient.invalidateQueries({ queryKey: ['order', data.id] })

            // Update the order in the cache without refetching
            queryClient.setQueryData(['order', data.id], data)

            // Update the order in the orders list cache if it exists
            queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((order: Order) =>
                    order.id === data.id ? { ...order, ...data } : order
                )
            })
        }
    })

    // Add order item
    const addOrderItem = useMutation<OrderItem, PostgrestError, OrderItemInsert>({
        mutationFn: async (newOrderItem: OrderItemInsert) => {
            const { data, error } = await supabase
                .from('order_items')
                .insert(newOrderItem)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Invalidate the specific order query to refresh order items
            queryClient.invalidateQueries({ queryKey: ['order', data.order_id] })
        }
    })

    // Update order item
    const updateOrderItem = useMutation<OrderItem, PostgrestError, { id: string, quantity: number, specialInstructions?: string }>({
        mutationFn: async ({ id, quantity, specialInstructions }) => {
            const { data, error } = await supabase
                .from('order_items')
                .update({
                    quantity,
                    special_instructions: specialInstructions
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Invalidate the specific order query to refresh order items
            queryClient.invalidateQueries({ queryKey: ['order', data.order_id] })
        }
    })

    // Remove order item
    const removeOrderItem = useMutation<void, PostgrestError, string>({
        mutationFn: async (id: string) => {
            // First get the order item to know which order to invalidate
            const { error: fetchError } = await supabase
                .from('order_items')
                .select('order_id')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const { error } = await supabase
                .from('order_items')
                .delete()
                .eq('id', id)

            if (error) throw error

            return
        },
        onSuccess: (_data, _variables, context) => {
            // We need to know the order_id to invalidate the correct query
            // This would be available in the context if we passed it
            if (context) {
                queryClient.invalidateQueries({ queryKey: ['order', context] })
            }
        }
    })

    // Confirm order pickup and calculate estimated delivery time
    const confirmOrderPickup = useMutation<Order, PostgrestError, { id: string, restaurantId: string, deliveryLocationId: string }>({
        mutationFn: async ({ id, restaurantId, deliveryLocationId }) => {
            // Get restaurant location
            const { data: restaurant, error: restaurantError } = await supabase
                .from('restaurants')
                .select('location_id')
                .eq('id', restaurantId)
                .single()

            if (restaurantError) throw restaurantError

            // Calculate estimated delivery time based on restaurant location and delivery location
            const estimatedMinutes = await getEstimatedDeliveryTime(
                restaurant.location_id,
                deliveryLocationId
            )

            // Calculate estimated delivery time
            const now = new Date()
            const estimatedDeliveryAt = new Date(now.getTime() + estimatedMinutes * 60000) // convert minutes to milliseconds

            // Update order with pickup confirmation and estimated delivery time
            const { data, error } = await supabase
                .from('orders')
                .update({
                    pickup_confirmed_at: now.toISOString(),
                    estimated_delivery_minutes: estimatedMinutes,
                    estimated_delivery_at: estimatedDeliveryAt.toISOString(),
                    delivery_status: 'picked_up',
                    order_status: 'in_transit'
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific order query
            queryClient.invalidateQueries({ queryKey: ['order', data.id] })

            // Update the order in the cache without refetching
            queryClient.setQueryData(['order', data.id], data)

            // Update the order in the orders list cache if it exists
            queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((order: Order) =>
                    order.id === data.id ? { ...order, ...data } : order
                )
            })
        }
    })

    // Confirm order delivery
    const confirmOrderDelivery = useMutation<Order, PostgrestError, string>({
        mutationFn: async (id: string) => {
            const now = new Date()

            const { data, error } = await supabase
                .from('orders')
                .update({
                    delivery_confirmed_at: now.toISOString(),
                    delivery_status: 'delivered',
                    order_status: 'completed'
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            // Only invalidate the specific order query
            queryClient.invalidateQueries({ queryKey: ['order', data.id] })

            // Update the order in the cache without refetching
            queryClient.setQueryData(['order', data.id], data)

            // Update the order in the orders list cache if it exists
            queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
                if (!oldData) return oldData
                return oldData.map((order: Order) =>
                    order.id === data.id ? { ...order, ...data } : order
                )
            })
        }
    })

    // Get order delivery progress percentage
    const getOrderDeliveryProgress = (order: Order): number => {
        if (!order.pickup_confirmed_at) {
            return 0
        }

        if (order.delivery_confirmed_at) {
            return 100
        }

        if (!order.estimated_delivery_at) {
            return 50 // Default to 50% if no estimated delivery time
        }

        const pickupTime = new Date(order.pickup_confirmed_at).getTime()
        const estimatedDeliveryTime = new Date(order.estimated_delivery_at).getTime()
        const currentTime = new Date().getTime()
        const totalTime = estimatedDeliveryTime - pickupTime

        if (totalTime <= 0) {
            return 90 // Avoid division by zero
        }

        const elapsedTime = currentTime - pickupTime
        let progress = Math.round((elapsedTime / totalTime) * 100)

        // Cap progress at 99% until delivery is confirmed
        if (progress >= 100 && !order.delivery_confirmed_at) {
            progress = 99
        }

        return progress
    }

    // Get order delivery status message based on progress
    const getOrderDeliveryStatusMessage = (order: Order): string => {
        if (!order.pickup_confirmed_at) {
            return 'Preparing order'
        }

        if (order.delivery_confirmed_at) {
            return 'Delivered'
        }

        const progress = getOrderDeliveryProgress(order)

        if (progress < 25) {
            return 'Order picked up, on the way to you'
        } else if (progress < 50) {
            return 'Rider is on the way'
        } else if (progress < 75) {
            return 'Rider is halfway there'
        } else if (progress < 90) {
            return 'Your order is almost there'
        } else {
            return 'Arriving very soon'
        }
    }

    // Get estimated minutes remaining
    const getEstimatedMinutesRemaining = (order: Order): number | null => {
        if (!order.pickup_confirmed_at || !order.estimated_delivery_at) {
            return null
        }

        if (order.delivery_confirmed_at) {
            return 0
        }

        const estimatedDeliveryTime = new Date(order.estimated_delivery_at).getTime()
        const currentTime = new Date().getTime()
        const remainingTime = estimatedDeliveryTime - currentTime

        if (remainingTime <= 0) {
            return 1 // At least 1 minute
        }

        // Convert ms to minutes and round up
        return Math.ceil(remainingTime / 60000)
    }

    return {
        orders,
        isLoading,
        fetchError,
        getOrderById,
        createOrder,
        updateOrder,
        updateOrderStatus,
        assignRider,
        addOrderItem,
        updateOrderItem,
        removeOrderItem,
        confirmOrderPickup,
        confirmOrderDelivery,
        getOrderDeliveryProgress,
        getOrderDeliveryStatusMessage,
        getEstimatedMinutesRemaining,
        refetch
    }
} 