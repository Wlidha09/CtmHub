
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { accumulateLeave } from "@/lib/actions";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LeaveAccumulationCard() {
    const [isAccumulating, setIsAccumulating] = React.useState(false);
    const [amount, setAmount] = React.useState<number>(1.5);
    const { toast } = useToast();
    const { currentRole } = useCurrentRole();

    const canManageSettings = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

    const handleAccumulate = async () => {
        if (!canManageSettings) {
             toast({
                variant: "destructive",
                title: "Permission Denied",
                description: "You do not have permission to perform this action.",
            });
            return;
        }
        if (amount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Accumulation amount must be greater than zero.",
            });
            return;
        }

        setIsAccumulating(true);
        const result = await accumulateLeave(amount);
        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.message,
            });
        }
        setIsAccumulating(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Leave Accumulation</CardTitle>
                <CardDescription>
                    Manually add a specified number of days to the leave balance for all active employees. This should typically be run once per month.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 max-w-xs">
                    <Label htmlFor="leave-amount">Days to Accumulate</Label>
                    <Input 
                        id="leave-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        disabled={!canManageSettings}
                    />
                </div>
                <Button onClick={handleAccumulate} disabled={isAccumulating || !canManageSettings}>
                    {isAccumulating ? "Processing..." : "Run Monthly Leave Accumulation"}
                </Button>
                 {!canManageSettings && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Only Dev, Owner, or RH roles can run this process.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function ProjectSettingsCard() {
    const [projectName, setProjectName] = React.useState("LoopHub");
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        setIsSaving(true);
        // In a real app, you would save this to a database
        // and update a global state.
        setTimeout(() => {
            toast({
                title: "Project Name Updated",
                description: `The project name has been set to "${projectName}".`,
            });
            setIsSaving(false);
        }, 1000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                    Configure general settings for the project.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2 max-w-xs">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input 
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Project Name"}
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations.
        </p>
      </header>
      <ProjectSettingsCard />
      <LeaveAccumulationCard />
    </div>
  );
}
