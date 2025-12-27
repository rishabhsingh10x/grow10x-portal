"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CalendarCheck, Timer, CalendarX, Loader2 } from "lucide-react"
import { supabaseService, User, AttendanceRecord } from "@/lib/services/supabase-service"

export default function EmployeeDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const u = supabaseService.getCurrentUser();
        setUser(u);
        if (u) {
            refreshData(u.id);
        }

        // Timer for clock
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const refreshData = async (userId: string) => {
        // First check for an active session (checked in but not checked out)
        const activeSession = await supabaseService.getActiveSession(userId);

        if (activeSession) {
            setTodayRecord(activeSession);
        } else {
            const record = await supabaseService.getTodayAttendance(userId);
            setTodayRecord(record);
        }
    }

    const handleClockIn = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await supabaseService.clockIn(user.id);
            await refreshData(user.id);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    const handleClockOut = async () => {
        if (!user || !todayRecord) return;
        setLoading(true);
        try {
            await supabaseService.clockOut(todayRecord.id);
            await refreshData(user.id);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    // Status Logic
    const isClockedIn = !!todayRecord;
    const isClockedOut = !!todayRecord?.checkOutTime;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0] || 'Employee'}!</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-md">
                    <CardHeader>
                        <CardTitle>Today's Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-4xl font-bold text-primary">{currentTime}</div>
                            <p className="text-muted-foreground font-medium">
                                {isClockedOut ? 'Checked Out' : isClockedIn ? 'Checked In' : 'Not Checked In'}
                            </p>
                            {isClockedIn && !isClockedOut && (
                                <p className="text-xs text-muted-foreground">Since {todayRecord?.checkInTime}</p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {!isClockedIn && (
                                <Button size="lg" className="bg-green-600 hover:bg-green-700 shadow-md" onClick={handleClockIn} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check In
                                </Button>
                            )}
                            {isClockedIn && !isClockedOut && (
                                <Button size="lg" variant="destructive" className="shadow-md" onClick={handleClockOut} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check Out
                                </Button>
                            )}
                            {isClockedOut && (
                                <Button size="lg" variant="outline" disabled>
                                    Done for Today
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{todayRecord?.totalHours || 0}h</div>
                        <p className="text-xs text-muted-foreground mt-1">Target: 8h</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground mt-1">This Month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absence</CardTitle>
                        <CalendarX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground mt-1">This Month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leaves Balance</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Remaining</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
