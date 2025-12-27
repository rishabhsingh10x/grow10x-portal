"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Download, Search, Trash2, Pencil } from "lucide-react"
import { supabaseService, AttendanceRecord } from "@/lib/services/supabase-service"
import { AddAttendanceDialog } from "@/components/attendance/add-attendance-dialog"

export default function AdminAttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const loadRecords = async () => {
        const data = await supabaseService.getAttendance();
        // Since getAttendance doesn't join profile name currently, we might need a join or fetch profiles
        // For now, I'll keep it as is or improve service.
        setRecords(data);
    }

    useEffect(() => {
        loadRecords();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record?")) {
            // Need a deleteAttendance method in service
            // const success = await supabaseService.deleteAttendance(id);
            // if (success) loadRecords();
        }
    }

    const filteredRecords = records.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterDate ? record.date === filterDate : true) &&
        (filterStatus !== "All" ? record.status === filterStatus : true)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Attendance Management</h2>
                    <p className="text-muted-foreground">Monitor employee check-in and check-out logs.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <AddAttendanceDialog onSave={loadRecords} />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <CardTitle>Attendance Logs</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employee..."
                                    className="pl-8 h-9 w-[200px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Input
                                type="date"
                                className="h-9 w-[150px]"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Status</SelectItem>
                                    <SelectItem value="Present">Present</SelectItem>
                                    <SelectItem value="Late">Late</SelectItem>
                                    <SelectItem value="Half Day">Half Day</SelectItem>
                                    <SelectItem value="Absent">Absent</SelectItem>
                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Total Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.employeeName}</TableCell>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>{record.checkInTime}</TableCell>
                                            <TableCell>{record.checkOutTime || "-"}</TableCell>
                                            <TableCell>{record.totalHours} hr</TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === 'Present' ? "default" : "secondary"}>
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
