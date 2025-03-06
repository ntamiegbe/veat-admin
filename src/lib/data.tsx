import {
  Building2,
  ShoppingBag,
  Users,
  Map,
  LayoutDashboard,
  Utensils,
  PieChart,
  Settings,
  UserPlus,
  Store,
  ListOrdered,
  Clock,
  CheckSquare,
  User,
  Truck,
  MapPin,
  Plus
} from 'lucide-react'

export const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/admin/dashboard',
    submenu: null
  },
  {
    title: 'Restaurants',
    icon: <Building2 size={20} />,
    path: '/admin/restaurants',
    submenu: [
      { title: 'All Restaurants', path: '/admin/restaurants', icon: <Store size={16} /> },
      { title: 'Add Restaurant', path: '/admin/restaurants/new', icon: <Plus size={16} /> },
      { title: 'Restaurant Owners', path: '/admin/restaurant-owners', icon: <User size={16} /> },
      { title: 'Categories', path: '/admin/restaurants-categories', icon: <ListOrdered size={16} /> }
    ]
  },
  {
    title: 'Menu Items',
    icon: <Utensils size={20} />,
    path: '/admin/menu-items',
    submenu: [
      { title: 'All Menu Items', path: '/admin/menu-items', icon: <Utensils size={16} /> },
      { title: 'Add Menu Item', path: '/admin/menu-items/new', icon: <Plus size={16} /> },
    ]
  },
  {
    title: 'Orders',
    icon: <ShoppingBag size={20} />,
    path: '/admin/orders',
    submenu: [
      { title: 'All Orders', path: '/admin/orders', icon: <ShoppingBag size={16} /> },
      { title: 'Active Orders', path: '/admin/orders/active', icon: <Clock size={16} /> },
      { title: 'Completed Orders', path: '/admin/orders/completed', icon: <CheckSquare size={16} /> },
    ]
  },
  {
    title: 'Users',
    icon: <Users size={20} />,
    path: '/admin/users',
    submenu: [
      { title: 'All Users', path: '/admin/users', icon: <Users size={16} /> },
      { title: 'Restaurant Owners', path: '/admin/users/restaurant-owners', icon: <Store size={16} /> },
      { title: 'Delivery Riders', path: '/admin/users/delivery-riders', icon: <Truck size={16} /> },
      { title: 'Customers', path: '/admin/users/customers', icon: <User size={16} /> },
      { title: 'Add User', path: '/admin/users/new', icon: <UserPlus size={16} /> },
    ]
  },
  {
    title: 'Locations',
    icon: <Map size={20} />,
    path: '/admin/locations',
    submenu: [
      { title: 'All Locations', path: '/admin/locations', icon: <MapPin size={16} /> },
      { title: 'Add Location', path: '/admin/locations/new', icon: <Plus size={16} /> },
    ]
  },
  {
    title: 'Analytics',
    icon: <PieChart size={20} />,
    path: '/admin/analytics',
    submenu: null
  },
  {
    title: 'Settings',
    icon: <Settings size={20} />,
    path: '/admin/settings',
    submenu: null
  },
]
