'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    AlertCircle
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useUsers } from '@/services/useUsers'
import type { Database } from '@/types/supabase'

type UserData = Database['public']['Tables']['users']['Row'] & {
    default_delivery_location?: { id: string, name: string, is_campus: boolean | null } | null
}

interface UsersListProps {
    users: UserData[] | null
    isLoading: boolean
    error: Error | null
    viewMode?: 'table' | 'grid'
    showActions?: boolean
    showType?: boolean
    userType?: 'user' | 'restaurant_owner' | 'delivery_rider' | 'admin'
    onRefresh?: () => void
}

export default function UsersList({
    users,
    isLoading,
    error,
    viewMode = 'table',
    showActions = true,
    showType = true,
    userType,
    onRefresh
}: UsersListProps) {
    const router = useRouter()
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const { verifyPhone } = useUsers()

    const handleViewUser = (id: string) => {
        router.push(`/admin/users/${id}`)
    }

    const handleEditUser = (id: string) => {
        router.push(`/admin/users/${id}/edit`)
    }

    const handleDeleteUser = (id: string) => {
        // In a real app, you would implement delete functionality
        // For demo purposes, just show a toast
        toast.error("User deletion functionality not implemented in this demo")
        setConfirmDeleteId(id)
    }

    const handleVerifyPhone = async (id: string) => {
        try {
            await verifyPhone.mutateAsync({ id })
            toast.success("Phone number verified successfully")
            if (onRefresh) onRefresh()
        } catch (error) {
            toast.error("Failed to verify phone number")
            console.error(error)
        }
    }

    const getUserTypeLabel = (type: string) => {
        switch (type) {
            case 'user':
                return <Badge>Customer</Badge>
            case 'restaurant_owner':
                return <Badge variant="outline">Restaurant Owner</Badge>
            case 'delivery_rider':
                return <Badge variant="secondary">Delivery Rider</Badge>
            case 'admin':
                return <Badge variant="default">Admin</Badge>
            default:
                return <Badge variant="outline">{type}</Badge>
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Unknown'
        return new Date(dateString).toLocaleDateString()
    }

    // Animation variants
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

    if (isLoading) {
        return viewMode === 'table' ? (
            <div className="w-full space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card className="bg-destructive/10 border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-semibold">Error loading users</h3>
                    </div>
                    <p className="mt-2">{error.message}</p>
                    {onRefresh && (
                        <Button className="mt-4" onClick={onRefresh}>
                            Try Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (!users || users.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No users found</h3>
                    <p className="text-muted-foreground mb-4">
                        {userType ? `No ${userType.replace('_', ' ')}s have been added yet.` : 'No users have been added yet.'}
                    </p>
                    <Button onClick={() => router.push('/admin/users/new')}>
                        Create User
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Table view
    if (viewMode === 'table') {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            {showType && <TableHead>Type</TableHead>}
                            <TableHead>Verification</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Joined</TableHead>
                            {showActions && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                            {user.profile_image_url ? (
                                                <Image
                                                    src={user.profile_image_url}
                                                    alt={user.full_name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.full_name}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{user.phone_number}</span>
                                        </div>
                                        {user.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{user.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                {showType && (
                                    <TableCell>
                                        {getUserTypeLabel(user.user_type)}
                                    </TableCell>
                                )}
                                <TableCell>
                                    {user.is_phone_verified ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleVerifyPhone(user.id)}
                                                disabled={verifyPhone.isPending}
                                                className="text-amber-600 hover:text-amber-700 p-0 h-auto"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                <span className="text-sm">Verify</span>
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.default_delivery_location ? (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{user.default_delivery_location.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Not set</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm">{formatDate(user.created_at)}</span>
                                    </div>
                                </TableCell>
                                {showActions && (
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setConfirmDeleteId(user.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => confirmDeleteId && handleDeleteUser(confirmDeleteId)}
                            >
                                Delete User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    // Grid view
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {users.map((user) => (
                <motion.div key={user.id} variants={itemVariants}>
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                        {user.profile_image_url ? (
                                            <Image
                                                src={user.profile_image_url}
                                                alt={user.full_name}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{user.full_name}</CardTitle>
                                        {showType && (
                                            <div className="mt-1">
                                                {getUserTypeLabel(user.user_type)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {user.is_phone_verified ? (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                        Not Verified
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-grow">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone_number}</span>
                                </div>
                                {user.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}
                                {user.default_delivery_location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.default_delivery_location.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined {formatDate(user.created_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                        {showActions && (
                            <div className="p-4 pt-0 mt-auto border-t flex justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewUser(user.id)}
                                >
                                    <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditUser(user.id)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => setConfirmDeleteId(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}