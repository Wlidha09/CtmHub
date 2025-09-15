
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ManageRoomsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Meeting Rooms
        </h1>
        <p className="text-muted-foreground">
          Add, edit, or remove meeting rooms available for booking.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
           <CardDescription>
            This page is under construction. Soon you'll be able to manage your company's meeting rooms from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here you will be able to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>View all existing meeting rooms and their details.</li>
            <li>Add new rooms with capacity and amenities.</li>
            <li>Edit details for existing rooms.</li>
            <li>Remove rooms that are no longer in use.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
