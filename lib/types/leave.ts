export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Unpaid Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: LeaveType;
    fromDate: string;
    toDate: string;
    reason: string;
    status: LeaveStatus;
    appliedOn: string;
    managerRemarks?: string;
}
