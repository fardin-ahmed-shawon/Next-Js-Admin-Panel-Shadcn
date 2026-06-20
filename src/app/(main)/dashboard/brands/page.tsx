"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBrandDialog } from "./_components/add-brand-dialog";
import { BrandsStats } from "./_components/brands-stats";
import { BrandsTable } from "./_components/brands-table";
import { toast } from "sonner";

export default function BrandsPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [brandsData, setBrandsData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    total: 0,
    newThisMonth: 0,
    totalProducts: 0,
    topTier: 0
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/admin';
  const BRANDS_URL = process.env.NEXT_PUBLIC_API_BRANDS_URL || 'brands';
  const API_URL = `${API_BASE_URL}/${BRANDS_URL}`;

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.success) {
        const formattedData = result.data.map((item: any) => ({
          id: `BRD-${item.id.toString().padStart(3, '0')}`,
          name: item.name,
          totalProducts: item.products_count || 0,
          logo: item.logo || `https://placehold.co/80x80/1a1a2e/e0e0e0?text=${item.name.substring(0,2).toUpperCase()}`,
          joinedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        
        setBrandsData(formattedData);
        
        // Update stats
        setStats({
          total: formattedData.length,
          newThisMonth: formattedData.length,
          totalProducts: formattedData.reduce((sum: number, brand: any) => sum + brand.totalProducts, 0),
          topTier: Math.ceil(formattedData.length * 0.3),
        });
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  // Update brand
  const handleUpdateBrand = async (id: string, formData: FormData) => {
    try {
      const numericId = id.replace('BRD-', '');
      const response = await fetch(`${API_URL}/${numericId}`, {
        method: 'POST',
        headers: {
          'X-HTTP-Method-Override': 'PUT',
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Brand updated successfully");
        await fetchBrands();
        return true;
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(', '));
        } else {
          toast.error(result.message || "Failed to update brand");
        }
        return false;
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Failed to update brand");
      return false;
    }
  };

  // Delete brand
  const handleDeleteBrand = async (id: string) => {
    try {
      const numericId = id.replace('BRD-', '');
      const response = await fetch(`${API_URL}/${numericId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Brand deleted successfully");
        await fetchBrands();
      } else {
        toast.error(result.message || "Failed to delete brand");
      }
    } catch (error) {
      toast.error("Failed to delete brand");
    }
  };

  // Add brand
  const handleAddBrand = async (formData: FormData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Brand added successfully");
        await fetchBrands();
        return true;
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(', '));
        } else {
          toast.error(result.message || "Failed to add brand");
        }
        return false;
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error("Failed to add brand");
      return false;
    }
  };

  React.useEffect(() => {
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Brands</h1>
            <p className="text-muted-foreground text-sm">Manage all product brands and their status.</p>
          </div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Brands</h1>
          <p className="text-muted-foreground text-sm">Manage all product brands and their status.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add Brand
          </Button>
          <AddBrandDialog 
            open={isAddOpen} 
            onOpenChange={setIsAddOpen}
            onAddBrand={handleAddBrand}
          />
        </div>
      </div>

      <BrandsStats 
        totalBrands={stats.total}
        newThisMonth={stats.newThisMonth}
        totalProducts={stats.totalProducts}
        topTier={stats.topTier}
      />
      <BrandsTable 
        data={brandsData} 
        onDelete={handleDeleteBrand}
        onUpdate={handleUpdateBrand}
        onRefresh={fetchBrands}
      />
    </div>
  );
}