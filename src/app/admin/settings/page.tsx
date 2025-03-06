'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    Settings,
    Bell,
    User,
    Lock,
    Globe,
    Palette,
    Save,
    Mail,
    Phone,
    Shield
} from "lucide-react"

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            toast.success('Settings saved successfully')
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="general">
                        <Settings className="h-4 w-4 mr-2" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance">
                        <Palette className="h-4 w-4 mr-2" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Manage your basic application settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="app-name">Application Name</Label>
                                <Input id="app-name" defaultValue="VEat Admin" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="app-url">Application URL</Label>
                                <Input id="app-url" defaultValue="https://veat-admin.example.com" />
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Put the application into maintenance mode
                                        </p>
                                    </div>
                                    <Switch id="maintenance-mode" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="debug-mode">Debug Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable detailed error messages and logging
                                        </p>
                                    </div>
                                    <Switch id="debug-mode" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Regional Settings</CardTitle>
                            <CardDescription>
                                Configure timezone and localization preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <select
                                        id="timezone"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                                        <option value="America/Chicago">Central Time (US & Canada)</option>
                                        <option value="America/Denver">Mountain Time (US & Canada)</option>
                                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date-format">Date Format</Label>
                                    <select
                                        id="date-format"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-timezone">Auto-detect Timezone</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically set timezone based on user location
                                    </p>
                                </div>
                                <Switch id="auto-timezone" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your account profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="Admin User" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="flex">
                                        <Input id="email" defaultValue="admin@example.com" />
                                        <Button variant="outline" size="icon" className="ml-2">
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="flex">
                                        <Input id="phone" defaultValue="+1 (555) 123-4567" />
                                        <Button variant="outline" size="icon" className="ml-2">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Tell us a little about yourself"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Configure how and when you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Email Notifications</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-orders">New Orders</Label>
                                        <Switch id="email-orders" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-users">New User Registrations</Label>
                                        <Switch id="email-users" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-restaurants">New Restaurant Applications</Label>
                                        <Switch id="email-restaurants" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-system">System Alerts</Label>
                                        <Switch id="email-system" defaultChecked />
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <h3 className="text-lg font-medium">Push Notifications</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push-orders">New Orders</Label>
                                        <Switch id="push-orders" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push-users">New User Registrations</Label>
                                        <Switch id="push-users" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push-restaurants">New Restaurant Applications</Label>
                                        <Switch id="push-restaurants" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push-system">System Alerts</Label>
                                        <Switch id="push-system" defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" className="justify-start">
                                        <span className="h-4 w-4 rounded-full bg-background border mr-2"></span>
                                        Light
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <span className="h-4 w-4 rounded-full bg-slate-950 mr-2"></span>
                                        Dark
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <span className="h-4 w-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-950 mr-2"></span>
                                        System
                                    </Button>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label>Accent Color</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer"></div>
                                    <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer"></div>
                                    <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer"></div>
                                    <div className="h-8 w-8 rounded-full bg-red-500 cursor-pointer"></div>
                                    <div className="h-8 w-8 rounded-full bg-orange-500 cursor-pointer"></div>
                                    <div className="h-8 w-8 rounded-full bg-slate-500 cursor-pointer"></div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="animations">Interface Animations</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable animations throughout the interface
                                        </p>
                                    </div>
                                    <Switch id="animations" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Minimize animations for accessibility
                                        </p>
                                    </div>
                                    <Switch id="reduced-motion" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your account security and authentication
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </div>

                            <Button className="mt-2">Change Password</Button>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Switch id="2fa" />
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Session Management</h3>
                                <Button variant="outline" className="w-full">
                                    <Lock className="mr-2 h-4 w-4" />
                                    Sign Out All Other Sessions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 