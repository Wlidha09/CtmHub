
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addBooking as addBookingFB, deleteBooking as deleteBookingFB, updateBooking as updateBookingFB } from "@/lib/firebase/bookings";
import type { Booking } from "@/lib/types";

const bookingSchema = z.object({
    roomId: z.string(),
    userId: z.string(),
    employeeName: z.string(),
    departmentName: z.string(),
    title: z.string().min(3, "Title must be at least 3 characters.").optional().or(z.literal("")),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
});

type ActionResponse = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

export async function addBooking(bookingData: Omit<Booking, 'id'>): Promise<ActionResponse> {
    const validatedFields = bookingSchema.safeParse(bookingData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid input.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addBookingFB(validatedFields.data);
        revalidatePath("/dashboard/book-room");
        return { success: true, message: "Room booked successfully." };
    } catch (error) {
        return { success: false, message: "Failed to book room." };
    }
}

export async function updateBooking(id: string, bookingData: Partial<Omit<Booking, 'id'>>): Promise<ActionResponse> {
    const validatedFields = bookingSchema.partial().safeParse(bookingData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid input.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateBookingFB(id, validatedFields.data);
        revalidatePath("/dashboard/book-room");
        return { success: true, message: "Booking updated successfully." };
    } catch (error) {
        return { success: false, message: "Failed to update booking." };
    }
}

export async function deleteBooking(id: string): Promise<ActionResponse> {
    if (!id) {
        return { success: false, message: "Booking ID is required." };
    }
    try {
        await deleteBookingFB(id);
        revalidatePath("/dashboard/book-room");
        return { success: true, message: "Booking cancelled successfully." };
    } catch (error) {
        return { success: false, message: "Failed to cancel booking." };
    }
}
