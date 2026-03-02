import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  FileText,
  CreditCard,
  Settings,
  Users,
  Bell,
  LogOut,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Layers },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Clients", href: "/admin/clients", icon: Users },
];

const bottomNavItems = [
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={cn("flex h-screen w-64 flex-col border-r border-border/60 bg-sidebar", className)}>
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-border/60 px-6 bg-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white overflow-hidden border border-slate-100 shadow-sm">
          <img src="/ram-aromatics-logo.jpg" alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-sm font-black tracking-tight text-slate-900 leading-none">RAM AROMATICS</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border/60 p-4">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <Separator className="my-4" />

        {/* User */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground uppercase">
            {user?.email?.[0] || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              Admin User
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || 'admin@company.com'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={async () => {
              await signOut();
              navigate("/admin/login");
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
