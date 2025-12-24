import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationBannerProps {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const styles = {
  info: "border-status-action/30 bg-status-action-bg text-status-action-foreground",
  success: "border-status-success/30 bg-status-success-bg text-status-success-foreground",
  warning: "border-status-pending/30 bg-status-pending-bg text-status-pending-foreground",
  error: "border-status-danger/30 bg-status-danger-bg text-status-danger-foreground",
};

export function NotificationBanner({
  type,
  title,
  message,
  action,
  onDismiss,
  className,
}: NotificationBannerProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        styles[type],
        className
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {message && (
          <p className="mt-1 text-sm opacity-90">{message}</p>
        )}
        {action && (
          <Button
            variant="link"
            size="sm"
            className="mt-2 h-auto p-0 text-sm font-medium underline-offset-4 hover:underline"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 shrink-0 p-0 opacity-70 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
