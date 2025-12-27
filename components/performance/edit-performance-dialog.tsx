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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { storage } from "@/lib/services/storage"
import { PerformanceRecord } from "@/lib/types/performance"

interface EditPerformanceDialogProps {
    record: PerformanceRecord | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: () => void
}

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function EditPerformanceDialog({ record, open, onOpenChange, onSave }: EditPerformanceDialogProps) {
    const [leads, setLeads] = useState("")
    const [contacted, setContacted] = useState("")
    const [conversions, setConversions] = useState("")
    const [remarks, setRemarks] = useState("")
    const [country, setCountry] = useState("")

    useEffect(() => {
        if (record) {
            setLeads(record.leadsAssigned.toString())
            setContacted(record.prospectsContacted.toString())
            setConversions(record.conversions.toString())
            setRemarks(record.remarks || "")
            setCountry(record.country || "USA")
        }
    }, [record, open])

    const handleSave = async () => {
        if (!record) return

        const updatedRecord: PerformanceRecord = {
            ...record,
            leadsAssigned: Number(leads),
            prospectsContacted: Number(contacted),
            conversions: Number(conversions),
            country: country,
            remarks: remarks
        }

        await storage.updatePerformanceRecord(updatedRecord)
        onSave()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Performance Record</DialogTitle>
                    <DialogDescription>
                        Modify the performance details for {record?.employeeName} on {record?.date}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-country">Country</Label>
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
                    <div className="grid gap-2">
                        <Label htmlFor="edit-leads">Leads Assigned</Label>
                        <Input
                            id="edit-leads"
                            type="number"
                            value={leads}
                            onChange={(e) => setLeads(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-contacted">Contacted</Label>
                            <Input
                                id="edit-contacted"
                                type="number"
                                value={contacted}
                                onChange={(e) => setContacted(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-conversions">Conversions</Label>
                            <Input
                                id="edit-conversions"
                                type="number"
                                value={conversions}
                                onChange={(e) => setConversions(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-remarks">Remarks</Label>
                        <Textarea
                            id="edit-remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
