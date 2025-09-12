import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Candidates
        </h1>
        <p className="text-muted-foreground">
          View and manage job candidates.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
