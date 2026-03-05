import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listener for new orders
    const channel = supabase
      .channel('admin-order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order detected:', payload);
          
          // Get some basic info if possible
          const newOrder = payload.new;
          
          toast.success("New Order Received!", {
            description: `Order #${newOrder.id.substring(0, 6)}. Click to view details.`,
            action: {
              label: "View",
              onClick: () => navigate(`/admin/orders/${newOrder.id}`)
            },
            icon: <Bell className="h-4 w-4" />,
            duration: 10000, // Keep it visible for 10 seconds
          });

          // Also play a subtle sound if you want, but sticking to UI for now
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

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
        <span className="ml-2 font-bold text-slate-900 tracking-tight">RAM AROMATICS</span>
      </div>

      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
