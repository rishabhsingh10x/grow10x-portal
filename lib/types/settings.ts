export interface SystemSettings {
    officeStartTime: string; // HH:mm e.g. "09:30"
    officeEndTime: string; // HH:mm e.g. "18:30"
    graceTimeMinutes: number; // e.g. 15
    halfDayThresholdHours: number; // e.g. 4
    fullDayHours: number; // e.g. 8
}

export const DEFAULT_SETTINGS: SystemSettings = {
    officeStartTime: "09:30",
    officeEndTime: "18:30",
    graceTimeMinutes: 15,
    halfDayThresholdHours: 4,
    fullDayHours: 8
};
