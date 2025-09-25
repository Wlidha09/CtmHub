
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
import { summarizeCvAction } from "@/lib/actions";
import { withPermission } from "@/components/with-permission";

const translations = { en, fr };

function CandidatesPage() {
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

    const result = await summarizeCvAction(file);

    if (result.success && result.data) {
        const newCandidate: Candidate = {
            id: `cand-${Date.now()}`,
            name: result.data.fullName,
            summary: result.data.summary,
            cvUrl: URL.createObjectURL(file), // Create a temporary URL to view the file
            uploadedAt: new Date().toISOString(),
        };

        setCandidates(prev => [...prev, newCandidate]);
        toast({
            title: t.toast_upload_success_title,
            description: t.toast_upload_success_desc.replace('{fileName}', file.name),
        });
    } else {
        toast({
            variant: "destructive",
            title: t.toast_ai_error_title,
            description: result.message || t.toast_ai_error_desc,
        });
        // Even if AI fails, we can add the candidate with the filename as name
         const newCandidate: Candidate = {
            id: `cand-${Date.now()}`,
            name: file.name.replace(/\.pdf$/i, ''),
            cvUrl: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
            summary: "AI summary failed."
        };
        setCandidates(prev => [...prev, newCandidate]);
    }

    setIsUploading(false);
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

export default withPermission(CandidatesPage, "Candidates");
