
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UserSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          User Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your personal account settings.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You will be able to manage your notification preferences, password, and other account details here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
