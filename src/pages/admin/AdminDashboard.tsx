import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, TrendingUp, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { OrderCard } from "@/components/ui/order-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { mockOrders, getStatusConfig } from "@/data/mockData";
import { getOrders } from "@/lib/api";
import { Order } from "@/types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query"; // Added missing import

// Helper to map backend status to UI status
const getStatusConfig = (status: string) => {
  const configs: Record<string, any> = {
    'NEW_INQUIRY': { label: "New Inquiry", variant: "pending", priority: 1 },
    'PENDING_PRICING': { label: "Pending Pricing", variant: "pending", priority: 1 },
    'WAITING_CLIENT_APPROVAL': { label: "Action Required", variant: "action", priority: 2 },
    'ORDER_CONFIRMED': { label: "Confirmed", variant: "success", priority: 3 },
    'IN_TRANSIT': { label: "In Transit", variant: "action", priority: 4 },
    'DELIVERED': { label: "Delivered", variant: "success", priority: 5 },
    'CLOSED': { label: "Completed", variant: "success", priority: 6 },
    'CANCELLED': { label: "Cancelled", variant: "danger", priority: 0 },
    // Fallback for mock data strings if needed during transition
    'pending_pricing': { label: "Pending Pricing", variant: "pending" },
    'quote_sent': { label: "Quote Sent", variant: "action" },
  };
  return configs[status] || { label: status, variant: "default", priority: 99 };
};

const statCards = [
  {
    label: "Pending Pricing",
    value: 3,
    icon: Clock,
    variant: "pending" as const,
  },
  {
    label: "Awaiting Approval",
    value: 5,
    icon: TrendingUp,
    variant: "action" as const,
  },
  {
    label: "Overdue Payments",
    value: 2,
    icon: AlertTriangle,
    variant: "danger" as const,
  },
  {
    label: "Completed Today",
    value: 8,
    icon: CheckCircle,
    variant: "success" as const,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  // const [orders, setOrders] = useState<Order[]>([]); // Use Order type
  // const [loading, setLoading] = useState(true);

  // Fetch orders using React Query
  const { data: orders = [], isLoading: loading, error } = useQuery<Order[], Error>({
    queryKey: ["admin-orders", activeTab, searchQuery], // Use activeTab and searchQuery for query key
    queryFn: getOrders,
    retry: false, // Don't retry on 401
  });

  // Handle Auth Error
  useEffect(() => {
    if (error) {
      // Check if the error is an AxiosError and has a response status
      if ((error as any).response?.status === 401) {
        window.location.href = "/admin/login";
      } else {
        console.error("Failed to fetch orders", error);
      }
    }
  }, [error]);

  // Calculate real stats
  const pendingPricingCount = orders.filter(o => ['NEW_INQUIRY', 'PENDING_PRICING'].includes(o.orderStatus)).length;
  const actionRequiredCount = orders.filter(o => ['WAITING_CLIENT_APPROVAL', 'IN_TRANSIT'].includes(o.orderStatus)).length;
  const overdueCount = orders.filter(o => o.paymentStatus === 'OVERDUE').length;
  const completedCount = orders.filter(o => ['CLOSED', 'DELIVERED'].includes(o.orderStatus)).length;

  const dynamicStatCards = [
    {
      label: "Pending Pricing",
      value: pendingPricingCount,
      icon: Clock,
      variant: "pending" as const,
    },
    {
      label: "Awaiting Approval",
      value: actionRequiredCount,
      icon: TrendingUp,
      variant: "action" as const,
    },
    {
      label: "Overdue Payments",
      value: overdueCount,
      icon: AlertTriangle,
      variant: "danger" as const,
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle,
      variant: "success" as const,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    // ... filtering logic ...
    const clientName = (typeof order.clientId === 'object' && order.clientId?.name) ? order.clientId.name : 'Unknown Client';
    const orderId = order._id || "ID";

    const matchesSearch =
      orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && (order.orderStatus === "PENDING_PRICING" || order.orderStatus === "NEW_INQUIRY");
    if (activeTab === "action") return matchesSearch && (order.orderStatus === "WAITING_CLIENT_APPROVAL" || order.orderStatus === "IN_TRANSIT");
    if (activeTab === "overdue") return matchesSearch && order.paymentStatus === "OVERDUE";
    if (activeTab === "completed") return matchesSearch && (order.orderStatus === "CLOSED" || order.orderStatus === "DELIVERED");

    return matchesSearch;
  });

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="bg-red-100 p-2 mb-4 text-xs font-mono hidden">
           DEBUG: Orders: {orders?.length} | Loading: {String(loading)}
        </div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of your order management system
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dynamicStatCards.map((stat) => (
            <Card
              key={stat.label}
              className="cursor-pointer border-border/60 shadow-card transition-all hover:border-border hover:shadow-card-hover"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      stat.variant === "pending"
                        ? "bg-status-pending-bg text-status-pending"
                        : stat.variant === "action"
                        ? "bg-status-action-bg text-status-action"
                        : stat.variant === "danger"
                        ? "bg-status-danger-bg text-status-danger"
                        : "bg-status-success-bg text-status-success"
                    }`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                Pending Pricing
                <StatusBadge status="pending" size="sm" dot={false}>
                  {pendingPricingCount}
                </StatusBadge>
              </TabsTrigger>
              <TabsTrigger value="action" className="gap-2">
                Action Required
                <StatusBadge status="action" size="sm" dot={false}>
                  {actionRequiredCount}
                </StatusBadge>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="gap-2">
                Overdue
                <StatusBadge status="danger" size="sm" dot={false}>
                  {overdueCount}
                </StatusBadge>
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto"/> : filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const clientName = (typeof order.clientId === 'object' && order.clientId?.name) ? order.clientId.name : 'Unknown Client';
                  return (
                    <OrderCard
                      key={order._id}
                      orderId={order._id.substring(orders.length - 6)} // Short ID for display
                      clientName={clientName}
                      itemCount={order.items.length}
                      total={order.cartTotal || 0} // Use correct field
                      status={statusConfig.variant}
                      statusLabel={statusConfig.label}
                      timestamp={formatTimestamp(order.createdAt)}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    />
                  );
                })}
              </div>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No orders found matching your criteria
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
