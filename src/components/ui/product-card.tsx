import { Minus, Plus, ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  description: string;
  unit: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  imageUrl?: string;
  className?: string;
  compact?: boolean;
}

export function ProductCard({
  name,
  description,
  unit,
  quantity,
  onQuantityChange,
  imageUrl,
  className,
  compact = false,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
        "flex flex-col overflow-hidden border-border/40 shadow-sm hover:shadow-lg transition-all h-full bg-white group",
        compact && "flex-row h-auto items-center",
        className
      )}
    >
      {!compact && (
        <div className={cn(
          "bg-slate-100 overflow-hidden relative",
          "aspect-[16/9] w-full",
          !imageLoaded && imageUrl && !hasError && "animate-pulse bg-slate-200"
        )}>
           {imageUrl && !hasError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                <img 
                    src={imageUrl} 
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={cn(
                      "h-full w-full object-cover transition-all duration-700 group-hover:scale-110",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )} 
                    onError={() => {
                        setHasError(true);
                        setImageLoaded(true);
                    }}
                />
              </>
           ) : (
               <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-400/40">
                   <Sparkles className="h-12 w-12 animate-pulse" />
               </div>
           )}
        </div>
      )}

      <CardContent className={cn("p-5 flex-1 flex flex-col gap-4", compact && "p-4 py-3")}>
        <div className={cn(compact && "mb-0 flex-1 flex flex-col justify-center")}>
            <div className="flex justify-between items-start mb-2">
                <h3 className={cn("font-bold text-lg text-foreground line-clamp-1", compact && "text-base")}>{name}</h3>
                {!compact && (
                    <Badge variant="secondary" className="text-xs font-normal text-muted-foreground bg-secondary/50">
                        {unit}
                    </Badge>
                )}
            </div>
            <p className={cn("text-sm text-muted-foreground line-clamp-2", !compact && "min-h-[2.5rem]", compact && "text-xs line-clamp-1")}>
              {description || "Exotic fragrance extract"}
            </p>
        </div>

        <div className={cn("mt-auto space-y-4", compact && "mt-0 space-y-2 flex flex-col items-end shrink-0")}>
             {!compact ? (
                 <>
                    {/* Unit & Price info */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Unit:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">{unit}</Badge>
                    </div>

                    {/* Price Banner */}
                    <div className="bg-yellow-50 text-yellow-800 text-xs py-2 px-3 rounded-md border border-yellow-200 flex items-center justify-center gap-2 font-medium">
                        <span>💰</span> Price available after inquiry
                    </div>
                </>
             ) : (
                <div className="text-right mb-1">
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100 text-[10px] font-bold uppercase">{unit}</Badge>
                </div>
             )}
             
             {/* Quantity Controls & Add Button - Specialized for Compact */}
             <div className={cn("flex flex-col gap-2 w-full", compact && "flex-row items-center gap-1.5")}>
                 <div className={cn("flex items-center justify-between bg-muted/20 p-1 rounded-lg border border-border/40", compact && "h-9 px-1")}>
                    <Button variant="ghost" size="sm" className={cn("h-8 w-8", compact && "h-7 w-7")} onClick={handleDecrement} disabled={quantity === 0}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className={cn("font-semibold w-8 text-center", compact && "text-sm w-6")}>{quantity}</span>
                    <Button variant="ghost" size="sm" className={cn("h-8 w-8", compact && "h-7 w-7")} onClick={handleIncrement}>
                        <Plus className="h-4 w-4" />
                    </Button>
                 </div>

                 <Button 
                    className={cn(
                        "w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm transition-all",
                        compact && "h-9 px-4 w-auto flex-1 font-bold text-xs",
                        quantity > 0 && compact && "bg-green-600 hover:bg-green-700"
                    )} 
                    onClick={handleIncrement}
                    disabled={quantity > 0 && !compact}
                 >
                     {quantity > 0 ? (compact ? "Add More" : "Add More") : (compact ? "Select Scent" : "Add to Inquiry")}
                 </Button>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
