export interface ShiftConfig {
    id: string;
    name: string; // "Day Shift", "Night Shift"
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isNightShift: boolean;
    graceTimeMinutes: number;
    halfDayThresholdHours: number;
    fullDayHours: number;
}

export const DEFAULT_DAY_SHIFT: ShiftConfig = {
    id: 'day-1',
    name: 'General Day',
    startTime: '09:30',
    endTime: '18:30',
    isNightShift: false,
    graceTimeMinutes: 15,
    halfDayThresholdHours: 4,
    fullDayHours: 8 // 9 hours usually with break, but counting 8 productive
};

export const DEFAULT_NIGHT_SHIFT: ShiftConfig = {
    id: 'night-1',
    name: 'US Shift',
    startTime: '21:00', // 9 PM
    endTime: '06:00', // 6 AM
    isNightShift: true,
    graceTimeMinutes: 30, // More grace for night shift maybe?
    halfDayThresholdHours: 4,
    fullDayHours: 8
};
