import { Link } from "react-router-dom";
import { Package, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Snowfall from "react-snowfall";
const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Snowfall color="#3b82f6" style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 50 }} radius={[0.5, 3.0]} snowflakeCount={200} />
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">DP-OMS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/client">Client Portal</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Admin Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Dynamic Pricing
            <br />
            <span className="text-primary">Order Management</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Replace WhatsApp and phone-based ordering with a structured,
            negotiation-driven workflow. Fast, transparent, and scalable.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Client Portal Card */}
            <Card className="cursor-pointer border-border/60 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover">
              <Link to="/client">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Client Portal</CardTitle>
                  <CardDescription>
                    Browse products, request quotes, and track orders from your mobile device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="gap-2 p-0 text-primary">
                    Open Client View
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Admin Dashboard Card */}
            <Card className="cursor-pointer border-border/60 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover">
              <Link to="/admin">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-success/10 text-status-success">
                    <Package className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Admin Dashboard</CardTitle>
                  <CardDescription>
                    Manage orders, set prices, track payments, and oversee operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="gap-2 p-0 text-primary">
                    Open Admin Panel
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Enterprise-grade order management. Built for scale.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
