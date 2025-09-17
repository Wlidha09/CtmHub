

"use server";

import { syncHolidays as syncHolidaysFlow } from "@/ai/flows/sync-holidays-flow";
import { summarizeCv } from "@/ai/flows/summarize-cv-flow";
import { z } from "zod";
import { db } from '@/lib/firebase/config';
import { collection, writeBatch, doc, setDoc, deleteDoc, getDocs, where, query } from 'firebase/firestore';
import { initialRoles as roles } from '@/lib/data';
import type { Employee, Department, LeaveRequest, Ticket, Holiday, AppSettings, Candidate } from "@/lib/types";
import { addLeaveRequest as addLeaveRequestFB, updateLeaveRequestStatus as updateStatus } from "./firebase/leave-requests";
import { getEmployees, getEmployee } from "./firebase/employees";
import { getHolidaysByYear, addHoliday as addHolidayFB, updateHoliday as updateHolidayFB } from "./firebase/holidays";
import { saveAvailability } from "./firebase/availability";
import { updateSettings as updateSettingsFB } from "./firebase/settings";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  differenceInDays,
  max,
  min,
  format,
  parseISO,
} from 'date-fns';
import pdf from 'pdf-parse';

export async function summarizeCvAction(file: File) {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdf(buffer);

        const cvDataUri = `data:application/pdf;base64,${buffer.toString('base64')}`;
        
        const result = await summarizeCv({ cvDataUri });

        return { success: true, data: result };

    } catch (error) {
        console.error('Error summarizing CV:', error);
        return { success: false, message: 'Failed to process the CV with AI.' };
    }
}


export async function saveWeeklyAvailability(userId: string, weekStartDate: string, selectedDays: string[]) {
    try {
        await saveAvailability(userId, weekStartDate, selectedDays);
        return { success: true, message: "Availability saved successfully." };
    } catch (error) {
        console.error("Error saving availability:", error);
        return { success: false, message: "Failed to save availability." };
    }
}

type WorkTicketResult = {
    success: boolean;
    message?: string;
    data?: Ticket | null;
}

export async function generateWorkTicket(employeeId: string, month: Date): Promise<WorkTicketResult> {
    if (!employeeId || !month) {
        return { success: false, message: "Employee and month are required." };
    }

    try {
        const employee = await getEmployee(employeeId);
        if (!employee) {
            return { success: false, message: "Employee not found." };
        }
        
        const year = month.getFullYear();
        const holidaysForYear = await getHolidaysByYear(year.toString());
        const paidHolidayDates = new Set(holidaysForYear.filter(h => h.isPaid).map(h => h.date));

        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const interval = { start, end };

        const allDaysInMonth = eachDayOfInterval(interval);
        
        const totalDays = allDaysInMonth.length;
        const weekendDays = allDaysInMonth.filter(isWeekend).length;

        const publicHolidays = allDaysInMonth.filter(day => 
            !isWeekend(day) && paidHolidayDates.has(format(day, 'yyyy-MM-dd'))
        ).length;
        
        const workableDays = totalDays - weekendDays - publicHolidays;

        const q = query(
            collection(db, 'leaveRequests'),
            where('userId', '==', employeeId),
            where('status', '==', 'Approved')
        );
        const leaveSnapshot = await getDocs(q);
        const leaveRequests = leaveSnapshot.docs
            .map(doc => doc.data() as LeaveRequest)
            .filter(req => {
                const leaveStart = parseISO(req.startDate);
                const leaveEnd = parseISO(req.endDate);
                return leaveEnd >= start && leaveStart <= end;
            });


        let leaveDaysTaken = 0;
        const leaveDetails: Ticket['calculation']['leaveDetails'] = [];

        for (const req of leaveRequests) {
            const leaveStart = parseISO(req.startDate);
            const leaveEnd = parseISO(req.endDate);

            const effectiveStart = max([start, leaveStart]);
            const effectiveEnd = min([end, leaveEnd]);
            
            if (effectiveStart <= effectiveEnd) {
                const leaveInterval = { start: effectiveStart, end: effectiveEnd };
                const daysOfLeave = eachDayOfInterval(leaveInterval);

                let actualLeaveDaysInPeriod = 0;
                for (const day of daysOfLeave) {
                    const isWeekendDay = isWeekend(day);
                    const isPublicHoliday = paidHolidayDates.has(format(day, 'yyyy-MM-dd'));

                    // Only count the day if it's not a weekend and not a public holiday
                    if (!isWeekendDay && !isPublicHoliday) {
                        actualLeaveDaysInPeriod++;
                    }
                }
                
                if (actualLeaveDaysInPeriod > 0) {
                    leaveDaysTaken += actualLeaveDaysInPeriod;
                    leaveDetails.push({
                        type: req.leaveType,
                        days: actualLeaveDaysInPeriod,
                        startDate: format(effectiveStart, 'MMM d'),
                        endDate: format(effectiveEnd, 'MMM d'),
                    });
                }
            }
        }
        
        const netWorkedDays = workableDays - leaveDaysTaken;

        const ticket: Ticket = {
            id: doc(collection(db, 'tickets')).id,
            employee,
            month: format(month, 'MMMM yyyy'),
            calculation: {
                totalDays,
                weekendDays,
                publicHolidays,
                workableDays,
                leaveDaysTaken,
                netWorkedDays,
                leaveDetails
            },
        };

        return { success: true, data: ticket };

    } catch (error) {
        console.error("Error generating work ticket:", error);
        return { success: false, message: "An internal error occurred." };
    }
}


