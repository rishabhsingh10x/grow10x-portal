"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/services/storage"
import { User } from "@/lib/types/user" // Fixed import
import { AttendanceRecord } from "@/lib/types/attendance"
import { Download, Filter } from "lucide-react"

export function AttendanceDeepDive() {
    const [employees, setEmployees] = useState<User[]>([])
    const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([])
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])

    // Filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    useEffect(() => {
        setEmployees(storage.getUsers().filter(u => u.role === 'employee'));
        setAllRecords(storage.getAttendanceRecords());

        // Default to this month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setFromDate(start);
        setToDate(end);
    }, []);

    useEffect(() => {
        filterData();
    }, [selectedEmployeeId, statusFilter, fromDate, toDate, allRecords]);

    const filterData = () => {
        let data = [...allRecords];

        // 1. Employee Filter
        if (selectedEmployeeId !== 'all') {
            data = data.filter(r => r.employeeId === selectedEmployeeId);
        }

        // 2. Status Filter
        if (statusFilter !== 'all') {
            data = data.filter(r => r.status === statusFilter);
        }

        // 3. Date Range Filter
        if (fromDate) {
            data = data.filter(r => r.date >= fromDate);
        }
        if (toDate) {
            data = data.filter(r => r.date <= toDate);
        }

        // Sort by date desc
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setFilteredRecords(data);
    }

    const downloadCSV = () => {
        const headers = ["ID", "Employee", "Date", "Check In", "Check Out", "Total Hours", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredRecords.map(row =>
                [row.id, row.employeeName, row.date, row.checkInTime || '-', row.checkOutTime || '-', row.totalHours, row.status].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${fromDate}_to_${toDate}.csv`;
        a.click();
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Present': return 'default';
            case 'Absent': return 'destructive';
            case 'Late': return 'warning'; // We might need to map warning to yellow in badge or use outline
            case 'Half Day': return 'secondary';
            case 'On Leave': return 'outline';
            default: return 'outline';
        }
    }

    // Calculate Summary Stats for the filtered view
    const totalPresent = filteredRecords.filter(r => r.status === 'Present').length;
    const totalLate = filteredRecords.filter(r => r.status === 'Late').length;
    const totalAbsent = filteredRecords.filter(r => r.status === 'Absent').length;
    const totalHours = filteredRecords.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1);

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Attendance Deep Dive</CardTitle>
                        <CardDescription>Detailed logs of employee check-ins and check-outs.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="w-full md:w-[200px]">
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Employees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {employees.map(e => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-[150px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Late">Late</SelectItem>
                                <SelectItem value="Half Day">Half Day</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-[140px]" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-[140px]" />
                    </div>
                </div>

                {/* Summary Row */}
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground border-t pt-4">
                    <div>Total Records: <span className="font-bold text-foreground">{filteredRecords.length}</span></div>
                    <div>Present: <span className="font-bold text-green-600">{totalPresent}</span></div>
                    <div>Late: <span className="font-bold text-yellow-600">{totalLate}</span></div>
                    <div>Absent: <span className="font-bold text-red-600">{totalAbsent}</span></div>
                    <div>Total Hours: <span className="font-bold text-foreground">{totalHours}</span></div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead className="text-right">Total Hours</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No attendance records found for the selected criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.employeeName}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                row.status === 'Present' ? 'default' :
                                                    row.status === 'Absent' ? 'destructive' :
                                                        row.status === 'Late' ? 'default' : // Use default (black/primary) for late, or customized
                                                            'secondary'
                                            } className={row.status === 'Late' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{row.checkInTime || '-'}</TableCell>
                                        <TableCell>{row.checkOutTime || '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{row.totalHours}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
