"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, Filter } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabaseService, LeaveRequest } from "@/lib/services/supabase-service"

export default function AdminLeavesPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Rejection Dialog
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [remarks, setRemarks] = useState("");
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        const data = await supabaseService.getLeaves();
        setRequests(data);
    }

    const filteredRequests = requests
        .filter(r =>
            (statusFilter === 'All' || r.status === statusFilter) &&
            (r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());

    const handleApprove = async (id: string) => {
        if (confirm("Approve this leave request?")) {
            await supabaseService.updateLeaveStatus(id, 'Approved', "Approved by Admin");
            await loadRequests();
        }
    }

    const openRejectDialog = (id: string) => {
        setRejectId(id);
        setRemarks("");
        setIsRejectOpen(true);
    }

    const handleReject = async () => {
        if (rejectId) {
            await supabaseService.updateLeaveStatus(rejectId, 'Rejected', remarks || "Rejected by Admin");
            setRejectId(null);
            setIsRejectOpen(false);
            await loadRequests();
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'Rejected': return 'bg-red-100 text-red-700 hover:bg-red-100';
            default: return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
                    <p className="text-muted-foreground">Review and manage employee leave requests.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[200px]">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employee..."
                            className="pl-8 h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Admin Remarks</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">No leave requests found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.employeeName}</TableCell>
                                        <TableCell>{req.appliedOn}</TableCell>
                                        <TableCell>{req.type}</TableCell>
                                        <TableCell>{req.fromDate} to {req.toDate}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={req.reason}>{req.reason || "-"}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(req.status)} variant="secondary">
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-sm">{req.managerRemarks || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'Pending' && (
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleApprove(req.id)} className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openRejectDialog(req.id)} className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                        <DialogDescription>Please provide a reason for rejection.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Critical project delivery pending..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Reject Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

