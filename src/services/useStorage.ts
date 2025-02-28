import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export function useStorage() {
    const supabase = createClientComponentClient<Database>()

    /**
     * Upload a file to Supabase storage
     * @param file File to upload
     * @param bucket Storage bucket name
     * @param path Path inside the bucket
     * @returns URL of the uploaded file
     */
    const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
        // Ensure the user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('User must be authenticated to upload files')
        }

        try {
            // Upload the file
            const { error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (error) {
                console.error('Storage upload error:', error)
                throw error
            }

            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(path)

            return publicUrlData.publicUrl
        } catch (error) {
            console.error('Storage service error:', error)
            throw error
        }
    }

    /**
     * Remove a file from Supabase storage
     * @param bucket Storage bucket name
     * @param path Path inside the bucket
     */
    const removeFile = async (bucket: string, path: string): Promise<void> => {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path])

            if (error) {
                throw error
            }
        } catch (error) {
            console.error('Storage removal error:', error)
            throw error
        }
    }

    return {
        uploadFile,
        removeFile
    }
}