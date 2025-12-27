import { PerformanceRecord } from "@/lib/types/performance";
import { AttendanceRecord, AttendanceStatus } from "@/lib/types/attendance";
import { LeaveRequest, LeaveStatus } from "@/lib/types/leave";
import { Holiday } from "@/lib/types/holiday";
import { SystemSettings, DEFAULT_SETTINGS } from "@/lib/types/settings";
import { User } from "@/lib/types/user";

export type { User };

// Initial Data
const INITIAL_USERS: User[] = [
    // { id: 'admin1', employeeId: 'ADM001', name: 'System Admin', email: 'admin@company.com', role: 'admin', department: 'IT', status: 'Active', password: 'admin', workType: 'Full-time', joiningDate: '2023-01-01' },
];

const INITIAL_PERFORMANCE: PerformanceRecord[] = [];

// LocalStorage Keys
const STORAGE_KEYS = {
    USERS: 'app_users',
    PERFORMANCE: 'app_performance',
    ATTENDANCE: 'app_attendance',
    LEAVES: 'app_leaves',
    HOLIDAYS: 'app_holidays',
    SETTINGS: 'app_settings',
    CURRENT_USER: 'app_current_user'
};

const INITIAL_LEAVES: LeaveRequest[] = [];

// Helper: Simulate delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storage = {
    // --- USERS ---
    getUsers: (): User[] => {
        if (typeof window === 'undefined') return INITIAL_USERS;
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);

        let users: User[] = [];
        if (stored) {
            try {
                users = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse users", e);
            }
        }

        // Failsafe: If no users found, or Admin is missing (lockout prevention), restore defaults
        const adminExists = users.some(u => u.email === 'admin@company.com');
        if (users.length === 0 || !adminExists) {
            // Merge defaults with existing (if any) to avoid deleting real data, but ensure Admin exists
            // Actually, if it's corrupted, better to just restore INITIAL.
            // But let's check: if we have some users but no admin?
            if (users.length > 0 && !adminExists) {
                // Add default admin back
                users = [...users, INITIAL_USERS[0]];
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                return users;
            }

            // If empty, restore all defaults
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }

        return users;
    },

    addUser: (user: User) => {
        const users = storage.getUsers();
        const newUsers = [...users, { ...user, id: Math.random().toString(36).substr(2, 9) }];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
        return newUsers;
    },

    updateUser: (updatedUser: User) => {
        const users = storage.getUsers();
        const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
        return newUsers;
    },

    deleteUser: (userId: string) => {
        const users = storage.getUsers();
        const newUsers = users.filter(u => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
        return newUsers;
    },

    // --- AUTH ---
    login: async (email: string, password: string): Promise<User | null> => {
        await delay(500);
        const users = storage.getUsers();
        // Normalized comparison
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || u.password?.trim() === password));
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
        return null;
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return stored ? JSON.parse(stored) : null;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    // --- PERFORMANCE ---
    getPerformanceRecords: (): PerformanceRecord[] => {
        if (typeof window === 'undefined') return INITIAL_PERFORMANCE;
        const stored = localStorage.getItem(STORAGE_KEYS.PERFORMANCE);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(INITIAL_PERFORMANCE));
            return INITIAL_PERFORMANCE;
        }
        return JSON.parse(stored);
    },

    getEmployeePerformance: (employeeId: string): PerformanceRecord[] => {
        const records = storage.getPerformanceRecords();
        return records.filter(r => r.employeeId === employeeId);
    },

    getTodayRecord: (employeeId: string): PerformanceRecord | undefined => {
        const records = storage.getPerformanceRecords();
        const today = new Date().toISOString().split('T')[0];
        return records.find(r => r.employeeId === employeeId && r.date === today);
    },

    assignLeads: async (employeeId: string, employeeName: string, leads: number, remarks?: string, date?: string, country?: string) => {
        await delay(300);
        const records = storage.getPerformanceRecords();
        const targetDate = date || new Date().toISOString().split('T')[0];

        const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === targetDate);

        let newRecords;
        if (existingIndex >= 0) {
            // Update existing
            const record = records[existingIndex];
            const updated = {
                ...record,
                leadsAssigned: record.leadsAssigned + Number(leads),
                remarks: remarks || record.remarks,
                country: country || record.country, // Update country if provided
                updatedAt: new Date().toISOString()
            };
            newRecords = [...records];
            newRecords[existingIndex] = updated;
        } else {
            // Create new
            const newRecord: PerformanceRecord = {
                id: Math.random().toString(36).substr(2, 9),
                employeeId,
                employeeName,
                date: targetDate, // Use target date
                leadsAssigned: Number(leads),
                prospectsContacted: 0,
                conversions: 0,
                remarks: remarks || '',
                country: country || 'USA', // Default to USA if not specified
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            newRecords = [...records, newRecord];
        }

        localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(newRecords));
        return newRecords;
    },

    updateDailyProgress: async (recordId: string, contacted: number, conversions: number, remarks: string) => {
        await delay(300);
        const records = storage.getPerformanceRecords();

        const record = records.find(r => r.id === recordId);
        if (!record) throw new Error("Record not found");

        // Validation Rules
        if (contacted > record.leadsAssigned) throw new Error("Prospects contacted cannot exceed assigned leads.");
        if (conversions > contacted) throw new Error("Conversions cannot exceed prospects contacted.");
        if (contacted < 0 || conversions < 0) throw new Error("Values cannot be negative.");

        const newRecords = records.map(r => {
            if (r.id === recordId) {
                return {
                    ...r,
                    prospectsContacted: contacted,
                    conversions,
                    remarks,
                    updatedAt: new Date().toISOString()
                };
            }
            return r;
        });
        localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(newRecords));
        return newRecords;
    },

    updatePerformanceRecord: async (record: PerformanceRecord) => {
        await delay(300);
        const records = storage.getPerformanceRecords();
        const newRecords = records.map(r => r.id === record.id ? { ...record, updatedAt: new Date().toISOString() } : r);
        localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(newRecords));
        return newRecords;
    },

    deletePerformanceRecord: (id: string) => {
        const records = storage.getPerformanceRecords();
        const newRecords = records.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(newRecords));
        return newRecords;
    },

    // --- ATTENDANCE ---
    getAttendanceRecords: (): AttendanceRecord[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
        return stored ? JSON.parse(stored) : [];
    },
    getEmployeeAttendance: (employeeId: string): AttendanceRecord[] => {
        const records = storage.getAttendanceRecords();
        return records.filter(r => r.employeeId === employeeId);
    },

    // Get today's attendance record for an employee
    getTodayAttendance: (employeeId: string): AttendanceRecord | undefined => {
        const records = storage.getAttendanceRecords();
        const today = new Date().toISOString().split('T')[0];
        return records.find(r => r.employeeId === employeeId && r.date === today);
    },

    // Find active session (checked in but not checked out)
    getActiveSession: (employeeId: string): AttendanceRecord | undefined => {
        const records = storage.getAttendanceRecords();
        return records.find(r => r.employeeId === employeeId && !r.checkOutTime);
    },

    clockIn: async (employeeId: string, employeeName: string) => {
        await delay(500);
        const records = storage.getAttendanceRecords();
        const user = storage.getUsers().find(u => u.id === employeeId);
        if (!user) throw new Error("User not found");

        const now = new Date();
        const currentTimeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }); // HH:mm 24h

        // --- SHIFT LOGIC ---
        // Determine Shift Config (Fallback to default if not set)
        // In a real app, we'd fetch the full Shift object. For now we use the values on User or Defaults.
        // Let's assume user.shift represents the assigned configuration
        // We will default to Day Shift if no specific shift data
        const settings = storage.getSettings();
        const shiftStart = user.shiftStartTime || settings.officeStartTime;
        const shiftEnd = user.shiftEndTime || settings.officeEndTime;

        // Simple Night Shift Detection: Start > End (e.g. 21:00 > 06:00)
        // Or explicit flag if we added it to User. Let's infer for now to keep User model simple or use the new fields.
        const [sHour] = shiftStart.split(':').map(Number);
        const [eHour] = shiftEnd.split(':').map(Number);
        const isNightShift = sHour > eHour;

        // --- ATTENDANCE DATE CALCULATION ---
        // Critical for Night Shifts: If isNightShift and now is 01:00, Date = Yesterday
        let attendanceDate = now.toISOString().split('T')[0]; // Default to today

        if (isNightShift) {
            const currentHour = now.getHours();
            // If we are in the "morning" part of the night shift (e.g. 00:00 to 06:00 + buffer)
            // If now < 12:00 (Noon), and shift started yesterday evening, it belongs to yesterday.
            // Adjust threshold as needed.

            if (currentHour < 12) { // Assuming shifts don't start before noon and end after midnight
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                attendanceDate = yesterday.toISOString().split('T')[0];
            }
        }

        // 1. Check for Active Session
        // We shouldn't have multiple active sessions.
        const activeSession = storage.getActiveSession(employeeId);
        if (activeSession) return activeSession;

        // 2. Check existence for this specific Attendance Date
        // If we already have a record for 'yesterday' (attendanceDate), we cannot check in again?
        // Rules say: "Employee can check in only once per shift".
        // If they checked out, they are done.
        const existing = records.find(r => r.employeeId === employeeId && r.date === attendanceDate);
        if (existing) throw new Error("Attendance record already exists for this shift date.");

        // 3. Check for Leaves for ATTENDANCE DATE
        const leaves = storage.getLeaveRequests();
        const approvedLeave = leaves.find(l =>
            l.employeeId === employeeId &&
            l.status === 'Approved' &&
            attendanceDate >= l.fromDate &&
            attendanceDate <= l.toDate
        );
        if (approvedLeave) throw new Error("Cannot check in: You are on approved leave for this date.");

        // 4. Check for Holidays for ATTENDANCE DATE
        const holidays = storage.getHolidays();
        const holiday = holidays.find(h => h.date === attendanceDate);
        if (holiday) throw new Error(`Cannot check in: ${attendanceDate} is ${holiday.name}.`);

        // 5. Calculate STATUS (Late vs Present)
        // Comparison must be against the Shift Start Timestamp derived from Attendance Date
        const shiftStartDateTime = new Date(attendanceDate + 'T' + shiftStart + ':00');

        // Add Grace Period
        shiftStartDateTime.setMinutes(shiftStartDateTime.getMinutes() + settings.graceTimeMinutes);

        let initialStatus: AttendanceStatus = 'Present';
        if (now > shiftStartDateTime) {
            initialStatus = 'Late';
        }

        const displayTime = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

        const newRecord: AttendanceRecord = {
            id: Math.random().toString(36).substr(2, 9),
            employeeId,
            employeeName,
            date: attendanceDate, // The Logical Date
            checkInTime: displayTime,
            checkInTimestamp: now.toISOString(),
            totalHours: 0,
            status: initialStatus
        };

        const newRecords = [...records, newRecord];
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(newRecords));
        return newRecord;
    },

    clockOut: async (employeeId: string) => {
        await delay(500);
        const records = storage.getAttendanceRecords();

        const recordIndex = records.findIndex(r => r.employeeId === employeeId && !r.checkOutTime);
        if (recordIndex === -1) throw new Error("No active session found");

        const record = records[recordIndex];
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

        // Calculate total hours
        let hours = 0;
        if (record.checkInTimestamp) {
            const start = new Date(record.checkInTimestamp);
            const end = now;
            const diff = end.getTime() - start.getTime();
            hours = Number((diff / (1000 * 60 * 60)).toFixed(2));
        }

        // 5. Finalize STATUS based on Hours
        const settings = storage.getSettings();
        let finalStatus = record.status;

        // If hours < Half Day Threshold -> Half Day (or Absent? logic says Half Day if threshold met)
        // Interpret requirement: "If fewer hours than required but meets half-day, status is Half Day"
        // Implicitly if < HalfDay, it might arguably be 'Absent' or short attendance, but let's stick to 'Half Day' or 'Present'
        // If originally 'Late', it stays 'Late' unless half-day overrides? 
        // User Requirement: "If employee completes required working hours -> Present. If < required but > half-day -> Half Day."

        // Assume 'Required' is ~8-9 hours? Let's use 8 as standard full day for calculation if not defined
        const fullDayHours = settings.fullDayHours;

        if (hours < settings.halfDayThresholdHours) {
            finalStatus = 'Absent'; // Or "Short Attendance" - let's flag as Absent if crazy short?
            // Actually requirement says "If no attendance record... Absent". 
            // If they clocked in but left immediately, it's probably effectively absent or "Half Day"?
            // Let's call it 'Half Day' if it's at least > 1 hr, else maybe leave it.
            // Requirement logic: "If works fewer hours than required but meets half-day threshold -> Half Day"
            // So if hours < HalfDayThreshold, we don't have a label. Let's leave it as is (Present/Late) or change to 'Half Day' as "Short"? 
            // Let's implement specifically:
            // if hours >= fullDayHours -> Present (Overriding 'Late'?) Usually Late is Late.
            // Let's keep 'Late' if they were late.
        } else if (hours >= settings.halfDayThresholdHours && hours < fullDayHours) {
            finalStatus = 'Half Day';
        }

        // Update record
        const updatedRecord = {
            ...record,
            checkOutTime: timeString,
            checkOutTimestamp: now.toISOString(),
            totalHours: hours,
            status: finalStatus
        };

        const newRecords = [...records];
        newRecords[recordIndex] = updatedRecord;

        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(newRecords));
        return updatedRecord;
    },

    addAttendanceRecord: async (record: AttendanceRecord) => {
        await delay(500);
        const records = storage.getAttendanceRecords();

        // Remove existing record for same employee and date if exists
        const filteredRecords = records.filter(r => !(r.employeeId === record.employeeId && r.date === record.date));

        const newRecords = [...filteredRecords, record];
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(newRecords));
        return newRecords;
    },

    deleteAttendanceRecord: (id: string) => {
        const records = storage.getAttendanceRecords();
        const newRecords = records.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(newRecords));
        return newRecords;
    },



    // --- LEAVES ---
    getLeaveRequests: (): LeaveRequest[] => {
        if (typeof window === 'undefined') return INITIAL_LEAVES;
        const stored = localStorage.getItem(STORAGE_KEYS.LEAVES);
        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES));
            return INITIAL_LEAVES;
        }
        return JSON.parse(stored);
    },

    addLeaveRequest: async (request: LeaveRequest) => {
        await delay(500);
        const leaves = storage.getLeaveRequests();
        const newLeaves = [...leaves, request];
        localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(newLeaves));
        return newLeaves;
    },

    updateLeaveStatus: async (id: string, status: LeaveStatus, remarks?: string) => {
        await delay(300);
        const leaves = storage.getLeaveRequests();
        const newLeaves = leaves.map(l => l.id === id ? { ...l, status, managerRemarks: remarks || l.managerRemarks } : l);
        localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(newLeaves));
        return newLeaves;
    },

    deleteLeaveRequest: async (id: string) => {
        await delay(300);
        const leaves = storage.getLeaveRequests();
        const newLeaves = leaves.filter(l => l.id !== id);
        localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(newLeaves));
        return newLeaves;
    },

    getEmployeeLeaveBalances: (employeeId: string) => {
        // Mock Balances - In real app, this would come from a dedicated table
        const defaultBalances = {
            'Casual Leave': 12,
            'Sick Leave': 10,
            'Paid Leave': 15,
            'Unpaid Leave': 999
        };

        const leaves = storage.getLeaveRequests().filter(l => l.employeeId === employeeId && l.status === 'Approved');

        const used = {
            'Casual Leave': 0,
            'Sick Leave': 0,
            'Paid Leave': 0,
            'Unpaid Leave': 0
        };

        leaves.forEach(l => {
            // fast calculation of days
            const start = new Date(l.fromDate);
            const end = new Date(l.toDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (used[l.type] !== undefined) {
                used[l.type] += diffDays;
            }
        });

        return {
            available: {
                'Casual Leave': defaultBalances['Casual Leave'] - used['Casual Leave'],
                'Sick Leave': defaultBalances['Sick Leave'] - used['Sick Leave'],
                'Paid Leave': defaultBalances['Paid Leave'] - used['Paid Leave'],
                'Unpaid Leave': 999
            },
            used
        };
    },

    // --- HOLIDAYS ---
    getHolidays: (): Holiday[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
        return stored ? JSON.parse(stored) : [];
    },

    addHoliday: async (holiday: Holiday) => {
        await delay(300);
        const holidays = storage.getHolidays();
        const newHolidays = [...holidays, holiday];
        localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(newHolidays));
        return newHolidays;
    },

    deleteHoliday: (id: string) => {
        const holidays = storage.getHolidays();
        const newHolidays = holidays.filter(h => h.id !== id);
        localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(newHolidays));
        return newHolidays;
    },

    // --- SETTINGS ---
    getSettings: (): SystemSettings => {
        if (typeof window === 'undefined') return DEFAULT_SETTINGS;
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    },

    updateSettings: (settings: SystemSettings) => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return settings;
    }

};
