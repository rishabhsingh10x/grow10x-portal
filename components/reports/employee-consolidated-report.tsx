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
import { User } from "@/lib/types/user"
import { AttendanceRecord } from "@/lib/types/attendance"
import { PerformanceRecord } from "@/lib/types/performance"
import { Download } from "lucide-react"

export function EmployeeConsolidatedReport() {
    const [employees, setEmployees] = useState<User[]>([])
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [reportData, setReportData] = useState<any[]>([])

    useEffect(() => {
        setEmployees(storage.getUsers().filter(u => u.role === 'employee'));

        // Default to this month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setFromDate(start);
        setToDate(end);
    }, []);

    useEffect(() => {
        generateReport();
    }, [selectedEmployeeId, fromDate, toDate]);

    const generateReport = () => {
        if (!fromDate || !toDate) return;

        const allAttendance = storage.getAttendanceRecords();
        const allPerformance = storage.getPerformanceRecords();

        // 1. Generate Date Range Array
        const dates: string[] = [];
        let curr = new Date(fromDate);
        const last = new Date(toDate);
        while (curr <= last) {
            dates.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }

        // 2. Filter target employees
        const targetEmployees = selectedEmployeeId === 'all'
            ? employees
            : employees.filter(e => e.id === selectedEmployeeId);

        const rows: any[] = [];

        targetEmployees.forEach(emp => {
            dates.forEach(date => {
                const attRec = allAttendance.find(a => a.employeeId === emp.id && a.date === date);
                const perfRec = allPerformance.find(p => p.employeeId === emp.id && p.date === date);

                // Only add row if there is some activity (attendance or performance) OR if we want to show absent days properly?
                // Ideally show all days to highlight absence.

                rows.push({
                    id: `${emp.id}-${date}`,
                    employeeName: emp.name,
                    date: date,
                    attendanceStatus: attRec ? attRec.status : 'Absent', // Or 'Weekend' logic if we had it
                    checkIn: attRec?.checkInTime || '-',
                    checkOut: attRec?.checkOutTime || '-',
                    totalHours: attRec?.totalHours || 0,
                    leadsAssigned: perfRec?.leadsAssigned || 0,
                    contacted: perfRec?.prospectsContacted || 0,
                    conversions: perfRec?.conversions || 0,
                    conversionRate: perfRec && perfRec.prospectsContacted > 0
                        ? ((perfRec.conversions / perfRec.prospectsContacted) * 100).toFixed(1) + '%'
                        : '0.0%'
                });
            });
        });

        // Filter out completely empty future days if needed, but mostly we want to see history.
        // Sort by date desc
        rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReportData(rows);
    }

    const downloadCSV = () => {
        // Simple CSV Export logic
        const headers = ["Employee", "Date", "Status", "Check In", "Check Out", "Hours", "Leads", "Contacted", "Conversions", "Conv %"];
        const csvContent = [
            headers.join(","),
            ...reportData.map(row =>
                [row.employeeName, row.date, row.attendanceStatus, row.checkIn, row.checkOut, row.totalHours, row.leadsAssigned, row.contacted, row.conversions, row.conversionRate].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employee_report_${fromDate}_to_${toDate}.csv`;
        a.click();
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Employee Consolidated Report</CardTitle>
                        <CardDescription>View Attendance and Performance side-by-side.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
                    <div className="w-full md:w-[200px]">
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {employees.map(e => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-[150px]" />
                        <span>to</span>
                        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-[150px]" />
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
                                <TableHead>Attendance Status</TableHead>
                                <TableHead>Check In / Out</TableHead>
                                <TableHead className="text-center">Total Hours</TableHead>
                                <TableHead className="text-center">Leads</TableHead>
                                <TableHead className="text-center">Contacted</TableHead>
                                <TableHead className="text-center">Conversions</TableHead>
                                <TableHead className="text-center">Conv. %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        No data found for this period.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reportData.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.employeeName}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                row.attendanceStatus === 'Present' ? 'default' :
                                                    row.attendanceStatus === 'Absent' ? 'destructive' : 'secondary'
                                            }>
                                                {row.attendanceStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {row.checkIn} - {row.checkOut}
                                        </TableCell>
                                        <TableCell className="text-center">{row.totalHours} hr</TableCell>
                                        <TableCell className="text-center">{row.leadsAssigned}</TableCell>
                                        <TableCell className="text-center">{row.contacted}</TableCell>
                                        <TableCell className="text-center">{row.conversions}</TableCell>
                                        <TableCell className="text-center font-bold text-green-600">
                                            {row.conversionRate}
                                        </TableCell>
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
