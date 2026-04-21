import { useEffect, useState } from "react";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts, modifyOrder, submitInquiry, addToLocalHistory } from "@/lib/api";
import { Product } from "@/types";

interface CartItem {
  productId: string;
  quantity: number | string;
}

interface CatalogViewProps {
  products: Product[];
  cart: CartItem[];
  loading: boolean;
  onQuantityChange: (productId: string, quantity: number | string) => void;
}

export default function CatalogView({ products, cart, loading, onQuantityChange }: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");

  // Dynamically extract unique categories from products (defaulting empty ones to "Materials")
  const categories = ["All Items", ...Array.from(new Set(products.map(p => p.category || "Materials"))).filter(Boolean)];

  const getQuantity = (productId: string) => cart.find((item) => item.productId === productId)?.quantity || 0;

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch = product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (activeCategory !== "All Items") {
        const cat = product.category || "";
        matchesCategory = cat.toLowerCase() === activeCategory.toLowerCase();
      }
      return matchesSearch && matchesCategory;
    }
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Categories Row - Sticky Header */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur pt-2 pb-4 border-b border-transparent shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-auto md:min-w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white shadow-sm border-slate-200"
            />
          </div>

          {/* Category Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full md:w-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full whitespace-nowrap transition-all",
                  activeCategory === cat
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Container - Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-1 pb-20 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent h-[calc(100vh-280px)] min-h-[400px]">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium">No items found in this category.</p>
          </div>
        ) : activeCategory === "All Items" ? (
          <div className="space-y-12">
            {categories.filter(c => c !== "All Items").map(cat => {
              const catProducts = filteredProducts.filter(p => (p.category || "Materials").toLowerCase() === cat.toLowerCase());
              if (catProducts.length === 0) return null;

              return (
                <div key={cat} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                    <h3 className="text-xl font-bold text-slate-900 capitalize">{cat}</h3>
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{catProducts.length} items</span>
                  </div>
                  <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-x-visible scrollbar-hide snap-x">
                    {catProducts.map((product) => (
                      <div key={product._id} className="min-w-[160px] sm:min-w-0 snap-start">
                        <ProductCard
                          name={product.itemName}
                          description={product.description}
                          unit={product.unit}
                          quantity={getQuantity(product._id)}
                          onQuantityChange={(qty) => onQuantityChange(product._id, qty)}
                          imageUrl={product.imageUrl}
                          className="border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                name={product.itemName}
                description={product.description}
                unit={product.unit}
                quantity={getQuantity(product._id)}
                onQuantityChange={(qty) => onQuantityChange(product._id, qty)}
                imageUrl={product.imageUrl}
                className="border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full"
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
