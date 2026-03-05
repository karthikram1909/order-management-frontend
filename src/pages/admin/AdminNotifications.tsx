import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, ShoppingCart, Clock, ArrowRight, PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminNotifications() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: getOrders,
  });

  // Create "notifications" from recent orders
  const notifications = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20) // Show last 20 events
    .map(order => {
      let icon = <ShoppingCart className="h-4 w-4 text-blue-500" />;
      let message = `New order received from ${typeof order.clientId === 'object' ? order.clientId?.name : 'Client'}`;
      
      if (order.orderStatus === 'ORDER_CONFIRMED') {
        icon = <PackageCheck className="h-4 w-4 text-green-500" />;
        message = `Order #${order._id.substring(0, 6)} has been confirmed`;
      } else if (order.paymentStatus === 'OVERDUE') {
        icon = <AlertCircle className="h-4 w-4 text-red-500" />;
        message = `Payment for Order #${order._id.substring(0, 6)} is overdue`;
      }

      return {
        id: order._id,
        message,
        time: new Date(order.createdAt).toLocaleString(),
        icon,
        orderId: order._id,
        status: order.orderStatus
      };
    });

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Keep track of latest orders and system activities.</p>
          </div>
          <Bell className="h-8 w-8 text-primary/20" />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Real-time updates from your order management system.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading activities...</div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No recent notifications.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border/40 shadow-sm">
                        {notif.icon}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{notif.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{notif.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0">
                        {notif.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(`/admin/orders/${notif.orderId}`)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
