/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Save,
    Loader2,
    ArrowLeft,
    Tag,
    User
} from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { useLocations } from '@/services/useLocations'
import { useRestaurants } from '@/services/useRestaurants'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']

interface RestaurantFormProps {
    restaurant?: Restaurant
    user: SupabaseUser | null
}

export default function RestaurantForm({ restaurant, user }: RestaurantFormProps) {
    const router = useRouter()
    const isEditMode = !!restaurant

    // Get locations for the dropdown
    const { locations, isLoading: isLocationsLoading } = useLocations()

    // Get restaurant owners for the dropdown
    const [restaurantOwners, setRestaurantOwners] = useState<any[]>([])
    const [isOwnersLoading, setIsOwnersLoading] = useState(false)

    // Restaurant operations
    const { createRestaurant, updateRestaurant } = useRestaurants()

    // Form state
    const [formData, setFormData] = useState<RestaurantInsert | RestaurantUpdate>({
        name: '',
        description: '',
        address: '',
        phone_number: '',
        email: '',
        location_id: null,
        is_active: true,
        is_featured: false,
        cuisine_types: [],
        owner_id: user?.id || '',
        opening_hours: {
            monday: { open: '08:00', close: '20:00', is_closed: false },
            tuesday: { open: '08:00', close: '20:00', is_closed: false },
            wednesday: { open: '08:00', close: '20:00', is_closed: false },
            thursday: { open: '08:00', close: '20:00', is_closed: false },
            friday: { open: '08:00', close: '20:00', is_closed: false },
            saturday: { open: '10:00', close: '22:00', is_closed: false },
            sunday: { open: '10:00', close: '22:00', is_closed: false }
        }
    })

    // Input for cuisine types (comma-separated)
    const [cuisineInput, setCuisineInput] = useState('')

    // Fetch restaurant owners
    useEffect(() => {
        const fetchRestaurantOwners = async () => {
            setIsOwnersLoading(true)
            try {
                const supabase = createClientComponentClient<Database>()
                const { data, error } = await supabase
                    .from('users')
                    .select('id, email, full_name')
                    .eq('user_type', 'restaurant_owner')

                if (error) throw error

                setRestaurantOwners(data || [])
            } catch (error) {
                console.error('Error fetching restaurant owners:', error)
                toast.error('Failed to load restaurant owners')
            } finally {
                setIsOwnersLoading(false)
            }
        }

        fetchRestaurantOwners()
    }, [])

    // Fill form with restaurant data if in edit mode
    useEffect(() => {
        if (isEditMode && restaurant) {
            setFormData({
                ...restaurant,
                cuisine_types: restaurant.cuisine_types || []
            })

            // Join cuisine types into a comma-separated string for the input
            setCuisineInput((restaurant.cuisine_types || []).join(', '))
        }
    }, [isEditMode, restaurant])

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle cuisine types input
    const handleCuisineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCuisineInput(e.target.value)

        // Split by comma and trim each value
        const cuisines = e.target.value
            .split(',')
            .map(cuisine => cuisine.trim())
            .filter(cuisine => cuisine) // Remove empty strings

        setFormData(prev => ({
            ...prev,
            cuisine_types: cuisines
        }))
    }

    // Handle toggle changes
    const handleToggleChange = (field: 'is_active' | 'is_featured') => (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    // Handle location selection
    const handleLocationChange = (locationId: string) => {
        setFormData(prev => ({
            ...prev,
            location_id: locationId
        }))
    }

    const handleOwnerChange = (ownerId: string) => {
        setFormData(prev => ({
            ...prev,
            owner_id: ownerId === 'none' ? '' : ownerId
        }))
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (!formData.owner_id) {
                throw new Error('Owner ID is required')
            }

            if (isEditMode) {
                await updateRestaurant.mutateAsync(formData as RestaurantUpdate)
                toast.success('Restaurant updated successfully')
            } else {
                await createRestaurant.mutateAsync(formData as RestaurantInsert)
                toast.success('Restaurant created successfully')
            }

            // Navigate back to restaurants list
            router.push('/admin/restaurants')
        } catch (error) {
            console.error('Error saving restaurant:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save restaurant')
        }
    }

    const isPending = createRestaurant.isPending || updateRestaurant.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Restaurant' : 'New Restaurant'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isEditMode
                            ? 'Update restaurant information'
                            : 'Add a new restaurant to the platform'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Restaurant Name <span className="text-destructive">*</span></Label>
                                <div className="flex items-center">
                                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter restaurant name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Restaurant description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    disabled={isPending}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="Full address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {isLocationsLoading ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select
                                            value={formData.location_id || ''}
                                            onValueChange={handleLocationChange}
                                            disabled={isPending || isLocationsLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select a location</SelectItem>
                                                {locations?.map((location: { id: string; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; is_campus: any }) => (
                                                    <SelectItem key={location.id} value={location.id}>
                                                        {location.name} {location.is_campus ? '(Campus)' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                {!formData.location_id && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Select a location to categorize this restaurant
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="owner">Restaurant Owner</Label>
                                <div className="flex items-center">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {isOwnersLoading ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select
                                            value={formData.owner_id || ''}
                                            onValueChange={handleOwnerChange}
                                            disabled={isPending || isOwnersLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an owner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select an owner</SelectItem>
                                                {restaurantOwners.map((owner) => (
                                                    <SelectItem key={owner.id} value={owner.id}>
                                                        {owner.full_name} ({owner.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Assign a restaurant owner who will manage this restaurant
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cuisine_types">Cuisine Types</Label>
                                <div className="flex items-center">
                                    <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cuisine_types"
                                        placeholder="E.g. Italian, Chinese, Fast Food (comma separated)"
                                        value={cuisineInput}
                                        onChange={handleCuisineChange}
                                        disabled={isPending}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Enter cuisine types separated by commas
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number <span className="text-destructive">*</span></Label>
                                    <div className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone_number"
                                            name="phone_number"
                                            placeholder="Contact phone number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            required
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Email address"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Active Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Inactive restaurants are hidden from customers
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={!!formData.is_active}
                                        onCheckedChange={handleToggleChange('is_active')}
                                        disabled={isPending}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_featured">Featured Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Featured restaurants appear on the home page
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_featured"
                                        checked={!!formData.is_featured}
                                        onCheckedChange={handleToggleChange('is_featured')}
                                        disabled={isPending}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="mt-6">
                    <CardFooter className="flex justify-between pt-6">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditMode ? 'Update Restaurant' : 'Create Restaurant'}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}