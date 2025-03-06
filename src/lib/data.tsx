import {
  Building2,
  ShoppingBag,
  Users,
  Map,
  LayoutDashboard,
  Utensils,
} from 'lucide-react'

export const menuItems = [
    {
      title: 'Overview',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard',
      submenu: null
    },
    {
      title: 'Restaurants',
      icon: <Building2 size={20} />,
      path: '/admin/restaurants',
      submenu: [
        { title: 'All Restaurants', path: '/admin/restaurants' },
        { title: 'Add Restaurant', path: '/admin/restaurants/new' },
        { title: 'Categories', path: '/admin/restaurants-categories' }
      ]
    },
    {
      title: 'Menu Items',
      icon: <Utensils size={20} />,
      path: '/admin/menu-items',
      submenu: [
        { title: 'All Menu Items', path: '/admin/menu-items' },
        { title: 'Add Menu Item', path: '/admin/menu-items/new' },
      ]
    },
    {
      title: 'Orders',
      icon: <ShoppingBag size={20} />,
      path: '/admin/orders',
      submenu: [
        { title: 'All Orders', path: '/admin/orders' },
        { title: 'Active Orders', path: '/admin/orders/active' },
        { title: 'Completed Orders', path: '/admin/orders/completed' },
      ]
    },
    {
      title: 'Users',
      icon: <Users size={20} />,
      path: '/admin/users',
      submenu: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Restaurant Owners', path: '/admin/users/restaurant-owners' },
        { title: 'Delivery Riders', path: '/admin/users/delivery-riders' },
        { title: 'Customers', path: '/admin/users/customers' },
      ]
    },
    {
      title: 'Locations',
      icon: <Map size={20} />,
      path: '/admin/locations',
      submenu: null
    },
  ]
