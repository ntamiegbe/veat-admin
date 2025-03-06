'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocations } from '@/services/useLocations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Database } from '@/types/supabase'

type LocationInsert = Database['public']['Tables']['locations']['Insert']

export default function NewLocationPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<LocationInsert>({
        name: '',
        description: '',
        address: '',
        is_campus: false,
        is_active: true
    })

    const { createLocation } = useLocations()

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
            await createLocation.mutateAsync(formData)
            toast.success('Location created successfully')
            router.push('/admin/locations')
        } catch (error) {
            toast.error('Failed to create location')
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push('/admin/locations')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Location</h1>
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
                                onClick={() => router.push('/admin/locations')}
                                disabled={createLocation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createLocation.isPending}
                            >
                                {createLocation.isPending ? (
                                    'Creating...'
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Location
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