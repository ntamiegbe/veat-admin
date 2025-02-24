'use client'

import { useRestaurants } from '@/hooks/useResturants'
import { Database } from '@/types/supabase'
import { useUser } from '@supabase/auth-helpers-react'

type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']

export default function RestaurantManagement() {
    const { restaurants, isLoading, createRestaurant } = useRestaurants()
    const user = useUser()

    const handleCreateRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const newRestaurant: RestaurantInsert = {
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            phone_number: formData.get('phone_number') as string,
            owner_id: user?.id as string,
            opening_hours: {
                monday: { open: '08:00', close: '20:00', is_closed: false },
                tuesday: { open: '08:00', close: '20:00', is_closed: false },
                wednesday: { open: '08:00', close: '20:00', is_closed: false },
                thursday: { open: '08:00', close: '20:00', is_closed: false },
                friday: { open: '08:00', close: '20:00', is_closed: false },
                saturday: { open: '10:00', close: '22:00', is_closed: false },
                sunday: { open: '10:00', close: '22:00', is_closed: false }
            }
        }

        try {
            await createRestaurant.mutateAsync(newRestaurant)
            // Reset form or show success message
        } catch (error) {
            // log error message
            console.error(error)
        }
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div>
            <h1>Restaurant Management</h1>

            <form onSubmit={handleCreateRestaurant}>
                <input
                    name="name"
                    placeholder="Restaurant name"
                    required
                />
                <input
                    name="address"
                    placeholder="Address"
                    required
                />
                <input
                    name="phone_number"
                    placeholder="Phone number"
                    required
                />
                <button type="submit" disabled={createRestaurant.isPending}>
                    {createRestaurant.isPending ? 'Creating...' : 'Create Restaurant'}
                </button>
            </form>

            <div>
                {restaurants?.map(restaurant => (
                    <div key={restaurant.id}>
                        <h3>{restaurant.name}</h3>
                        <p>{restaurant.address}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}