async function ensureCollection(collectionName: string) {
    const placeholderRef = doc(db, collectionName, '_placeholder');
    try {
        await setDoc(placeholderRef, { createdAt: new Date() });
        await deleteDoc(placeholderRef);
    } catch (error) {
        // This can fail if the collection already exists, which is fine.
        // We just want to ensure it's there.
    }
}

// Helper functions to generate random data
const firstNames = ["Olivia", "Benjamin", "Sophia", "Liam", "Ava", "Noah", "Isabella", "Mason", "Harper", "Ethan", "Emma", "James"];
const lastNames = ["Martinez", "Carter", "Nguyen", "Rodriguez", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Smith"];
const deptNames = ["Engineering", "Human Resources", "Design", "Sales", "Marketing", "Product", "Support", "Finance"];
const rolesList: Employee['role'][] = ['Employee', 'Manager', 'RH'];
const leaveTypes: LeaveRequest['leaveType'][] = ['Vacation', 'Sick Leave', 'Personal Day', 'Unpaid Leave', 'Day off'];
const statuses: Employee['status'][] = ['active', 'inactive'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;


export async function seedDatabase() {
  try {
    const collectionsToEnsure = ['employees', 'departments', 'roles', 'leaveRequests', 'candidates', 'availability', 'settings'];
    for (const collectionName of collectionsToEnsure) {
        await ensureCollection(collectionName);
    }
    
    const batch = writeBatch(db);

    // --- Generate and Add New Random Data ---
    const numDepartments = 4; // Create 4 new departments each time

    for (let i = 0; i < numDepartments; i++) {
        const newDeptId = doc(collection(db, 'departments')).id;
        const newDeptName = `${getRandomElement(deptNames)} #${getRandomInt(1, 100)}`;
        const newDepartment: Omit<Department, 'leadId'> = {
            id: newDeptId,
            name: newDeptName,
        };

        const numEmployees = getRandomInt(3, 6); // Create between 3 and 6 employees
        const newEmployees: Employee[] = [];
        for (let j = 0; j < numEmployees; j++) {
            const newEmployeeId = doc(collection(db, 'employees')).id;
            const firstName = getRandomElement(firstNames);
            const lastName = getRandomElement(lastNames);
            const newEmployee: Employee = {
                id: newEmployeeId,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@loophub.com`,
                avatarUrl: `https://picsum.photos/seed/${newEmployeeId}/100/100`,
                role: getRandomElement(rolesList),
                departmentId: newDeptId,
                status: getRandomElement(statuses),
                startDate: new Date(new Date().setFullYear(new Date().getFullYear() - getRandomInt(0, 5))).toISOString(),
                birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - getRandomInt(20, 60))).toISOString(),
                leaveBalance: getRandomInt(0, 21),
            };
            newEmployees.push(newEmployee);
        }

        // Assign a lead to the new department from the new employees
        const lead = newEmployees[0];
        const finalNewDepartment: Department = {
          ...newDepartment,
          leadId: lead.id,
        };
        
        // Add new department and employees to the batch
        const deptDocRef = doc(db, 'departments', newDeptId);
        batch.set(deptDocRef, finalNewDepartment);

        newEmployees.forEach(employee => {
          const empDocRef = doc(db, 'employees', employee.id);
          batch.set(empDocRef, employee);
        });
        
        // Create some leave requests for the new employees
        const numLeaveRequests = getRandomInt(1, 3);
        for (let k = 0; k < numLeaveRequests; k++) {
            const employee = getRandomElement(newEmployees);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + getRandomInt(5, 30));
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + getRandomInt(1, 5));

            await addLeaveRequestFB({
                userId: employee.id,
                leaveType: getRandomElement(leaveTypes),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });
        }
    }

    // Seed Roles (static, ensures they are always present)
    roles.forEach(role => {
      const docRef = doc(db, 'roles', role.name);
      batch.set(docRef, role);
    });

    await batch.commit();

    // --- Update all existing employees with a random status and leave balance ---
    const updateBatch = writeBatch(db);
    const allEmployees = await getEmployees();
    allEmployees.forEach(employee => {
        const empRef = doc(db, "employees", employee.id);
        const randomStatus = getRandomElement(statuses);
        const randomLeaveBalance = getRandomInt(0, 21);
        updateBatch.update(empRef, { status: randomStatus, leaveBalance: randomLeaveBalance });
    });
    await updateBatch.commit();
    
    return { success: true, message: 'New random data added and existing employees updated!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database.' };
  }
}

