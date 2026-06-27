"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchClient } from "@/lib/fetch-client";

export function WebsiteInfoTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: "",
    address: "",
    inside_location: "",
    inside_shipping_charge: 0,
    outside_shipping_charge: 0,
    phone: "",
    wp_api_num: "",
    messenger_username: "",
    mobile_banking_acc_num: "",
    email: "",
    fb_link: "",
    insta_link: "",
    twitter_link: "",
    yt_link: "",
    google_map_location: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-settings`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setFormData({
              brand_name: res.data.brand_name || "",
              address: res.data.address || "",
              inside_location: res.data.inside_location || "",
              inside_shipping_charge: Number(res.data.inside_shipping_charge) || 0,
              outside_shipping_charge: Number(res.data.outside_shipping_charge) || 0,
              phone: res.data.phone || "",
              wp_api_num: res.data.wp_api_num || "",
              messenger_username: res.data.messenger_username || "",
              mobile_banking_acc_num: res.data.mobile_banking_acc_num || "",
              email: res.data.email || "",
              fb_link: res.data.fb_link || "",
              insta_link: res.data.insta_link || "",
              twitter_link: res.data.twitter_link || "",
              yt_link: res.data.yt_link || "",
              google_map_location: res.data.google_map_location || "",
            });
          }
        } else {
          toast.error("Failed to load website settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("An error occurred while loading settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("charge") ? Number(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast.success("Website settings updated successfully");
      } else {
        if (res.errors) {
          const firstError = Object.values(res.errors)[0];
          if (Array.isArray(firstError)) {
            toast.error(firstError[0] || "Failed to update website settings");
          } else {
            toast.error("Failed to update website settings");
          }
        } else {
          toast.error(res.message || "Failed to update website settings");
        }
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground animate-pulse">Loading website settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Update Website Information</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure general website information and delivery pricing.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Website Name</label>
          <Input name="brand_name" value={formData.brand_name} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Address</label>
          <Input name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Inside Delivery Location (Your District Location)
          </label>
          <Input name="inside_location" value={formData.inside_location} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Inside Delivery Charge (৳)</label>
            <Input type="number" name="inside_shipping_charge" value={formData.inside_shipping_charge} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Outside Delivery Charge (৳)</label>
            <Input type="number" name="outside_shipping_charge" value={formData.outside_shipping_charge} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              WhatsApp API Number (Without first '0', e.g., 1724923068)
            </label>
            <Input name="wp_api_num" value={formData.wp_api_num} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Messenger Username</label>
            <Input name="messenger_username" value={formData.messenger_username} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Account Number (Mobile Banking)</label>
            <Input name="mobile_banking_acc_num" value={formData.mobile_banking_acc_num} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Facebook Link</label>
            <Input name="fb_link" value={formData.fb_link} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Instagram Link</label>
            <Input name="insta_link" value={formData.insta_link} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Twitter Link</label>
            <Input name="twitter_link" value={formData.twitter_link} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">YouTube Link</label>
            <Input name="yt_link" value={formData.yt_link} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Google Map Location Embed URL</label>
          <Input name="google_map_location" value={formData.google_map_location} onChange={handleChange} />
        </div>
      </div>

      <div className="pt-4 pb-8">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
