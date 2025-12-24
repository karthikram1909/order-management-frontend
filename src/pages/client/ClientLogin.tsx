import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientLogin } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });

  const isMandatory = !!returnUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.mobile) {
          toast({ title: "Error", description: "Mobile number is required", variant: "destructive" });
          return;
      }
      
      await clientLogin(formData.name, formData.mobile);
      toast({ title: "Welcome!", description: "You are now logged in." });
      
      // Navigate to returnUrl if exists, else catalog
      if (returnUrl) {
          navigate(returnUrl);
      } else {
          navigate("/client/catalog");
      }
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: error.response?.data?.message || "Please check your details", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-8 py-12 space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
                {isMandatory ? "Login Required" : "Welcome"}
            </h1>
            <p className="text-sm text-muted-foreground">
                {isMandatory 
                    ? "Please login to submit your order." 
                    : "Enter your details to track orders."}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="10-digit number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name (For New Users)</Label>
            <Input
              id="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
          </Button>
        </form>

        {!isMandatory && (
            <div className="text-center">
                <Button variant="link" onClick={() => navigate("/client/catalog")} className="text-muted-foreground">
                    Skip for now <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
