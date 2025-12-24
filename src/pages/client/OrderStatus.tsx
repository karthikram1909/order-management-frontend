import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Clock, Package, Truck, ArrowLeft, AlertCircle, CheckCircle2, Phone, MessageSquare, BadgeHelp } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimelineStepper } from "@/components/ui/timeline-stepper";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, getOrder, confirmOrder, confirmDelivery } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { getStatusConfig } from "@/data/mockData";

const getSteps = (status: string) => {
    return [
     { id: "1", label: "Request Sent", status: "completed" as const },
     { id: "2", label: "Pricing", status: ['NEW_INQUIRY', 'PENDING_PRICING'].includes(status) ? "current" as const : "completed" as const },
     { id: "3", label: "Review Quote", status: status === 'WAITING_CLIENT_APPROVAL' ? "current" : (['ORDER_CONFIRMED', 'AWAITING_PAYMENT', 'PAYMENT_CLEARED', 'IN_TRANSIT', 'DELIVERED', 'CLOSED'].includes(status) ? 'completed' : 'upcoming') as any },
     { id: "4", label: "Delivery", status: status === 'IN_TRANSIT' ? "current" : (status === 'DELIVERED' || status === 'CLOSED' ? 'completed' : 'upcoming') as any },
    ];
};

export default function OrderStatus() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (orderId && orderId !== 'ORD-NEW') {
        fetchOrder();
    } else {
        setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
        const data = await getOrder(orderId!);
        setOrder(data);
    } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Could not load order details" });
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmQuote = async () => {
      setConfirming(true);
      try {
          await confirmOrder(order._id);
          toast({ title: "Order Confirmed!", description: "We will process your delivery soon." });
          fetchOrder(); // Refresh
      } catch (e) {
          toast({ title: "Error", description: "Failed to confirm order" });
      } finally {
          setConfirming(false);
      }
  };

  const handleConfirmDelivery = async () => {
      setConfirming(true);
      try {
          await confirmDelivery(order._id);
          toast({ title: "Delivery Confirmed", description: "Thank you for shopping with us!" });
          fetchOrder();
      } catch (e) {
          toast({ title: "Error", description: "Failed to confirm delivery" });
      } finally {
          setConfirming(false);
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (!order) {
      return (
        <div className="min-h-screen bg-background">
          <MobileHeader title="Order Status" showBack onBack={() => navigate("/client")} />
           <div className="p-8 text-center">
            <p className="text-muted-foreground">Order not found.</p>
            <Button onClick={() => navigate("/client")} className="mt-4">Back to Home</Button>
           </div>
        </div>
      );
  }

  const steps = getSteps(order.orderStatus);
  const isWaitingForApproval = order.orderStatus === 'WAITING_CLIENT_APPROVAL';
  const statusConfig = getStatusConfig(order.orderStatus);

  return (
    <div className="min-h-screen bg-background pb-32">
      <MobileHeader
        title={`Order #${order._id.slice(-6)}`}
        showBack
        onBack={() => navigate("/client/history")} // Navigate to history usually better than home
        rightElement={<StatusBadge status={(statusConfig?.variant as any) || 'neutral'} className="text-xs">{order.orderStatus.replace(/_/g, ' ')}</StatusBadge>}
      />

      <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-6">
          {/* Desktop Header (Hidden on Mobile) */}
          <div className="hidden md:flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                 <Button variant="ghost" size="sm" onClick={() => navigate("/client/orders")}>
                     <ArrowLeft className="h-4 w-4 mr-2"/> Back
                 </Button>
                 <div>
                    <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
                    <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                 </div>
                 <StatusBadge status={(statusConfig?.variant as any) || 'neutral'} size="lg" className="ml-2">
                    {order.orderStatus.replace(/_/g, ' ')}
                 </StatusBadge>
             </div>
             <div>
                {/* Desktop Actions */}
                 {isWaitingForApproval && (
                    <div className="flex gap-2">
                         <Button variant="outline" onClick={() => {
                             const cartItems = order.items.map((i: any) => ({
                                 productId: i.itemId._id,
                                 quantity: i.quantity,
                                 unitPrice: i.unitPrice
                             }));
                             sessionStorage.setItem("cart", JSON.stringify(cartItems));
                             sessionStorage.setItem("editingOrderId", order._id);
                             navigate("/client/catalog");
                         }}>
                             Modify Quote
                         </Button>
                         <Button onClick={handleConfirmQuote} disabled={confirming}>
                             {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                             Accept Quote
                         </Button>
                    </div>
                 )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Left Column: Progress & Items */}
             <div className="md:col-span-2 space-y-6">
                
                {/* Timeline */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Order Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <TimelineStepper steps={steps} orientation="vertical" />
                     <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                        <p className="font-medium text-foreground">
                            {order.orderStatus.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {order.orderStatus === 'NEW_INQUIRY' && "We have received your request and are calculating the best prices."}
                            {order.orderStatus === 'PENDING_PRICING' && "Our team is reviewing stock and pricing."}
                            {order.orderStatus === 'WAITING_CLIENT_APPROVAL' && "Pricing is ready. Please review the quote to proceed."}
                            {order.orderStatus === 'ORDER_CONFIRMED' && "Thank you! Your order is being prepared for dispatch."}
                            {order.orderStatus === 'IN_TRANSIT' && "Your order is on the way."}
                            {order.orderStatus === 'DELIVERED' && "Order delivered successfully."}
                        </p>
                     </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader>
                     <CardTitle className="text-base">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-border/60">
                         {order.items.map((item: any) => {
                             const hasPrice = item.unitPrice > 0;
                             return (
                                 <div key={item._id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                     <div>
                                         <p className="font-medium text-foreground">{item.itemId.itemName}</p>
                                         <p className="text-sm text-muted-foreground">{item.quantity} {item.itemId.unit}</p>
                                     </div>
                                     <div className="text-right">
                                         {hasPrice ? (
                                             <>
                                                 <p className="font-medium">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                                                 <p className="text-xs text-muted-foreground">${item.unitPrice}/{item.itemId.unit}</p>
                                             </>
                                         ) : (
                                             <BadgeHelp className="h-5 w-5 text-muted-foreground/50" />
                                         )}
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                     
                     {/* Totals */}
                     {order.totalOrderValue > 0 && (
                         <div className="p-4 bg-muted/30 border-t border-border/60">
                             <div className="flex justify-between items-center">
                                 <span className="font-medium">Total Estimate</span>
                                 <span className="text-xl font-bold">${order.totalOrderValue.toLocaleString()}</span>
                             </div>
                         </div>
                     )}
                  </CardContent>
                </Card>
             </div>

             {/* Right Column: Support & Summary */}
             <div className="space-y-6">
                
                {/* Help Card */}
                <Card className="border-border/60 shadow-sm">
                   <CardHeader>
                      <CardTitle className="text-base">Need Help?</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <p className="text-sm text-muted-foreground">For any questions regarding this order, please contact our support.</p>
                       <div className="flex gap-2">
                           <Button variant="outline" className="flex-1 w-full gap-2" size="sm">
                               <Phone className="h-4 w-4"/> Call
                           </Button>
                           <Button variant="outline" className="flex-1 w-full gap-2" size="sm">
                               <MessageSquare className="h-4 w-4"/> Chat
                           </Button>
                       </div>
                   </CardContent>
                </Card>
             </div>
          </div>
      </div>

       {/* Floating Actions for Mobile */}
       {isWaitingForApproval && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border md:hidden z-50">
                 <div className="flex gap-3">
                     <Button variant="outline" className="flex-1" onClick={() => {
                         const cartItems = order.items.map((i: any) => ({
                             productId: i.itemId._id,
                             quantity: i.quantity,
                             unitPrice: i.unitPrice
                         }));
                         sessionStorage.setItem("cart", JSON.stringify(cartItems));
                         sessionStorage.setItem("editingOrderId", order._id);
                         navigate("/client/catalog");
                     }}>
                         Modify
                     </Button>
                     <Button className="flex-1" onClick={handleConfirmQuote} disabled={confirming}>
                         {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                         Accept
                     </Button>
                 </div>
            </div>
       )}

       {/* Confirm Delivery CTA Mobile */}
       {order.orderStatus === 'IN_TRANSIT' && (
       <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden z-50">
         <Button className="w-full gap-2" size="lg" onClick={handleConfirmDelivery} disabled={confirming}>
           <CheckCircle2 className="h-5 w-5" />
           Confirm Delivery
         </Button>
       </div>)}

       {/* Desktop Dispatch/Delivery Buttons if needed in Sidebar, but client usually only confirms delivery */}
       {order.orderStatus === 'IN_TRANSIT' && (
           <div className="hidden md:block fixed bottom-8 right-8 z-50">
                <Button size="lg" className="shadow-xl" onClick={handleConfirmDelivery} disabled={confirming}>
                     <CheckCircle2 className="h-5 w-5 mr-2" />
                     Confirm Delivery
                </Button>
           </div>
       )}
    </div>
  );
}
