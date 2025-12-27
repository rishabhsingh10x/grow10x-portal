import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-muted rounded-full">
                    <Construction className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="text-muted-foreground max-w-lg">
                    This module is currently being developed. Please check back later or check the Employees/Dashboard modules for completely working implementations.
                </p>
            </div>
        </div>
    )
}
