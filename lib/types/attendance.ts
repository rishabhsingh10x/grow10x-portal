export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string; // YYYY-MM-DD
    checkInTime?: string; // Display string HH:mm AM/PM
    checkOutTime?: string; // Display string HH:mm AM/PM
    checkInTimestamp?: string; // ISO String for calculation
    checkOutTimestamp?: string; // ISO String for calculation
    totalHours: number;
    status: AttendanceStatus;
}
