import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'

export function useOrderRealtime(restaurantId: string | undefined) {
    const supabase = createClientComponentClient<Database>()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!restaurantId) return

        // Subscribe to new orders
        const newOrdersChannel = supabase
            .channel('new-orders')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    // Show toast notification
                    toast({
                        title: 'New Order Received!',
                        description: `Order #${payload.new.id} has been placed.`,
                        variant: 'default',
                    })

                    // Invalidate orders query to trigger refetch
                    queryClient.invalidateQueries({ queryKey: ['orders'] })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    // Invalidate orders query to trigger refetch
                    queryClient.invalidateQueries({ queryKey: ['orders'] })

                    // If status changed, show notification
                    if (payload.old.order_status !== payload.new.order_status) {
                        toast({
                            title: 'Order Status Updated',
                            description: `Order #${payload.new.id} is now ${payload.new.order_status}`,
                            variant: 'default',
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(newOrdersChannel)
        }
    }, [restaurantId, supabase, toast, queryClient])
} 