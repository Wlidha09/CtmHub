
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

interface CvUploadFormProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function CvUploadForm({ onUpload, isUploading }: CvUploadFormProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const { language } = useLanguage();
  const t = translations[language].candidates_page;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null); // Reset after upload
      // Reset the input value
      const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cv-upload">{t.form_cv_label}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="cv-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button type="submit" disabled={isUploading || !selectedFile}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isUploading ? t.form_uploading : t.form_upload_button}
          </Button>
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            {t.form_selected_file}: {selectedFile.name}
          </p>
        )}
      </div>
    </form>
  );
}
