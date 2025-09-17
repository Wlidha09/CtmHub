
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

export default function CandidatesPage() {
  const { language } = useLanguage();
  const t = translations[language].candidates_page;

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
          <CardTitle>{t.coming_soon}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t.under_construction}</p>
        </CardContent>
      </Card>
    </div>
  );
}
