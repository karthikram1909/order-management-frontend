import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, RefreshCw, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PriceInputRow } from "@/components/ui/price-input-row";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api, setPricing, getOrder } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPricing() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { toast } = useToast();
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchOrder = async () => {
        try {
            if (!orderId) return;
            const data = await getOrder(orderId);
            setOrder(data);
            
            // Initialize prices
            const initial: Record<string, number> = {};
            data.items.forEach((item: any) => {
                initial[item.itemId._id || item.itemId] = item.unitPrice || 0;
            });
            setPrices(initial);
        } catch (error) {
            console.error(error);
            toast({ title: "Error fetching order", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchOrder();
  }, [orderId]);

  const handlePriceChange = (productId: string, price: number) => {
    setPrices((prev) => ({ ...prev, [productId]: price }));
  };

  const calculateTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum: number, item: any) => {
      const pid = item.itemId._id || item.itemId;  
      return sum + item.quantity * (prices[pid] || 0);
    }, 0);
  };

  const handleSendQuote = async () => {
    setIsSending(true);
    try {
        const items = Object.entries(prices).map(([itemId, unitPrice]) => ({
            itemId,
            unitPrice
        }));
        await setPricing(orderId!, items);
        toast({ title: "Quote Sent", description: "Order status updated." });
        setShowSendQuoteModal(false);
        navigate("/admin");
    } catch (error) {
        toast({ title: "Failed to send quote", variant: "destructive" });
    } finally {
        setIsSending(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!order) return <div className="p-8">Order not found</div>;

  const allPricesFilled = order.items.every(
    (item: any) => (prices[item.itemId._id || item.itemId] || 0) > 0
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Price Order {order._id.slice(-6)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set unit prices for customer request
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Load Last Prices
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Pricing Notification */}
            <NotificationBanner
              type="info"
              title="Pricing Required"
              message="Enter unit prices for each item. The client will receive a quote via SMS once submitted."
            />

            {/* Price Inputs */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item: any) => {
                   const pid = item.itemId._id || item.itemId; 
                   return (
                  <PriceInputRow
                    key={pid}
                    productName={item.itemId.itemName || "Unknown Item"}
                    quantity={item.quantity}
                    unit={item.itemId.unit || "unit"}
                    price={prices[pid] || 0}
                    onPriceChange={(price) =>
                      handlePriceChange(pid, price)
                    }
                  />
                );})}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Client Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* We need to populate client details in backend getOrder or use what we have */}
                {/* order.clientId is usually populated IF we used .populate('clientId') in backend. 
                    Let's check clientController.getOrder. Yes, it only populates items.itemId. 
                    We should populate clientId too. */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Client ID
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {typeof order.clientId === 'object' ? order.clientId?.name : order.clientId}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quote Summary */}
            <Card className="border-border/60 shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${calculateTotal().toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-xl font-semibold text-foreground">
                     ${calculateTotal().toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <Button
                  className="mt-4 w-full gap-2"
                  size="lg"
                  disabled={!allPricesFilled}
                  onClick={() => setShowSendQuoteModal(true)}
                >
                  <Send className="h-4 w-4" />
                  Send Quote
                </Button>

                {!allPricesFilled && (
                  <p className="text-center text-xs text-muted-foreground">
                    Fill in all prices to send quote
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={showSendQuoteModal}
        onOpenChange={setShowSendQuoteModal}
        type="success"
        title="Send Quote to Client?"
        description={`A quote for $${calculateTotal().toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })} will be sent.`}
        confirmLabel="Send Quote"
        onConfirm={handleSendQuote}
        loading={isSending}
      />
    </AdminLayout>
  );
}
