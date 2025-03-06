'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, ArrowLeft, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

export default function RestaurantOwnerRegistrationPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        restaurantName: '',
        restaurantDescription: '',
        address: '',
        isCampus: false
    })
    const [isCampusInteracted, setIsCampusInteracted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClientComponentClient<Database>()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isCampus: checked
        }))
        setIsCampusInteracted(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate form
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        // Validate that the user has interacted with the campus location field
        if (!isCampusInteracted) {
            setError('Please specify if your restaurant is located on campus')
            return
        }

        setIsLoading(true)

        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName
                    }
                }
            })

            if (authError) throw authError

            if (!authData.user) {
                throw new Error('Failed to create user account')
            }

            // 2. Create user profile with restaurant_owner role
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: formData.email,
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber,
                    user_type: 'restaurant_owner',
                    is_phone_verified: false
                })

            if (profileError) throw profileError

            // 3. Create location for the restaurant
            const { data: locationData, error: locationError } = await supabase
                .from('locations')
                .insert({
                    name: `${formData.restaurantName} Location`,
                    address: formData.address,
                    is_campus: formData.isCampus,
                    is_active: true
                })
                .select()
                .single()

            if (locationError) throw locationError

            // 4. Create restaurant
            const { error: restaurantError } = await supabase
                .from('restaurants')
                .insert({
                    name: formData.restaurantName,
                    description: formData.restaurantDescription,
                    address: formData.address,
                    owner_id: authData.user.id,
                    is_active: false,
                    phone_number: formData.phoneNumber,
                    is_featured: false,
                    location_id: locationData.id
                })

            if (restaurantError) throw restaurantError

            toast.success('Registration successful! Please check your email to verify your account.')
            router.push('/login?registered=true')

        } catch (error) {
            console.error('Registration error:', error)
            setError(error instanceof Error ? error.message : 'An error occurred during registration')
            toast.error('Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
            <div className="w-full max-w-2xl">
                <Card className="border-none shadow-lg">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-primary" />
                                <CardTitle className="text-2xl">Restaurant Owner Registration</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/login">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <CardDescription>
                            Register as a restaurant owner to manage your restaurant on our platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Account Information</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        placeholder="+1 (555) 123-4567"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Restaurant Information</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="restaurantName">Restaurant Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="restaurantName"
                                        name="restaurantName"
                                        placeholder="My Amazing Restaurant"
                                        value={formData.restaurantName}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="restaurantDescription">Description</Label>
                                    <Textarea
                                        id="restaurantDescription"
                                        name="restaurantDescription"
                                        placeholder="Tell us about your restaurant"
                                        value={formData.restaurantDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                                        <Textarea
                                            id="address"
                                            name="address"
                                            placeholder="123 Main St, City, State, Zip"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={2}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="isCampus">Campus Location <span className="text-destructive">*</span></Label>
                                        <p className="text-sm text-muted-foreground">
                                            Is this restaurant located on the university campus?
                                        </p>
                                    </div>
                                    <Switch
                                        id="isCampus"
                                        checked={formData.isCampus}
                                        onCheckedChange={handleSwitchChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    'Register as Restaurant Owner'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <div className="text-sm text-center">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
} 