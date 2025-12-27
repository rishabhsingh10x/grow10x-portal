"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabaseService as storage } from "@/lib/services/supabase-service"

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [headerTitle, setHeaderTitle] = useState("Employee Portal");

    useEffect(() => {
        const user = storage.getCurrentUser();
        if (!user) {
            router.push('/login');
            return;
        }

        if (user.role !== 'employee') {
            router.push('/admin/dashboard');
            return;
        }

        // Personalize the portal name
        const firstName = user.name.split(' ')[0];
        setHeaderTitle(`${firstName}'s Portal`);

        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/40 text-foreground">
            <Sidebar role="employee" />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header title={headerTitle} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
