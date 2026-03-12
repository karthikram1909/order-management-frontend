import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { PriceInputRow } from "@/components/ui/price-input-row";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getLastPrices, getOrder, setPricing } from "@/lib/api";
import { ArrowLeft, Loader2, RefreshCw, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminPricing() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { toast } = useToast();
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  const [prices, setPrices] = useState<Record<string, number>>({});

  const getItemId = (item: any, index: number) => {
    // Use the item._id if available for database consistency, or fallback to index
    return item._id || `item-${index}`;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;
        const data = await getOrder(orderId);
        setOrder(data);

        // Initialize prices
        const initial: Record<string, number> = {};
        data.items.forEach((item: any, index: number) => {
          const pid = getItemId(item, index);
          initial[pid] = item.unitPrice || 0;
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

  const handleLoadLastPrices = async () => {
    if (!orderId || !order) return;
    setIsLoadingPrices(true);
    try {
      // Expecting { idMap, nameMap }
      const { idMap, nameMap } = await getLastPrices(orderId);

      if (Object.keys(idMap).length === 0 && Object.keys(nameMap).length === 0) {
        toast({ title: "No previous prices found", description: "This client and global history have no past priced orders.", variant: "destructive" });
        return;
      }

      // Fill in prices for matching items
      let filledCount = 0;
      setPrices((prev) => {
        const updated = { ...prev };
        console.log("Current order items:", order.items);
        console.log("History ID Map:", idMap);
        console.log("History Name Map:", nameMap);
        
        order.items.forEach((item: any, index: number) => {
          const pid = getItemId(item, index);
          const itemId = item.itemId?._id || item.itemId || item.productId;
          const itemName = (item.itemName || item.itemId?.itemName || item.itemId?.name || '').trim().toLowerCase();
          
          console.log(`Checking item ${index}: ID=${itemId}, Name="${itemName}"`);

          // Try ID match first
          if (itemId && idMap[itemId] && idMap[itemId] > 0) {
            console.log(`Matched by ID: ${idMap[itemId]}`);
            updated[pid] = idMap[itemId];
            filledCount++;
          } 
          // Fallback to name match
          else if (itemName && nameMap[itemName] && nameMap[itemName] > 0) {
            console.log(`Matched by Name: ${nameMap[itemName]}`);
            updated[pid] = nameMap[itemName];
            filledCount++;
          } else {
            console.log("No match found for this item");
          }
        });
        return updated;
      });

      toast({
        title: "Prices Loaded",
        description: `Loaded last prices for ${filledCount} item(s).`,
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to load prices", variant: "destructive" });
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const calculateTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum: number, item: any, index: number) => {
      const pid = getItemId(item, index);
      return sum + (item.quantity || 0) * (prices[pid] || 0);
    }, 0);
  };

  const handleSendQuote = async () => {
    setIsSending(true);
    try {
      const items = order.items.map((item: any, index: number) => {
        const pid = getItemId(item, index);
        return {
          itemId: item.itemId?._id || item.itemId || item.productId,
          unitPrice: prices[pid] || 0,
          // Preserve item ID if we're updating existing ones
          _id: item._id
        };
      });
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

  const allPricesFilled = order.items.length > 0 && order.items.every(
    (item: any, index: number) => {
      const pid = getItemId(item, index);
      return (prices[pid] || 0) > 0;
    }
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
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
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={handleLoadLastPrices}
            disabled={isLoadingPrices}
          >
            {isLoadingPrices ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Load Last Prices
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                {order.items.map((item: any, index: number) => {
                  const pid = getItemId(item, index);
                  return (
                    <PriceInputRow
                      key={pid}
                      productName={item.itemName || item.itemId?.itemName || item.itemId?.name || "Product"}
                      quantity={item.quantity}
                      unit={item.unit || item.itemId?.unit || "unit"}
                      price={prices[pid] || 0}
                      onPriceChange={(price) =>
                        handlePriceChange(pid, price)
                      }
                    />
                  );
                })}
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
                    ₹{calculateTotal().toLocaleString(undefined, {
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
                    ₹{calculateTotal().toLocaleString(undefined, {
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
        description={`A quote for ₹${calculateTotal().toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })} will be sent.`}
        confirmLabel="Send Quote"
        onConfirm={handleSendQuote}
        loading={isSending}
      />
    </AdminLayout>
  );
}
