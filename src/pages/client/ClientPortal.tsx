import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutGrid, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CatalogView from "./tabs/CatalogView";
import OrdersView from "./tabs/OrdersView";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading } = useAuth();
  const [clientName, setClientName] = useState("Client");
  const [activeTab, setActiveTab] = useState("catalog");

  useEffect(() => {
    // Auth Check
    const clientInfoStr = localStorage.getItem("clientInfo") || sessionStorage.getItem("clientInfo");
    if (!clientInfoStr && !user && !authLoading) {
        navigate("/");
        return;
    }
    if (clientInfoStr) {
        const clientInfo = JSON.parse(clientInfoStr);
        setClientName(clientInfo.name || user?.user_metadata?.name || "Client");
    }

    // Initial Tab Check based on URL
    if (location.pathname.includes('/orders')) {
        setActiveTab("orders");
    } else if (location.pathname.includes('/agarbatti') || location.pathname.includes('/fragrances') || location.pathname.includes('/perfumes')) {
        setActiveTab("agarbatti");
    } else if (location.pathname.includes('/sambrani')) {
        setActiveTab("sambrani");
    } else {
        setActiveTab("catalog");
    }
  }, [navigate, location, user, authLoading]);

  const handleLogout = async () => {
      await signOut();
      navigate("/");
  };

  const handleTabChange = (value: string) => {
      setActiveTab(value);
      // Sync URL
      if (value === "orders") navigate("/client/orders");
      else if (value === "agarbatti") navigate("/client/agarbatti");
      else if (value === "sambrani") navigate("/client/sambrani");
      else navigate("/client/catalog");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
       {/* White Premium Header */}
       <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
           <div className="container mx-auto px-4 h-20 flex items-center justify-between">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center">
                       <img src="/ram-aromatics-logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                   </div>
                   <div>
                       <h1 className="text-xl font-extrabold tracking-tighter text-slate-900 leading-none">RAM AROMATICS</h1>
                       <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mt-1">Client Portal</p>
                   </div>
               </div>
               
               <div className="flex items-center gap-4">
                   <div className="hidden md:block text-right mr-2">
                       <p className="text-sm font-medium text-slate-900">Welcome, {clientName}</p>
                       <p className="text-[10px] text-slate-400">Authenticated Access</p>
                   </div>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 gap-2 font-semibold"
                    onClick={handleLogout}
                   >
                       <LogOut className="h-4 w-4" />
                       <span className="hidden sm:inline">Logout</span>
                   </Button>
               </div>
           </div>
       </header>

       <main className="container mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex justify-center md:justify-start">
                    <TabsList className="bg-white border shadow-sm p-1 rounded-full h-auto">
                        <TabsTrigger 
                            value="catalog" 
                            className="rounded-full px-6 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-foreground data-[state=active]:shadow-none gap-2 text-muted-foreground"
                        >
                            <LayoutGrid className="h-4 w-4" /> Raw Materials
                        </TabsTrigger>
                        <TabsTrigger 
                            value="agarbatti" 
                            className="rounded-full px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none gap-2 text-muted-foreground"
                        >
                            <ShoppingBag className="h-4 w-4" /> Agarbatti
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sambrani" 
                            className="rounded-full px-6 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none gap-2 text-muted-foreground"
                        >
                            <ShoppingBag className="h-4 w-4" /> Sambrani
                        </TabsTrigger>
                        <TabsTrigger 
                            value="orders" 
                            className="rounded-full px-6 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-foreground data-[state=active]:shadow-none gap-2 text-muted-foreground"
                        >
                            <FileText className="h-4 w-4" /> My Orders
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content */}
                <TabsContent value="catalog" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Raw Materials</h2>
                        <p className="text-slate-500">Essential supplies for your production.</p>
                    </div>
                    <CatalogView filter="Materials" />
                </TabsContent>

                <TabsContent value="agarbatti" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">Agarbatti Scent Bar</h2>
                        <p className="text-slate-500">Exotic fragrance extracts for Agarbatti production.</p>
                    </div>
                    <CatalogView filter="Agarbatti" mode="grid-compact" />
                </TabsContent>

                <TabsContent value="sambrani" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-indigo-900">Sambrani Scent Bar</h2>
                        <p className="text-slate-500">Premium fragrance extracts for Sambrani production.</p>
                    </div>
                    <CatalogView filter="Sambrani" mode="grid-compact" />
                </TabsContent>

                <TabsContent value="orders" className="mt-0 animate-in fade-in-50 duration-300">
                     <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">My Orders</h2>
                        <p className="text-slate-500">Track your inquiries and orders</p>
                    </div>
                    <OrdersView />
                </TabsContent>
            </Tabs>
       </main>
    </div>
  );
}
