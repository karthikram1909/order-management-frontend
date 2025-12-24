import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ArrowRight, Calendar } from "lucide-react";
import { getClientHistory, isClientLoggedIn } from "@/lib/api";

export default function ClientHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isClientLoggedIn()) {
        navigate("/client/login");
        return;
    }

    const fetchHistory = async () => {
        try {
            const data = await getClientHistory();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Orders" showBack onBack={() => navigate("/client")} />

      <div className="p-4 space-y-4 pt-4">
        {orders.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found.</p>
                <Button variant="link" onClick={() => navigate("/client")}>Start Shopping</Button>
            </div>
        )}

        {orders.map((order) => {
             // Map backend status to UI friendly status
             let statusVariant: any = 'default';
             if (['NEW_INQUIRY', 'PENDING_PRICING'].includes(order.orderStatus)) statusVariant = 'pending';
             if (order.orderStatus === 'WAITING_CLIENT_APPROVAL') statusVariant = 'action';
             if (order.orderStatus === 'ORDER_CONFIRMED') statusVariant = 'success';
             if (order.orderStatus === 'DELIVERED') statusVariant = 'success';
             if (order.orderStatus === 'CANCELLED') statusVariant = 'danger';

             return (
                <Card key={order._id} className="border-border/60 shadow-sm overflow-hidden" onClick={() => navigate(`/client/status/${order._id}`)}>
                    <CardHeader className="bg-muted/20 pb-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle className="text-base">Order #{order._id}</CardTitle>
                                <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                                    Created {new Date(order.createdAt).toLocaleString()}
                                </div>
                             </div>
                             <StatusBadge status={statusVariant}>{order.orderStatus.replace(/_/g, ' ')}</StatusBadge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="p-4 space-y-2">
                             <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                             {order.items.map((item: any, idx: number) => (
                                 <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-md border border-border/50 text-sm">
                                     <span className="font-medium">{item.itemId.itemName}</span>
                                     <span className="bg-background border border-border px-2 py-0.5 rounded text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                 </div>
                             ))}
                         </div>
                         
                         <div className="bg-muted/10 p-3 border-t border-border/60 text-center cursor-pointer hover:bg-muted/20 transition-colors">
                            <span className="text-sm font-medium text-primary">Show Activity Log & Status</span>
                         </div>
                    </CardContent>
                </Card>
             );
        })}
      </div>
    </div>
  );
}
