import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsers() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Users
          </h1>
          <p className="text-muted-foreground">User management (managed through Lovable Cloud)</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">User accounts are managed through the Lovable Cloud Users panel.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
