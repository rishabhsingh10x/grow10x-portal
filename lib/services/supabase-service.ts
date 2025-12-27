import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types/user'
import { AttendanceRecord } from '@/lib/types/attendance'
import { LeaveRequest } from '@/lib/types/leave'
import { PerformanceRecord } from '@/lib/types/performance'
import { SystemSettings, DEFAULT_SETTINGS } from '@/lib/types/settings'
import { Holiday } from '@/lib/types/holiday'

export type { User, AttendanceRecord, LeaveRequest, PerformanceRecord, Holiday, SystemSettings }

const STORAGE_KEYS = {
    CURRENT_USER: 'app_current_user'
}

export const supabaseService = {
    // --- AUTH ---
    login: async (email: string, password: string): Promise<User | null> => {
        const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError || !authUser) {
            console.error('Login error:', authError)
            return null
        }

        // Fetch additional profile data
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError)
            return null
        }

        const user: User = {
            id: authUser.id,
            email: authUser.email!,
            name: profile.name,
            role: profile.role,
            department: profile.department,
            phone: profile.phone,
            status: profile.status,
            employeeId: profile.employee_id,
            avatarUrl: profile.avatar_url,
            joiningDate: profile.joining_date,
            workType: profile.work_type,
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
        return user
    },

    logout: async () => {
        await supabase.auth.signOut()
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
        return stored ? JSON.parse(stored) : null
    },

    // --- EMPLOYEES ---
    getEmployees: async (): Promise<User[]> => {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name')

        if (error) {
            console.error('Error fetching employees:', error)
            return []
        }

        return profiles.map(p => ({
            id: p.id,
            email: p.email,
            name: p.name,
            role: p.role,
            department: p.department,
            phone: p.phone,
            status: p.status,
            employeeId: p.employee_id,
            avatarUrl: p.avatar_url,
            joiningDate: p.joining_date,
            workType: p.work_type,
        }))
    },

    addEmployee: async (employee: Omit<User, 'id'>, password: string): Promise<boolean> => {
        // 1. Create auth user (Note: This normally requires service role or public sign up)
        // For simplicity in this demo, we'll try to use signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: employee.email,
            password: password,
            options: {
                data: {
                    name: employee.name,
                }
            }
        })

        if (authError || !authData.user) {
            console.error('Error creating auth user:', authError)
            return false
        }

        // 2. Profile creation: Use upsert to avoid conflicts with database triggers
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: employee.email.toLowerCase(),
                name: employee.name,
                role: employee.role,
                department: employee.department,
                phone: employee.phone,
                status: employee.status,
                employee_id: employee.employeeId,
                joining_date: employee.joiningDate,
                work_type: employee.workType,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('Error in profile upsert:', profileError)
            return false
        }

        return true
    },

    deleteEmployee: async (userId: string): Promise<boolean> => {
        // Due to RLS and Auth settings, deleting other users usually requires Admin API
        // For now, let's just delete the profile record
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId)

        return !error
    },

    updateEmployee: async (user: User): Promise<boolean> => {
        const { error } = await supabase
            .from('profiles')
            .update({
                name: user.name,
                department: user.department,
                phone: user.phone,
                status: user.status,
                avatar_url: user.avatarUrl,
                work_type: user.workType,
            })
            .eq('id', user.id)

        if (!error) {
            // If updating current user, update local storage
            const currentUser = supabaseService.getCurrentUser()
            if (currentUser && currentUser.id === user.id) {
                const updatedSessionUser = { ...currentUser, ...user }
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedSessionUser))
            }
        }

        return !error
    },

    // --- ATTENDANCE ---
    getAttendance: async (employeeId?: string): Promise<AttendanceRecord[]> => {
        let query = supabase.from('attendance').select('*')
        if (employeeId) query = query.eq('user_id', employeeId)

        const { data, error } = await query.order('date', { ascending: false })
        if (error) return []

        return data.map(r => ({
            id: r.id,
            employeeId: r.user_id,
            employeeName: '', // Frontend should handle name lookup or we join
            date: r.date,
            checkInTime: r.check_in_time,
            checkOutTime: r.check_out_time,
            totalHours: r.total_hours,
            status: r.status as any
        }))
    },

    getTodayAttendance: async (employeeId: string): Promise<AttendanceRecord | null> => {
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', employeeId)
            .eq('date', today)
            .maybeSingle()

        if (error || !data) return null
        return {
            id: data.id,
            employeeId: data.user_id,
            employeeName: '',
            date: data.date,
            checkInTime: data.check_in_time,
            checkOutTime: data.check_out_time,
            totalHours: data.total_hours,
            status: data.status as any
        }
    },

    getActiveSession: async (employeeId: string): Promise<AttendanceRecord | null> => {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', employeeId)
            .is('check_out_time', null)
            .maybeSingle()

        if (error || !data) return null
        return {
            id: data.id,
            employeeId: data.user_id,
            employeeName: '',
            date: data.date,
            checkInTime: data.check_in_time,
            checkOutTime: data.check_out_time,
            totalHours: data.total_hours,
            status: data.status as any
        }
    },

    clockIn: async (employeeId: string): Promise<boolean> => {
        const today = new Date().toISOString().split('T')[0]
        const now = new Date()
        const time = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })

        const { error } = await supabase.from('attendance').insert({
            user_id: employeeId,
            date: today,
            check_in_time: time,
            check_in_timestamp: now.toISOString(),
            status: 'Present' // Simplification: system settings logic can be added later
        })

        return !error
    },

    clockOut: async (attendanceId: string): Promise<boolean> => {
        const now = new Date()
        const time = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })

        // Fetch check-in to calc hours
        const { data: record } = await supabase.from('attendance').select('check_in_timestamp').eq('id', attendanceId).single()
        let hours = 0
        if (record?.check_in_timestamp) {
            const start = new Date(record.check_in_timestamp)
            hours = Number(((now.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2))
        }

        const { error } = await supabase.from('attendance').update({
            check_out_time: time,
            check_out_timestamp: now.toISOString(),
            total_hours: hours,
        }).eq('id', attendanceId)

        return !error
    },

    // --- LEAVES ---
    getLeaves: async (employeeId?: string): Promise<LeaveRequest[]> => {
        let query = supabase.from('leaves').select('*, profiles(name)')
        if (employeeId) query = query.eq('user_id', employeeId)

        const { data, error } = await query.order('applied_on', { ascending: false })
        if (error) return []

        return data.map(l => ({
            id: l.id,
            employeeId: l.user_id,
            employeeName: (l.profiles as any)?.name || 'Unknown',
            type: l.type as any,
            fromDate: l.from_date,
            toDate: l.to_date,
            reason: l.reason,
            status: l.status as any,
            appliedOn: l.applied_on,
            managerRemarks: l.manager_remarks
        }))
    },

    requestLeave: async (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>): Promise<boolean> => {
        const { error } = await supabase.from('leaves').insert({
            user_id: leave.employeeId,
            type: leave.type,
            from_date: leave.fromDate,
            to_date: leave.toDate,
            reason: leave.reason,
            status: 'Pending',
            applied_on: new Date().toISOString()
        })
        return !error
    },

    updateLeaveStatus: async (id: string, status: string, remarks?: string): Promise<boolean> => {
        const { error } = await supabase.from('leaves').update({
            status,
            manager_remarks: remarks
        }).eq('id', id)
        return !error
    },

    // --- SETTINGS ---
    getSettings: async (): Promise<SystemSettings> => {
        const { data, error } = await supabase.from('system_settings').select('*').single()
        if (error || !data) return DEFAULT_SETTINGS

        return {
            officeStartTime: data.officeStartTime,
            officeEndTime: data.officeEndTime,
            graceTimeMinutes: data.graceTimeMinutes,
            halfDayThresholdHours: data.halfDayThresholdHours,
            fullDayHours: data.fullDayHours
        }
    },

    updateSettings: async (settings: SystemSettings): Promise<boolean> => {
        const { error } = await supabase.from('system_settings').upsert({
            id: 1, // Global settings
            ...settings
        })
        return !error
    }
}

