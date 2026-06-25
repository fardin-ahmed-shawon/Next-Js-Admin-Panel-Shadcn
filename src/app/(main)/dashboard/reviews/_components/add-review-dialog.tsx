"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const PRODUCT_API_URL = process.env.NEXT_PUBLIC_API_ALL_PRODUCT_URL || "products";
const CUSTOMER_API_URL = process.env.NEXT_PUBLIC_API_CUSTOMER_URL || "customers";
const REVIEW_API_URL = process.env.NEXT_PUBLIC_API_REVIEW_URL || "reviews";

const getProductUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const productPath = PRODUCT_API_URL.replace(/^\/|\/$/g, "");
  console.log("NEXT_PUBLIC_API_ALL_PRODUCT_URL:", PRODUCT_API_URL);
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${productPath}/${cleanPath}` : productPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

const getCustomerUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const customerPath = CUSTOMER_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${customerPath}/${cleanPath}` : customerPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

const getReviewUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const reviewPath = REVIEW_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${reviewPath}/${cleanPath}` : reviewPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface Product {
  id: number;
  title: string;
}

interface Customer {
  id: number;
  full_name: string;
}

interface AddReviewDialogProps {
  onReviewAdded?: () => void;
}

export function AddReviewDialog({ onReviewAdded }: AddReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [formData, setFormData] = useState({
    productId: "",
    customerId: "",
    rating: "",
    text: "",
  });

  // Fetch products
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const url = getProductUrl();
      console.log("Fetching products from:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();
      console.log("Products API response:", result);

      let productsData = [];

      // Handle the nested pagination structure from your API
      if (result.data && result.data.data && Array.isArray(result.data.data)) {
        productsData = result.data.data;
      }
      // Handle direct data array
      else if (result.data && Array.isArray(result.data)) {
        productsData = result.data;
      }
      // Handle array response
      else if (Array.isArray(result)) {
        productsData = result;
      }
      // Handle products wrapper
      else if (result.products && Array.isArray(result.products)) {
        productsData = result.products;
      }

      console.log(`Raw products count: ${productsData.length}`);

      // Log first product to see structure
      if (productsData.length > 0) {
        console.log("Sample product structure:", productsData[0]);
      }

      // Filter active products and map to expected format
      const activeProducts = productsData
        .filter((p: any) => p.status === "active")
        .map((p: any) => ({
          id: p.id,
          // Use product_short_description as the display name since title is just a number
          title: p.product_short_description || p.title || `Product #${p.id}`,
        }));

      console.log(`Active products count: ${activeProducts.length}`);
      console.log("Active products:", activeProducts);

      setProducts(activeProducts);

      if (activeProducts.length === 0) {
        toast.info("No active products found. Please add some products first.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products. Please check if the API is working.");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const url = getCustomerUrl();
      console.log("Fetching customers from:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }

      const result = await response.json();
      console.log("Customers API response:", result);

      let customersData = [];

      // Handle different response structures
      if (result.data && Array.isArray(result.data)) {
        customersData = result.data;
      } else if (Array.isArray(result)) {
        customersData = result;
      } else if (result.customers && Array.isArray(result.customers)) {
        customersData = result.customers;
      }

      console.log(`Customers count: ${customersData.length}`);

      // Map customers to expected format
      const mappedCustomers = customersData.map((c: any) => ({
        id: c.id,
        full_name: c.full_name || c.name || `Customer #${c.id}`,
      }));

      setCustomers(mappedCustomers);

      if (mappedCustomers.length === 0) {
        toast.info("No customers found. Please add some customers first.");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers. Please check if the API is working.");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchCustomers();
    }
  }, [open]);

  const handleSave = async () => {
    if (!formData.productId) {
      toast.error("Please select a product.");
      return;
    }
    if (!formData.customerId) {
      toast.error("Please select a customer.");
      return;
    }
    if (!formData.rating) {
      toast.error("Please select a rating.");
      return;
    }
    if (!formData.text.trim()) {
      toast.error("Please write review text.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = getReviewUrl();
      console.log("Submitting review to:", url);
      console.log("Review data:", {
        product_id: parseInt(formData.productId),
        customer_id: parseInt(formData.customerId),
        ratings: parseInt(formData.rating),
        review_text: formData.text.trim(),
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: parseInt(formData.productId),
          customer_id: parseInt(formData.customerId),
          ratings: parseInt(formData.rating),
          review_text: formData.text.trim(),
        }),
      });

      const result = await response.json();
      console.log("Submit review response:", result);

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to add review");
      }

      toast.success(result.message || "Review added successfully.");
      setOpen(false);
      setFormData({ productId: "", customerId: "", rating: "", text: "" });

      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="size-4" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
          <DialogDescription>Fill in the details to add a new customer product review.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="product">
              Select Product <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.productId}
              onValueChange={(val) => setFormData({ ...formData, productId: val })}
              disabled={isLoadingProducts}
            >
              <SelectTrigger className="w-full" id="product">
                <SelectValue
                  placeholder={
                    isLoadingProducts
                      ? "Loading products..."
                      : products.length === 0
                        ? "No products available"
                        : "-- Select Product --"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProducts && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">Loading products...</div>
                )}
                {!isLoadingProducts && products.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                    No active products available
                  </div>
                )}
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">
              Select Customer <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.customerId}
              onValueChange={(val) => setFormData({ ...formData, customerId: val })}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="w-full" id="customer">
                <SelectValue
                  placeholder={
                    isLoadingCustomers
                      ? "Loading customers..."
                      : customers.length === 0
                        ? "No customers available"
                        : "-- Select Customer --"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCustomers && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">Loading customers...</div>
                )}
                {!isLoadingCustomers && customers.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">No customers available</div>
                )}
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
              <SelectTrigger className="w-full" id="rating">
                <SelectValue placeholder="-- Select Rating --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5 Stars)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Good (4 Stars)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Average (3 Stars)</SelectItem>
                <SelectItem value="2">⭐⭐ Poor (2 Stars)</SelectItem>
                <SelectItem value="1">⭐ Terrible (1 Star)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Select rating from 1 (worst) to 5 (best) stars</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">
              Review Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="text"
              placeholder="Write the review content here..."
              className="min-h-[120px] resize-none"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
