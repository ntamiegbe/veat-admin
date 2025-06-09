'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Database } from '@/types/supabase'
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  User,
  Settings,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@supabase/auth-helpers-react'
import { Toaster } from '@/components/ui/sonner'
import { menuItems } from '@/lib/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient<Database>()
  const user = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [userInitials, setUserInitials] = useState('UA')

  // Extract user initials from email
  useEffect(() => {
    if (user?.email) {
      const parts = user.email.split('@')[0].split(/[._-]/)
      const initials = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase()
      setUserInitials(initials)
    }
  }, [user])

  // Handle sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Mobile: closed sidebar
        setIsSidebarOpen(false)
        setSidebarCollapsed(false)
      } else if (window.innerWidth < 1024) {
        // Tablet: collapsed sidebar
        setIsSidebarOpen(true)
        setSidebarCollapsed(true)
      } else {
        // Desktop: open sidebar
        setIsSidebarOpen(true)
        setSidebarCollapsed(false)
      }
    }

    // Initial call
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarMenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
    const hasSubmenu = item.submenu !== null
    const isSubmenuOpen = activeMenu === item.title

    const toggleSubmenu = (e: React.MouseEvent) => {
      if (hasSubmenu) {
        e.preventDefault()
        setActiveMenu(isSubmenuOpen ? null : item.title)
      }
    }

    return (
      <div className="mb-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={hasSubmenu ? '#' : item.path}
                onClick={toggleSubmenu}
                className={`flex items-center py-2.5 px-4 rounded-md transition-all duration-200 group ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary text-foreground hover:text-foreground'
                  }`}
              >
                <span className={`${isSidebarCollapsed ? 'mx-auto text-lg' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.title}</span>
                    {hasSubmenu && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </>
                )}
              </Link>
            </TooltipTrigger>
            {isSidebarCollapsed && (
              <TooltipContent side="right">
                {item.title}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {hasSubmenu && !isSidebarCollapsed && (
          <AnimatePresence>
            {isSubmenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-8 mt-1"
              >
                {item.submenu?.map((subItem, idx) => (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`flex items-center py-2 px-4 rounded-md text-sm transition-colors ${pathname === subItem.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-secondary text-foreground'
                      }`}
                  >
                    {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                    <span>{subItem.title}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
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
        <div className="font-semibold text-lg">VEat Admin</div>
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
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-background p-4 border-r shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">VEat Admin</h1>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {user && (
                <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {menuItems.map((item, idx) => (
                  <SidebarMenuItem key={idx} item={item} />
                ))}
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full justify-start"
                >
                  <LogOut size={18} className="mr-2" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop layout */}
      <div className="flex h-screen overflow-hidden pt-0 lg:pt-0">
        {/* Desktop sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: isSidebarCollapsed ? 72 : 280,
                opacity: 1
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block border-r bg-background h-screen overflow-y-auto z-20 sticky top-0"
            >
              <div className={`p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  {!isSidebarCollapsed && <h1 className="text-xl font-bold">VEat Admin</h1>}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                    className={`${isSidebarCollapsed ? 'mx-auto' : ''} rounded-full h-8 w-8`}
                    aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    <ChevronLeft className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                {!isSidebarCollapsed && user && (
                  <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{user.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  {menuItems.map((item, idx) => (
                    <SidebarMenuItem key={idx} item={item} />
                  ))}
                </nav>

                <div className={`mt-8 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={handleSignOut}
                          className={`${isSidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full justify-start'}`}
                          aria-label="Sign out"
                        >
                          <LogOut size={18} className={isSidebarCollapsed ? 'm-auto' : 'mr-2'} />
                          {!isSidebarCollapsed && <span>Sign Out</span>}
                        </Button>
                      </TooltipTrigger>
                      {isSidebarCollapsed && (
                        <TooltipContent side="right">
                          Sign Out
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header */}
          <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b bg-background z-10 sticky top-0">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="focus:outline-none text-foreground mr-6 p-1 rounded-md hover:bg-secondary transition-colors"
                aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu size={20} />
              </button>
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
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  {user?.email && (
                    <span className="font-medium">{user.email.split('@')[0]}</span>
                  )}
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}