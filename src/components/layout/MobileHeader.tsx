import { ArrowLeft, Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onProfile?: () => void;
  className?: string;
  rightElement?: React.ReactNode;
}

export function MobileHeader(props: MobileHeaderProps) {
    const {
        title,
        subtitle,
        showBack = false,
        onBack,
        showMenu = false,
        onMenu,
        showNotifications = false,
        notificationCount = 0,
        onNotifications,
        className,
        rightElement,
    } = props;
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-9 w-9 p-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      {showMenu && (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-9 w-9 p-0"
          onClick={onMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        
        {showNotifications && (
            <Button
            variant="ghost"
            size="sm"
            className="relative -mr-2 h-9 w-9 p-0"
            onClick={onNotifications}
            >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {notificationCount > 9 ? "9+" : notificationCount}
                </span>
            )}
            </Button>
        )}
        
        {props.showProfile && (
            <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
                onClick={props.onProfile}
            >
                <User className="h-5 w-5" />
            </Button>
        )}
      </div>
    </header>
  );
}
