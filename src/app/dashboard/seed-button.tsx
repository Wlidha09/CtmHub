
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { seedDatabase } from "@/lib/actions";
import { Database } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function SeedButton() {
  const [isSeeding, setIsSeeding] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSeed = async () => {
    setIsSeeding(true);
    const result = await seedDatabase();
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
    setIsSeeding(false);
  };

  return (
    <Button onClick={handleSeed} disabled={isSeeding}>
      <Database className="w-4 h-4 mr-2" />
      {isSeeding ? "Seeding..." : "Seed Database"}
    </Button>
  );
}
