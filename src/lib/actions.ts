
"use server";

import {
  calculateEstimatedTimeOff,
  type CalculateEstimatedTimeOffInput,
} from "@/ai/flows/calculate-estimated-time-off";
import { z } from "zod";
import { db } from '@/lib/firebase/config';
import { collection, writeBatch, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { roles } from '@/lib/data';
import type { Employee, Department, LeaveRequest } from "@/lib/types";
import { addLeaveRequest, updateLeaveRequestStatus as updateStatus } from "./firebase/leave-requests";

const schema = z.object({
  monthsWorked: z.coerce
    .number()
    .int()
    .positive("Months worked must be a positive number.")
    .max(1200, "Months worked cannot exceed 100 years."),
});

type FormState = {
  message: string;
  errors: Record<string, string[]> | null;
  data: number | null;
};

export async function getEstimatedTimeOff(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    monthsWorked: formData.get("monthsWorked"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid input.",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const input: CalculateEstimatedTimeOffInput = {
      monthsWorked: validatedFields.data.monthsWorked,
    };
    const result = await calculateEstimatedTimeOff(input);
    return {
      message: "Calculation successful.",
      errors: null,
      data: result.estimatedTimeOff,
    };
  } catch (error) {
    return {
      message: "An error occurred during calculation. Please try again.",
      errors: null,
      data: null,
    };
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

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;


export async function seedDatabase() {
  try {
    const collectionsToEnsure = ['employees', 'departments', 'roles', 'leaveRequests', 'candidates'];
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

            await addLeaveRequest({
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
    return { success: true, message: 'New random data added to database!' };
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
