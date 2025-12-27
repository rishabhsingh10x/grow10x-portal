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
import { LeaveRequest } from "@/lib/types/leave"
import { Download, Filter } from "lucide-react"

export function LeaveReport() {
    const [employees, setEmployees] = useState<User[]>([])
    const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([])
    const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([])

    // Filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all") // Casual, Sick, etc.
    const [statusFilter, setStatusFilter] = useState<string>("all") // Approved, Pending etc.
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    useEffect(() => {
        setEmployees(storage.getUsers().filter(u => u.role === 'employee'));
        setAllLeaves(storage.getLeaveRequests());

        // Default to this year maybe? Or last 3 months
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        setFromDate(start);
        setToDate(end);
    }, []);

    useEffect(() => {
        filterData();
    }, [selectedEmployeeId, typeFilter, statusFilter, fromDate, toDate, allLeaves]);

    const filterData = () => {
        let data = [...allLeaves];

        // 1. Employee Filter
        if (selectedEmployeeId !== 'all') {
            data = data.filter(r => r.employeeId === selectedEmployeeId);
        }

        // 2. Type Filter
        if (typeFilter !== 'all') {
            data = data.filter(r => r.type === typeFilter);
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            data = data.filter(r => r.status === statusFilter);
        }

        // 4. Date Range Filter (Check overlap or apply date)
        if (fromDate) {
            data = data.filter(r => r.fromDate >= fromDate);
        }
        if (toDate) {
            data = data.filter(r => r.toDate <= toDate);
        }

        // Sort by applied date desc
        data.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
        setFilteredLeaves(data);
    }

    const downloadCSV = () => {
        const headers = ["ID", "Employee", "Applied On", "Type", "From", "To", "Reason", "Status", "Admin Remarks"];
        const csvContent = [
            headers.join(","),
            ...filteredLeaves.map(row =>
                [row.id, row.employeeName, row.appliedOn, row.type, row.fromDate, row.toDate, `"${row.reason}"`, row.status, `"${row.managerRemarks || ''}"`].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave_report_${fromDate}_to_${toDate}.csv`;
        a.click();
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'Rejected': return 'bg-red-100 text-red-700 hover:bg-red-100';
            default: return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
        }
    }

    // Stats
    const totalRequests = filteredLeaves.length;
    const approved = filteredLeaves.filter(l => l.status === 'Approved').length;
    const pending = filteredLeaves.filter(l => l.status === 'Pending').length;
    const rejected = filteredLeaves.filter(l => l.status === 'Rejected').length;

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Leave Requests Report</CardTitle>
                        <CardDescription>Historical log of all leave applications and their status.</CardDescription>
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
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                <SelectItem value="Paid Leave">Paid Leave</SelectItem>
                                <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
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
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-[140px]" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-[140px]" />
                    </div>
                </div>

                {/* Summary Stats Row */}
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground border-t pt-4">
                    <div>Total: <span className="font-bold text-foreground">{totalRequests}</span></div>
                    <div>Approved: <span className="font-bold text-green-600">{approved}</span></div>
                    <div>Pending: <span className="font-bold text-yellow-600">{pending}</span></div>
                    <div>Rejected: <span className="font-bold text-red-600">{rejected}</span></div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No leave records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeaves.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.employeeName}</TableCell>
                                        <TableCell>{row.appliedOn}</TableCell>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {row.fromDate} <span className="mx-1">to</span> {row.toDate}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={row.reason}>
                                            {row.reason}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(row.status)} variant="secondary">
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-xs" title={row.managerRemarks}>
                                            {row.managerRemarks || '-'}
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
