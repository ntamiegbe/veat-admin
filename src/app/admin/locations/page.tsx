'use client'

import { useState } from 'react'
import { motion} from 'framer-motion'
import { useLocations } from '@/services/useLocations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    MapPin,
    Search,
    Plus,
    Edit,
    Trash2,
    RefreshCcw
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'

type Location = Database['public']['Tables']['locations']['Row']
type LocationInsert = Database['public']['Tables']['locations']['Insert']
type LocationUpdate = Database['public']['Tables']['locations']['Update']

export default function LocationsPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [formData, setFormData] = useState<LocationInsert | LocationUpdate>({
        name: '',
        description: '',
        address: '',
        is_campus: false,
        is_active: true
    })

    const {
        locations,
        isLoading,
        fetchError,
        createLocation,
        updateLocation,
        deleteLocation,
    } = useLocations()

    const filteredLocations = locations?.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenForm = (location?: Location) => {
        if (location) {
            setSelectedLocation(location)
            setFormData({
                id: location.id,
                name: location.name,
                description: location.description || '',
                address: location.address || '',
                is_campus: location.is_campus || false,
                is_active: location.is_active || true
            })
        } else {
            setSelectedLocation(null)
            setFormData({
                name: '',
                description: '',
                address: '',
                is_campus: false,
                is_active: true
            })
        }
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setSelectedLocation(null)
    }

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
            if (selectedLocation) {
                // Update existing location
                await updateLocation.mutateAsync(formData as LocationUpdate)
                toast.success('Location updated successfully')
            } else {
                // Create new location
                await createLocation.mutateAsync(formData as LocationInsert)
                toast.success('Location created successfully')
            }

            handleCloseForm()
        } catch (error) {
            toast.error(`Failed to ${selectedLocation ? 'update' : 'create'} location`)
            console.error(error)
        }
    }

    const handleConfirmDelete = (location: Location) => {
        setSelectedLocation(location)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!selectedLocation) return

        try {
            await deleteLocation.mutateAsync(selectedLocation.id)
            toast.success('Location deleted successfully')
            setIsDeleteDialogOpen(false)
            setSelectedLocation(null)
        } catch (error) {
            toast.error('Failed to delete location')
            console.error(error)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
                    <p className="text-muted-foreground">
                        Manage all locations for restaurants and delivery
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search locations..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.refresh()}
                    className="w-full sm:w-auto"
                >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            ) : fetchError ? (
                <Card className="bg-destructive/10">
                    <CardContent className="pt-6">
                        <p>Error: {fetchError.message}</p>
                        <Button className="mt-4" onClick={() => router.refresh()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredLocations?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No locations found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new location'}
                        </p>
                        <Button onClick={() => handleOpenForm()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Location
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredLocations?.map((location) => (
                        <motion.div key={location.id} variants={itemVariants}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1">{location.name}</CardTitle>
                                        <div className="flex gap-1">
                                            {location.is_campus ? (
                                                <Badge>Campus</Badge>
                                            ) : (
                                                <Badge variant="secondary">Off-Campus</Badge>
                                            )}
                                            {!location.is_active && (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {location.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                                    )}
                                    {location.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                            <span className="text-sm line-clamp-1">{location.address}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(location)}>
                                            <Edit className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleConfirmDelete(location)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Location Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
                        <DialogDescription>
                            {selectedLocation ? 'Update the location details below' : 'Fill in the details to create a new location'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
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
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseForm}
                                disabled={createLocation.isPending || updateLocation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createLocation.isPending || updateLocation.isPending}
                            >
                                {createLocation.isPending || updateLocation.isPending ? (
                                    'Saving...'
                                ) : selectedLocation ? (
                                    'Update Location'
                                ) : (
                                    'Add Location'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedLocation?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteLocation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteLocation.isPending}
                        >
                            {deleteLocation.isPending ? 'Deleting...' : 'Delete Location'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}