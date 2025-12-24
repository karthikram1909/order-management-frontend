import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Clock, ChevronRight } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { mockProducts } from "@/data/mockData"; // Removed
import { getProducts, modifyOrder, getLocalHistory } from "@/lib/api";
import { Product } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface CartItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export default function ProductCatalog() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsEditing(!!localStorage.getItem("editingOrderId"));
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Identity Check
  useEffect(() => {
    // Check localStorage first, then sessionStorage for backward compatibility
    const clientInfo = localStorage.getItem("clientInfo") || sessionStorage.getItem("clientInfo");
    if (!clientInfo) {
        navigate("/");
    } else {
        // Ensure it's in localStorage if it was only in sessionStorage
        if (!localStorage.getItem("clientInfo")) {
            localStorage.setItem("clientInfo", clientInfo);
        }
    }
  }, [navigate]);

  useEffect(() => {
    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    }
    loadProducts();
  }, []);

  // Load local order history
  useEffect(() => {
      const history = getLocalHistory();
      setLocalOrders(history);
  }, [historyOpen]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (quantity === 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const getQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = cart.length > 0;

  const handleRequestQuote = async () => {
    // Read from localStorage (primary) or fallback to sessionStorage
    const clientInfoStr = localStorage.getItem("clientInfo") || sessionStorage.getItem("clientInfo");
    
    if (!clientInfoStr) {
        navigate("/"); 
        return;
    }
    const clientInfo = JSON.parse(clientInfoStr);
    const editingOrderId = localStorage.getItem("editingOrderId");

    setLoading(true);
    try {
        const items = cart.map((item) => ({
            itemId: item.productId,
            quantity: item.quantity,
            // unitPrice removed - Client cannot set price
        }));

        let orderData;
        if (editingOrderId) {
             // Modify existing order
             orderData = await modifyOrder(editingOrderId, items);
             localStorage.removeItem("editingOrderId");
             toast({ title: "Order Updated", description: "Your changes have been submitted." });
        } else {
            // Create new inquiry
            const { submitInquiry } = await import("@/lib/api");
            orderData = await submitInquiry({ 
                name: clientInfo.name, 
                mobileNumber: clientInfo.mobileNumber, 
                items 
            });
            toast({ title: "Request Sent", description: "We have received your request." });
        }

        // Save to local history
        // Manually attach mobile number so strict filtering works immediately
        const orderToSave = { ...orderData, mobileNumber: clientInfo.mobileNumber };
        import("@/lib/api").then(m => m.addToLocalHistory(orderToSave));

        localStorage.removeItem("cart"); // Clean up persistent cart
        setCart([]); // Reset state
        
        navigate("/client/orders"); // Redirect to Status Portal (History)

    } catch (error: any) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to submit request." });
    } finally {
        setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader
        title="Order Materials"
        subtitle="Select items for quote"
        showNotifications
        notificationCount={localOrders.length}
        showProfile // Repurposed for History
        onProfile={() => setHistoryOpen(true)}
      />

      <div className="sticky top-14 z-40 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6">
        {loading ? <p>Loading...</p> : filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            name={product.itemName}
            description={product.description}
            unit={product.unit}
            quantity={getQuantity(product._id)}
            onQuantityChange={(qty) => handleQuantityChange(product._id, qty)}
            imageUrl=""
          />
        ))}

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button
          className="w-full gap-2"
          size="lg"
          disabled={!hasItems}
          onClick={handleRequestQuote}
        >
          <ShoppingCart className="h-5 w-5" />
          {isEditing ? "Update Quote" : "Request Quote"}
          {hasItems && (
            <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
              {totalItems} item{totalItems !== 1 && "s"}
            </span>
          )}
        </Button>
      </div>

      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-[85vw] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Your Requests</SheetTitle>
            <SheetDescription>
              Recent quotes and orders you've submitted from this device.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {localOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent requests found.</p>
            ) : (
                localOrders.map((order) => (
                    <div 
                        key={order._id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate(`/client/status/${order._id}`)}
                    >
                        <div>
                            <p className="font-medium text-sm">Order #{order._id.slice(-6)}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium capitalize bg-secondary px-2 py-1 rounded">
                                {order.status?.replace(/_/g, ' ').toLowerCase() || 'Pending'}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
