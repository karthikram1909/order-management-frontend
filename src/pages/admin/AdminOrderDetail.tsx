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
import { getOrder, setPricing, updatePaymentStatus, dispatchOrder, adminDeliverOrder, updateOrderPayments } from "@/lib/api"; 
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: "", method: "CASH", date: new Date().toISOString().split('T')[0] });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);

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

  const handleUpdatePayment = async (status?: string) => {
      setProcessing(true);
      try {
          await updatePaymentStatus(orderId!, status || 'PAID');
          toast({ title: "Status Updated", description: `Order marked as ${status || 'PAID'}.` });
          fetchOrder();
      } catch (e) {
          toast({ title: "Error", description: "Failed to update payment status" });
      } finally {
          setProcessing(false);
      }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const currentPayments = order.payments || [];
      const paymentItem = {
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        date: new Date(newPayment.date).toISOString()
      };

      let updatedPayments;
      if (editingPaymentIndex !== null) {
        updatedPayments = [...currentPayments];
        updatedPayments[editingPaymentIndex] = paymentItem;
      } else {
        updatedPayments = [...currentPayments, paymentItem];
      }

      await updateOrderPayments(orderId!, updatedPayments);
      
      // Auto-update overall status if fully paid? 
      // Let's check total.
      const totalPaid = updatedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPaid >= (order.totalOrderValue || 0)) {
        await updatePaymentStatus(orderId!, 'PAID');
      } else if (totalPaid > 0) {
        await updatePaymentStatus(orderId!, 'PARTIALLY_PAID');
      }

      toast({ title: "Payment Recorded", description: editingPaymentIndex !== null ? "Payment updated." : "Partial payment added." });
      setIsPaymentModalOpen(false);
      setNewPayment({ amount: "", method: "CASH", date: new Date().toISOString().split('T')[0] });
      setEditingPaymentIndex(null);
      fetchOrder();
    } catch (e) {
      toast({ title: "Error", description: "Failed to save payment" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePayment = async (index: number) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    setProcessing(true);
    try {
      const updatedPayments = order.payments.filter((_: any, i: number) => i !== index);
      await updateOrderPayments(orderId!, updatedPayments);
      
      const totalPaid = updatedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPaid === 0) {
        await updatePaymentStatus(orderId!, 'PENDING');
      } else if (totalPaid < (order.totalOrderValue || 0)) {
        await updatePaymentStatus(orderId!, 'PARTIALLY_PAID');
      }

      toast({ title: "Payment Deleted" });
      fetchOrder();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete payment" });
    } finally {
      setProcessing(false);
    }
  };

  const openEditPayment = (p: any, index: number) => {
    setNewPayment({
      amount: p.amount.toString(),
      method: p.method,
      date: new Date(p.date).toISOString().split('T')[0]
    });
    setEditingPaymentIndex(index);
    setIsPaymentModalOpen(true);
  };

  const handleDispatch = async () => {
      setProcessing(true);
      try {
          await dispatchOrder(orderId!);
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
    <>
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 w-fit"
              onClick={() => navigate("/admin/orders")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
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
          <div className="flex flex-wrap items-center gap-2">
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                          {item.itemName || item.itemId?.itemName || "Unknown Item"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit || item.itemId?.unit || "unit"} @ ₹{item.unitPrice?.toLocaleString() || "—"}/{item.unit || item.itemId?.unit || "unit"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        ₹
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
                    ₹{order.totalOrderValue?.toLocaleString() || "—"}
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
                <TimelineStepper steps={timelineSteps} orientation="horizontal" />
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
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <a href={typeof order.clientId === 'object' && order.clientId?.mobileNumber ? `tel:${order.clientId.mobileNumber}` : '#'}>
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <a 
                      href={typeof order.clientId === 'object' && order.clientId?.mobileNumber ? `https://wa.me/91${order.clientId.mobileNumber.replace(/\D/g, '')}` : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-border/60 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Payment</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                  setNewPayment({ amount: "", method: "CASH", date: new Date().toISOString().split('T')[0] });
                  setEditingPaymentIndex(null);
                  setIsPaymentModalOpen(true);
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={order.paymentStatus === 'PAID' ? 'success' : (order.paymentStatus === 'PARTIALLY_PAID' ? 'action' : 'pending')}>
                    {order.paymentStatus?.replace(/_/g, ' ') || 'PENDING'}
                  </StatusBadge>
                </div>

                {/* Individual Payments */}
                {order.payments && order.payments.length > 0 && (
                  <div className="space-y-2 mt-4 border-t pt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment History</p>
                    {order.payments.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm group">
                        <div>
                          <p className="font-medium">₹{p.amount.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(p.date).toLocaleDateString()} • {p.method}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditPayment(p, i)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeletePayment(i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-medium text-muted-foreground">Total Paid</span>
                      <span className="text-sm font-bold">₹{order.payments.reduce((s: number, p: any) => s + p.amount, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Balance</span>
                      <span className="text-sm font-bold text-destructive">₹{Math.max(0, (order.totalOrderValue || 0) - order.payments.reduce((s: number, p: any) => s + p.amount, 0)).toLocaleString()}</span>
                    </div>
                  </div>
                )}

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
                    onClick={() => handleUpdatePayment('PAID')}
                    disabled={order.paymentStatus === 'PAID' || processing}
                  >
                    <CreditCard className="h-4 w-4" />
                    {order.paymentStatus === 'PAID' ? 'Fully Paid' : 'Mark as Fully Paid'}
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
                        <Button 
                            className="w-full gap-2" 
                            onClick={handleDispatch} 
                            disabled={processing || order.paymentStatus !== 'PAID'}
                            title={order.paymentStatus !== 'PAID' ? "Payment required before dispatch" : "Dispatch Order"}
                        >
                            <Truck className="h-4 w-4"/> Dispatch Order
                        </Button>
                        {order.paymentStatus !== 'PAID' && (
                            <p className="text-center text-xs text-muted-foreground mt-2 text-destructive">
                                * Payment required to dispatch
                            </p>
                        )}
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
                                await adminDeliverOrder(orderId!);
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
    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingPaymentIndex !== null ? "Edit Payment Record" : "Add Payment Record"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input 
              type="number" 
              placeholder="e.g. 5000" 
              value={newPayment.amount} 
              onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select 
              value={newPayment.method} 
              onValueChange={(val) => setNewPayment({...newPayment, method: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={newPayment.date} 
              onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPayment} disabled={processing}>
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingPaymentIndex !== null ? "Update Payment" : "Save Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
