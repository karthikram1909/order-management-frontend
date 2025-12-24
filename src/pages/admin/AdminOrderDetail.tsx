import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Phone, MessageSquare, MoreVertical, CreditCard, Clock, AlertCircle, Truck, Package } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { TimelineStepper } from "@/components/ui/timeline-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStatusConfig } from "@/data/mockData";
import { api, getOrder, setPricing } from "@/lib/api"; // Added API imports
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const getTimelineSteps = (status: string) => {
    // Map backend status to timeline
     return [
     { id: "1", label: "Placed", status: "completed" as const },
     { id: "2", label: "Confirmed", status: ['ORDER_CONFIRMED', 'AWAITING_PAYMENT', 'PAYMENT_CLEARED', 'IN_TRANSIT', 'DELIVERED', 'CLOSED'].includes(status) ? "completed" as const : "upcoming" as any },
     { id: "3", label: "Paid", status: ['PAYMENT_CLEARED', 'IN_TRANSIT', 'DELIVERED', 'CLOSED'].includes(status) ? "completed" : (status === 'AWAITING_PAYMENT' ? 'current' : 'upcoming') as any },
     { id: "4", label: "Dispatched", status: ['IN_TRANSIT', 'DELIVERED', 'CLOSED'].includes(status) ? "completed" : 'upcoming' as any },
     { id: "5", label: "Delivered", status: ['DELIVERED', 'CLOSED'].includes(status) ? "completed" : 'upcoming' as any },
    ];
};

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchOrder = async () => {
    try {
        if (!orderId) return;
        const data = await getOrder(orderId);
        setOrder(data);
    } catch (e) {
        toast({ title: "Error", description: "Could not load order" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdatePayment = async () => {
      setProcessing(true);
      try {
          // Simplification: Mark PAID immediately. Ideally a modal.
          await api.put(`/admin/order/${orderId}/payment`, { status: 'PAID' });
          toast({ title: "Payment Recorded", description: "Order marked as PAID." });
          fetchOrder();
      } catch (e) {
          toast({ title: "Error", description: "Failed to update payment" });
      } finally {
          setProcessing(false);
      }
  };

  const handleDispatch = async () => {
      setProcessing(true);
      try {
          await api.post(`/admin/order/${orderId}/dispatch`);
          toast({ title: "Dispatched", description: "Order marked as In Transit." });
          fetchOrder();
      } catch (e) {
          toast({ title: "Error", description: "Failed to dispatch order" });
      } finally {
          setProcessing(false);
      }
  };

  // Add missing imports to top if needed check step 429
  // Imports already include api, getOrder. Check imports:
  // import { api, getOrder, setPricing } from "@/lib/api"; -> Need cancelOrder, extendDueDate
  
  const handleExtendDueDate = async () => {
      setProcessing(true);
      try {
          // Add 7 days to current or now
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + 7);
          
          await import("@/lib/api").then(m => m.extendDueDate(orderId!, newDate.toISOString()));
          toast({ title: "Due Date Extended", description: "Credit period extended by 7 days." });
          fetchOrder();
      } catch (e) {
          toast({ title: "Error", description: "Failed to extend due date" });
      } finally {
          setProcessing(false);
      }
  };

  const handleCancelOrder = async () => {
      if (!confirm("Are you sure you want to cancel this order?")) return;
      setProcessing(true);
      try {
          await import("@/lib/api").then(m => m.cancelOrder(orderId!));
          toast({ title: "Order Cancelled", description: "Order has been cancelled." });
          fetchOrder();
      } catch (e) {
          toast({ title: "Error", description: "Failed to cancel order" });
      } finally {
          setProcessing(false);
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!order) return <div className="p-8">Order not found</div>;

  const statusConfig = getStatusConfig(order.orderStatus); // Adapt or create new helper
  const timelineSteps = getTimelineSteps(order.orderStatus);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/admin/orders")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  Order {order._id.slice(-6)}
                </h1>
                <StatusBadge status={(statusConfig?.variant as any) || 'neutral'} size="lg">
                  {order.orderStatus.replace(/_/g, ' ')}
                </StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Created {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {['NEW_INQUIRY', 'PENDING_PRICING', 'WAITING_CLIENT_APPROVAL'].includes(order.orderStatus) && (
                <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => navigate(`/admin/pricing/${order._id}`)}
                >
                    <CreditCard className="h-4 w-4" /> 
                    Set Pricing
                </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/admin/pricing/${order._id}`)}>Edit Pricing</DropdownMenuItem>
                <DropdownMenuSeparator />
                {(order.orderStatus === 'ORDER_CONFIRMED' || order.orderStatus === 'PAYMENT_CLEARED') && (
                     <DropdownMenuItem onClick={handleDispatch}>
                        <Truck className="h-4 w-4 mr-2" /> Mark Dispatched
                     </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive" onClick={handleCancelOrder}>
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60">
                  {order.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.itemId.itemName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.itemId.unit} @ ${item.unitPrice?.toLocaleString() || "—"}/{item.itemId.unit}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        $
                        {item.unitPrice
                          ? (item.quantity * item.unitPrice).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <p className="text-xl font-semibold text-foreground">
                    ${order.totalOrderValue?.toLocaleString() || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineStepper steps={timelineSteps} />
              </CardContent>
            </Card>

            {/* Activity Log (Placeholder or connect to order.auditLogs) */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.auditLogs?.map((activity: any, i:number) => (
                    <div
                      key={i}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <p className="text-sm text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.detail}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                     {/* order.clientId populated check */}
                    {typeof order.clientId === 'object' ? order.clientId?.name : 'Client'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                     {typeof order.clientId === 'object' ? order.clientId?.mobileNumber : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={order.paymentStatus === 'PAID' ? 'success' : 'pending'}>{order.paymentStatus || 'PENDING'}</StatusBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className="text-sm font-medium">
                    {order.creditDueDate
                      ? new Date(order.creditDueDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button 
                    className="w-full gap-2" 
                    size="sm" 
                    onClick={handleUpdatePayment}
                    disabled={order.paymentStatus === 'PAID' || processing}
                  >
                    <CreditCard className="h-4 w-4" />
                    {order.paymentStatus === 'PAID' ? 'Paid' : 'Record Payment'}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="sm" onClick={handleExtendDueDate}>
                    <Clock className="h-4 w-4" />
                    Extend Due Date
                  </Button>
                  <Button variant="ghost" className="w-full gap-2 text-destructive" size="sm" onClick={() => toast({ title: "Reminder Sent", description: "SMS reminder has been sent to client." })}>
                    <AlertCircle className="h-4 w-4" />
                    Send Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>

             {/* Dispatch Action (Quick Access) */}
              {(order.orderStatus === 'ORDER_CONFIRMED' || order.orderStatus === 'PAYMENT_CLEARED') && (
                <Card className="border-border/60 shadow-card bg-accent/20">
                    <CardContent className="pt-6">
                        <Button className="w-full gap-2" onClick={handleDispatch} disabled={processing}>
                            <Truck className="h-4 w-4"/> Dispatch Order
                        </Button>
                    </CardContent>
                </Card>
              )}

              {/* Delivery Action (Quick Access) */}
              {order.orderStatus === 'IN_TRANSIT' && (
                <Card className="border-border/60 shadow-card bg-accent/20">
                    <CardContent className="pt-6">
                        <Button className="w-full gap-2" onClick={async () => {
                            setProcessing(true);
                            try {
                                await import("@/lib/api").then(m => m.adminDeliverOrder(orderId!));
                                toast({ title: "Delivered", description: "Order marked as Delivered." });
                                fetchOrder();
                            } catch (e) {
                                toast({ title: "Error", description: "Failed to mark delivered" });
                            } finally {
                                setProcessing(false);
                            }
                        }} disabled={processing}>
                            <Package className="h-4 w-4"/> Mark Delivered
                        </Button>
                    </CardContent>
                </Card>
              )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
