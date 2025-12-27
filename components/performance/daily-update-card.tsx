"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Target, Phone, CheckCircle2, Loader2 } from "lucide-react"
import { storage } from "@/lib/services/storage"
import { PerformanceRecord } from "@/lib/types/performance"

export function DailyUpdateCard({ onUpdate }: { onUpdate: () => void }) {
    const [record, setRecord] = useState<PerformanceRecord | null | undefined>(undefined)
    const [contacted, setContacted] = useState("")
    const [conversions, setConversions] = useState("")
    const [remarks, setRemarks] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadTodayRecord();
    }, []);

    const loadTodayRecord = () => {
        const user = storage.getCurrentUser();
        if (user) {
            const todayRec = storage.getTodayRecord(user.id);
            setRecord(todayRec || null); // null means accessed but not found
            if (todayRec) {
                setContacted(todayRec.prospectsContacted.toString());
                setConversions(todayRec.conversions.toString());
                setRemarks(todayRec.remarks || "");
            }
        }
    }

    const handleSubmit = async () => {
        if (!record) return;
        setLoading(true);
        await storage.updateDailyProgress(record.id, Number(contacted), Number(conversions), remarks);
        setLoading(false);
        onUpdate(); // Refresh parent
    }

    if (record === undefined) return null; // Loading state could go here

    if (record === null) {
        return (
            <Card className="border-t-4 border-t-muted shadow-md">
                <CardHeader>
                    <CardTitle>Today's Targets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <Target className="h-12 w-12 mb-2 opacity-20" />
                        <p>No leads assigned for today yet.</p>
                        <p className="text-sm">Please contact your administrator.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-t-4 border-t-primary shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Today's Targets
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Leads Assigned</p>
                        <p className="text-3xl font-bold">{record.leadsAssigned}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contacted" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Prospects Contacted
                        </Label>
                        <Input
                            id="contacted"
                            type="number"
                            placeholder="0"
                            value={contacted}
                            onChange={(e) => setContacted(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="conversions" className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Conversions Closed
                        </Label>
                        <Input
                            id="conversions"
                            type="number"
                            placeholder="0"
                            value={conversions}
                            onChange={(e) => setConversions(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="remarks">Daily Remarks</Label>
                    <Textarea
                        id="remarks"
                        placeholder="Any notes about today's calls..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Progress
                </Button>
            </CardFooter>
        </Card>
    )
}
