"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AttendanceSummaryChart({ data }: { data: any[] }) {
    // Process data to count status
    const statusCounts = data.reduce((acc: any, curr: any) => {
        const status = curr.status || 'Present';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(statusCounts).map(key => ({
        name: key,
        value: statusCounts[key]
    }));

    // If no data, show placeholder
    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                    {chartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span>{entry.name}: {entry.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
