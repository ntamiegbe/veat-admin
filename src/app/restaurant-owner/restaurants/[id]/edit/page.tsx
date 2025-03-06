'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth, useRequireRole } from '@/services/useAuth'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']

export default function EditRestaurantPage() {
    const params = useParams()
    const router = useRouter()
    const restaurantId = params.id as string
    const { userRestaurants, isLoading: isAuthLoading, ownsRestaurant } = useAuth()
    const { isLoading: isAuthChecking } = useRequireRole('restaurant_owner')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<RestaurantUpdate>({
        name: '',
        description: '',
        address: '',
        phone_number: '',
        is_active: true,
        is_featured: false,
        minimum_order_amount: 0,
        average_preparation_time: 0
    })

    const supabase = createClientComponentClient<Database>()

    // Check if user owns this restaurant
    useEffect(() => {
        if (!isAuthLoading && userRestaurants) {
            const hasAccess = ownsRestaurant(restaurantId)
            if (!hasAccess) {
                toast.error('You do not have permission to edit this restaurant')
                router.push('/unauthorized')
            }
        }
    }, [isAuthLoading, userRestaurants, restaurantId, ownsRestaurant, router])

    // Fetch restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const { data, error } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('id', restaurantId)
                    .single()

                if (error) throw error

                setFormData({
                    id: data.id,
                    name: data.name,
                    description: data.description || '',
                    address: data.address || '',
                    phone_number: data.phone_number || '',
                    is_active: data.is_active || false,
                    is_featured: data.is_featured || false,
                    minimum_order_amount: data.minimum_order_amount || 0,
                    average_preparation_time: data.average_preparation_time || 0
                })
            } catch (error) {
                console.error('Error fetching restaurant:', error)
                toast.error('Failed to load restaurant data')
            } finally {
                setIsLoading(false)
            }
        }

        if (restaurantId && !isAuthLoading) {
            fetchRestaurant()
        }
    }, [restaurantId, supabase, isAuthLoading])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const value = parseFloat(e.target.value) || 0
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSwitchChange = (field: 'is_active' | 'is_featured') => (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const { error } = await supabase
                .from('restaurants')
                .update(formData)
                .eq('id', restaurantId)

            if (error) throw error

            toast.success('Restaurant updated successfully')
            router.push('/restaurant-owner/dashboard')
        } catch (error) {
            console.error('Error updating restaurant:', error)
            toast.error('Failed to update restaurant')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading || isAuthChecking || isAuthLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push('/restaurant-owner/dashboard')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Restaurant</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Restaurant Information</CardTitle>
                    <CardDescription>
                        Update your restaurant&apos;s details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="restaurant-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Restaurant Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter restaurant name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                placeholder="Brief description of your restaurant"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* <div className="space-y-2">
                                <Label htmlFor="cuisine_type">Cuisine Type</Label>
                                <Input
                                    id="cuisine_type"
                                    name="cuisine_type"
                                    value={formData.cuisine_type || ''}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Italian, Chinese, Mexican"
                                />
                            </div> */}

                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number || ''}
                                    onChange={handleInputChange}
                                    placeholder="Restaurant contact number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleInputChange}
                                placeholder="Restaurant address"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* <div className="space-y-2">
                                <Label htmlFor="delivery_fee">Delivery Fee ($)</Label>
                                <Input
                                    id="delivery_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.delivery_fee || 0}
                                    onChange={(e) => handleNumericChange(e, 'delivery_fee')}
                                    placeholder="0.00"
                                />
                            </div> */}

                            <div className="space-y-2">
                                <Label htmlFor="minimum_order_amount">Minimum Order ($)</Label>
                                <Input
                                    id="minimum_order_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.minimum_order_amount || 0}
                                    onChange={(e) => handleNumericChange(e, 'minimum_order_amount')}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="average_preparation_time">Avg. Prep Time (min)</Label>
                                <Input
                                    id="average_preparation_time"
                                    type="number"
                                    min="0"
                                    value={formData.average_preparation_time || 0}
                                    onChange={(e) => handleNumericChange(e, 'average_preparation_time')}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive restaurants won&apos;t be shown to customers
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={!!formData.is_active}
                                onCheckedChange={handleSwitchChange('is_active')}
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/restaurant-owner/dashboard')}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="restaurant-form"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 