import { Card, CardContent } from '@/components/ui/card'
import {
    User,
    ShoppingBag,
    Building2,
    Bike,
    UserCog,
    CheckCircle
} from 'lucide-react'

interface UserStatsProps {
    stats: {
        total: number
        customers: number
        restaurantOwners: number
        riders: number
        admins: number
        verified: number
    }
}

export default function UserStats({ stats }: UserStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Customers</p>
                        <p className="text-2xl font-bold">{stats.customers}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Restaurant Owners</p>
                        <p className="text-2xl font-bold">{stats.restaurantOwners}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-amber-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Delivery Riders</p>
                        <p className="text-2xl font-bold">{stats.riders}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Bike className="h-5 w-5 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Admins</p>
                        <p className="text-2xl font-bold">{stats.admins}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <UserCog className="h-5 w-5 text-purple-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                        <p className="text-2xl font-bold">{stats.verified}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}