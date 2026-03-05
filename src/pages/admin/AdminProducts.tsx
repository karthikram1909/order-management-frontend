import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Package, Loader2, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
import { getProducts, addProduct, deleteProduct, uploadProductImage, updateProduct } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminProducts() {
  const { isBypass } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ itemName: "", description: "", unit: "kg", imageUrl: "", category: "Materials" });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error(error);
      const status = error.status || error.response?.status;
      if (status === 401 || error.code === 'PGRST301') {
          window.location.href = "/admin/login";
          return;
      }
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct.itemName || !editingProduct.unit) {
        toast({ title: "Validation Error", description: "Name and Unit are required", variant: "destructive" });
        return;
    }

    if (isBypass) {
        toast({ 
            title: "Permission Denied", 
            description: "You are logged in via Bypass Mode. Update operations require a real Supabase admin account.", 
            variant: "destructive" 
        });
        return;
    }

    setSubmitting(true);
    try {
        let imageUrl = editingProduct.imageUrl;
        if (selectedFile) {
            imageUrl = await uploadProductImage(selectedFile);
        }
        await updateProduct(editingProduct._id, { ...editingProduct, imageUrl });
        toast({ title: "Success", description: "Product updated successfully" });
        setEditingProduct(null);
        setSelectedFile(null);
        fetchProducts();
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to update product", variant: "destructive" });
    } finally {
        setSubmitting(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.itemName || !newProduct.unit) {
        toast({ title: "Validation Error", description: "Name and Unit are required", variant: "destructive" });
        return;
    }
    
    if (isBypass) {
        toast({ 
            title: "Permission Denied", 
            description: "You are logged in via Bypass Mode. This mode is read-only. To add products, please log in with a real Supabase admin account.", 
            variant: "destructive" 
        });
        return;
    }

    setSubmitting(true);
    try {
        let imageUrl = newProduct.imageUrl;

        // Upload image first if selected
        if (selectedFile) {
            imageUrl = await uploadProductImage(selectedFile);
        }

        await addProduct({ ...newProduct, imageUrl });
        toast({ title: "Success", description: "Product added successfully" });
        setIsAddOpen(false);
        setNewProduct({ itemName: "", description: "", unit: "kg", imageUrl: "", category: "Materials" });
        setSelectedFile(null);
        fetchProducts();
    } catch (error: any) {
        // Handle Auth Error
        const status = error.status || error.response?.status;
        if (status === 401 || error.code === 'PGRST301') {
            window.location.href = "/admin/login";
            return;
        }
        toast({ title: "Error", description: error.message || "Failed to add product", variant: "destructive" });
    } finally {
        setSubmitting(false);
    }
  };
  const handleDeleteProduct = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete ${name}?`)) return;

      if (isBypass) {
          toast({ 
              title: "Permission Denied", 
              description: "You are logged in via Bypass Mode. Delete operations require a real Supabase admin account.", 
              variant: "destructive" 
          });
          return;
      }
      
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

  const totalUnits = new Set(products.map(p => p.unit)).size;

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        {/* Superior Header Styling */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Product Catalog
            </h1>
            <p className="text-muted-foreground text-base max-w-lg">
              Manage your global inventory, update images, and maintain product specifications.
            </p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 gap-2 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-5 w-5" />
                <span>Add New Product</span>
              </Button>
            </DialogTrigger>
            {/* Modal Styling remains robust - focused on layout for now */}
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Product</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create a professional catalog entry for your new item.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Product Name</Label>
                  <Input 
                    id="name" 
                    value={newProduct.itemName}
                    onChange={(e) => setNewProduct({ ...newProduct, itemName: e.target.value })}
                    placeholder="e.g. Weightless Charcoal"
                    className="h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-sm font-semibold">Channel / Category</Label>
                    <select 
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="h-11 w-full rounded-md bg-muted/30 border-none px-3 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Materials">Raw Materials (Catalog)</option>
                      <option value="Agarbatti">Agarbatti Scent Bar</option>
                      <option value="Sambrani">Sambrani Scent Bar</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit" className="text-sm font-semibold">Base Unit</Label>
                    <Input 
                      id="unit" 
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      placeholder="e.g. kg"
                      className="h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="desc" className="text-sm font-semibold">Description</Label>
                    <Input 
                        id="desc" 
                        value={newProduct.description} 
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Refined charcoal for industrial use"
                        className="h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-sm font-semibold">Product Media</Label>
                  <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 transition-colors hover:border-blue-400 bg-muted/10 cursor-pointer">
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {selectedFile ? (
                        <div className="relative h-24 w-32 rounded-lg overflow-hidden border shadow-sm">
                            <img src={URL.createObjectURL(selectedFile)} className="h-full w-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="h-6 w-6 text-white" />
                             </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-blue-500 transition-colors">
                            <Package className="h-8 w-8 mb-1" />
                            <span className="text-xs font-medium uppercase tracking-wider">Browse File</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="h-11 px-8 text-muted-foreground">Cancel</Button>
                <Button onClick={handleAddProduct} disabled={submitting} className="h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Package className="h-20 w-20 text-blue-600" />
                </div>
                <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total SKU</p>
                    <h3 className="text-3xl font-bold text-foreground">{products.length} Items</h3>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                        Inventory Live ⚡
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Search className="h-20 w-20 text-indigo-600" />
                </div>
                <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Unit Types</p>
                    <h3 className="text-3xl font-bold text-foreground">{totalUnits} Categories</h3>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 w-fit px-2 py-1 rounded">
                         Standardized ✅
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-xl shadow-blue-100 group relative">
                <CardContent className="p-6 text-white">
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest mb-1">Search Database</p>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                        <Input 
                            placeholder="Find inventory..." 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-10 h-10 ring-offset-blue-600 focus-visible:ring-white/40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Global Catalog Container */}
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/[0.02] overflow-hidden transition-all hover:shadow-black/[0.04]">
            <div className="bg-muted/30 px-8 py-5 border-b border-border/40 flex items-center justify-between">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    Central Inventory List
                 </h2>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-white px-2 py-1 rounded-full border border-border/40 shadow-sm leading-none">
                    Real-time Sync
                 </span>
            </div>
            
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[380px] h-14 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Product Details</TableHead>
                            <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Category</TableHead>
                            <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Description</TableHead>
                            <TableHead className="h-14 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Measurement</TableHead>
                            <TableHead className="text-right h-14 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-72 text-center border-none">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-10 w-10 animate-spin text-blue-600/40" />
                                        <p className="text-sm text-muted-foreground/60 font-medium italic">Fetching manifest...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-72 text-center border-none">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center">
                                            <Search className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold text-foreground">Entry not found</p>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">No products matching your search were found in the master database.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-2 text-blue-600 border-blue-100 hover:bg-blue-50">Clear Filter</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product, idx) => (
                                <TableRow key={product._id} className="group border-b border-border/30 hover:bg-blue-50/20 transition-colors">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className="relative group/img flex-shrink-0">
                                                <div className="h-14 w-14 rounded-2xl border border-border/40 bg-white overflow-hidden shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-md">
                                                    {product.imageUrl ? (
                                                    <img 
                                                        src={product.imageUrl} 
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="h-full w-full object-cover transition-opacity hover:opacity-90" 
                                                        alt={product.itemName}
                                                    />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-muted/20">
                                                            <Package className="h-6 w-6 text-muted-foreground/30 font-thin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -top-1 -left-1 h-5 w-5 bg-blue-600 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold shadow-sm">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-base text-foreground group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">
                                                    {product.itemName}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground/40 font-mono tracking-widest uppercase truncate max-w-[150px]">
                                                    ID: {product._id.slice(-8)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                         <Badge variant="outline" className={cn(
                                             "capitalize font-bold text-[10px]",
                                             product.category === 'Agarbatti' ? "text-blue-600 bg-blue-50 border-blue-100" : 
                                             product.category === 'Sambrani' ? "text-indigo-600 bg-indigo-50 border-indigo-100" :
                                             "text-slate-600 bg-slate-50 border-slate-100"
                                         )}>
                                             {product.category || "General"}
                                         </Badge>
                                     </TableCell>
                                    <TableCell className="max-w-[100px]">
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                            {product.description || <span className="text-muted-foreground/30 italic font-normal">No metadata provided</span>}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-white border text-blue-700 px-3 py-1 rounded-full font-bold text-[11px] shadow-sm uppercase tracking-wider">
                                            {product.unit}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-xl border-border/40 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                                onClick={() => setEditingProduct(product)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-xl border-border/40 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                onClick={() => handleDeleteProduct(product._id, product.itemName)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {!loading && filteredProducts.length > 0 && (
                <div className="px-8 py-5 bg-muted/10 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    <span>Database active</span>
                    <span>Total products displayed: {filteredProducts.length}</span>
                </div>
            )}
        </div>

        {/* Enhanced Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-hidden p-0">
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-6 pt-10">
                <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Update Entry</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                    Modifying system data for <span className="font-bold text-foreground">"{editingProduct?.itemName}"</span>
                </DialogDescription>
                </DialogHeader>
                {editingProduct && (
                <div className="grid gap-6 py-6 overflow-y-auto max-h-[60vh] px-1">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name" className="text-sm font-semibold">SKU Name</Label>
                        <Input 
                            id="edit-name" 
                            value={editingProduct.itemName}
                            onChange={(e) => setEditingProduct({ ...editingProduct, itemName: e.target.value })}
                            className="h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category" className="text-sm font-semibold">Channel</Label>
                            <select 
                                id="edit-category"
                                value={editingProduct.category || "Materials"}
                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                className="h-11 w-full rounded-md bg-muted/30 border-none px-3 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                 <option value="Materials">Raw Materials</option>
                                 <option value="Agarbatti">Agarbatti</option>
                                 <option value="Sambrani">Sambrani</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-unit" className="text-sm font-semibold">Base Unit</Label>
                            <Input 
                                id="edit-unit" 
                                value={editingProduct.unit}
                                onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                                className="h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-desc" className="text-sm font-semibold">Manifest Description</Label>
                        <Input 
                            id="edit-desc" 
                            value={editingProduct.description || ""} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                    </div>
                    <div className="grid gap-4">
                        <Label className="text-sm font-semibold">Asset Payload</Label>
                        <div className="flex items-center gap-4">
                            <Input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="h-14 bg-muted/10 border-dashed border-2 cursor-pointer flex-1"
                            />
                            {(selectedFile || editingProduct.imageUrl) && (
                                <div className="h-14 w-14 rounded-lg border-2 border-white shadow-md overflow-hidden bg-muted flex-shrink-0">
                                    <img src={selectedFile ? URL.createObjectURL(selectedFile) : editingProduct.imageUrl} className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}
                <DialogFooter className="gap-3 pt-4">
                <Button variant="ghost" onClick={() => setEditingProduct(null)} className="h-11 px-8 text-muted-foreground">Cancel</Button>
                <Button onClick={handleUpdateProduct} disabled={submitting} className="h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit Changes"}
                </Button>
                </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
