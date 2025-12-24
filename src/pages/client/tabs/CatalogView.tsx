import { useEffect, useState } from "react";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts, modifyOrder, submitInquiry, addToLocalHistory } from "@/lib/api";
import { Product } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface CartItem {
  productId: string;
  quantity: number;
}

export default function CatalogView() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Load Products
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

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (quantity === 0) return prev.filter((item) => item.productId !== productId);
      if (existing) return prev.map((item) => item.productId === productId ? { ...item, quantity } : item);
      return [...prev, { productId, quantity }];
    });
  };

  const getQuantity = (productId: string) => cart.find((item) => item.productId === productId)?.quantity || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = cart.length > 0;

  const handleRequestQuote = async () => {
    const clientInfoStr = localStorage.getItem("clientInfo") || sessionStorage.getItem("clientInfo");
    if (!clientInfoStr) return; // Should handle auth redirect in parent
    
    const clientInfo = JSON.parse(clientInfoStr);
    const editingOrderId = sessionStorage.getItem("editingOrderId");

    setLoading(true);
    try {
        const items = cart.map((item) => ({ itemId: item.productId, quantity: item.quantity }));
        let orderData;

        if (editingOrderId) {
             orderData = await modifyOrder(editingOrderId, items);
             sessionStorage.removeItem("editingOrderId");
             toast({ title: "Order Updated", description: "Your changes have been submitted." });
        } else {
            orderData = await submitInquiry({ 
                name: clientInfo.name, 
                mobileNumber: clientInfo.mobileNumber, 
                items 
            });
            toast({ title: "Request Sent", description: "We have received your request." });
        }

        addToLocalHistory(orderData);
        localStorage.removeItem("cart");
        setCart([]);
        navigate("/client/orders"); // Redirect to Orders tab

    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: "Failed to submit request." });
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
    <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
                <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
            ) : filteredProducts.map((product) => (
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
        </div>

        {/* Floating Action Button */}
        {hasItems && (
             <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:static md:bg-transparent md:border-t-0 md:p-0 flex justify-end">
                <Button className="w-full md:w-auto gap-2 shadow-xl" size="lg" onClick={handleRequestQuote}>
                    <ShoppingCart className="h-5 w-5" />
                    {sessionStorage.getItem("editingOrderId") ? "Update Quote" : "Add to Inquiry"}
                    <span className="bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full text-xs ml-1">
                        {totalItems}
                    </span>
                </Button>
             </div>
        )}
    </div>
  );
}
