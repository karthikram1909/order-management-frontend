import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        pending: "bg-status-pending-bg text-status-pending-foreground",
        action: "bg-status-action-bg text-status-action-foreground",
        success: "bg-status-success-bg text-status-success-foreground",
        danger: "bg-status-danger-bg text-status-danger-foreground",
        neutral: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "neutral",
      size: "default",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean;
}

export function StatusBadge({
  className,
  status,
  size,
  dot = true,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "pending" && "bg-status-pending",
            status === "action" && "bg-status-action",
            status === "success" && "bg-status-success",
            status === "danger" && "bg-status-danger",
            status === "neutral" && "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </span>
  );
}
