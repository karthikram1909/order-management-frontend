import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutGrid, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CatalogView from "./tabs/CatalogView";
import OrdersView from "./tabs/OrdersView";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/types";
import { getProducts, modifyOrder, submitInquiry, addToLocalHistory } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, Info } from "lucide-react";

interface CartItem {
    productId: string;
    quantity: number;
}

export default function ClientPortal() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut, loading: authLoading } = useAuth();
    const [clientName, setClientName] = useState("Client");
    const [activeTab, setActiveTab] = useState("catalog");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { toast } = useToast();

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
        } else {
            setActiveTab("catalog");
        }
    }, [navigate, location, user, authLoading]);

    // Load cart from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
        }
    }, []);

    // Save cart to local storage
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Load products globally
    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load catalog." });
            } finally {
                setLoadingProducts(false);
            }
        }
        loadProducts();
    }, [toast]);

    const handleQuantityChange = (productId: string, quantity: number) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === productId);
            if (quantity === 0) return prev.filter((item) => item.productId !== productId);
            if (existing) return prev.map((item) => item.productId === productId ? { ...item, quantity } : item);
            return [...prev, { productId, quantity }];
        });
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleRequestQuote = async () => {
        const clientInfoStr = localStorage.getItem("clientInfo") || sessionStorage.getItem("clientInfo");
        if (!clientInfoStr) return;

        const clientInfo = JSON.parse(clientInfoStr);
        const editingOrderId = sessionStorage.getItem("editingOrderId");

        setSubmitLoading(true);
        try {
            const items = cart.map((item) => {
                const product = products.find(p => p._id === item.productId);
                return {
                    itemId: item.productId,
                    quantity: item.quantity,
                    itemName: product?.itemName || "Unknown",
                    unit: product?.unit || "kg"
                };
            });

            let orderData;

            if (editingOrderId) {
                orderData = await modifyOrder(editingOrderId, items);
                sessionStorage.removeItem("editingOrderId");
                toast({ title: "Order Updated", description: "Your changes have been submitted." });
            } else {
                orderData = await submitInquiry({
                    name: clientInfo.name,
                    mobileNumber: clientInfo.mobileNumber,
                    items
                });
                toast({ title: "Request Sent", description: "We have received your requested items." });
            }

            addToLocalHistory(orderData);
            localStorage.removeItem("cart");
            setCart([]);
            navigate("/client/orders");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: "Failed to submit request." });
        } finally {
            setSubmitLoading(false);
        }
    };

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

    const getProductDetails = (productId: string) => {
        return products.find(p => p._id === productId);
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

                        {/* Cart Drawer in Header */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="relative h-9 w-9 border-slate-200">
                                    <ShoppingBag className="h-4 w-4 text-slate-600" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md flex flex-col bg-slate-50 p-0 border-l border-border/40">
                                <SheetHeader className="p-6 pb-4 border-b bg-white">
                                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                                        Shopping Cart
                                    </SheetTitle>
                                    <p className="text-sm text-slate-500">
                                        {totalItems} {totalItems === 1 ? 'item' : 'items'} in your inquiry cart
                                    </p>
                                </SheetHeader>

                                <ScrollArea className="flex-1 p-6">
                                    {cart.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <ShoppingBag className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Your cart is empty.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cart.map((item) => {
                                                const product = getProductDetails(item.productId);
                                                if (!product) return null;

                                                return (
                                                    <div key={item.productId} className="flex gap-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                                                        <div className="h-20 w-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.itemName} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                                    <ShoppingBag className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">{product.itemName}</h4>
                                                                <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize px-1.5 py-0.5 bg-slate-100 rounded-sm inline-block">{product.unit}</p>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-2">
                                                                {/* Drawer cart quantity controls */}
                                                                <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 h-8">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-full w-8 text-slate-500 hover:text-slate-900"
                                                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={item.quantity}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value, 10);
                                                                            if (!isNaN(val) && val > 0) handleQuantityChange(item.productId, val);
                                                                            else if (e.target.value === "") handleQuantityChange(item.productId, 0);
                                                                        }}
                                                                        className="h-full w-10 text-center font-bold text-sm bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                                                                    />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-full w-8 text-slate-500 hover:text-slate-900"
                                                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleQuantityChange(item.productId, 0)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>

                                {cart.length > 0 && (
                                    <div className="p-6 bg-white border-t space-y-4">
                                        <div className="flex items-start gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100 text-sm">
                                            <Info className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                                            <p>Prices are determined upon inquiry review given fluctuating material costs. Submit your request and we will follow up with exact pricing.</p>
                                        </div>
                                        <Button
                                            className="w-full text-base font-bold h-12 bg-blue-600 hover:bg-blue-700 shadow-md"
                                            onClick={handleRequestQuote}
                                            disabled={submitLoading}
                                        >
                                            {submitLoading ? "Submitting..." : sessionStorage.getItem("editingOrderId") ? "Update Catalog Quote" : "Request Free Quote"}
                                        </Button>
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>

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
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <TabsList className="bg-white border shadow-sm p-1 rounded-full h-auto inline-flex whitespace-nowrap">
                            <TabsTrigger
                                value="catalog"
                                className="rounded-full px-6 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-foreground data-[state=active]:shadow-none gap-2 text-muted-foreground"
                            >
                                <LayoutGrid className="h-4 w-4" /> Complete Catalog
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
                        <CatalogView
                            products={products}
                            cart={cart}
                            loading={loadingProducts}
                            onQuantityChange={handleQuantityChange}
                        />
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
