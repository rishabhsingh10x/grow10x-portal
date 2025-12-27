"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CalendarDays,
    FileText,
    Settings,
    LogOut,
    UserCircle,
    TrendingUp,
    BarChart
} from "lucide-react"

const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/admin/performance", label: "Performance", icon: TrendingUp },
    { href: "/admin/leaves", label: "Leaves", icon: FileText },
    { href: "/admin/holidays", label: "Holidays", icon: CalendarDays },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
]

const employeeLinks = [
    { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/attendance", label: "My Attendance", icon: CalendarCheck },
    { href: "/employee/performance", label: "Performance", icon: TrendingUp },
    { href: "/employee/leaves", label: "My Leaves", icon: FileText },
    { href: "/employee/profile", label: "Profile", icon: UserCircle },
]

interface SidebarProps {
    role: "admin" | "employee"
    className?: string
}

export function Sidebar({ role, className }: SidebarProps) {
    const pathname = usePathname()
    const links = role === "admin" ? adminLinks : employeeLinks

    return (
        <div className={cn("flex flex-col h-screen border-r bg-card w-64 transition-all duration-300", className)}>
            <div className="h-16 flex items-center px-6 border-b">
                <span className="font-bold text-xl tracking-tight">Grow<span className="text-primary">10x</span></span>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-3">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t">
                <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Link>
            </div>
        </div>
    )
}
