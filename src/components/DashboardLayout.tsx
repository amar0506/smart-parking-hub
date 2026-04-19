import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-sm font-medium text-muted-foreground">Smart Parking Management System</h2>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
        <div className="fixed bottom-2 right-3 text-[11px] text-muted-foreground/60 pointer-events-none select-none z-50">
          © 2026 SmartPark | Developed by Amar Vishwakarma
        </div>
      </div>
    </SidebarProvider>
  );
}
