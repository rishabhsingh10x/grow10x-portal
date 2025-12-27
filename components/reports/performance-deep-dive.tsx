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
import { PerformanceRecord } from "@/lib/types/performance"
import { Download, Filter } from "lucide-react"

export function PerformanceDeepDive() {
    const [employees, setEmployees] = useState<User[]>([])
    const [allRecords, setAllRecords] = useState<PerformanceRecord[]>([])
    const [filteredRecords, setFilteredRecords] = useState<PerformanceRecord[]>([])

    // Filters
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
    const [countryFilter, setCountryFilter] = useState<string>("all")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    useEffect(() => {
        setEmployees(storage.getUsers().filter(u => u.role === 'employee'));
        setAllRecords(storage.getPerformanceRecords());

        // Default to this month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setFromDate(start);
        setToDate(end);
    }, []);

    useEffect(() => {
        filterData();
    }, [selectedEmployeeId, countryFilter, fromDate, toDate, allRecords]);

    const filterData = () => {
        let data = [...allRecords];

        // 1. Employee Filter
        if (selectedEmployeeId !== 'all') {
            data = data.filter(r => r.employeeId === selectedEmployeeId);
        }

        // 2. Country Filter
        if (countryFilter !== 'all') {
            data = data.filter(r => (r.country || 'USA') === countryFilter);
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
        const headers = ["ID", "Employee", "Date", "Country", "Leads Assigned", "Contacted", "Conversions", "Conv %", "Remarks"];
        const csvContent = [
            headers.join(","),
            ...filteredRecords.map(row => {
                const rate = row.prospectsContacted > 0
                    ? ((row.conversions / row.prospectsContacted) * 100).toFixed(1) + '%'
                    : '0.0%';
                return [row.id, row.employeeName, row.date, row.country || 'USA', row.leadsAssigned, row.prospectsContacted, row.conversions, rate, `"${row.remarks || ''}"`].join(",")
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_report_${fromDate}_to_${toDate}.csv`;
        a.click();
    }

    // Report Stats
    const totalLeads = filteredRecords.reduce((acc, curr) => acc + curr.leadsAssigned, 0);
    const totalContacted = filteredRecords.reduce((acc, curr) => acc + curr.prospectsContacted, 0);
    const totalConversions = filteredRecords.reduce((acc, curr) => acc + curr.conversions, 0);
    const avgConversionRate = totalContacted > 0 ? ((totalConversions / totalContacted) * 100).toFixed(1) : "0.0";

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Performance Deep Dive</CardTitle>
                        <CardDescription>Analyze sales and lead conversion metrics.</CardDescription>
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
                        <Select value={countryFilter} onValueChange={setCountryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Countries" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                <SelectItem value="USA">USA</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
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
                    <div>Total Records: <span className="font-bold text-foreground">{filteredRecords.length}</span></div>
                    <div>Total Leads: <span className="font-bold text-blue-600">{totalLeads}</span></div>
                    <div>Total Conversions: <span className="font-bold text-green-600">{totalConversions}</span></div>
                    <div>Avg Conv Rate: <span className="font-bold text-foreground">{avgConversionRate}%</span></div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead className="text-center">Leads</TableHead>
                                <TableHead className="text-center">Contacted</TableHead>
                                <TableHead className="text-center">Conv.</TableHead>
                                <TableHead className="text-center">Rate</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No performance records found for the selected criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((row) => {
                                    const rate = row.prospectsContacted > 0
                                        ? ((row.conversions / row.prospectsContacted) * 100).toFixed(1)
                                        : "0.0";
                                    const isHighPerf = Number(rate) >= 10;

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">{row.employeeName}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell>{row.country || 'USA'}</TableCell>
                                            <TableCell className="text-center">{row.leadsAssigned}</TableCell>
                                            <TableCell className="text-center">{row.prospectsContacted}</TableCell>
                                            <TableCell className="text-center">{row.conversions}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={isHighPerf ? 'default' : 'secondary'} className={isHighPerf ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                    {rate}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs" title={row.remarks}>
                                                {row.remarks || '-'}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
