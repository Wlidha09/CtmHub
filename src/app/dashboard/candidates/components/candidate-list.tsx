
"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Eye, Trash2, FileText } from "lucide-react";
import type { Candidate } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

interface CandidateListProps {
  candidates: Candidate[];
  onDelete: (id: string) => void;
}

export function CandidateList({ candidates, onDelete }: CandidateListProps) {
  const { language } = useLanguage();
  const t = translations[language].candidates_page;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.list_header_name}</TableHead>
            <TableHead>{t.list_header_uploaded_at}</TableHead>
            <TableHead className="text-right">{t.list_header_actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>
                  {format(new Date(candidate.uploadedAt), "PPP p")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                   {candidate.summary && (
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" /> {t.list_action_summary}
                           </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t.summary_title.replace('{candidateName}', candidate.name)}</DialogTitle>
                                <DialogDescription>
                                    {candidate.summary}
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                   )}
                  <Button asChild variant="outline" size="sm">
                    <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" /> {t.list_action_view}
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> {t.list_action_delete}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.confirm_delete_title}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.confirm_delete_description}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel_button}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(candidate.id)}>
                          {t.delete_button}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                {t.list_no_candidates}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
