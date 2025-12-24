import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package } from "lucide-react";
import { getClientHistory, api } from "@/lib/api"; // Import api directly for custom call if needed

export default function OrdersView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const clientInfoStr = localStorage.getItem("clientInfo");
            const clientInfo = clientInfoStr ? JSON.parse(clientInfoStr) : null;

            // Try standard getClientHistory (relies on token)
            let data = await getClientHistory();
            
            // STRICT FILTERING FUNCTION
            const normalizePhone = (p: any) => {
                if (!p) return "";
                return String(p).replace(/[^0-9]/g, '').slice(-10); // Last 10 digits only
            };

            const filterByMobile = (list: any[]) => {
                const myMobile = normalizePhone(clientInfo?.mobileNumber);
                if (!myMobile) return list; // Should probably return [] if no mobile, but let's stick to safe fallback or empty.
                
                console.log("DEBUG: Filtering for normalized mobile:", myMobile);
                
                return list.filter((order: any) => {
                     // Check nested clientId object or root level property
                     const rawOrderMobile = order.clientId?.mobileNumber || order.mobileNumber;
                     const orderMobile = normalizePhone(rawOrderMobile);
                     
                     const match = orderMobile === myMobile;
                     console.log(`DEBUG: Order ${order._id} Mobile: ${rawOrderMobile} -> ${orderMobile} (Match: ${match})`);
                     return match;
                });
            };

            // 1. Server Data: Trust the backend (it uses token-based filtering)
            // DO NOT filter by mobile here because backend response typically does NOT 
            // populate clientId, so order.clientId.mobileNumber is undefined.
            // Strict filtering on server data was hiding valid orders.
            
            // 2. Fallback if empty
            if ((!data || data.length === 0) && clientInfo?.mobileNumber) {
                try {
                     console.log("DEBUG: Attempting Fallback Fetch");
                     // Note: This endpoint likely relies on token anyway, so query param might be ignored
                     // but we keep it as a backup attempt.
                     const fallbackResponse = await api.get(`/client/orders?mobileNumber=${clientInfo.mobileNumber}`);
                     if (fallbackResponse.data && fallbackResponse.data.length > 0) {
                         data = fallbackResponse.data;
                     }
                } catch (e) {
                    // Ignore
                }
            }
            
            // MERGING LOCAL HISTORY: RE-ENABLED with Strict Filtering
            // We now filter local history just like server data to ensure privacy.
             const localHistory = localStorage.getItem('localOrderHistory');
             if (localHistory) {
                 let localOrders = JSON.parse(localHistory);
                 
                 // Apply valid filtering to local orders too
                 localOrders = filterByMobile(localOrders);

                 const currentIds = new Set(data?.map((o: any) => o._id) || []);
                 const newLocalOrders = localOrders.filter((o: any) => !currentIds.has(o._id));
                 
                 if (data) {
                     data = [...newLocalOrders, ...data];
                 } else {
                     data = newLocalOrders;
                 }
                 
                 // Sort by date desc
                 data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
             }

            setOrders(data || []);
        } catch (err) {
            console.error(err);
             // Fallback to local history on error
             const localHistory = localStorage.getItem('localOrderHistory');
             if (localHistory) {
                 setOrders(JSON.parse(localHistory));
             }
        } finally {
            setLoading(false);
        }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (orders.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders found.</p>
        </div>
      );
  }

  return (
    <div className="space-y-4">
        {orders.map((order) => {
             let statusVariant: any = 'default';
             if (['NEW_INQUIRY', 'PENDING_PRICING'].includes(order.orderStatus)) statusVariant = 'pending';
             if (order.orderStatus === 'WAITING_CLIENT_APPROVAL') statusVariant = 'action';
             if (order.orderStatus === 'ORDER_CONFIRMED') statusVariant = 'success';
             if (order.orderStatus === 'DELIVERED') statusVariant = 'success';
             if (order.orderStatus === 'CANCELLED') statusVariant = 'danger';

             return (
                <Card key={order._id} className="border-border/60 shadow-sm overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/client/status/${order._id}`)}>
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex justify-between items-center">
                             <div>
                                <CardTitle className="text-base font-semibold">Order #{order._id.substring(order._id.length - 6)}</CardTitle>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Created {new Date(order.createdAt).toLocaleString()}
                                </div>
                             </div>
                             <StatusBadge status={statusVariant}>{order.orderStatus?.replace(/_/g, ' ') || 'Pending'}</StatusBadge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="p-4 space-y-2">
                             <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Items</p>
                             {order.items?.map((item: any, idx: number) => (
                                 <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-border/40 text-sm">
                                     <span className="font-medium">{item.itemId?.itemName || "Item"}</span>
                                     <div className="flex items-center gap-4">
                                         <span className="text-muted-foreground">Qty: {item.quantity}</span>
                                         {item.unitPrice && <span className="font-semibold">${(item.quantity * item.unitPrice).toLocaleString()}</span>}
                                     </div>
                                 </div>
                             ))}
                         </div>
                         
                         {order.totalOrderValue > 0 && typeof order.totalOrderValue === 'number' && (
                            <div className="bg-blue-50/50 p-3 flex justify-between items-center border-t border-blue-100">
                                <span className="text-sm font-medium text-blue-900">Total Order Value</span>
                                <span className="text-lg font-bold text-blue-700">${order.totalOrderValue.toLocaleString()}</span>
                            </div>
                         )}
                    </CardContent>
                </Card>
             );
        })}
    </div>
  );
}
