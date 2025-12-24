import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Client Pages
import ClientPortal from "./pages/client/ClientPortal";
import ClientIdentify from "./pages/client/ClientIdentify";
import QuoteReview from "./pages/client/QuoteReview";
import OrderStatus from "./pages/client/OrderStatus";
import ClientLogin from "./pages/client/ClientLogin";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPayments from "./pages/admin/AdminPayments";

import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Client Routes */}
          <Route path="/client" element={<ClientIdentify />} /> 
          
          {/* Main Portal Route */}
          <Route path="/client/catalog" element={<ClientPortal />} />
          <Route path="/client/orders" element={<ClientPortal />} /> {/* Both point to portal, tab handles logic */}
          
          <Route path="/client/identify" element={<ClientIdentify />} />
          <Route path="/client/review" element={<QuoteReview />} />
          <Route path="/client/status/:orderId" element={<OrderStatus />} />
          
          {/* Hidden/Aux Routes */}
          <Route path="/client/login" element={<ClientLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminDashboard />} />
          <Route path="/admin/pricing" element={<AdminDashboard />} />
          <Route path="/admin/invoices" element={<AdminDashboard />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/clients" element={<AdminDashboard />} />
          <Route path="/admin/notifications" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/admin/pricing/:orderId" element={<AdminPricing />} />
          <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
