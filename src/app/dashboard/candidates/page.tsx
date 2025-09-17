
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import type { Candidate } from "@/lib/types";
import { CvUploadForm } from "./components/cv-upload-form";
import { CandidateList } from "./components/candidate-list";

const translations = { en, fr };

export default function CandidatesPage() {
  const { language } = useLanguage();
  const t = translations[language].candidates_page;
  const { toast } = useToast();
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleCvUpload = async (file: File) => {
    if (!file) {
      toast({
        variant: "destructive",
        title: t.toast_no_file_title,
        description: t.toast_no_file_desc,
      });
      return;
    }
    setIsUploading(true);

    // In a real app, you would upload the file to Firebase Storage
    // and get a download URL. For now, we'll simulate this.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCandidate: Candidate = {
        id: `cand-${Date.now()}`,
        name: file.name.replace(/\.pdf$/i, ''),
        cvUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
    };

    setCandidates(prev => [...prev, newCandidate]);
    setIsUploading(false);
    toast({
        title: t.toast_upload_success_title,
        description: t.toast_upload_success_desc.replace('{fileName}', file.name),
    });
  };

  const handleDelete = (id: string) => {
    // In a real app, you'd also delete the file from storage
    setCandidates(prev => prev.filter(c => c.id !== id));
    toast({
        title: t.toast_delete_success_title,
    });
  }

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
          <CardTitle>{t.upload_cv_title}</CardTitle>
          <CardDescription>{t.upload_cv_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <CvUploadForm onUpload={handleCvUpload} isUploading={isUploading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.candidate_list_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateList candidates={candidates} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
