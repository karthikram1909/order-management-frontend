import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Send, Edit2 } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { mockProducts } from "@/data/mockData";

interface CartItem {
  productId: string;
  quantity: number;
}

interface ClientInfo {
  name: string;
  phone: string;
}

export default function QuoteReview() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    const savedClientInfo = sessionStorage.getItem("clientInfo");
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedClientInfo) {
      setClientInfo(JSON.parse(savedClientInfo));
    }
  }, []);

  const handleQuantityChange = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getProduct = (productId: string) => {
    return mockProducts.find((p) => p.id === productId);
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("clientInfo");
      navigate("/client/status/ORD-NEW");
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader
          title="Review Quote"
          showBack
          onBack={() => navigate("/client")}
        />
        <div className="flex flex-col items-center justify-center p-8 pt-24">
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
          <Button
            variant="link"
            className="mt-2"
            onClick={() => navigate("/client")}
          >
            Browse products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <MobileHeader
        title="Review Quote"
        subtitle={clientInfo?.name}
        showBack
        onBack={() => navigate("/client/identify")}
      />

      <div className="space-y-4 p-4">
        {/* Items */}
        <Card className="border-border/60 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Order Items</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => navigate("/client")}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Modify
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;

              return (
                <div
                  key={item.productId}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleQuantityChange(item.productId, -1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleQuantityChange(item.productId, 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="rounded-lg border border-status-action/30 bg-status-action-bg p-4">
          <p className="text-sm font-medium text-status-action-foreground">
            Prices will be shared after review
          </p>
          <p className="mt-1 text-xs text-status-action-foreground/80">
            Our team will review your order and send you a quote with the best prices
          </p>
        </div>

        {/* Client Info */}
        {clientInfo && (
          <Card className="border-border/60 shadow-card">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Contact Details
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {clientInfo.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {clientInfo.phone}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => navigate("/client/identify")}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 space-y-2 border-t border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Items</span>
          <span className="font-semibold">{cart.length} products</span>
        </div>
        <Separator />
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/client")}
          >
            Modify Order
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => setShowConfirmModal(true)}
          >
            <Send className="h-4 w-4" />
            Request Quote
          </Button>
        </div>
      </div>

      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        type="info"
        title="Submit Quote Request?"
        description="Your order will be sent to our team for pricing. You'll receive a quote via SMS shortly."
        confirmLabel="Submit Request"
        onConfirm={handleConfirmOrder}
        loading={isSubmitting}
      />
    </div>
  );
}
