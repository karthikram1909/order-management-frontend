import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitInquiry, isClientLoggedIn } from "@/lib/api"; 
import { useToast } from "@/components/ui/use-toast";

export default function ClientIdentify() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // const [step, setStep] = useState<"PHONE" | "OTP">("PHONE"); // Removed
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  
  // Import APIs
  const { toast } = useToast();
  // Assume requestOtp, verifyOtp are imported from @/lib/api.
  // Wait, I need to add them to imports first.
  
  useEffect(() => {
     if (isClientLoggedIn()) {
         const clientStr = sessionStorage.getItem('clientInfo');
         if (clientStr) {
             const client = JSON.parse(clientStr);
             setName(client.name || "");
             setPhone(client.mobileNumber || "");
         }
     }
  }, []);

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
        const { clientLogin } = await import("@/lib/api");
        const response = await clientLogin(name, phone);
        
        const clientInfo = { name, mobileNumber: phone, ...response.client };
        localStorage.setItem("clientInfo", JSON.stringify(clientInfo));
        
        navigate("/client/catalog");
    } catch (error: any) {
        toast({ title: "Error", description: "Could not verify details", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="Enter Details"
        subtitle="Start by entering your number"
      />

      <div className="p-4">
        <Card className="border-border/60 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>
              Please confirm your details for the order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Submit Inquiry"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your information is secure and will only be used for order processing
        </p>
      </div>
    </div>
  );
}
