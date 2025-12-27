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
import { AttendanceRecord } from "@/lib/types/attendance"

export function AddAttendanceDialog({ onSave }: { onSave: () => void }) {
    const [open, setOpen] = useState(false)
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([])

    // Form State
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [date, setDate] = useState("")
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [status, setStatus] = useState("Present")

    useEffect(() => {
        // Load employees
        const users = storage.getUsers().filter(u => u.role === 'employee');
        setEmployees(users);
    }, [open]);

    const handleSubmit = async () => {
        if (!selectedEmployee || !date || !checkIn) return;

        const emp = employees.find(e => e.id === selectedEmployee);
        if (!emp) return;

        // Calculate Hours
        let totalHours = 0;
        if (checkIn && checkOut) {
            // Assume date is 'date' for both times implicitly
            const start = new Date(`${date}T${checkIn}`);
            const end = new Date(`${date}T${checkOut}`);
            const diff = end.getTime() - start.getTime();
            if (diff > 0) {
                totalHours = Number((diff / (1000 * 60 * 60)).toFixed(2));
            }
        }

        const newRecord: AttendanceRecord = {
            id: Math.random().toString(36).substr(2, 9),
            employeeId: emp.id,
            employeeName: emp.name,
            date: date,
            checkInTime: new Date(`2000-01-01T${checkIn}`).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }), // Format for display
            checkOutTime: checkOut ? new Date(`2000-01-01T${checkOut}`).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }) : undefined,
            totalHours: totalHours,
            status: status as any
        };

        await storage.addAttendanceRecord(newRecord);
        onSave();
        setOpen(false);

        // Reset
        setSelectedEmployee("");
        setDate("");
        setCheckIn("");
        setCheckOut("");
        setStatus("Present");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Attendance Record</DialogTitle>
                    <DialogDescription>
                        Manually add or correct an attendance log.
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
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="checkin">Check In</Label>
                            <Input
                                id="checkin"
                                type="time"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="checkout">Check Out</Label>
                            <Input
                                id="checkout"
                                type="time"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Late">Late</SelectItem>
                                <SelectItem value="Half Day">Half Day</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!selectedEmployee || !date || !checkIn}>
                        Save Record
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
