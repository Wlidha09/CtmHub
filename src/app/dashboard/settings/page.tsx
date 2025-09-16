
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { accumulateLeave } from "@/lib/actions";
import { useCurrentRole } from "@/hooks/use-current-role";

function LeaveAccumulationCard() {
    const [isAccumulating, setIsAccumulating] = React.useState(false);
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

        setIsAccumulating(true);
        const result = await accumulateLeave();
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
                    Manually add 1.7 days to the leave balance for all active employees. This should typically be run once per month.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
      <LeaveAccumulationCard />
    </div>
  );
}
