"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseService, User, SystemSettings } from "@/lib/services/supabase-service"
import { DEFAULT_SETTINGS } from "@/lib/types/settings"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSettingsPage() {
    // System Settings State
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    // Admin Profile State
    const [admin, setAdmin] = useState<User | null>(null);
    const [phone, setPhone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const s = await supabaseService.getSettings();
        setSettings(s);
        const currentUser = supabaseService.getCurrentUser();
        if (currentUser) {
            setAdmin(currentUser);
            setPhone(currentUser.phone || "");
        }
    }

    const handleSaveSettings = async () => {
        setLoading(true);
        const ok = await supabaseService.updateSettings(settings);
        if (ok) {
            setSuccess("Settings updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        }
        setLoading(false);
    }

    const handleUpdateProfile = async () => {
        if (!admin) return;
        setLoading(true);
        setProfileMsg({ type: '', text: '' });

        try {
            const updatedUser = { ...admin, phone };
            const ok = await supabaseService.updateEmployee(updatedUser);

            if (ok) {
                setAdmin(updatedUser);
                setProfileMsg({ type: 'success', text: "Profile updated successfully!" });
            } else {
                setProfileMsg({ type: 'error', text: "Failed to update profile." });
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: "Error updating profile." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings & Profile</h2>
                <p className="text-muted-foreground">Manage system configurations and your admin account.</p>
            </div>

            <Tabs defaultValue="system" className="max-w-4xl">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="system">System Settings</TabsTrigger>
                    <TabsTrigger value="profile">Admin Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Rules</CardTitle>
                            <CardDescription>Set the working hours and thresholds for late marking.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">Office Start Time</Label>
                                    <Input
                                        id="start-time"
                                        type="time"
                                        value={settings.officeStartTime}
                                        onChange={(e) => setSettings({ ...settings, officeStartTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-time">Office End Time</Label>
                                    <Input
                                        id="end-time"
                                        type="time"
                                        value={settings.officeEndTime}
                                        onChange={(e) => setSettings({ ...settings, officeEndTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grace-time">Grace Period (Minutes)</Label>
                                <Input
                                    id="grace-time"
                                    type="number"
                                    value={settings.graceTimeMinutes}
                                    onChange={(e) => setSettings({ ...settings, graceTimeMinutes: parseInt(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground">Employees checking in after Start Time + Grace Period will be marked Late.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="half-day">Half Day Threshold (Hours)</Label>
                                <Input
                                    id="half-day"
                                    type="number"
                                    value={settings.halfDayThresholdHours}
                                    onChange={(e) => setSettings({ ...settings, halfDayThresholdHours: parseInt(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground">Minimum hours required to avoid Half Day status.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div className="text-green-600 text-sm font-medium">{success}</div>
                            <Button onClick={handleSaveSettings} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Update your personal details and password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={admin?.name || ''} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={admin?.email || ''} disabled className="bg-muted" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="admin-phone">Phone Number</Label>
                                <Input
                                    id="admin-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-3 text-sm">Change Password</h3>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="curr-pass">Current Password</Label>
                                        <Input
                                            id="curr-pass"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Only required if changing password"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-pass">New Password</Label>
                                            <Input
                                                id="new-pass"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="conf-pass">Confirm Password</Label>
                                            <Input
                                                id="conf-pass"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div className={`text-sm font-medium ${profileMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                {profileMsg.text}
                            </div>
                            <Button onClick={handleUpdateProfile} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Profile
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
