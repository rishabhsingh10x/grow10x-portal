import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PerformanceRecord } from "@/lib/types/performance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { EditPerformanceDialog } from "./edit-performance-dialog"
import { storage } from "@/lib/services/storage"

interface PerformanceTableProps {
    data: PerformanceRecord[]
    onRefresh?: () => void
    showActions?: boolean
}

export function PerformanceTable({ data, onRefresh, showActions = false }: PerformanceTableProps) {
    const [editingRecord, setEditingRecord] = useState<PerformanceRecord | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
            storage.deletePerformanceRecord(id);
            if (onRefresh) onRefresh();
        }
    }

    const handleEdit = (record: PerformanceRecord) => {
        setEditingRecord(record);
        setIsEditOpen(true);
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead className="text-center">Leads Assigned</TableHead>
                        <TableHead className="text-center">Contacted</TableHead>
                        <TableHead className="text-center">Conversions</TableHead>
                        <TableHead className="text-center">Conv. %</TableHead>
                        <TableHead>Remarks</TableHead>
                        {showActions && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={showActions ? 8 : 7} className="h-24 text-center">
                                No performance data found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((record) => {
                            const conversionRate = record.prospectsContacted > 0
                                ? ((record.conversions / record.prospectsContacted) * 100).toFixed(1)
                                : "0.0";

                            return (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.country || "USA"}</TableCell>
                                    <TableCell className="text-center">{record.leadsAssigned}</TableCell>
                                    <TableCell className="text-center">{record.prospectsContacted}</TableCell>
                                    <TableCell className="text-center">{record.conversions}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={Number(conversionRate) > 10 ? "default" : "secondary"}>
                                            {conversionRate}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={record.remarks}>
                                        {record.remarks || "-"}
                                    </TableCell>
                                    {showActions && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(record)} className="h-8 w-8 hover:bg-muted">
                                                    <Edit2 className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)} className="h-8 w-8 hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>

            <EditPerformanceDialog
                record={editingRecord}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSave={() => {
                    if (onRefresh) onRefresh();
                }}
            />
        </div>
    )
}
