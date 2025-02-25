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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@supabase/auth-helpers-react'
import { Toaster } from '@/components/ui/sonner'
import { menuItems } from '@/lib/data'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient<Database>()
  const user = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Handle sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
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
        <Link 
          href={hasSubmenu ? '#' : item.path}
          onClick={toggleSubmenu}
          className={`flex items-center py-2 px-4 rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-secondary text-foreground'
          }`}
        >
          <span className="mr-3">{item.icon}</span>
          <span className="flex-1">{item.title}</span>
          {hasSubmenu && (
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </Link>

        {hasSubmenu && (
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
                    className={`block py-2 px-4 rounded-md text-sm transition-colors ${
                      pathname === subItem.path 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    {subItem.title}
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
      <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-background z-30">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="focus:outline-none text-foreground"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="font-semibold text-lg">VEat Admin</div>
        <button 
          onClick={handleSignOut}
          className="text-foreground"
        >
          <LogOut size={20} />
        </button>
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
              className="fixed top-0 left-0 bottom-0 w-64 bg-background p-4 border-r shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">VEat Admin</h1>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <nav>
                {menuItems.map((item, idx) => (
                  <SidebarMenuItem key={idx} item={item} />
                ))}
              </nav>
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full py-2 px-4 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="flex h-screen overflow-hidden pt-0 lg:pt-0">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block border-r bg-background h-screen overflow-y-auto z-20"
            >
              <div className="p-4">
                <h1 className="text-xl font-bold mb-6">VEat Admin</h1>
                <nav>
                  {menuItems.map((item, idx) => (
                    <SidebarMenuItem key={idx} item={item} />
                  ))}
                </nav>
                <div className="mt-8">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full py-2 px-4 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header */}
          <header className="hidden lg:flex items-center h-16 px-6 border-b bg-background z-10">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="focus:outline-none text-foreground mr-6"
            >
              <Menu size={20} />
            </button>
            <div className="text-sm text-muted-foreground">
              {user?.email && (
                <span>Logged in as <span className="font-medium text-foreground">{user.email}</span></span>
              )}
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}