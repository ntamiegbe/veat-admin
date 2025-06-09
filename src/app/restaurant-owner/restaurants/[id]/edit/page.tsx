'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth, useRequireRole } from '@/services/useAuth'
import {
    Card,
    CardContent,
    CardDescription,
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
import RestaurantImagesForm from '@/components/resturants/RestaurantImagesForm'

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
                    average_preparation_time: data.average_preparation_time || 0,
                    logo_url: data.logo_url,
                    banner_url: data.banner_url
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

    const handleImagesUpdate = async (updates: { logo_url?: string | null; banner_url?: string | null }) => {
        try {
            const { error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', restaurantId)

            if (error) throw error

            // Update local state
            setFormData(prev => ({ ...prev, ...updates }))
            toast.success('Restaurant images updated successfully')
        } catch (error) {
            console.error('Error updating restaurant images:', error)
            throw error
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

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleInputChange}
                                    placeholder="Restaurant address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
                                <Input
                                    id="minimum_order_amount"
                                    type="number"
                                    value={formData.minimum_order_amount || 0}
                                    onChange={(e) => handleNumericChange(e, 'minimum_order_amount')}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="average_preparation_time">Average Preparation Time (minutes)</Label>
                                <Input
                                    id="average_preparation_time"
                                    type="number"
                                    value={formData.average_preparation_time || 0}
                                    onChange={(e) => handleNumericChange(e, 'average_preparation_time')}
                                    placeholder="0"
                                    min="0"
                                    step="1"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active || false}
                                    onCheckedChange={handleSwitchChange('is_active')}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <RestaurantImagesForm
                restaurantId={restaurantId}
                logoUrl={formData.logo_url || null}
                bannerUrl={formData.banner_url || null}
                onImagesUpdate={handleImagesUpdate}
            />
        </div>
    )
} 