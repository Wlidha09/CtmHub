
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { accumulateLeave, updateSettings } from "@/lib/actions";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/types";
import { getSettings } from "@/lib/firebase/settings";

function SettingsManager({ initialSettings }: { initialSettings: AppSettings }) {
    const [settings, setSettings] = React.useState(initialSettings);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isAccumulating, setIsAccumulating] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { currentRole } = useCurrentRole();

    const canManageSettings = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        const result = await updateSettings(settings);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            router.refresh();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsSaving(false);
    };

    const handleAccumulate = async () => {
        if (!canManageSettings) {
             toast({
                variant: "destructive",
                title: "Permission Denied",
                description: "You do not have permission to perform this action.",
            });
            return;
        }
        if (settings.leaveAccumulationAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Accumulation amount must be greater than zero.",
            });
            return;
        }

        setIsAccumulating(true);
        const result = await accumulateLeave(settings.leaveAccumulationAmount);
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
        <div className="space-y-6">
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
                            name="projectName"
                            value={settings.projectName}
                            onChange={handleSettingsChange}
                            disabled={!canManageSettings}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Accumulation</CardTitle>
                    <CardDescription>
                        Manually add a specified number of days to the leave balance for all active employees. This should typically be run once per month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-xs">
                        <Label htmlFor="leaveAccumulationAmount">Days to Accumulate</Label>
                        <Input
                            id="leaveAccumulationAmount"
                            name="leaveAccumulationAmount"
                            type="number"
                            value={settings.leaveAccumulationAmount}
                            onChange={handleSettingsChange}
                            step="0.1"
                            min="0"
                            disabled={!canManageSettings}
                        />
                    </div>
                </CardContent>
            </Card>

            {canManageSettings && (
                 <div className="flex justify-end gap-2">
                    <Button onClick={handleAccumulate} disabled={isAccumulating}>
                        {isAccumulating ? "Processing..." : "Run Monthly Leave Accumulation"}
                    </Button>
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            )}
             {!canManageSettings && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Only Dev, Owner, or RH roles can manage these settings.
                    </p>
                )}
        </div>
    );
}

export default function SettingsPage() {
    const [settings, setSettings] = React.useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        async function fetchSettingsData() {
            try {
                const settingsData = await getSettings();
                setSettings(settingsData);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load settings from the database.",
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettingsData();
    }, [toast]);

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

            {isLoading ? (
                <div>Loading settings...</div>
            ) : settings ? (
                <SettingsManager initialSettings={settings} />
            ) : (
                <div>Could not load settings. Please try again.</div>
            )}
        </div>
    );
}
