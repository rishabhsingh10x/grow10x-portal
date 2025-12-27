"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabaseService } from "@/lib/services/supabase-service"
import { User, AttendanceRecord } from "@/lib/services/supabase-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, CheckCircle, XCircle, Ban, AlertTriangle } from "lucide-react"

type TimeRange = 'This Month' | 'Last Month' | 'This Week' | 'Last Week' | 'Today' | 'Custom';

export default function EmployeeAttendancePage() {
    const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);

    // Filters
    const [timeRange, setTimeRange] = useState<TimeRange>('This Month');
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const loadData = async () => {
            const user = supabaseService.getCurrentUser();
            if (user) {
                const records = await supabaseService.getAttendance(user.id);
                setAllRecords(records);
            }
        }
        loadData()
    }, []);

    useEffect(() => {
        filterRecords();
    }, [allRecords, timeRange, customStart, customEnd, statusFilter]);

    const filterRecords = () => {
        let filtered = [...allRecords];
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Date Filter
        if (timeRange !== 'Custom') {
            let startDate = new Date();
            let endDate = new Date();

            switch (timeRange) {
                case 'Today':
                    startDate = now;
                    endDate = now;
                    break;
                case 'This Week':
                    // Assuming week starts Sunday
                    const day1 = now.getDay();
                    const diff1 = now.getDate() - day1 + (day1 === 0 ? -6 : 1); // adjust when day is sunday
                    startDate = new Date(now.setDate(diff1));
                    endDate = new Date(); // To Date
                    break;
                case 'Last Week':
                    // Not implementing complex week logic perfectly for now, keeping it simple previous 7 days
                    startDate = new Date();
                    startDate.setDate(now.getDate() - 14);
                    endDate = new Date();
                    endDate.setDate(now.getDate() - 7);
                    break;
                case 'This Month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
                case 'Last Month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                    break;
            }

            // Format to YYYY-MM-DD for comparison
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            // Allow exact match for Today, or range overlap
            if (timeRange === 'Today') {
                filtered = filtered.filter(r => r.date === todayStr);
            } else {
                // Re-calibrating the "This Week" logic which is tricky with JS Date mutation above
                // Let's use simple logic:
                // Reset vars
                const d = new Date();
                let start = "";
                let end = "";

                if (timeRange === 'This Month') {
                    start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                    end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
                } else if (timeRange === 'Last Month') {
                    start = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0];
                    end = new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split('T')[0];
                } else if (timeRange === 'This Week') {
                    // Simple approximation: Last 7 days? Or actual calendar week?
                    // User asked for "This Week".
                    const curr = new Date();
                    const first = curr.getDate() - curr.getDay();
                    const last = first + 6;
                    start = new Date(curr.setDate(first)).toISOString().split('T')[0];
                    end = new Date(curr.setDate(last)).toISOString().split('T')[0];
                } else if (timeRange === 'Last Week') {
                    const today = new Date();
                    const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7 - today.getDay());
                    const lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1 - today.getDay());
                    start = lastWeekStart.toISOString().split('T')[0];
                    end = lastWeekEnd.toISOString().split('T')[0];
                }

                if (start && end) {
                    filtered = filtered.filter(r => r.date >= start && r.date <= end);
                }
            }
        } else {
            if (customStart && customEnd) {
                filtered = filtered.filter(r => r.date >= customStart && r.date <= customEnd);
            }
        }

        // Status Filter
        if (statusFilter !== "All") {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        setFilteredRecords(filtered);
    }

    // Stats Calculation
    const totalDays = filteredRecords.length;
    const presentDays = filteredRecords.filter(r => r.status === 'Present').length;
    const absentDays = filteredRecords.filter(r => r.status === 'Absent').length;
    const halfDays = filteredRecords.filter(r => r.status === 'Half Day').length;
    const leaveDays = filteredRecords.filter(r => r.status === 'On Leave').length; // Assuming 'On Leave' status map
    const totalHours = filteredRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "0";

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Present': return 'default';
            case 'Absent': return 'destructive';
            case 'Late': return 'warning'; // We need to add warning variant to badge potentially, or use secondary
            case 'Half Day': return 'secondary';
            case 'On Leave': return 'outline';
            default: return 'default';
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Attendance History</h2>
                    <p className="text-muted-foreground">Detailed logs of your working hours and status.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Select value={timeRange} onValueChange={(v: TimeRange) => setTimeRange(v)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Today">Today</SelectItem>
                            <SelectItem value="This Week">This Week</SelectItem>
                            <SelectItem value="Last Week">Last Week</SelectItem>
                            <SelectItem value="This Month">This Month</SelectItem>
                            <SelectItem value="Last Month">Last Month</SelectItem>
                            <SelectItem value="Custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>
                    {timeRange === 'Custom' && (
                        <div className="flex items-center gap-2">
                            <Input type="date" className="w-[140px]" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                            <span>-</span>
                            <Input type="date" className="w-[140px]" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                        </div>
                    )}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Late">Late</SelectItem>
                            <SelectItem value="Half Day">Half Day</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentDays}</div>
                        <p className="text-xs text-muted-foreground">Days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentDays}</div>
                        <p className="text-xs text-muted-foreground">Days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late / Half Day</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredRecords.filter(r => r.status === 'Late' || r.status === 'Half Day').length}</div>
                        <p className="text-xs text-muted-foreground">Days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">Across {totalDays} days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Daily</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgHours}</div>
                        <p className="text-xs text-muted-foreground">Hours / Day</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance Log</CardTitle>
                    <CardDescription>Records for {timeRange === 'Custom' ? 'Selected Range' : timeRange}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Total Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No attendance records found for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.date}</TableCell>
                                            <TableCell>{record.checkInTime}</TableCell>
                                            <TableCell>{record.checkOutTime || "-"}</TableCell>
                                            <TableCell>{record.totalHours} hr</TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === 'Present' ? "default" : record.status === 'Absent' ? "destructive" : "secondary"}>
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
