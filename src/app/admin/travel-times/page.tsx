/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, Search, Clock, ArrowRight } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { useTravelTimes } from '@/services/useTravelTimes'
import { useLocations } from '@/services/useLocations'

type Location = Database['public']['Tables']['locations']['Row']

type TravelTime = {
    id: string
    from_location_id: string
    to_location_id: string
    average_minutes: number
    from_location?: {
        name: string
    }
    to_location?: {
        name: string
    }
}

export default function TravelTimesPage() {
    const { travelTimes, isLoading: isLoadingTravelTimes, createTravelTime, updateTravelTime, deleteTravelTime } = useTravelTimes()
    const { locations, isLoading: isLoadingLocations } = useLocations({ isActive: true })

    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentTravelTime, setCurrentTravelTime] = useState<TravelTime | null>(null)

    const [formData, setFormData] = useState<{
        from_location_id: string;
        to_location_id: string;
        average_minutes: number;
    }>({
        from_location_id: '',
        to_location_id: '',
        average_minutes: 15,
    })

    // Filter travel times based on search term
    const filteredTravelTimes = travelTimes?.filter(travelTime => {
        const fromName = travelTime.from_location?.name?.toLowerCase() || ''
        const toName = travelTime.to_location?.name?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()

        return fromName.includes(search) || toName.includes(search)
    }) || []

    const handleOpenForm = (travelTime?: TravelTime) => {
        if (travelTime) {
            setCurrentTravelTime(travelTime)
            setFormData({
                from_location_id: travelTime.from_location_id,
                to_location_id: travelTime.to_location_id,
                average_minutes: travelTime.average_minutes,
            })
        } else {
            setCurrentTravelTime(null)
            setFormData({
                from_location_id: '',
                to_location_id: '',
                average_minutes: 15,
            })
        }
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        if (!formData.from_location_id || !formData.to_location_id || formData.average_minutes <= 0) {
            toast.error('Please fill all fields with valid values')
            return
        }

        if (formData.from_location_id === formData.to_location_id) {
            toast.error('From and To locations must be different')
            return
        }

        try {
            if (currentTravelTime) {
                // Update existing travel time
                await updateTravelTime.mutateAsync({
                    id: currentTravelTime.id,
                    ...formData
                })
                toast.success('Travel time updated successfully')
            } else {
                // Create new travel time
                await createTravelTime.mutateAsync(formData)
                toast.success('Travel time created successfully')
            }

            setIsFormOpen(false)
            resetForm()
        } catch (error: any) {
            if (error instanceof Error && 'code' in error && error.code === '23505') {
                toast.error('A travel time between these locations already exists')
            } else {
                toast.error(`Failed to ${currentTravelTime ? 'update' : 'create'} travel time: ${error.message}`)
            }
        }
    }

    const handleConfirmDelete = (travelTime: TravelTime) => {
        setCurrentTravelTime(travelTime)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!currentTravelTime) return

        try {
            await deleteTravelTime.mutateAsync(currentTravelTime.id)
            toast.success('Travel time deleted successfully')
            setIsDeleteDialogOpen(false)
            setCurrentTravelTime(null)
        } catch (error: any) {
            toast.error(`Failed to delete travel time: ${error.message}`)
        }
    }

    const resetForm = () => {
        setFormData({
            from_location_id: '',
            to_location_id: '',
            average_minutes: 15,
        })
        setCurrentTravelTime(null)
    }

    const isLoading = isLoadingTravelTimes || isLoadingLocations

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Location Travel Times</h1>
                    <p className="text-muted-foreground">
                        Manage travel times between campus locations for accurate delivery estimates
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Travel Times</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search locations..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From Location</TableHead>
                                    <TableHead></TableHead>
                                    <TableHead>To Location</TableHead>
                                    <TableHead>Travel Time</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTravelTimes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No travel times found. Add one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTravelTimes.map((travelTime) => (
                                        <TableRow key={travelTime.id}>
                                            <TableCell className="font-medium">
                                                {travelTime.from_location?.name || 'Unknown Location'}
                                            </TableCell>
                                            <TableCell>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </TableCell>
                                            <TableCell>
                                                {travelTime.to_location?.name || 'Unknown Location'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span>{travelTime.average_minutes} minutes</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenForm(travelTime)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleConfirmDelete(travelTime)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {currentTravelTime ? 'Edit Travel Time' : 'Add Travel Time'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentTravelTime
                                ? 'Update the travel time between two locations'
                                : 'Set the average travel time between two locations'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="from_location" className="text-right">
                                    From
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={formData.from_location_id}
                                        onValueChange={(value) => setFormData({ ...formData, from_location_id: value })}
                                        disabled={!!currentTravelTime}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select starting location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations?.map((location: Location) => (
                                                <SelectItem key={location.id} value={location.id}>
                                                    {location.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="to_location" className="text-right">
                                    To
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={formData.to_location_id}
                                        onValueChange={(value) => setFormData({ ...formData, to_location_id: value })}
                                        disabled={!!currentTravelTime}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations?.map((location: Location) => (
                                                <SelectItem key={location.id} value={location.id}>
                                                    {location.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="average_minutes" className="text-right">
                                    Minutes
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="average_minutes"
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={formData.average_minutes}
                                        onChange={(e) => setFormData({ ...formData, average_minutes: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsFormOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createTravelTime.isPending || updateTravelTime.isPending}>
                                {createTravelTime.isPending || updateTravelTime.isPending ? (
                                    <span>Saving...</span>
                                ) : currentTravelTime ? (
                                    'Update'
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Travel Time</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this travel time?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteTravelTime.isPending}
                        >
                            {deleteTravelTime.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 