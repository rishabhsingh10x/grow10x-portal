"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { supabaseService, User } from "@/lib/services/supabase-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Form State
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newPhone, setNewPhone] = useState("")
    const [newDept, setNewDept] = useState("")
    const [newRole, setNewRole] = useState("employee")
    const [newPassword, setNewPassword] = useState("")
    const [newCode, setNewCode] = useState("")

    useEffect(() => {
        loadEmployees()
    }, [])

    const loadEmployees = async () => {
        setLoading(true)
        const data = await supabaseService.getEmployees()
        setEmployees(data)
        setLoading(false)
    }

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddEmployee = async () => {
        if (!newName || !newEmail || !newPassword) return;

        const normalizedEmail = newEmail.toLowerCase().trim();

        setLoading(true)
        const success = await supabaseService.addEmployee({
            name: newName,
            email: normalizedEmail,
            phone: newPhone,
            department: newDept,
            role: newRole as any,
            status: 'Active',
            employeeId: newCode.trim() || `EMP${Math.floor(100 + Math.random() * 900)}`
        }, newPassword.trim())

        if (success) {
            await loadEmployees()
            setIsDialogOpen(false);
            resetForm();
        } else {
            alert("Failed to add employee. Email might already be in use or connection issue.")
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
            const success = await supabaseService.deleteEmployee(id);
            if (success) {
                await loadEmployees()
            }
        }
    }

    const resetForm = () => {
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewDept("");
        setNewRole("employee");
        setNewPassword("");
        setNewCode("");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Employee</DialogTitle>
                                <DialogDescription>
                                    Create a new user account with login credentials.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Employee ID (Optional)</Label>
                                    <Input id="code" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="EMP-001" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@company.com" type="email" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1 234 567 890" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input id="department" value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="Engineering" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={newRole} onValueChange={setNewRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employee">Employee</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Secure password" type="text" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleAddEmployee}>Save Employee</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No.</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Loading...</div>
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">No employees found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((employee, index) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>{employee.department || '-'}</TableCell>
                                    <TableCell className="capitalize">{employee.role}</TableCell>
                                    <TableCell>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {employee.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></Button> */}
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(employee.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
