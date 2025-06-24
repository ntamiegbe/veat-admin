import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200',
  payment_pending: 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200',
  confirmed: 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200',
  preparing: 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200',
  ready: 'bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200',
  completed: 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200',
}
