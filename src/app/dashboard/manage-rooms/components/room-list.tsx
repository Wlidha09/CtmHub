
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Monitor, Tv, Presentation, Video, Wind } from "lucide-react";
import type { MeetingRoom } from "@/lib/types";
import { RoomForm } from "./room-form";

interface RoomListProps {
  rooms: MeetingRoom[];
  isLoading: boolean;
  canManage: boolean;
  onUpdate: (id: string, data: Partial<MeetingRoom>) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

const amenityIcons: { [key: string]: React.ElementType } = {
    Projector: Monitor,
    TV: Tv,
    Whiteboard: Presentation,
    Videoconference: Video,
    "Air Conditioner": Wind,
};

export function RoomList({ rooms, isLoading, canManage, onUpdate, onDelete }: RoomListProps) {
  const [editingRoom, setEditingRoom] = React.useState<MeetingRoom | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const handleEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setIsFormOpen(true);
  };
  
  const handleUpdate = async (data: any) => {
    if (!editingRoom) return false;
    const result = await onUpdate(editingRoom.id, data);
    return result;
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead>Amenities</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 4 : 3} className="h-24 text-center">
                    Loading rooms...
                  </TableCell>
                </TableRow>
              ) : rooms.length > 0 ? (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="text-center">{room.capacity}</TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-2">
                            {room.amenities && room.amenities.map(amenity => {
                                const Icon = amenityIcons[amenity];
                                return (
                                    <Badge key={amenity} variant="outline" className="flex items-center gap-1.5">
                                        {Icon && <Icon className="w-3.5 h-3.5" />}
                                        {amenity}
                                    </Badge>
                                )
                            })}
                        </div>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the room.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(room.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canManage ? 4 : 3} className="h-24 text-center">
                    No meeting rooms found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isFormOpen && (
        <RoomForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleUpdate}
            room={editingRoom}
        />
      )}
    </>
  );
}
