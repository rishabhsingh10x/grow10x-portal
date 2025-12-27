"use client"

import { useState, useEffect } from "react"
import { DailyUpdateCard } from "@/components/performance/daily-update-card"
import { PerformanceTable } from "@/components/performance/performance-table"
import { storage } from "@/lib/services/storage"
import { PerformanceRecord } from "@/lib/types/performance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmployeePerformancePage() {
    const [myData, setMyData] = useState<PerformanceRecord[]>([])

    useEffect(() => {
        loadData();
    }, [])

    const loadData = () => {
        const user = storage.getCurrentUser();
        if (user) {
            setMyData(storage.getEmployeePerformance(user.id));
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Performance</h2>
                <p className="text-muted-foreground">Track your leads and update daily progress.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <div className="md:col-span-3">
                    <DailyUpdateCard onUpdate={loadData} />
                </div>
                <div className="md:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <PerformanceTable data={myData} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
