"use client"

import { useState, useEffect } from "react"
import { PerformanceTable } from "@/components/performance/performance-table"
import { AssignLeadsDialog } from "@/components/performance/assign-leads-dialog"
import { supabaseService, PerformanceRecord } from "@/lib/services/supabase-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

export default function AdminPerformancePage() {
    const [data, setData] = useState<PerformanceRecord[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        loadData();
    }, [])

    const loadData = async () => {
        const d = await supabaseService.getPerformanceRecords();
        setData(d);
    }

    const filteredData = data.filter(d =>
        d.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Performance Tracker</h2>
                    <p className="text-muted-foreground">Monitor daily employee performance and conversion rates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <AssignLeadsDialog onAssign={loadData} />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Daily Performance Records</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by employee..."
                                    className="pl-8 h-9 w-[200px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Input type="date" className="h-9 w-[150px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <PerformanceTable data={filteredData} showActions={true} onRefresh={loadData} />
                </CardContent>
            </Card>
        </div>
    )
}
