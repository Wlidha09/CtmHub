
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MeetingRoom } from "@/lib/types";
import { X, Plus } from "lucide-react";

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
  room: MeetingRoom | null;
}

export function RoomForm({ isOpen, onClose, onSave, room }: RoomFormProps) {
  const [name, setName] = React.useState("");
  const [capacity, setCapacity] = React.useState<number | "">("");
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [newAmenity, setNewAmenity] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      if (room) {
        setName(room.name);
        setCapacity(room.capacity);
        setAmenities(room.amenities || []);
      } else {
        setName("");
        setCapacity("");
        setAmenities([]);
      }
      setNewAmenity("");
    }
  }, [room, isOpen]);

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenityToRemove: string) => {
    setAmenities(amenities.filter(amenity => amenity !== amenityToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !capacity) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a room name and capacity.",
      });
      return;
    }
    
    setIsSubmitting(true);
    const roomData = { name, capacity: Number(capacity), amenities };

    const success = room ? await onSave({ ...roomData, id: room.id }) : await onSave(roomData);

    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{room ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-capacity">Capacity</Label>
            <Input id="room-capacity" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required min="1" />
          </div>
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Projector"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); }}}
              />
              <Button type="button" onClick={handleAddAmenity}>
                <Plus className="w-4 h-4 mr-2"/> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-1.5 bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                  <span>{amenity}</span>
                  <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="text-destructive">
                    <X className="w-3 h-3"/>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

