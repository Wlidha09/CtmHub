"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addLeaveRequest } from "@/lib/firebase/leave-requests";
import { useToast } from "@/hooks/use-toast";

export function NewLeaveRequestForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const [leaveType, setLeaveType] = React.useState<string | undefined>();
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields.",
        });
        return;
    }
    
    setIsSubmitting(true);
    try {
        await addLeaveRequest({
            // This is a placeholder. In a real app, you would get the current user's ID
            userId: "e1", 
            leaveType: leaveType as any,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
        toast({
            title: "Request Submitted",
            description: "Your leave request has been submitted successfully.",
        });
        setIsOpen(false);
        onFormSubmit(); // Refresh the list on the parent component
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to submit leave request.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Leave Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Leave Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="py-4">
            <div className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select onValueChange={setLeaveType} value={leaveType}>
                    <SelectTrigger id="leave-type">
                    <SelectValue placeholder="Select a leave type" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Personal Day">Personal Day</SelectItem>
                    <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                    <SelectItem value="Day off">Day off</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="start-date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="end-date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={{ before: startDate }}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                </div>
                </div>
            </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
