export interface PerformanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    leadsAssigned: number;
    prospectsContacted: number;
    conversions: number;
    remarks?: string;
    country?: string; // New field
    createdAt?: string;
    updatedAt?: string;
}
