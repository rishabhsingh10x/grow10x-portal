export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    department: string;
    phone?: string;
    status: 'Active' | 'Inactive';
    password?: string; // For mock auth
    employeeId?: string;
    joiningDate?: string;
    workType?: 'Full-time' | 'Part-time' | 'Intern';
    shiftStartTime?: string; // HH:mm
    shiftEndTime?: string; // HH:mm
    avatarUrl?: string;
}
