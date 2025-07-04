/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { useTravelTimes } from './useTravelTimes'

type Order = Database['public']['Tables']['orders']['Row'] & {
    user?: {
        id: string
        full_name: string
        phone_number: string
        email: string
    }
    items?: Array<{
        id: string
        name: string
        price: number
        quantity: number
        restaurantId: string
    }>
}
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
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    orderId?: string
}

export function useOrders(filters: OrderFilters = {}) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()
    const { getEstimatedDeliveryTime } = useTravelTimes()
    const defaultFilters: OrderFilters = {
        searchTerm: '',
        userId: filters.userId,
        restaurantId: filters.restaurantId,
        riderId: filters.riderId,
        status: filters.status,
        locationId: undefined,
        startDate: undefined,
        endDate: undefined,
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc',
        orderId: filters.orderId
    }

    const fetchOrders = async () => {
        try {
            // If orderId is provided, fetch a single order
            if (defaultFilters.orderId) {
                let query = supabase
                    .from('orders')
                    .select(`
                        *,
                        user:users!orders_user_id_fkey(
                            id,
                            full_name,
                            phone_number,
                            email
                        )
                    `)
                    .eq('id', defaultFilters.orderId)

                if (defaultFilters.restaurantId) {
                    console.log('Applying restaurant filter:', defaultFilters.restaurantId)
                    query = query.eq('restaurant_id', defaultFilters.restaurantId)
                }

                const { data, error } = await query.single()

                if (error) {
                    console.error('Error fetching order:', error)
                    throw error
                }

                if (!data) {
                    console.log(`No order found with ID: ${defaultFilters.orderId}`)
                    return []
                }

                return [data]
            }

            // Existing code for fetching multiple orders
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    user:users!orders_user_id_fkey(
                        id,
                        full_name,
                        phone_number,
                        email
                    )
                `)

            // Apply filters
            if (defaultFilters.userId) {
                query = query.eq('user_id', defaultFilters.userId)
            }

            if (defaultFilters.restaurantId) {
                query = query.eq('restaurant_id', defaultFilters.restaurantId)
            }

            if (defaultFilters.riderId) {
                query = query.eq('rider_id', defaultFilters.riderId)
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

            if (error) {
                console.error('Error fetching orders:', error)
                throw error
            }

            if (!data || data.length === 0) {
                console.log('No orders found for restaurant:', defaultFilters.restaurantId)
                return []
            }

            return data
        } catch (error) {
            console.error('Error in fetchOrders:', error)
            throw error
        }
    }

    // Fetch orders with related data and filtering
    const {
        data: orders,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['orders', defaultFilters],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true, // Enable automatic refetch on window focus
        refetchOnMount: true, // Enable refetch on mount
        refetchOnReconnect: true, // Enable refetch on reconnect
        retry: 2, // Increase retry attempts
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
                user:users!orders_user_id_fkey(*),
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
    const updateOrderStatus = useMutation<Order, PostgrestError, { id: string, order_status: string }>({
        mutationFn: async ({ id, order_status }) => {
            const { data, error } = await supabase
                .from('orders')
                .update({ order_status: order_status })
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
                restaurant.location_id || '',
                deliveryLocationId
            )

            // Calculate estimated delivery time
            const now = new Date()
            const estimatedDeliveryAt = new Date(now.getTime() + estimatedMinutes * 60000) // convert minutes to milliseconds

            // Update order with pickup confirmation and estimated delivery time
            const { data, error } = await supabase
                .from('orders')
                .update({
                    order_status: 'in_transit',
                    estimated_delivery_time: estimatedDeliveryAt.toISOString()
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
                    order_status: 'completed',
                    actual_delivery_time: now.toISOString()
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
        switch (order.order_status) {
            case 'preparing':
                return 0
            case 'in_transit':
                return 50
            case 'completed':
                return 100
            default:
                return 0
        }
    }

    // Get order delivery status message based on progress
    const getOrderDeliveryStatusMessage = (order: Order): string => {
        switch (order.order_status) {
            case 'preparing':
                return 'Preparing order'
            case 'in_transit':
                return 'Order is on the way'
            case 'completed':
                return 'Delivered'
            default:
                return 'Order received'
        }
    }

    // Get estimated minutes remaining
    const getEstimatedMinutesRemaining = (order: Order): number | null => {
        if (!order.estimated_delivery_time) {
            return null
        }

        if (order.order_status === 'completed') {
            return 0
        }

        const estimatedDeliveryTime = new Date(order.estimated_delivery_time).getTime()
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
        error: fetchError,
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