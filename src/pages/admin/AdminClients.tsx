import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getClients, getOrders } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, ChevronRight, History, Package, Calendar } from "lucide-react";
import { OrderCard } from "@/components/ui/order-card";
import { useNavigate } from "react-router-dom";

export default function AdminClients() {
  const navigate = useNavigate();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: getClients,
  });

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders-for-clients"],
    queryFn: getOrders,
  });

  const selectedClient = clients.find((c: any) => c._id === selectedClientId);
  const clientOrders = allOrders.filter((o: any) => 
    (typeof o.clientId === 'object' ? o.clientId?._id : o.clientId) === selectedClientId
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedClientId ? `Order history for ${selectedClient?.name}` : "Manage your customer list"}
            </p>
          </div>
          {selectedClientId && (
            <Button variant="outline" onClick={() => setSelectedClientId(null)}>
              Back to Client List
            </Button>
          )}
        </div>

        {clientsLoading || (selectedClientId && ordersLoading) ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedClientId ? (
          // Client List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client: any) => (
              <Card 
                key={client._id} 
                className="cursor-pointer hover:border-primary/50 transition-all group overflow-hidden"
                onClick={() => setSelectedClientId(client._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{client.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <span className="text-sm font-bold uppercase tracking-widest">View History</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {clients.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                 <User className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                 <p className="text-muted-foreground">No clients found in database.</p>
              </div>
            )}
          </div>
        ) : (
          // Client History View
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-none">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Orders</p>
                        <h3 className="text-3xl font-black">{clientOrders.length}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-none">
                    <CardContent className="p-6">
                        <p className="text-sm text-green-600 uppercase font-bold tracking-widest mb-1">Total Spent</p>
                        <h3 className="text-3xl font-black text-green-700">
                            ₹{clientOrders.reduce((sum: number, o: any) => sum + (o.cartTotal || 0), 0).toLocaleString()}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Past Orders
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {clientOrders.map((order: any) => (
                  <OrderCard
                    key={order._id}
                    orderId={order._id.slice(-6)}
                    clientName={selectedClient?.name || "Client"}
                    itemCount={order.items.length}
                    total={order.cartTotal || 0}
                    status={order.orderStatus.toLowerCase()}
                    statusLabel={order.orderStatus.replace(/_/g, ' ')}
                    timestamp={new Date(order.createdAt).toLocaleDateString()}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  />
                ))}
                {clientOrders.length === 0 && (
                   <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                        <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground">No previous orders found for this client.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
