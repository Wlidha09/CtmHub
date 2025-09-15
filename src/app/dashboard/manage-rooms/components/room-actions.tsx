
"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "./room-form";
import type { MeetingRoom } from "@/lib/types";

interface AddRoomButtonProps {
    onSave: (data: Omit<MeetingRoom, 'id'>) => Promise<boolean>;
}

export function AddRoomButton({ onSave }: AddRoomButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Room
            </Button>
            <RoomForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={onSave}
                room={null}
            />
        </div>
    );
}

