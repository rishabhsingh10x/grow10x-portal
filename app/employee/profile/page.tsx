"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/services/storage"
import { User } from "@/lib/types/user" // Assuming User type is here or exported from storage
import { Loader2, User as UserIcon, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EmployeeProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Edit State
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setPhone(currentUser.phone || "");
            setAvatarUrl(currentUser.avatarUrl || "");
        }
    }, []);

    const handleProfileUpdate = async () => {
        if (!user) return;
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const updatedUser = { ...user, phone, avatarUrl };
            storage.updateUser(updatedUser);
            // Update session storage too
            localStorage.setItem('app_current_user', JSON.stringify(updatedUser)); // Or use storage method if available
            setUser(updatedUser);
            setSuccessMessage("Profile updated successfully!");
        } catch (err) {
            setErrorMessage("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;
        setErrorMessage("");
        setSuccessMessage("");

        if (newPassword !== confirmPassword) {
            setErrorMessage("New passwords do not match.");
            return;
        }

        // Check current password (also trim just in case user typed space, though DB might have space... tricky. best to behave Same as Login)
        // Login does trim. So we should trim here too to match what Login would have accepted.
        if (user.password !== currentPassword.trim()) {
            setErrorMessage("Incorrect current password.");
            return;
        }

        setLoading(true);
        try {
            // SAVE TRIMMED
            const updatedUser = { ...user, password: newPassword.trim() };
            storage.updateUser(updatedUser);
            localStorage.setItem('app_current_user', JSON.stringify(updatedUser));

            setUser(updatedUser);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccessMessage("Password changed successfully!");
        } catch (err) {
            setErrorMessage("Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
                <p className="text-muted-foreground">Manage your account details and preferences.</p>
            </div>

            <Tabs defaultValue="details" className="max-w-3xl">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Personal Details</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>View and update your contact details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={user.name} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={user.email} disabled className="bg-muted" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input value={user.department} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input value={user.role} disabled className="bg-muted capitalize" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatar">Profile Picture URL</Label>
                                <Input
                                    id="avatar"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/photo.jpg"
                                />
                                <p className="text-xs text-muted-foreground">Enter a direct link to an image.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="text-sm">
                                {successMessage && <span className="text-green-600">{successMessage}</span>}
                                {errorMessage && <span className="text-red-600">{errorMessage}</span>}
                            </div>
                            <Button onClick={handleProfileUpdate} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-pass">Current Password</Label>
                                <Input
                                    id="current-pass"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
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
                                <Label htmlFor="confirm-pass">Confirm New Password</Label>
                                <Input
                                    id="confirm-pass"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="text-sm">
                                {successMessage && <span className="text-green-600">{successMessage}</span>}
                                {errorMessage && <span className="text-red-600">{errorMessage}</span>}
                            </div>
                            <Button onClick={handleChangePassword} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
