import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, LogOut, Mail, ShieldCheck } from "lucide-react";

export default function AdminSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and system preferences.</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Admin Profile</CardTitle>
              </div>
              <CardDescription>Your account information and credentials.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {user?.email?.[0].toUpperCase() || 'A'}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Administrator</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded text-xs font-bold mt-2">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Admin Account</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Actions</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="destructive" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Details about the current environment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">App Version</span>
                <span className="font-medium">1.2.0-production</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Connected DB</span>
                <span className="font-medium text-blue-600">Supabase (Main)</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 py-4 flex justify-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                RAM AROMATICS &copy; 2026 • Secure Infrastructure
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
