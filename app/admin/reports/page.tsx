"use client"

import { useState, useEffect } from "react"
import { AttendanceSummaryChart } from "@/components/reports/attendance-summary-chart"
import { PerformanceSummaryChart } from "@/components/reports/performance-summary-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/services/storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmployeeConsolidatedReport } from "@/components/reports/employee-consolidated-report"
import { AttendanceDeepDive } from "@/components/reports/attendance-deep-dive"
import { PerformanceDeepDive } from "@/components/reports/performance-deep-dive"
import { LeaveReport } from "@/components/reports/leave-report"

export default function ReportsPage() {
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);

    useEffect(() => {
        // Load all data
        setAttendanceData(storage.getAttendanceRecords());
        setPerformanceData(storage.getPerformanceRecords());
    }, []);

    // Stats Calculation
    const totalEmployees = storage.getUsers().filter(u => u.role === 'employee').length;
    const totalLeads = performanceData.reduce((acc, curr) => acc + Number(curr.leadsAssigned), 0);
    const totalConversions = performanceData.reduce((acc, curr) => acc + Number(curr.conversions), 0);
    const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
                    <p className="text-muted-foreground">Comprehensive overview of company performance.</p>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEmployees}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLeads}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Visualizations */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="employee-report">Employee Report</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance Details</TabsTrigger>
                    <TabsTrigger value="performance">Performance Details</TabsTrigger>
                    <TabsTrigger value="leaves">Leave Details</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Attendance Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <AttendanceSummaryChart data={attendanceData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PerformanceSummaryChart data={performanceData} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="attendance">
                    <AttendanceDeepDive />
                </TabsContent>
                <TabsContent value="performance">
                    <PerformanceDeepDive />
                </TabsContent>
                <TabsContent value="employee-report">
                    <EmployeeConsolidatedReport />
                </TabsContent>
                <TabsContent value="leaves">
                    <LeaveReport />
                </TabsContent>
            </Tabs>
        </div>
    )
}
