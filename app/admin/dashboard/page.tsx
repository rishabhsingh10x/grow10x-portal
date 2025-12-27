"use client"

import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, UserCheck, UserX, Clock, CalendarOff } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Employees" value="128" icon={Users} description="total active" trend="+4%" />
                <StatsCard title="Present Today" value="112" icon={UserCheck} description="92% attendance" trend="+2%" />
                <StatsCard title="Absent" value="10" icon={UserX} description="excused leaves" />
                <StatsCard title="Late Check-ins" value="6" icon={Clock} description="arrived after 9:30 AM" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <OverviewChart />
                </div>
                <div className="col-span-3 space-y-4">
                    {/* We can add a "Recent Leaves" or "On Leave Today" list here */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">On Leave Today</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">AB</div>
                                        <div>
                                            <p className="text-sm font-medium">Alex Brown</p>
                                            <p className="text-xs text-muted-foreground">Sick Leave</p>
                                        </div>
                                    </div>
                                    <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Approved</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
