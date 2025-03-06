'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocations } from '@/services/useLocations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Database } from '@/types/supabase'

type LocationUpdate = Database['public']['Tables']['locations']['Update']

export default function EditLocationPage() {
    const params = useParams()
    const router = useRouter()
    const locationId = params.id as string
    const [formData, setFormData] = useState<LocationUpdate>({
        name: '',
        description: '',
        address: '',
        is_campus: false,
        is_active: true
    })

    const {
        getLocationById,
        updateLocation,
        isLoading: isServiceLoading
    } = useLocations()

    // Fetch location data
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const location = await getLocationById(locationId)
                setFormData({
                    id: location.id,
                    name: location.name,
                    description: location.description || '',
                    address: location.address || '',
                    is_campus: location.is_campus || false,
                    is_active: location.is_active || true
                })
            } catch (error) {
                console.error('Error fetching location:', error)
                toast.error('Failed to load location data')
            }
        }

        if (locationId) {
            fetchLocation()
        }
    }, [locationId, getLocationById])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSwitchChange = (field: 'is_campus' | 'is_active') => (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await updateLocation.mutateAsync(formData)
            toast.success('Location updated successfully')
            router.push(`/admin/locations/${locationId}`)
        } catch (error) {
            toast.error('Failed to update location')
            console.error(error)
        }
    }

    if (isServiceLoading || !formData.name) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" disabled>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-12" />
                        </div>
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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/admin/locations/${locationId}`)}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Location</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Location Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter location name"
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
                                placeholder="Brief description of the location"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleInputChange}
                                placeholder="Address details"
                                rows={2}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_campus">Campus Location</Label>
                                <p className="text-sm text-muted-foreground">
                                    Is this location on the university campus?
                                </p>
                            </div>
                            <Switch
                                id="is_campus"
                                checked={!!formData.is_campus}
                                onCheckedChange={handleSwitchChange('is_campus')}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive locations won&apos;t be shown to users
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={!!formData.is_active}
                                onCheckedChange={handleSwitchChange('is_active')}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/admin/locations/${locationId}`)}
                                disabled={updateLocation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateLocation.isPending}
                            >
                                {updateLocation.isPending ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 