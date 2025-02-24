'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRestaurants } from '@/hooks/useResturants'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, MapPin, Phone } from 'lucide-react'
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User } from '@supabase/supabase-js'

type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']

export default function RestaurantManagement() {
    const { restaurants, isLoading, fetchError, createRestaurant } = useRestaurants()
    const [user, setUser] = useState<User | null>(null)
    const [isAuthChecking, setIsAuthChecking] = useState(true)
    const [isFormVisible, setIsFormVisible] = useState(false)
    const supabase = createClientComponentClient<Database>()

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error
                setUser(session?.user ?? null)
            } catch (error) {
                console.error('Auth error:', error)
                toast("Error", {
                    description: "Failed to fetch user session",
                })
            } finally {
                setIsAuthChecking(false)
            }
        }

        getUser()

        // Set up real-time auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    const handleCreateRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const formData = new FormData(form)

        const newRestaurant: RestaurantInsert = {
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            phone_number: formData.get('phone_number') as string,
            owner_id: user!.id,
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
            if (!user?.id) {
                throw new Error('User not authenticated')
            }

            await createRestaurant.mutateAsync(newRestaurant)

            toast("Success!", {
                description: "Restaurant created successfully",
            })

            setIsFormVisible(false)
            form.reset()
        } catch (error) {
            console.error('Creation error:', error)
            toast("Error", {
                description: error instanceof Error ? error.message : "Failed to create restaurant. Please try again.",
            })
        }
    }

    if (isAuthChecking || isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        )
    }

    if (fetchError) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertDescription>
                    Error loading restaurants: {fetchError.message}
                </AlertDescription>
            </Alert>
        )
    }

    if (!user) {
        return (
            <Alert className="m-4">
                <AlertDescription>
                    Please log in to manage restaurants.
                </AlertDescription>
            </Alert>
        )
    }
    
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Restaurant Management</h1>
                <Button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    variant="default"
                    disabled={createRestaurant.isPending}
                >
                    {isFormVisible ? 'Cancel' : 'Add Restaurant'}
                </Button>
            </div>

            <AnimatePresence>
                {isFormVisible && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>New Restaurant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateRestaurant} className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Building2 className="text-gray-500" size={20} />
                                        <Input
                                            name="name"
                                            placeholder="Restaurant name"
                                            required
                                            className="flex-1"
                                            disabled={createRestaurant.isPending}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="text-gray-500" size={20} />
                                        <Input
                                            name="address"
                                            placeholder="Address"
                                            required
                                            className="flex-1"
                                            disabled={createRestaurant.isPending}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="text-gray-500" size={20} />
                                        <Input
                                            name="phone_number"
                                            placeholder="Phone number"
                                            required
                                            className="flex-1"
                                            disabled={createRestaurant.isPending}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={createRestaurant.isPending}
                                        className="w-full"
                                    >
                                        {createRestaurant.isPending ? 'Creating...' : 'Create Restaurant'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid gap-4 md:grid-cols-2"
                >
                    {restaurants?.map(restaurant => (
                        <motion.div
                            key={restaurant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>{restaurant.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <MapPin size={16} />
                                        <span>{restaurant.address}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Phone size={16} />
                                        <span>{restaurant.phone_number}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}