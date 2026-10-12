"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { createCustomer } from "@/hooks/useCustomers";

const defaults = {
  full_name: "",
  phone: "",
  email: "",
  gender: "unknown",
  address: "",
  city: "",
  district: "",
  division: "",
  customer_type: "Retail",
  admin_notes: "",
  last_contacted_at: "",
  status: "active",
};
const selectClass =
  "flex h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function CustomerCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState(defaults);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (key: keyof typeof defaults, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const addTag = () => {
    const value = tag.trim();
    if (value && !tags.includes(value) && tags.length < 30) setTags((previous) => [...previous, value]);
    setTag("");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null]));
      await createCustomer({ ...values, tags: Array.from(new Set([...tags, ...(tag.trim() ? [tag.trim()] : [])])) });
      toast.success("Customer added successfully");
      setForm(defaults);
      setTags([]);
      setTag("");
      onOpenChange(false);
      onCreated();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to add customer.");
    } finally {
      setBusy(false);
    }
  };
  const field = (key: keyof typeof defaults, title: string, type = "text", required = false, maxLength?: number) => (
    <div className="space-y-2">
      <Label htmlFor={"customer-" + key}>
        {title}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={"customer-" + key}
        type={type}
        required={required}
        maxLength={maxLength}
        value={form[key]}
        onChange={(event) => change(key, event.target.value)}
      />
    </div>
  );
  const select = (key: keyof typeof defaults, title: string, options: string[], placeholder?: string) => (
    <div className="space-y-2">
      <Label htmlFor={"customer-" + key}>{title}</Label>
      <select
        className={selectClass}
        id={"customer-" + key}
        value={form[key]}
        onChange={(event) => change(key, event.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((value) => (
          <option key={value} value={value}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-xl gap-0">
        <SheetHeader className="border-b p-6">
          <SheetTitle>Add Customer</SheetTitle>
          <SheetDescription>Create a customer profile for your CRM. Fields marked * are required.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <fieldset disabled={busy} className="space-y-5">
              <legend className="mb-4 text-sm font-semibold">Customer details</legend>
              {field("full_name", "Full name", "text", true, 150)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("phone", "Phone", "tel", true, 20)}
                {field("email", "Email", "email", false, 100)}
                {select("gender", "Gender", ["unknown", "male", "female", "other"])}
                {select("customer_type", "Customer type", ["Retail", "Wholesale", "VIP", "Corporate"])}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-address">Address</Label>
                <Textarea
                  id="customer-address"
                  maxLength={5000}
                  value={form.address}
                  onChange={(event) => change("address", event.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {select("city", "City / delivery area", ["Inside Dhaka", "Outside Dhaka"], "Choose area")}
                {select(
                  "division",
                  "Division",
                  ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"],
                  "Choose division",
                )}
                {field("district", "District", "text", false, 100)}
                {select("status", "Status", ["active", "inactive"])}
              </div>
            </fieldset>
            <fieldset disabled={busy} className="space-y-5 border-t pt-5">
              <legend className="px-1 text-sm font-semibold">CRM information</legend>
              <div className="space-y-2">
                <Label htmlFor="customer-tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="customer-tags"
                    value={tag}
                    maxLength={50}
                    placeholder="Add a tag and press Enter"
                    onChange={(event) => setTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!tag.trim() || tags.length >= 30}
                    aria-label="Add tag"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((value) => (
                    <span key={value} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                      {value}
                      <button
                        type="button"
                        aria-label={"Remove tag " + value}
                        onClick={() => setTags(tags.filter((item) => item !== value))}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Up to 30 tags. Each tag is saved separately.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-admin-notes">Admin notes</Label>
                <Textarea
                  id="customer-admin-notes"
                  maxLength={10000}
                  value={form.admin_notes}
                  onChange={(event) => change("admin_notes", event.target.value)}
                  placeholder="Internal notes about this customer"
                />
              </div>
              {field("last_contacted_at", "Last contacted (Dhaka time)", "datetime-local")}
            </fieldset>
            {error && (
              <p role="alert" className="whitespace-pre-line rounded-md bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <SheetFooter className="border-t p-4 flex-row justify-end">
            <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}Add Customer
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
