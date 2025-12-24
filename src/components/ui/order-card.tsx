import { ChevronRight, Clock, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  orderId: string;
  clientName: string;
  itemCount: number;
  total?: number;
  status: "pending" | "action" | "success" | "danger";
  statusLabel: string;
  timestamp: string;
  onClick?: () => void;
  className?: string;
}

export function OrderCard({
  orderId,
  clientName,
  itemCount,
  total,
  status,
  statusLabel,
  timestamp,
  onClick,
  className,
}: OrderCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer border-border/60 shadow-card transition-all hover:border-border hover:shadow-card-hover",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {clientName}
              </span>
              <StatusBadge status={status}>{statusLabel}</StatusBadge>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Order #{orderId.slice(-6).toUpperCase()}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {itemCount} item{itemCount !== 1 && "s"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timestamp}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {total !== undefined && (
              <span className="text-sm font-semibold text-foreground">
                ${total.toLocaleString()}
              </span>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
