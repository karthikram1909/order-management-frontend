import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Clock, Package, Truck, ArrowLeft, AlertCircle, CheckCircle2, Phone, MessageSquare, BadgeHelp, Edit2, X, Save } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimelineStepper } from "@/components/ui/timeline-stepper";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, getOrder, confirmOrder, confirmDelivery, modifyOrder } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { getStatusConfig } from "@/data/mockData";
import { Input } from "@/components/ui/input";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (orderId && orderId !== 'ORD-NEW') {
        fetchOrder();
    } else {
        setLoading(false);
    }
    // Fetch products for add item dropdown
    import("@/lib/api").then(m => m.getProducts().then(setProducts).catch(console.error));
  }, [orderId]);

  const fetchOrder = async () => {
    try {
        const data = await getOrder(orderId!);
        setOrder(data);
        // Initialize edited items with current quantities
        setEditedItems(data.items.map((i: any) => ({
            itemId: i.itemId._id,
            quantity: i.quantity,
            unitPrice: i.unitPrice
        })));
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

  const handleQuantityChange = (itemId: string, newQty: number) => {
      setEditedItems(prev => prev.map(item => 
          item.itemId === itemId ? { ...item, quantity: Math.max(0, newQty) } : item
      ));
  };

  const handleAddItem = (itemId: string) => {
      const product = products.find(p => p._id === itemId);
      if (!product) return;

      setEditedItems(prev => [
          ...prev, 
          { 
              itemId: product._id, 
              quantity: 1, 
              unitPrice: 0 // New items have unknown price
          }
      ]);
  };

  const handleRemoveItem = (itemId: string) => {
      setEditedItems(prev => prev.filter(item => item.itemId !== itemId));
  };

  const handleSaveChanges = async () => {
      setConfirming(true);
      try {
          const itemsToSubmit = editedItems.filter(i => i.quantity > 0).map(i => ({
              itemId: i.itemId,
              quantity: i.quantity
              // Backend might preserve unitPrice or reset it. 
              // Usually client modification resets status so price needs re-evaluation or confirmation.
          }));
          
          await modifyOrder(order._id, itemsToSubmit);
          toast({ title: "Quote Updated", description: "Sent to admin for review." });
          setIsEditing(false);
          fetchOrder();
      } catch (e: any) {
          toast({ variant: "destructive", title: "Update Failed", description: e.response?.data?.message || "Could not update order" });
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
        onBack={() => navigate("/client/catalog")} 
        rightElement={<StatusBadge status={(statusConfig?.variant as any) || 'neutral'} className="text-xs">{order.orderStatus.replace(/_/g, ' ')}</StatusBadge>}
      />

      <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                 <Button variant="ghost" size="sm" onClick={() => navigate("/client/catalog")}>
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
                         {!isEditing ? (
                             <>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit2 className="h-4 w-4 mr-2"/> Modify Quote
                                </Button>
                                <Button onClick={handleConfirmQuote} disabled={confirming}>
                                    {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                                    Accept Quote
                                </Button>
                             </>
                         ) : (
                             <>
                                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={confirming}>
                                    <X className="h-4 w-4 mr-2"/> Cancel
                                </Button>
                                <Button onClick={handleSaveChanges} disabled={confirming}>
                                    {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
                                    Submit Modified Request
                                </Button>
                             </>
                         )}
                    </div>
                 )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-6">
                
                {/* Timeline */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Order Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <TimelineStepper steps={steps} orientation="horizontal" />
                     <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                        <p className="font-medium text-foreground">
                            {order.orderStatus.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isEditing ? "Modify quantities below and submit for re-evaluation." : (
                                <>
                                    {order.orderStatus === 'NEW_INQUIRY' && "We have received your request and are calculating the best prices."}
                                    {order.orderStatus === 'PENDING_PRICING' && "Our team is reviewing stock and pricing."}
                                    {order.orderStatus === 'WAITING_CLIENT_APPROVAL' && "Pricing is ready. Please review the quote to proceed."}
                                    {order.orderStatus === 'ORDER_CONFIRMED' && "Thank you! Your order is being prepared for dispatch."}
                                    {order.orderStatus === 'IN_TRANSIT' && "Your order is on the way."}
                                    {order.orderStatus === 'DELIVERED' && "Order delivered successfully."}
                                </>
                            )}
                        </p>
                     </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader>
                     <CardTitle className="text-base flex justify-between items-center">
                         <span>Order Items</span>
                         {isEditing && <span className="text-xs font-normal text-muted-foreground bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-yellow-700 dark:text-yellow-400">Editing Mode</span>}
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-border/60">
                         {/* Existing Items */}
                         {editedItems.length > 0 ? editedItems.map((item: any, index: number) => {
                             // Find item details either from original order or products list
                             const productDetails = order.items.find((i: any) => i.itemId._id === item.itemId)?.itemId 
                                                    || products.find(p => p._id === item.itemId);
                             
                             if (!productDetails) return null;

                             const hasPrice = item.unitPrice > 0;

                             return (
                                 <div key={item.itemId} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                     <div className="flex-1">
                                         <p className="font-medium text-foreground">{productDetails.itemName || productDetails.name}</p>
                                         <div className="flex items-center gap-2 mt-1">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        className="h-8 w-20 text-center" 
                                                        value={item.quantity.toString()}
                                                        onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)}
                                                        min="0"
                                                    />
                                                    <span className="text-sm text-muted-foreground">{productDetails.unit}</span>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleRemoveItem(item.itemId)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">{item.quantity} {productDetails.unit}</p>
                                            )}
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         {hasPrice ? (
                                             <>
                                                 <p className="font-medium">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                                                 <p className="text-xs text-muted-foreground">${item.unitPrice}/{productDetails.unit}</p>
                                                 {isEditing && <p className="text-[10px] text-yellow-600 dark:text-yellow-400">Review pending</p>}
                                             </>
                                         ) : (
                                             <div className="flex flex-col items-end">
                                                  <span className="text-xs text-muted-foreground italic">TBD</span>
                                                  {isEditing && <span className="text-[10px] text-muted-foreground">New Item</span>}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             );
                         }) : <div className="p-8 text-center text-muted-foreground">No items in order</div>}
                         
                         {/* Add New Item Section */}
                         {isEditing && (
                             <div className="p-4 bg-muted/20">
                                 <label className="text-xs font-medium text-muted-foreground mb-2 block">Add New Item</label>
                                 <div className="flex gap-2">
                                     <select 
                                         className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                         onChange={(e) => {
                                             if (e.target.value) {
                                                 handleAddItem(e.target.value);
                                                 e.target.value = ""; // Reset
                                             }
                                         }}
                                     >
                                         <option value="">Select a product...</option>
                                         {products.filter(p => !editedItems.find(i => i.itemId === p._id)).map(product => (
                                             <option key={product._id} value={product._id}>
                                                 {product.itemName} ({product.unit})
                                             </option>
                                         ))}
                                     </select>
                                 </div>
                             </div>
                         )}
                     </div>
                     
                     {/* Totals */}
                     {order.totalOrderValue > 0 && !isEditing && (
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

             <div className="space-y-6">
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
                 {!isEditing ? (
                     <div className="flex gap-3">
                         <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                             Modify
                         </Button>
                         <Button className="flex-1" onClick={handleConfirmQuote} disabled={confirming}>
                             {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                             Accept
                         </Button>
                     </div>
                 ) : (
                    <div className="flex gap-3">
                         <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                             Cancel
                         </Button>
                         <Button className="flex-1" onClick={handleSaveChanges} disabled={confirming}>
                             {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : "Submit New Request"}
                         </Button>
                     </div>
                 )}
            </div>
       )}

       {/* Confirm Delivery CTA Mobile */}
       {order.orderStatus === 'IN_TRANSIT' && !isEditing && (
       <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden z-50">
         <Button className="w-full gap-2" size="lg" onClick={handleConfirmDelivery} disabled={confirming}>
           <CheckCircle2 className="h-5 w-5" />
           Confirm Delivery
         </Button>
       </div>)}

       {/* Floating Delivery Desktop */}
       {order.orderStatus === 'IN_TRANSIT' && !isEditing && (
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
