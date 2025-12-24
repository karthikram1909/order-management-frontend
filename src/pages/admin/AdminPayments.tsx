import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrders } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPayments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      // Filter for orders that have some payment interaction/status
      // Assuming we want to see Paid, Overdue, or Payment Pending (if confirmed)
      // Usually "Payments" view focuses on received revenue or overdue.
      // Let's show all for now but prioritize Paid.
      setOrders(data);
    } catch (e) {
      toast({ title: "Error", description: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Only show relevant payment statuses? Or just filter by search.
    // Let's show everything but allow search.
    // Or maybe filter out 'NEW_INQUIRY' / 'PENDING_PRICING' as no payment is relevant yet.
    if (['NEW_INQUIRY', 'PENDING_PRICING', 'WAITING_CLIENT_APPROVAL'].includes(order.orderStatus)) return false;

    const searchTerm = searchQuery.toLowerCase();
    const orderId = order._id?.toLowerCase() || "";
    const clientName = (typeof order.clientId === 'object' && order.clientId?.name) ? order.clientId.name.toLowerCase() : "";
    
    return orderId.includes(searchTerm) || clientName.includes(searchTerm);
  });

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + (curr.totalOrderValue || 0), 0);

  const pendingRevenue = orders
    .filter(o => o.paymentStatus !== 'PAID' && !['NEW_INQUIRY', 'PENDING_PRICING', 'WAITING_CLIENT_APPROVAL'].includes(o.orderStatus))
    .reduce((acc, curr) => acc + (curr.totalOrderValue || 0), 0);

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-6">Payments & Invoices</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="border-border/60 shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue Collected</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From {orders.filter(o => o.paymentStatus === 'PAID').length} paid orders</p>
                </CardContent>
            </Card>
            <Card className="border-border/60 shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${pendingRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Outstanding invoices</p>
                </CardContent>
            </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search payments by Order ID or Client..." 
            className="pl-10 max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <Card className="border-border/60 shadow-card">
            <CardContent className="p-0">
                {loading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No payment records found.</div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Order {order._id.slice(-6)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {typeof order.clientId === 'object' ? order.clientId?.name : 'Client'} • {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-medium">${(order.totalOrderValue || 0).toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due: {order.creditDueDate ? new Date(order.creditDueDate).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.paymentStatus === 'PAID' ? 'success' : (order.paymentStatus === 'OVERDUE' ? 'danger' : 'pending')}>
                                        {order.paymentStatus || 'PENDING'}
                                    </StatusBadge>
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
