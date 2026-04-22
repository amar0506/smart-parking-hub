import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ParkingCircle, Wrench } from "lucide-react";

export default function Parking3DPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ParkingCircle className="h-6 w-6 text-primary" /> 3D Parking Visualization
          </h1>
          <p className="text-muted-foreground">Interactive 3D view with real-time sensor indicators</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Alert>
              <Wrench className="h-4 w-4" />
              <AlertTitle>Feature Unavailable</AlertTitle>
              <AlertDescription>
                3D Parking View is currently disabled or under development.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
