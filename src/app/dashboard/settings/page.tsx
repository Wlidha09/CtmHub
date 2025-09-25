
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
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";

const translations = { en, fr };

function SettingsManager({ initialSettings }: { initialSettings: AppSettings }) {
    const [settings, setSettings] = React.useState(initialSettings);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isAccumulating, setIsAccumulating] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { currentRole } = useCurrentRole();
    const { language } = useLanguage();
    const t = translations[language].settings_page;

    const canManageSettings = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

    const hslToHex = (h: number, s: number, l: number): string => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    const hexToHsl = (hex: string): string | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;

        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        return `${h} ${s}% ${l}%`;
    }
    
    const getHexFromHslString = (hslString?: string): string => {
        if (!hslString) return '#000000';
        const [h, s, l] = hslString.replace(/%/g, '').split(' ').map(Number);
        return hslToHex(h, s, l);
    }

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };
    
    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof AppSettings) => {
        const hex = e.target.value;
        const hsl = hexToHsl(hex);
        if (hsl) {
            setSettings(prev => ({ ...prev, [fieldName]: hsl }));
        }
    };


    const handleSaveSettings = async () => {
        setIsSaving(true);
        const result = await updateSettings(settings);
        if (result.success) {
            toast({ title: "Success", description: t.toast_save_success });
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
                description: t.permission_denied,
            });
            return;
        }
        if (settings.leaveAccumulationAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: t.invalid_amount,
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
                    <CardTitle>{t.project_settings}</CardTitle>
                    <CardDescription>
                        {t.project_settings_desc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-xs">
                        <Label htmlFor="project-name">{t.project_name}</Label>
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
                    <CardTitle>{t.theme_settings}</CardTitle>
                    <CardDescription>{t.theme_settings_desc}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="primary-color">{t.primary_color}</Label>
                        <div className="flex items-center gap-2">
                             <Input
                                id="primary-color"
                                value={getHexFromHslString(settings.primaryColor)}
                                onChange={(e) => handleColorInputChange(e, 'primaryColor')}
                                disabled={!canManageSettings}
                                className="font-mono"
                            />
                            <Input 
                                type="color"
                                value={getHexFromHslString(settings.primaryColor)}
                                onChange={(e) => handleColorInputChange(e, 'primaryColor')}
                                className="w-12 h-10 p-1"
                                disabled={!canManageSettings}
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="background-color">{t.background_color}</Label>
                        <div className="flex items-center gap-2">
                             <Input
                                id="background-color"
                                value={getHexFromHslString(settings.backgroundColor)}
                                onChange={(e) => handleColorInputChange(e, 'backgroundColor')}
                                disabled={!canManageSettings}
                                className="font-mono"
                            />
                            <Input 
                                type="color"
                                value={getHexFromHslString(settings.backgroundColor)}
                                onChange={(e) => handleColorInputChange(e, 'backgroundColor')}
                                className="w-12 h-10 p-1"
                                disabled={!canManageSettings}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accent-color">{t.accent_color}</Label>
                        <div className="flex items-center gap-2">
                             <Input
                                id="accent-color"
                                value={getHexFromHslString(settings.accentColor)}
                                onChange={(e) => handleColorInputChange(e, 'accentColor')}
                                disabled={!canManageSettings}
                                className="font-mono"
                            />
                            <Input 
                                type="color"
                                value={getHexFromHslString(settings.accentColor)}
                                onChange={(e) => handleColorInputChange(e, 'accentColor')}
                                className="w-12 h-10 p-1"
                                disabled={!canManageSettings}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t.logo_settings}</CardTitle>
                    <CardDescription>{t.logo_settings_desc}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2 max-w-xs">
                        <Label htmlFor="logo-svg-color">{t.logo_svg_color}</Label>
                        <div className="flex items-center gap-2">
                             <Input
                                id="logo-svg-color"
                                name="logoSvgColor"
                                value={getHexFromHslString(settings.logoSvgColor)}
                                onChange={(e) => handleColorInputChange(e, 'logoSvgColor')}
                                disabled={!canManageSettings}
                                className="font-mono"
                            />
                            <Input 
                                type="color"
                                value={getHexFromHslString(settings.logoSvgColor)}
                                onChange={(e) => handleColorInputChange(e, 'logoSvgColor')}
                                className="w-12 h-10 p-1"
                                disabled={!canManageSettings}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">{t.logo_svg_color_desc}</p>
                    </div>
                     <div className="space-y-2 max-w-xs">
                        <Label htmlFor="logo-text-color">{t.logo_text_color}</Label>
                        <div className="flex items-center gap-2">
                             <Input
                                id="logo-text-color"
                                name="logoTextColor"
                                value={getHexFromHslString(settings.logoTextColor)}
                                onChange={(e) => handleColorInputChange(e, 'logoTextColor')}
                                disabled={!canManageSettings}
                                className="font-mono"
                            />
                            <Input 
                                type="color"
                                value={getHexFromHslString(settings.logoTextColor)}
                                onChange={(e) => handleColorInputChange(e, 'logoTextColor')}
                                className="w-12 h-10 p-1"
                                disabled={!canManageSettings}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">{t.logo_text_color_desc}</p>
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>{t.leave_accumulation}</CardTitle>
                    <CardDescription>
                        {t.leave_accumulation_desc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-xs">
                        <Label htmlFor="leaveAccumulationAmount">{t.days_to_accumulate}</Label>
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
                        {isAccumulating ? t.processing : t.run_accumulation}
                    </Button>
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving ? t.saving : t.save_settings}
                    </Button>
                </div>
            )}
             {!canManageSettings && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {t.manage_settings_permission}
                    </p>
                )}
        </div>
    );
}

function SettingsPage() {
    const [settings, setSettings] = React.useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();
    const { language } = useLanguage();
    const t = translations[language].settings_page;

    React.useEffect(() => {
        async function fetchSettingsData() {
            try {
                const settingsData = await getSettings();
                setSettings(settingsData);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: t.toast_load_error,
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettingsData();
    }, [toast, t]);

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t.title}
                </h1>
                <p className="text-muted-foreground">
                {t.description}
                </p>
            </header>

            {isLoading ? (
                <div>{t.loading}</div>
            ) : settings ? (
                <SettingsManager initialSettings={settings} />
            ) : (
                <div>{t.load_error}</div>
            )}
        </div>
    );
}

export default withPermission(SettingsPage, "Settings");
