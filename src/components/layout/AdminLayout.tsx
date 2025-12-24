import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AdminSidebar className="fixed left-0 top-0 z-40 hidden md:flex" />

      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex items-center border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r border-border/60">
             <AdminSidebar className="h-full w-full border-none" onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="ml-2 font-semibold text-lg">DP-OMS</span>
      </div>

      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
