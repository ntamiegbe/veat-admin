'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { X, ImageIcon } from 'lucide-react'
import { useStorage } from '@/services/useStorage'
import { getProxiedImageUrl } from '@/lib/imageUtils'

interface RestaurantImagesFormProps {
    restaurantId: string
    logoUrl: string | null
    bannerUrl: string | null
    onImagesUpdate: (updates: { logo_url?: string | null; banner_url?: string | null }) => Promise<void>
}

export default function RestaurantImagesForm({
    restaurantId,
    logoUrl,
    bannerUrl,
    onImagesUpdate
}: RestaurantImagesFormProps) {
    const { uploadFile } = useStorage()
    const logoInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    // State for image files and previews
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl)
    const [bannerPreview, setBannerPreview] = useState<string | null>(bannerUrl)
    const [isUploading, setIsUploading] = useState(false)

    // Handle image selection
    const handleImageSelect = (type: 'logo' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB')
            return
        }

        // Set file and create preview
        if (type === 'logo') {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (event) => {
                setLogoPreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setBannerFile(file)
            const reader = new FileReader()
            reader.onload = (event) => {
                setBannerPreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Remove selected image
    const handleRemoveImage = (type: 'logo' | 'banner') => () => {
        if (type === 'logo') {
            setLogoFile(null)
            setLogoPreview(null)
            if (logoInputRef.current) {
                logoInputRef.current.value = ''
            }
        } else {
            setBannerFile(null)
            setBannerPreview(null)
            if (bannerInputRef.current) {
                bannerInputRef.current.value = ''
            }
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)

        try {
            const updates: { logo_url?: string | null; banner_url?: string | null } = {}

            // Upload logo if selected
            if (logoFile) {
                const path = `restaurants/${restaurantId}/logo-${Date.now()}-${logoFile.name}`
                const url = await uploadFile(logoFile, 'restaurant-images', path)
                updates.logo_url = url
            }

            // Upload banner if selected
            if (bannerFile) {
                const path = `restaurants/${restaurantId}/banner-${Date.now()}-${bannerFile.name}`
                const url = await uploadFile(bannerFile, 'restaurant-images', path)
                updates.banner_url = url
            }

            // Update restaurant if any images were uploaded
            if (Object.keys(updates).length > 0) {
                await onImagesUpdate(updates)
                toast.success('Restaurant images updated successfully')
            }
        } catch (error) {
            console.error('Error updating restaurant images:', error)
            toast.error('Failed to update restaurant images')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Restaurant Logo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <div className="border rounded-md p-4">
                                    <div className="flex items-center justify-center h-40 w-40 bg-muted rounded-md relative overflow-hidden">
                                        {logoPreview ? (
                                            <>
                                                <Image
                                                    src={getProxiedImageUrl(logoPreview)}
                                                    alt="Logo Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={handleRemoveImage('logo')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <ImageIcon className="h-10 w-10 mb-2" />
                                                <p className="text-sm">No logo</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="logo" className="block mb-2">Upload Logo</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="logo"
                                            type="file"
                                            ref={logoInputRef}
                                            accept="image/*"
                                            onChange={handleImageSelect('logo')}
                                            disabled={isUploading}
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recommended size: 400x400px. Max file size: 2MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Restaurant Banner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <div className="border rounded-md p-4">
                                    <div className="flex items-center justify-center aspect-video w-full bg-muted rounded-md relative overflow-hidden">
                                        {bannerPreview ? (
                                            <>
                                                <Image
                                                    src={getProxiedImageUrl(bannerPreview)}
                                                    alt="Banner Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={handleRemoveImage('banner')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <ImageIcon className="h-10 w-10 mb-2" />
                                                <p className="text-sm">No banner</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="banner" className="block mb-2">Upload Banner</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="banner"
                                            type="file"
                                            ref={bannerInputRef}
                                            accept="image/*"
                                            onChange={handleImageSelect('banner')}
                                            disabled={isUploading}
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recommended size: 1200x400px. Max file size: 2MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isUploading || (!logoFile && !bannerFile)}
                    >
                        {isUploading ? 'Uploading...' : 'Save Images'}
                    </Button>
                </div>
            </div>
        </form>
    )
} 