export async function updateLeaveRequestStatus(id: string, status: LeaveRequest['status']) {
    try {
        await updateStatus(id, status);
        return { success: true, message: `Request status updated to ${status}.` };
    } catch (error) {
        console.error('Error updating leave request status:', error);
        return { success: false, message: 'Failed to update leave request status.' };
    }
}

export async function syncHolidays(year: number) {
    try {
        const result = await syncHolidaysFlow({ year });
        if (!result.holidays) {
            return { success: false, message: "AI failed to generate holidays." };
        }

        const existingHolidays = await getHolidaysByYear(year.toString());
        const existingHolidayDates = new Set(existingHolidays.map(h => h.date));
        
        const batch = writeBatch(db);
        let newHolidaysCount = 0;

        for (const holiday of result.holidays) {
            if (!existingHolidayDates.has(holiday.date)) {
                const newHolidayRef = doc(collection(db, 'holidays'));
                const newHoliday: Holiday = {
                    id: newHolidayRef.id,
                    name: holiday.name,
                    date: holiday.date,
                    isPaid: true, 
                };
                batch.set(newHolidayRef, newHoliday);
                newHolidaysCount++;
            }
        }

        if (newHolidaysCount > 0) {
            await batch.commit();
            return { success: true, message: `${newHolidaysCount} new holidays synced successfully.` };
        } else {
            return { success: true, message: "Holiday list is already up to date." };
        }

    } catch (error) {
        console.error('Error syncing holidays:', error);
        return { success: false, message: 'An internal error occurred during holiday sync.' };
    }
}

const holidaySchema = z.object({
  name: z.string().min(3, "Holiday name must be at least 3 characters."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
});

type AddHolidayResult = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

export async function addHoliday(formData: FormData): Promise<AddHolidayResult> {
    const validatedFields = holidaySchema.safeParse({
        name: formData.get("name"),
        date: formData.get("date"),
    });

    if (!validatedFields.success) {
        return { 
            success: false, 
            message: "Invalid input.", 
            errors: validatedFields.error.flatten().fieldErrors 
        };
    }

    try {
        await addHolidayFB({
            name: validatedFields.data.name,
            date: validatedFields.data.date,
            isPaid: true, // Default new holidays to paid
        });
        return { success: true, message: "Holiday added successfully." };
    } catch (error) {
        return { success: false, message: "Failed to add holiday." };
    }
}

export async function updateHoliday(id: string, data: Partial<Holiday>) {
    try {
        await updateHolidayFB(id, data);
        return { success: true, message: "Holiday updated." };
    } catch (error) {
        return { success: false, message: "Failed to update holiday." };
    }
}

export async function accumulateLeave(accumulationAmount: number) {
    if (typeof accumulationAmount !== 'number' || accumulationAmount <= 0) {
        return { success: false, message: 'Invalid accumulation amount provided.' };
    }

    try {
        const q = query(collection(db, 'employees'), where('status', '==', 'active'));
        const employeeSnapshot = await getDocs(q);
        const activeEmployees = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));

        if (activeEmployees.length === 0) {
            return { success: true, message: "No active employees found to accumulate leave for." };
        }

        const batch = writeBatch(db);

        activeEmployees.forEach(employee => {
            const employeeRef = doc(db, 'employees', employee.id);
            const currentBalance = employee.leaveBalance || 0;
            const newBalance = currentBalance + accumulationAmount;
            batch.update(employeeRef, { leaveBalance: newBalance });
        });

        await batch.commit();
        
        return { success: true, message: `Successfully updated leave balance for ${activeEmployees.length} active employees.` };
    } catch (error) {
        console.error('Error accumulating leave:', error);
        return { success: false, message: 'An internal error occurred while accumulating leave.' };
    }
}

const settingsSchema = z.object({
    projectName: z.string().min(1, "Project name cannot be empty."),
    leaveAccumulationAmount: z.number().min(0, "Leave accumulation amount cannot be negative."),
    logoSvgColor: z.string().optional(),
    logoTextColor: z.string().optional(),
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    accentColor: z.string().optional(),
});

export async function updateSettings(data: AppSettings) {
    const validatedFields = settingsSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid input.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        await updateSettingsFB(validatedFields.data);
        return { success: true, message: 'Settings updated successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to update settings.' };
    }
}
