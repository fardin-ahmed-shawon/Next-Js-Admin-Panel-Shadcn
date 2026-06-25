"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface EditReviewDialogProps {
  review: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function EditReviewDialog({ review, open, onOpenChange, onRefresh }: EditReviewDialogProps) {
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
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const result = await response.json();
      let productsData = [];

      // Handle the nested pagination structure
      if (result.data && result.data.data && Array.isArray(result.data.data)) {
        productsData = result.data.data;
      } else if (result.data && Array.isArray(result.data)) {
        productsData = result.data;
      } else if (Array.isArray(result)) {
        productsData = result;
      } else if (result.products && Array.isArray(result.products)) {
        productsData = result.products;
      }

      const activeProducts = productsData
        .filter((p: any) => p.status === "active")
        .map((p: any) => ({
          id: p.id,
          title: p.product_short_description || p.title || `Product #${p.id}`,
        }));

      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const url = getCustomerUrl();
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch customers");

      const result = await response.json();
      let customersData = [];

      if (result.data && Array.isArray(result.data)) {
        customersData = result.data;
      } else if (Array.isArray(result)) {
        customersData = result;
      } else if (result.customers && Array.isArray(result.customers)) {
        customersData = result.customers;
      }

      const mappedCustomers = customersData.map((c: any) => ({
        id: c.id,
        full_name: c.full_name || c.name || `Customer #${c.id}`,
      }));

      setCustomers(mappedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
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

  useEffect(() => {
    if (review && open) {
      setFormData({
        productId: review.productId ? review.productId.replace("PRD-", "") : "",
        customerId: review.customerId ? review.customerId.replace("CUS-", "") : "",
        rating: String(review.rating || ""),
        text: review.text || "",
      });
    }
  }, [review, open]);

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
      const url = getReviewUrl(review.id.toString());
      console.log("Updating review at:", url);
      console.log("Update data:", {
        product_id: parseInt(formData.productId),
        customer_id: parseInt(formData.customerId),
        ratings: parseInt(formData.rating),
        review_text: formData.text.trim(),
      });

      const response = await fetch(url, {
        method: "PUT",
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
      console.log("Update response:", result);

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to update review");
      }

      toast.success(result.message || "Review updated successfully.");
      onOpenChange(false);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>Modify the product review details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-product">
              Select Product <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.productId}
              onValueChange={(val) => setFormData({ ...formData, productId: val })}
              disabled={isLoadingProducts}
            >
              <SelectTrigger className="w-full" id="edit-product">
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
            <Label htmlFor="edit-customer">
              Select Customer <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.customerId}
              onValueChange={(val) => setFormData({ ...formData, customerId: val })}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="w-full" id="edit-customer">
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
            <Label htmlFor="edit-rating">
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
              <SelectTrigger className="w-full" id="edit-rating">
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
            <Label htmlFor="edit-text">
              Review Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-text"
              className="min-h-[120px] resize-none"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Write the review content here..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
