import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminLogin, isClientLoggedIn } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Client Form State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientLoading, setClientLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState<{ name?: string; phone?: string }>({});

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

    useEffect(() => {
     if (isClientLoggedIn()) {
         const clientStr = localStorage.getItem('clientInfo') || sessionStorage.getItem('clientInfo');
         if (clientStr) {
             const client = JSON.parse(clientStr);
             setClientName(client.name || "");
             setClientPhone(client.mobileNumber || "");
         }
     }
  }, []);

  const validateClient = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!clientName.trim()) newErrors.name = "Name is required";
    if (!clientPhone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(clientPhone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid phone number";
    }
    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClient()) return;
    setClientLoading(true);

    try {
        // Authenticate to get token
        const { clientLogin } = await import("@/lib/api");
        const response = await clientLogin(clientName, clientPhone);
        
        // clientLogin helper already sets clientToken in localStorage
        // We also ensure clientInfo is persistent in localStorage (api helper does sessionStorage by default, let's fix that here or there)
        const clientInfo = { name: clientName, mobileNumber: clientPhone, ...response.client };
        localStorage.setItem("clientInfo", JSON.stringify(clientInfo));
        
        navigate("/client/catalog");
    } catch (error: any) {
        console.error(error);
        toast({ title: "Access Failed", description: error.response?.data?.message || "Could not login. Please try again.", variant: "destructive" });
    } finally {
        setClientLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      await adminLogin(adminEmail, adminPassword);
      // adminLogin already sets token in localStorage
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-800">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none"></div>

      {/* Header Section */}
      <div className="mb-8 text-center space-y-4 relative z-10 text-white">
        <div className="mx-auto w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl mb-6">
             <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">Order Management System</h1>
        <p className="text-lg text-blue-100 font-light tracking-wide">Enterprise-grade workflow management</p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur rounded-xl overflow-hidden z-10">
        <Tabs defaultValue="client" className="w-full">
            <div className="p-1 mx-6 mt-6 bg-slate-100/80 rounded-lg p-1">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-1">
                <TabsTrigger 
                  value="client"
                  className="rounded-md py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all"
                >
                  <User className="w-4 h-4 mr-2" />
                  Client Portal
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  className="rounded-md py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin Portal
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6 md:p-8 pt-6">
                <TabsContent value="client" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">Client Access</h2>
                        <p className="text-sm text-slate-500">Enter your details to browse catalog and submit inquiries</p>
                    </div>

                    <form onSubmit={handleClientSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName" className="font-medium text-slate-700">Full Name</Label>
                             <Input
                                id="clientName"
                                placeholder="Enter your name"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                            {clientErrors.name && <p className="text-xs text-red-500">{clientErrors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clientPhone" className="font-medium text-slate-700">Mobile Number</Label>
                            <Input
                                id="clientPhone"
                                type="tel"
                                placeholder="Enter your mobile number"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                            {clientErrors.phone && <p className="text-xs text-red-500">{clientErrors.phone}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]" disabled={clientLoading}>
                             {clientLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Access Client Portal"}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="admin" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">Admin Access</h2>
                        <p className="text-sm text-slate-500">Login to manage orders, pricing, and settings</p>
                    </div>

                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="adminEmail" className="font-medium text-slate-700">Email Address</Label>
                             <Input
                                id="adminEmail"
                                type="email"
                                placeholder="admin@company.com"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminPassword" className="font-medium text-slate-700">Password</Label>
                            <Input
                                id="adminPassword"
                                type="password"
                                placeholder="••••••••"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.01]" disabled={adminLoading}>
                             {adminLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Login to Dashboard"}
                        </Button>
                    </form>
                </TabsContent>
            </CardContent>
        </Tabs>
      </Card>
      
      <div className="mt-8 text-blue-200/60 text-sm font-light">
        &copy; {new Date().getFullYear()} Dynamic Pricing System. All rights reserved.
      </div>
    </div>
  );
}
