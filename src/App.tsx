import { Toaster } from "@/components/ui/toaster";
import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Auth
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

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
import AdminProducts from "./pages/admin/AdminProducts";
import AdminClients from "./pages/admin/AdminClients";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";

import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <ToasterSonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Client Routes */}
            <Route path="/client" element={<ProtectedRoute role="client"><ClientIdentify /></ProtectedRoute>} /> 
            
            {/* Main Portal Route */}
            <Route path="/client/catalog" element={<ProtectedRoute role="client"><ClientPortal /></ProtectedRoute>} />
            <Route path="/client/agarbatti" element={<ProtectedRoute role="client"><ClientPortal /></ProtectedRoute>} />
            <Route path="/client/sambrani" element={<ProtectedRoute role="client"><ClientPortal /></ProtectedRoute>} />
            <Route path="/client/perfumes" element={<ProtectedRoute role="client"><ClientPortal /></ProtectedRoute>} />
            <Route path="/client/fragrances" element={<ProtectedRoute role="client"><ClientPortal /></ProtectedRoute>} />
            <Route path="/client/orders" element={<ProtectedRoute role="client"><ClientPortal /></ProtectedRoute>} />
            
            <Route path="/client/identify" element={<ClientIdentify />} />
            <Route path="/client/review" element={<ProtectedRoute role="client"><QuoteReview /></ProtectedRoute>} />
            <Route path="/client/status/:orderId" element={<ProtectedRoute role="client"><OrderStatus /></ProtectedRoute>} />
            
            {/* Hidden/Aux Routes */}
            <Route path="/client/login" element={<ClientLogin />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/pricing" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/invoices" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute role="admin"><AdminClients /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/pricing/:orderId" element={<ProtectedRoute role="admin"><AdminPricing /></ProtectedRoute>} />
            <Route path="/admin/orders/:orderId" element={<ProtectedRoute role="admin"><AdminOrderDetail /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
