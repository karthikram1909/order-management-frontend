import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Package, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getProducts, addProduct, deleteProduct } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ itemName: "", description: "", unit: "kg" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.itemName || !newProduct.unit) {
        toast({ title: "Validation Error", description: "Name and Unit are required", variant: "destructive" });
        return;
    }
    setSubmitting(true);
    try {
        await addProduct(newProduct);
        toast({ title: "Success", description: "Product added successfully" });
        setIsAddOpen(false);
        setNewProduct({ itemName: "", description: "", unit: "kg" });
        fetchProducts();
    } catch (error: any) {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to add product", variant: "destructive" });
    } finally {
        setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete ${name}?`)) return;
      try {
          await deleteProduct(id);
          toast({ title: "Deleted", description: "Product removed." });
          fetchProducts();
      } catch (error) {
          toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
      }
  };

  const filteredProducts = products.filter(p => 
    p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Product Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Add or remove products from the catalog</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter product details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    value={newProduct.itemName}
                    onChange={(e) => setNewProduct({ ...newProduct, itemName: e.target.value })}
                    placeholder="e.g. Onion"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input 
                    id="unit" 
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder="e.g. kg, pcs, box"
                  />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="desc">Description (Optional)</Label>
                    <Input 
                        id="desc" 
                        value={newProduct.description} 
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="e.g. Red onions, medium size"
                    />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddProduct} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search products..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <Card className="border-border/60 shadow-card">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Product Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            {product.itemName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{product.description || "—"}</TableCell>
                                    <TableCell>{product.unit}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteProduct(product._id, product.itemName)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
