"use server";

import {
  calculateEstimatedTimeOff,
  type CalculateEstimatedTimeOffInput,
} from "@/ai/flows/calculate-estimated-time-off";
import { z } from "zod";
import { db } from '@/lib/firebase/config';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { employees, departmentData, roles } from '@/lib/data';

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

export async function seedDatabase() {
  try {
    const batch = writeBatch(db);

    const employeesCol = collection(db, 'employees');
    employees.forEach(employee => {
      const docRef = doc(employeesCol, employee.id);
      batch.set(docRef, employee);
    });

    const departmentsCol = collection(db, 'departments');
    departmentData.forEach(department => {
      const docRef = doc(departmentsCol, department.id);
      batch.set(docRef, department);
    });

    const rolesCol = collection(db, 'roles');
    roles.forEach(role => {
      const docRef = doc(rolesCol, role.name);
      batch.set(docRef, role);
    });

    await batch.commit();
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database.' };
  }
}
