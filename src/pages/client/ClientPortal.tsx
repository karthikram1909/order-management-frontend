import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutGrid, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CatalogView from "./tabs/CatalogView";
import OrdersView from "./tabs/OrdersView";
import { Badge } from "@/components/ui/badge";

export default function ClientPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [clientName, setClientName] = useState("Client");
  const [activeTab, setActiveTab] = useState("catalog");

  useEffect(() => {
    // Auth Check
    const clientInfoStr = localStorage.getItem("clientInfo") || sessionStorage.getItem("clientInfo");
    if (!clientInfoStr) {
        navigate("/");
        return;
    }
    const clientInfo = JSON.parse(clientInfoStr);
    setClientName(clientInfo.name);

    // Initial Tab Check based on URL
    if (location.pathname.includes('/orders')) {
        setActiveTab("orders");
    } else {
        setActiveTab("catalog");
    }
  }, [navigate, location]);

  const handleLogout = () => {
      localStorage.removeItem("clientInfo");
      sessionStorage.removeItem("clientInfo");
      navigate("/");
  };

  const handleTabChange = (value: string) => {
      setActiveTab(value);
      // Sync URL
      if (value === "orders") navigate("/client/orders");
      else navigate("/client/catalog");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
       {/* Blue Header */}
       <header className="bg-blue-600 text-white sticky top-0 z-50 shadow-md">
           <div className="container mx-auto px-4 h-16 flex items-center justify-between">
               <div>
                   <h1 className="text-xl font-bold tracking-tight">Client Portal</h1>
                   <p className="text-xs text-blue-100 opacity-90">Welcome, {clientName}</p>
               </div>
               <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-blue-700 hover:text-white gap-2"
                onClick={handleLogout}
               >
                   <LogOut className="h-4 w-4" />
                   <span className="hidden sm:inline">Logout</span>
               </Button>
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
                            <LayoutGrid className="h-4 w-4" /> Browse Catalog
                        </TabsTrigger>
                        <TabsTrigger 
                            value="orders" 
                            className="rounded-full px-6 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-foreground data-[state=active]:shadow-none gap-2 text-muted-foreground"
                        >
                            <FileText className="h-4 w-4" /> My Orders
                            <Badge variant="secondary" className="ml-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">2</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content */}
                <TabsContent value="catalog" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
                        <p className="text-slate-500">Browse items and submit your inquiry. Pricing will be provided by our team.</p>
                    </div>
                    <CatalogView />
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
