import { useNavigate, useLocation } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Trash2,
  Layers
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { OrderCard } from "@/components/ui/order-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getOrders, getClients, getProducts, createOrder } from "@/lib/api";
import { Order, Product } from "@/types";

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
    'pending_pricing': { label: "Pending Pricing", variant: "pending" },
    'quote_sent': { label: "Quote Sent", variant: "action" },
  };
  return configs[status] || { label: status, variant: "default", priority: 99 };
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isBypass } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Determine initial tab based on route
  const getInitialTab = () => {
    if (location.pathname.includes('/admin/pricing')) return "pending";
    if (location.pathname.includes('/admin/invoices')) return "confirmed";
    if (location.pathname.includes('/admin/orders')) return "all";
    return "all";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update tab if location changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const pageTitle = location.pathname.includes('/admin/pricing') ? "Pricing" :
                  location.pathname.includes('/admin/invoices') ? "Invoices" :
                  location.pathname.includes('/admin/orders') ? "Orders" : "Dashboard";
  
  // New Order Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ productId: string, quantity: number }[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Queries for the dialog
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    enabled: isDialogOpen,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: isDialogOpen,
  });

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Success", description: "Order created successfully" });
      setIsDialogOpen(false);
      resetDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create order", 
        variant: "destructive" 
      });
    }
  });

  const resetDialog = () => {
    setStep(1);
    setSelectedClientId("");
    setSelectedItems([]);
    setProductSearch("");
  };

  const handleAddItem = (productId: string) => {
    setSelectedItems(prev => {
      if (prev.find(i => i.productId === productId)) return prev;
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setSelectedItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId));
  };

  const handleCreateOrder = () => {
    if (!selectedClientId || selectedItems.length === 0) return;
    
    if (isBypass) {
      toast({ 
        title: "Permission Denied", 
        description: "You are logged in via Bypass Mode. Creating orders requires a real Supabase admin account.", 
        variant: "destructive" 
      });
      return;
    }

    const items = selectedItems.map(item => {
      const p = allProducts.find(prod => prod._id === item.productId);
      return {
        itemId: item.productId,
        quantity: item.quantity,
        itemName: p?.itemName,
        unit: p?.unit
      };
    });

    createOrderMutation.mutate({
      clientId: selectedClientId,
      items
    });
  };

  // Fetch orders using React Query
  const { data: orders = [], isLoading: loading, error } = useQuery<Order[], Error>({
    queryKey: ["admin-orders"],
    queryFn: getOrders,
    retry: false,
  });

  // Handle Auth Error
  useEffect(() => {
    if (error) {
      const status = (error as any).status || (error as any).response?.status;
      if (status === 401 || (error as any).code === 'PGRST301') {
        window.location.href = "/admin/login";
      } else {
        console.error("Failed to fetch orders", error);
      }
    }
  }, [error]);

  // Calculate real stats
  const pendingPricingCount = orders.filter(o => ['NEW_INQUIRY', 'PENDING_PRICING'].includes(o.orderStatus)).length;
  const actionRequiredCount = orders.filter(o => ['WAITING_CLIENT_APPROVAL', 'IN_TRANSIT'].includes(o.orderStatus)).length;
  const confirmedCount = orders.filter(o => o.orderStatus === 'ORDER_CONFIRMED' || o.paymentStatus === 'PAID').length;
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
      label: "Confirmed Orders",
      value: confirmedCount,
      icon: CheckCircle,
      variant: "success" as const,
    },
    {
      label: "Completed",
      value: completedCount,
      icon: Layers,
      variant: "success" as const,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const clientName = (typeof order.clientId === 'object' && order.clientId?.name) ? order.clientId.name : 'Unknown Client';
    const orderId = order._id || "ID";

    const matchesSearch =
      orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && (order.orderStatus === "PENDING_PRICING" || order.orderStatus === "NEW_INQUIRY");
    if (activeTab === "action") return matchesSearch && (order.orderStatus === "WAITING_CLIENT_APPROVAL" || order.orderStatus === "IN_TRANSIT");
    if (activeTab === "confirmed") return matchesSearch && (order.orderStatus === "ORDER_CONFIRMED" || order.paymentStatus === "PAID");
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pageTitle === "Dashboard" ? "Overview of your order management system" : `Manage your ${pageTitle.toLowerCase()}`}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Step {step} of 2: {step === 1 ? "Select Client" : "Add Products"}
                </DialogDescription>
              </DialogHeader>

              {step === 1 ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Client</Label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client: any) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name} ({client.mobileNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Type product name..."
                        className="pl-8"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-1">
                      {allProducts
                        .filter(p => p.itemName.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(product => (
                          <div 
                            key={product._id} 
                            className="flex items-center justify-between p-2 hover:bg-muted rounded-sm cursor-pointer"
                            onClick={() => handleAddItem(product._id)}
                          >
                            <span className="text-sm font-medium">{product.itemName}</span>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                               <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Selected Items ({selectedItems.length})</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {selectedItems.map(item => {
                        const p = allProducts.find(prod => prod._id === item.productId);
                        return (
                          <div key={item.productId} className="flex items-center gap-3 border p-2 rounded-md">
                            <span className="flex-1 text-sm truncate">{p?.itemName}</span>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number" 
                                className="w-16 h-8 text-center"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                              />
                              <span className="text-xs text-muted-foreground">{p?.unit}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() => handleRemoveItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {selectedItems.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground py-4">No items selected yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                {step === 2 && (
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                )}
                {step === 1 ? (
                  <Button 
                    disabled={!selectedClientId} 
                    onClick={() => setStep(2)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateOrder}
                    disabled={selectedItems.length === 0 || createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Order"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stat Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <TabsTrigger value="confirmed" className="gap-2">
                Confirmed
                <StatusBadge status="success" size="sm" dot={false}>
                  {confirmedCount}
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
                {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> : filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const clientName = (typeof order.clientId === 'object' && order.clientId?.name) ? order.clientId.name : 'Unknown Client';
                  return (
                    <OrderCard
                      key={order._id}
                      orderId={order._id.slice(-6)}
                      clientName={clientName}
                      itemCount={order.items.length}
                      total={order.cartTotal || 0}
                      status={statusConfig.variant}
                      statusLabel={statusConfig.label}
                      timestamp={formatTimestamp(order.createdAt)}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    />
                  );
                })}
              </div>

              {filteredOrders.length === 0 && !loading && (
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
