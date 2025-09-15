
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import type { MeetingRoom } from "@/lib/types";
import { useCurrentRole } from "@/hooks/use-current-role";
import { getRooms } from "@/lib/firebase/rooms";
import { RoomList } from "./components/room-list";
import { AddRoomButton } from "./components/room-actions";
import { addRoom, updateRoom, deleteRoom as deleteRoomAction } from "./actions";

export default function ManageRoomsPage() {
  const [rooms, setRooms] = React.useState<MeetingRoom[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();

  const canManage = ['Owner', 'RH', 'Manager', 'Dev'].includes(currentRole);

  const fetchRooms = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const roomList = await getRooms();
      setRooms(roomList);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch meeting rooms.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = async (roomData: Omit<MeetingRoom, 'id'>) => {
    const result = await addRoom(roomData);
    if (result.success) {
      toast({ title: "Success", description: "Meeting room added successfully." });
      fetchRooms();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    return result.success;
  };

  const handleUpdateRoom = async (id: string, roomData: Partial<MeetingRoom>) => {
    const result = await updateRoom(id, roomData);
    if (result.success) {
      toast({ title: "Success", description: "Meeting room updated successfully." });
      fetchRooms();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    return result.success;
  };

  const handleDeleteRoom = async (id: string) => {
    const result = await deleteRoomAction(id);
    if (result.success) {
      toast({ title: "Success", description: "Meeting room deleted." });
      setRooms(prev => prev.filter(room => room.id !== id));
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Meeting Rooms
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or remove meeting rooms available for booking.
          </p>
        </header>
        {canManage && <AddRoomButton onSave={handleAddRoom} />}
      </div>
      <RoomList 
        rooms={rooms}
        isLoading={isLoading}
        canManage={canManage}
        onUpdate={handleUpdateRoom}
        onDelete={handleDeleteRoom}
      />
    </div>
  );
}

