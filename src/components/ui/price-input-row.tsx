import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PriceInputRowProps {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  onPriceChange: (price: number) => void;
  disabled?: boolean;
  className?: string;
}

export function PriceInputRow({
  productName,
  quantity,
  unit,
  price,
  onPriceChange,
  disabled = false,
  className,
}: PriceInputRowProps) {
  const lineTotal = quantity * price;

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-center gap-4 rounded-lg border border-border/60 bg-card p-4",
        className
      )}
    >
      <div className="col-span-4">
        <p className="text-sm font-medium text-foreground">{productName}</p>
        <p className="text-xs text-muted-foreground">
          {quantity} {unit}
        </p>
      </div>
      <div className="col-span-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            value={price}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            className="pl-7 text-right"
            disabled={disabled}
            min={0}
            step={0.01}
          />
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          per {unit}
        </p>
      </div>
      <div className="col-span-2 text-center text-sm text-muted-foreground">
        ×
      </div>
      <div className="col-span-3 text-right">
        <p className="text-sm font-semibold text-foreground">
          ${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground">Line total</p>
      </div>
    </div>
  );
}
