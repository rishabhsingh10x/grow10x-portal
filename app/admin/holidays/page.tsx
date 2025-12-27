"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseService, Holiday } from "@/lib/services/supabase-service"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, CalendarDays } from "lucide-react"

export default function AdminHolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("Public");

    useEffect(() => {
        loadHolidays();
    }, []);

    const loadHolidays = async () => {
        const data = await supabaseService.getHolidays();
        setHolidays(data);
    }

    const handleAdd = async () => {
        if (!name || !date) return;
        const success = await supabaseService.addHoliday({
            name,
            date,
            type: type as any
        });
        if (success) {
            await loadHolidays();
            setIsDialogOpen(false);
            setName("");
            setDate("");
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Delete this holiday?")) {
            await supabaseService.deleteHoliday(id);
            await loadHolidays();
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Holiday Management</h2>
                    <p className="text-muted-foreground">Manage company and public holidays.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Holiday</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Holiday</DialogTitle>
                            <DialogDescription>Create a new holiday entry for the calendar.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Holiday Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Christmas" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Public">Public Holiday</SelectItem>
                                        <SelectItem value="Company">Company Holiday</SelectItem>
                                        <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd}>Save Holiday</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Holidays</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Holiday Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holidays.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No holidays added yet.</TableCell>
                                </TableRow>
                            ) : (
                                holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(h => (
                                    <TableRow key={h.id}>
                                        <TableCell className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            {h.date}
                                        </TableCell>
                                        <TableCell className="font-medium">{h.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {h.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)} className="text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
