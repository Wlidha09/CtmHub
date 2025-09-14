
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Edit, Trash2, Check, X } from "lucide-react";
import type { Holiday } from "@/lib/types";

interface HolidayTableProps {
  holidays: Holiday[];
  isLoading: boolean;
  canManage: boolean;
  onTogglePaid: (id: string, isPaid: boolean) => void;
  onUpdate: (id: string, name: string, date: string) => void;
  onDelete: (id: string) => void;
}

export function HolidayTable({
  holidays,
  isLoading,
  canManage,
  onTogglePaid,
  onUpdate,
  onDelete,
}: HolidayTableProps) {
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [editedData, setEditedData] = React.useState<{ name: string; date: string }>({ name: "", date: "" });

  const handleEdit = (holiday: Holiday) => {
    setEditingRowId(holiday.id);
    setEditedData({ name: holiday.name, date: holiday.date });
  };

  const handleCancel = () => {
    setEditingRowId(null);
  };

  const handleSave = (id: string) => {
    onUpdate(id, editedData.name, editedData.date);
    setEditingRowId(null);
  };

  const renderCell = (holiday: Holiday, field: keyof Holiday) => {
    const isEditing = editingRowId === holiday.id;
    if (isEditing && (field === 'name' || field === 'date')) {
      return (
        <TableCell>
          <Input
            type={field === 'date' ? 'date' : 'text'}
            value={editedData[field]}
            onChange={(e) => setEditedData({ ...editedData, [field]: e.target.value })}
            className="h-8"
          />
        </TableCell>
      );
    }

    if (field === 'date') {
      return <TableCell>{format(parseISO(holiday.date), "MMMM d, yyyy")}</TableCell>;
    }
    
    return <TableCell>{holiday[field as keyof Holiday] as React.ReactNode}</TableCell>;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Name</TableHead>
              {canManage && <TableHead className="w-[100px] text-center">Paid</TableHead>}
              {canManage && <TableHead className="w-[120px] text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 3} className="text-center h-24">
                  Loading holidays...
                </TableCell>
              </TableRow>
            ) : holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 3} className="text-center h-24">
                  No holidays found for this year.
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  {renderCell(holiday, "date")}
                  <TableCell>{format(parseISO(holiday.date), "EEEE")}</TableCell>
                  {renderCell(holiday, "name")}
                  {canManage && (
                    <TableCell className="text-center">
                      <Checkbox
                        checked={holiday.isPaid}
                        onCheckedChange={(checked) => onTogglePaid(holiday.id, !!checked)}
                        disabled={editingRowId === holiday.id}
                      />
                    </TableCell>
                  )}
                  {canManage && (
                    <TableCell className="text-right">
                      {editingRowId === holiday.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleSave(holiday.id)}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancel}>
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(holiday)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(holiday.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
