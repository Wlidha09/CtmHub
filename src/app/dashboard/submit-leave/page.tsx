import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitLeavePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Submit Leave Request
        </h1>
        <p className="text-muted-foreground">
          Fill out the form to submit a leave request.
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
