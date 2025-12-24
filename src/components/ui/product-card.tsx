import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  description: string;
  unit: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  imageUrl?: string;
  className?: string;
}

export function ProductCard({
  name,
  description,
  unit,
  quantity,
  onQuantityChange,
  imageUrl,
  className,
}: ProductCardProps) {
  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all h-full bg-card",
        className
      )}
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted relative">
         {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
         ) : (
             // Placeholder similar to screenshot
             <img src="/placeholder-product.jpg" alt={name} className="h-full w-full object-cover opacity-80" 
                  onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop"; 
                  }}
             />
         )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-foreground line-clamp-1">{name}</h3>
                <Badge variant="secondary" className="text-xs font-normal text-muted-foreground bg-secondary/50">
                    {unit}
                </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
              {description}
            </p>
        </div>

        <div className="mt-auto space-y-4">
             {/* Unit & Price info */}
             <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">Unit:</span>
                 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">{unit}</Badge>
             </div>

             {/* Price Banner */}
             <div className="bg-yellow-50 text-yellow-800 text-xs py-2 px-3 rounded-md border border-yellow-200 flex items-center justify-center gap-2 font-medium">
                 <span>💰</span> Price available after inquiry
             </div>
             
             {/* Quantity Controls */}
             <div className="flex items-center justify-between bg-muted/20 p-1 rounded-lg border border-border/40">
                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleDecrement} disabled={quantity === 0}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold w-8 text-center">{quantity}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleIncrement}>
                    <Plus className="h-4 w-4" />
                </Button>
             </div>

             {/* Add Button */}
             <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm" 
                onClick={handleIncrement}
                disabled={quantity > 0} // Optional: Disable if already added? Screenshots typically just show "Add"
             >
                 {quantity > 0 ? <Plus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                 {quantity > 0 ? "Add More" : "Add to Inquiry"}
             </Button>
        </div>
      </CardContent>
    </Card>
  );
}
