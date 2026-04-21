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
        "grid grid-cols-12 items-center gap-2 sm:gap-4 rounded-lg border border-border/60 bg-card p-3 sm:p-4",
        className
      )}
    >
      <div className="col-span-4 sm:col-span-4 shrink-0">
        <p className="text-[13px] sm:text-sm font-medium text-foreground leading-tight sm:leading-normal">{productName}</p>
        <p className="text-xs text-muted-foreground mt-1 sm:mt-0">
          {quantity} {unit}
        </p>
      </div>
      <div className="col-span-4 sm:col-span-3">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ₹
          </span>
          <Input
            type="number"
            value={price === 0 ? "" : price}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            className="pl-6 pr-2.5 text-right font-medium text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9 sm:h-10"
            disabled={disabled}
            min={0}
            step={0.01}
          />
        </div>
        <p className="mt-1 text-center text-[10px] sm:text-xs text-muted-foreground">
          per {unit}
        </p>
      </div>
      <div className="col-span-1 sm:col-span-2 text-center text-sm text-muted-foreground flex justify-center">
        ×
      </div>
      <div className="col-span-3 sm:col-span-3 text-right">
        <p className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          ₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Line total</p>
      </div>
    </div>
  );
}
