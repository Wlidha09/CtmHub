
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, Language } from "@/lib/types";
import { getEmployee, updateEmployee } from "@/lib/firebase/employees";
import { useToast } from "@/hooks/use-toast";

const translations = { en, fr };

// In a real app, this would come from the authenticated user
const FAKE_CURRENT_USER_ID = "e2";


export default function UserSettingsPage() {
  const { language, setLanguage: setAppLanguage } = useLanguage();
  const t = translations[language].user_settings_page;
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [defaultLanguage, setDefaultLanguage] = React.useState<Language | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getEmployee(FAKE_CURRENT_USER_ID);
        setCurrentUser(user);
        setDefaultLanguage(user?.defaultLanguage || language);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t.common.error,
          description: t.toast_load_error,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [language, t.common.error, t.toast_load_error, toast]);
  
  const handleSave = async () => {
    if (!currentUser || !defaultLanguage) return;

    setIsSaving(true);
    try {
        await updateEmployee(currentUser.id, { defaultLanguage });
        setAppLanguage(defaultLanguage); // Update language in the app immediately
        toast({
            title: t.common.success,
            description: t.toast_save_success,
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: t.common.error,
            description: t.toast_save_error,
        });
    } finally {
        setIsSaving(false);
    }
  };

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
      <Card>
        <CardHeader>
          <CardTitle>{t.language_settings_title}</CardTitle>
          <CardDescription>{t.language_settings_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>{t.common.loading}</p>
          ) : (
            <div className="space-y-2 max-w-sm">
                <Label htmlFor="language-select">{t.default_language_label}</Label>
                <Select value={defaultLanguage} onValueChange={(value) => setDefaultLanguage(value as Language)}>
                    <SelectTrigger id="language-select">
                        <SelectValue placeholder={t.select_language_placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français (French)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} disabled={isLoading || isSaving}>
                {isSaving ? t.saving : t.common.save}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
