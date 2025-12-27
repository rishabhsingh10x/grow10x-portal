"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { name: "Jan", total: 95 },
    { name: "Feb", total: 92 },
    { name: "Mar", total: 96 },
    { name: "Apr", total: 91 },
    { name: "May", total: 94 },
    { name: "Jun", total: 98 },
    { name: "Jul", total: 92 },
    { name: "Aug", total: 95 },
    { name: "Sep", total: 93 },
    { name: "Oct", total: 96 },
    { name: "Nov", total: 90 },
    { name: "Dec", total: 95 },
]

export function OverviewChart() {
    return (
        <Card className="col-span-4 shadow-md">
            <CardHeader>
                <CardTitle>Monthly Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
