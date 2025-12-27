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

export const mockPerformanceData: PerformanceRecord[] = [
    {
        id: "1",
        employeeId: "emp1",
        employeeName: "Alice Johnson",
        date: new Date().toISOString().split('T')[0],
        leadsAssigned: 20,
        prospectsContacted: 15,
        conversions: 2,
        remarks: "Good progress",
    },
    {
        id: "2",
        employeeId: "emp2",
        employeeName: "Bob Smith",
        date: new Date().toISOString().split('T')[0],
        leadsAssigned: 25,
        prospectsContacted: 10,
        conversions: 1,
        remarks: "Needs to follow up more",
    },
    // Add more mock data as needed
];
