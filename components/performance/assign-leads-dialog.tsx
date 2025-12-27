"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { storage } from "@/lib/services/storage"

export function AssignLeadsDialog({ onAssign }: { onAssign?: () => void }) {
    const [open, setOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [leadsCount, setLeadsCount] = useState("")
    const [contacted, setContacted] = useState("")
    const [conversions, setConversions] = useState("")
    const [date, setDate] = useState("")
    const [country, setCountry] = useState("USA")
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        // Load employees with 'employee' role only
        const users = storage.getUsers().filter(u => u.role === 'employee');
        setEmployees(users);
        // Default date to today
        setDate(new Date().toISOString().split('T')[0]);
    }, [open]); // Reload when dialog opens

    const handleSave = async () => {
        const emp = employees.find(e => e.id === selectedEmployee);
        const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        if (emp) {
            // 1. Assign Leads First (with Date and Country)
            const records = await storage.assignLeads(emp.id, emp.name, Number(leadsCount), "", targetDate, country);

            // 2. If contacted/conversions provided, update status immediately
            // We need to find the ID of the record we just touched (using targetDate)
            const record = records.find(r => r.employeeId === emp.id && r.date === targetDate);

            if (record && (contacted || conversions)) {
                await storage.updateDailyProgress(
                    record.id,
                    contacted ? Number(contacted) : 0,
                    conversions ? Number(conversions) : 0,
                    record.remarks || ""
                );
            }

            if (onAssign) onAssign();
        }
        setOpen(false)
        setSelectedEmployee("")
        setLeadsCount("")
        setContacted("")
        setConversions("")
        setCountry("USA") // Reset to default
        setDate("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Daily Performance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Daily Performance Entry</DialogTitle>
                    <DialogDescription>
                        Assign leads and optionally log progress for an employee.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="employee">Employee</Label>
                        <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Select onValueChange={setCountry} value={country}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USA">USA</SelectItem>
                                    <SelectItem value="UK">UK</SelectItem>
                                    <SelectItem value="India">India</SelectItem>
                                    <SelectItem value="Canada">Canada</SelectItem>
                                    <SelectItem value="Australia">Australia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="leads">Total Leads Assigned</Label>
                        <Input
                            id="leads"
                            type="number"
                            placeholder="e.g. 50"
                            value={leadsCount}
                            onChange={(e) => setLeadsCount(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contacted">Prospects Contacted</Label>
                            <Input
                                id="contacted"
                                type="number"
                                placeholder="Optional"
                                value={contacted}
                                onChange={(e) => setContacted(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="conversions">Total Conversions</Label>
                            <Input
                                id="conversions"
                                type="number"
                                placeholder="Optional"
                                value={conversions}
                                onChange={(e) => setConversions(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={!selectedEmployee || !leadsCount}>
                        Save Entry
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
