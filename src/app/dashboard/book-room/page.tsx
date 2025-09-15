
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BookRoomPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Book a Meeting Room
        </h1>
        <p className="text-muted-foreground">
          Check availability and book a room for your meetings.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page is under construction. Soon you'll be able to book meeting rooms from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>The final feature will include:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>A calendar view showing room availability.</li>
            <li>The ability to filter rooms by capacity and amenities.</li>
            <li>A simple form to book a room for a specific date and time.</li>
            <li>Email notifications to confirm your booking.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
