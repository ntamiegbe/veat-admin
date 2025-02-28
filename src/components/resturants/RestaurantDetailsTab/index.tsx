/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Building2,
    MapPin,
    Phone,
    Calendar,
    Star,
    ShoppingBag,
    Utensils,
    User
} from 'lucide-react'

type RestaurantDetails = {
    id: string;
    name: string;
    description: string | null;
    address: string;
    phone_number: string;
    email: string | null;
    is_active: boolean | null;
    is_featured: boolean | null;
    cuisine_types: string[] | null;
    average_rating: number | null;
    total_orders: number | null;
    created_at: string | null;
    opening_hours: any;
    location?: { id: string, name: string, is_campus: boolean | null } | null;
    owner?: { id: string, full_name: string, email: string | null } | null;
    menu_categories?: Array<{ id: string, name: string, display_order: number | null }>;
    [key: string]: any; // Allow for additional properties
}

interface RestaurantDetailsTabProps {
    restaurant: RestaurantDetails
    menuItemCount?: number
}

export default function RestaurantDetailsTab({ restaurant, menuItemCount = 0 }: RestaurantDetailsTabProps) {
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-medium">{restaurant.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {restaurant.description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-medium">Address</h3>
                                <p className="text-sm">{restaurant.address}</p>
                                {restaurant.location && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Location: {restaurant.location.name}
                                        {restaurant.location.is_campus ? ' (Campus)' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-medium">Contact</h3>
                                <p className="text-sm">Phone: {restaurant.phone_number}</p>
                                {restaurant.email && (
                                    <p className="text-sm">Email: {restaurant.email}</p>
                                )}
                            </div>
                        </div>

                        {restaurant.owner && (
                            <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <h3 className="font-medium">Owner</h3>
                                    <p className="text-sm">{restaurant.owner.full_name}</p>
                                    {restaurant.owner.email && (
                                        <p className="text-sm text-muted-foreground">{restaurant.owner.email}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                            <div className="grid grid-cols-[20px_1fr] gap-x-4 items-start">
                                <Utensils className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <h3 className="font-medium">Cuisine Types</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {restaurant.cuisine_types.map((cuisine, index) => (
                                            <Badge key={index} variant="secondary">
                                                {cuisine}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {restaurant.opening_hours &&
                                    Object.entries(restaurant.opening_hours as Record<string, any>).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between">
                                            <span className="font-medium capitalize">{day}</span>
                                            <span>
                                                {hours.is_closed ? (
                                                    <span className="text-muted-foreground">Closed</span>
                                                ) : (
                                                    `${hours.open} - ${hours.close}`
                                                )}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Rating</p>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-amber-500 mr-1" />
                                        <span className="font-medium">{restaurant.average_rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                    <div className="flex items-center">
                                        <ShoppingBag className="h-4 w-4 text-primary mr-1" />
                                        <span className="font-medium">{restaurant.total_orders || 0}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Menu Items</p>
                                    <div className="flex items-center">
                                        <Utensils className="h-4 w-4 text-primary mr-1" />
                                        <span className="font-medium">{menuItemCount || 0}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Added On</p>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-primary mr-1" />
                                        <span className="font-medium">
                                            {new Date(restaurant.created_at || '').toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {restaurant.menu_categories && restaurant.menu_categories.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Menu Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {restaurant.menu_categories
                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                .map(category => (
                                    <Badge key={category.id} variant="outline" className="text-sm py-1 px-3">
                                        {category.name}
                                    </Badge>
                                ))
                            }
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/admin/restaurants-categories')}
                        >
                            Manage Categories
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}