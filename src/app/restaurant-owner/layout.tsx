'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useRequireAuth } from '@/services/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from '@/components/ui/sonner'
import {
    Building2,
    Utensils,
    ShoppingBag,
    LogOut,
    Menu,
    X,
    User,
    Home,
    Settings,
    ChevronDown
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const menuItems = [
    {
        title: 'Dashboard',
        icon: <Home className="h-5 w-5" />,
        path: '/restaurant-owner/dashboard'
    },
    {
        title: 'Restaurants',
        icon: <Building2 className="h-5 w-5" />,
        path: '/restaurant-owner/restaurants'
    },
    {
        title: 'Menu Items',
        icon: <Utensils className="h-5 w-5" />,
        path: '/restaurant-owner/menu'
    },
    {
        title: 'Orders',
        icon: <ShoppingBag className="h-5 w-5" />,
        path: '/restaurant-owner/orders'
    },
    {
        title: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        path: '/restaurant-owner/settings'
    }
]

export default function RestaurantOwnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { currentUser, isAuthenticated, hasRole, signOut } = useAuth()
    const { isLoading } = useRequireAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [userInitials, setUserInitials] = useState('RO')

    // Extract user initials from email or name
    useEffect(() => {
        if (currentUser?.email) {
            const parts = currentUser.email.split('@')[0].split(/[._-]/)
            const initials = parts.length > 1
                ? (parts[0][0] + parts[1][0]).toUpperCase()
                : parts[0].substring(0, 2).toUpperCase()
            setUserInitials(initials)
        }
    }, [currentUser])

    // Redirect if not authenticated or not a restaurant owner
    useEffect(() => {
        if (!isLoading && isAuthenticated && !hasRole('restaurant_owner')) {
            router.push('/unauthorized')
        }
    }, [isLoading, isAuthenticated, hasRole, router])

    // Close mobile menu when navigating
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile header */}
            <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-background z-30 sticky top-0">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="focus:outline-none text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="font-semibold text-lg">Restaurant Dashboard</div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt="User" />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/restaurant-owner/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/restaurant-owner/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* Mobile sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="fixed top-0 left-0 bottom-0 w-64 bg-background p-4 border-r shadow-lg z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold">Restaurant Portal</h1>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {currentUser && (
                            <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src="" alt="User" />
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{currentUser.email?.split('@')[0]}</p>
                                        <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <nav className="space-y-1">
                            {menuItems.map((item, idx) => {
                                const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

                                return (
                                    <Link
                                        key={idx}
                                        href={item.path}
                                        className={`flex items-center py-2 px-4 rounded-md transition-colors ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-secondary text-foreground'
                                            }`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="absolute bottom-4 left-4 right-4">
                            <Button
                                variant="destructive"
                                onClick={signOut}
                                className="w-full justify-start"
                            >
                                <LogOut size={18} className="mr-2" />
                                <span>Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop layout */}
            <div className="flex h-screen overflow-hidden pt-0 lg:pt-0">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-64 border-r bg-background h-screen overflow-y-auto z-20 sticky top-0">
                    <div className="p-4">
                        <h1 className="text-xl font-bold mb-6">Restaurant Portal</h1>

                        {currentUser && (
                            <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src="" alt="User" />
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-medium truncate">{currentUser.email?.split('@')[0]}</p>
                                        <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <nav className="space-y-1">
                            {menuItems.map((item, idx) => {
                                const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

                                return (
                                    <Link
                                        key={idx}
                                        href={item.path}
                                        className={`flex items-center py-2 px-4 rounded-md transition-colors ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-secondary text-foreground'
                                            }`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="mt-8">
                            <Button
                                variant="destructive"
                                onClick={signOut}
                                className="w-full justify-start"
                            >
                                <LogOut size={18} className="mr-2" />
                                <span>Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Desktop header */}
                    <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b bg-background z-10 sticky top-0">
                        <div className="text-sm text-muted-foreground">
                            {pathname && (
                                <span className="font-medium text-foreground">
                                    {pathname.split('/').filter(Boolean).map((segment, i) => (
                                        <span key={i}>
                                            {i > 0 && " / "}
                                            {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                                        </span>
                                    ))}
                                </span>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt="User" />
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    {currentUser?.email && (
                                        <span className="font-medium">{currentUser.email.split('@')[0]}</span>
                                    )}
                                    <ChevronDown size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/restaurant-owner/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/restaurant-owner/settings')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={signOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>

                    {/* Content area */}
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>

            {/* Toaster for notifications */}
            <Toaster />
        </div>
    )
} 