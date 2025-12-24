import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "info" | "success" | "warning" | "danger";
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const iconStyles = {
  info: "text-status-action bg-status-action-bg",
  success: "text-status-success bg-status-success-bg",
  warning: "text-status-pending bg-status-pending-bg",
  danger: "text-status-danger bg-status-danger-bg",
};

export function ConfirmationModal({
  open,
  onOpenChange,
  type = "info",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  const Icon = icons[type];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                iconStyles[type]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="text-left">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-left">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex-row gap-2 sm:justify-end">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={loading}
            className="mt-0 flex-1 sm:flex-none"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 sm:flex-none",
              type === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
