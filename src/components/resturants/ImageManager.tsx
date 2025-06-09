'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { getProxiedImageUrl } from '@/lib/imageUtils'
import { Loader2, X } from 'lucide-react'

interface ImageManagerProps {
    restaurantId: string
    logoUrl: string | null
    bannerUrl: string | null
    onUpdate: (updates: { logo_url?: string, banner_url?: string }) => Promise<void>
}

export function ImageManager({ restaurantId, logoUrl, bannerUrl, onUpdate }: ImageManagerProps) {
    const [isUploading, setIsUploading] = useState<'logo' | 'banner' | null>(null)
    const { toast } = useToast()
    const supabase = createClientComponentClient()

    const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
        try {
            setIsUploading(type)

            // Validate file
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload an image file',
                    variant: 'destructive',
                })
                return
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: 'File too large',
                    description: 'Image must be less than 5MB',
                    variant: 'destructive',
                })
                return
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${type}-${restaurantId}-${Date.now()}.${fileExt}`

            // Upload to storage bucket
            const { error: uploadError } = await supabase.storage
                .from('restaurant-images')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('restaurant-images')
                .getPublicUrl(fileName)

            // Update restaurant record
            await onUpdate({
                [type === 'logo' ? 'logo_url' : 'banner_url']: publicUrl
            })

            toast({
                title: 'Success',
                description: `Restaurant ${type} updated successfully`,
            })
        } catch (error) {
            console.error('Error uploading image:', error)
            toast({
                title: 'Error',
                description: 'Failed to upload image. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(null)
        }
    }

    const handleImageDelete = async (type: 'logo' | 'banner') => {
        try {
            setIsUploading(type)

            const currentUrl = type === 'logo' ? logoUrl : bannerUrl
            if (!currentUrl) return

            // Extract filename from URL
            const fileName = currentUrl.split('/').pop()
            if (!fileName) return

            // Delete from storage
            const { error: deleteError } = await supabase.storage
                .from('restaurant-images')
                .remove([fileName])

            if (deleteError) throw deleteError

            // Update restaurant record
            await onUpdate({
                [type === 'logo' ? 'logo_url' : 'banner_url']: null
            })

            toast({
                title: 'Success',
                description: `Restaurant ${type} removed successfully`,
            })
        } catch (error) {
            console.error('Error deleting image:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete image. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(null)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Restaurant Logo</CardTitle>
                    <CardDescription>
                        Upload a square logo image (recommended size: 400x400px)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {logoUrl ? (
                        <div className="relative w-40 h-40">
                            <Image
                                src={getProxiedImageUrl(logoUrl)}
                                alt="Restaurant logo"
                                fill
                                className="rounded-lg object-cover"
                            />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => handleImageDelete('logo')}
                                disabled={isUploading === 'logo'}
                            >
                                {isUploading === 'logo' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file, 'logo')
                                }}
                                disabled={isUploading === 'logo'}
                            />
                            {isUploading === 'logo' && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Restaurant Banner</CardTitle>
                    <CardDescription>
                        Upload a banner image (recommended size: 1200x400px)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bannerUrl ? (
                        <div className="relative w-full h-48">
                            <Image
                                src={getProxiedImageUrl(bannerUrl)}
                                alt="Restaurant banner"
                                fill
                                className="rounded-lg object-cover"
                            />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => handleImageDelete('banner')}
                                disabled={isUploading === 'banner'}
                            >
                                {isUploading === 'banner' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file, 'banner')
                                }}
                                disabled={isUploading === 'banner'}
                            />
                            {isUploading === 'banner' && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 