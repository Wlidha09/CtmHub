
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addRoom as addRoomFB, updateRoom as updateRoomFB, deleteRoom as deleteRoomFB } from "@/lib/firebase/rooms";
import type { MeetingRoom } from "@/lib/types";

const roomSchema = z.object({
    name: z.string().min(3, "Room name must be at least 3 characters."),
    capacity: z.number().min(1, "Capacity must be at least 1."),
    amenities: z.array(z.string()).optional(),
});

type ActionResponse = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

export async function addRoom(roomData: Omit<MeetingRoom, 'id'>): Promise<ActionResponse> {
    const validatedFields = roomSchema.safeParse(roomData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid input.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addRoomFB(validatedFields.data);
        revalidatePath("/dashboard/manage-rooms");
        return { success: true, message: "Room added successfully." };
    } catch (error) {
        return { success: false, message: "Failed to add room." };
    }
}

export async function updateRoom(id: string, roomData: Partial<MeetingRoom>): Promise<ActionResponse> {
    const validatedFields = roomSchema.partial().safeParse(roomData);
    
     if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid input.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateRoomFB(id, validatedFields.data);
        revalidatePath("/dashboard/manage-rooms");
        return { success: true, message: "Room updated successfully." };
    } catch (error) {
        return { success: false, message: "Failed to update room." };
    }
}

export async function deleteRoom(id: string): Promise<ActionResponse> {
    if (!id) {
        return { success: false, message: "Room ID is required." };
    }
    try {
        await deleteRoomFB(id);
        revalidatePath("/dashboard/manage-rooms");
        return { success: true, message: "Room deleted successfully." };
    } catch (error) {
        return { success: false, message: "Failed to delete room." };
    }
}
