
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addHoliday, syncHolidays } from "@/lib/actions";

export function HolidayActions({ onDataSynced }: { onDataSynced: () => void }) {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    const year = new Date().getFullYear();
    const result = await syncHolidays(year);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      onDataSynced();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsSyncing(false);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addHoliday(formData);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setIsOpen(false);
        onDataSynced();
        formRef.current?.reset();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleSync} disabled={isSyncing} variant="outline">
        <Sparkles className="w-4 h-4 mr-2" />
        {isSyncing ? "Syncing..." : "Sync with AI"}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Holiday
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} ref={formRef} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input id="name" name="name" placeholder="e.g., New Year's Day" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
