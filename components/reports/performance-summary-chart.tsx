"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PerformanceSummaryChart({ data }: { data: any[] }) {
    // Process data to group by employee and sum leads/conversions
    const employeeStats = data.reduce((acc: any, curr: any) => {
        const name = curr.employeeName;
        if (!acc[name]) {
            acc[name] = { name, leadsArray: 0, conversions: 0 };
        }
        acc[name].leadsArray += Number(curr.leadsAssigned || 0);
        acc[name].conversions += Number(curr.conversions || 0);
        return acc;
    }, {});

    const chartData = Object.values(employeeStats);

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
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
                <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" fontSize={12} stroke="#888888" />
                        <YAxis fontSize={12} stroke="#888888" />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="leadsArray" name="Leads Assigned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="conversions" name="Conversions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
