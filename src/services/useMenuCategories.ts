import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuCategoryInsert = Database['public']['Tables']['menu_categories']['Insert']
type MenuCategoryUpdate = Database['public']['Tables']['menu_categories']['Update']

export function useMenuCategories(restaurantId?: string) {
    const supabase = createClientComponentClient<Database>()
    const queryClient = useQueryClient()

    // Fetch categories for a specific restaurant or all categories
    const {
        data: categories,
        isLoading,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: ['menu-categories', restaurantId],
        queryFn: async () => {
            let query = supabase
                .from('menu_categories')
                .select('*')
                .order('display_order', { ascending: true })

            if (restaurantId) {
                query = query.eq('restaurant_id', restaurantId)
            }

            const { data, error } = await query
            if (error) throw error
            return data
        },
        enabled: restaurantId !== undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Create category
    const createCategory = useMutation<MenuCategory, PostgrestError, MenuCategoryInsert>({
        mutationFn: async (newCategory: MenuCategoryInsert) => {
            const { data, error } = await supabase
                .from('menu_categories')
                .insert(newCategory)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
        }
    })

    // Update category
    const updateCategory = useMutation<MenuCategory, PostgrestError, MenuCategoryUpdate>({
        mutationFn: async (updatedCategory: MenuCategoryUpdate) => {
            const { data, error } = await supabase
                .from('menu_categories')
                .update(updatedCategory)
                .eq('id', updatedCategory.id as string)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
        }
    })

    // Delete category
    const deleteCategory = useMutation<string, PostgrestError, string>({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('menu_categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
        }
    })

    return {
        categories,
        isLoading,
        fetchError,
        createCategory,
        updateCategory,
        deleteCategory,
        refetch
    }
}