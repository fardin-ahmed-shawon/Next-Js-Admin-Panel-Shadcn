"use client";

import * as React from "react";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Calendar, Hash, Loader2, Plus, Tag, User, Wallet } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";
import { CapitalItem } from "@/hooks/useCapitals";

export type CapitalFormData = {
  id?: number;
  amount: number | "";
  type: "cash_in" | "cash_out";
  investor_name: string;
  title: string;
  payment_method: string;
  trx_id: string;
  date: string;
  description: string;
};

interface CapitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CapitalItem | null;
  mode: "add" | "edit";
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "bKash",
  "Nagad",
  "Rocket",
  "Cheque",
  "Other",
];

export function CapitalDialog({ open, onOpenChange, initialData, mode, onSuccess }: CapitalDialogProps) {
  const [formData, setFormData] = React.useState<CapitalFormData>({
    amount: "",
    type: "cash_in",
    investor_name: "",
    title: "Capital Inflow",
    payment_method: "Cash",
    trx_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        const itemType = (initialData.type === "cash_out" || initialData.type === "out") ? "cash_out" : "cash_in";
        setFormData({
          id: initialData.id,
          amount: initialData.amount ?? "",
          type: itemType,
          investor_name: initialData.investor_name || "",
          title: initialData.title || (itemType === "cash_out" ? "Cash Outflow" : "Capital Inflow"),
          payment_method: initialData.payment_method || "Cash",
          trx_id: initialData.trx_id || "",
          date: initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          description: initialData.description || "",
        });
      } else {
        setFormData({
          amount: "",
          type: "cash_in",
          investor_name: "",
          title: "Capital Inflow",
          payment_method: "Cash",
          trx_id: `CIN-${Date.now().toString().slice(-6)}`,
          date: format(new Date(), "yyyy-MM-dd"),
          description: "",
        });
      }
    }
  }, [open, mode, initialData]);

  const handleTypeChange = (newType: "cash_in" | "cash_out") => {
    setFormData((prev) => {
      const isOut = newType === "cash_out";
      let newTitle = prev.title;
      if (prev.title === "Capital Inflow" || prev.title === "Cash In" || prev.title === "Cash Outflow" || prev.title === "Owner Drawing") {
        newTitle = isOut ? "Owner Drawing" : "Capital Inflow";
      }
      let newTrx = prev.trx_id;
      if (mode === "add" && (!newTrx || newTrx.startsWith("CIN-") || newTrx.startsWith("COUT-") || newTrx.startsWith("CAP-"))) {
        newTrx = `${isOut ? "COUT" : "CIN"}-${Date.now().toString().slice(-6)}`;
      }

      return {
        ...prev,
        type: newType,
        title: newTitle,
        trx_id: newTrx,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount === "" || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      let url = `${baseUrl}capitals`;
      let method = "POST";

      if (mode === "edit" && initialData?.id) {
        url = `${url}/${initialData.id}`;
        method = "PUT";
      }

      const payload = {
        amount: Number(formData.amount),
        type: formData.type,
        investor_name: formData.investor_name ? formData.investor_name.trim() : null,
        title: formData.title ? formData.title.trim() : (formData.type === "cash_out" ? "Cash Outflow" : "Capital Inflow"),
        payment_method: formData.payment_method || "Cash",
        trx_id: formData.trx_id ? formData.trx_id.trim() : null,
        date: formData.date || null,
        description: formData.description ? formData.description.trim() : null,
      };

      const res = await fetchClient(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `Failed to ${mode === "add" ? "record" : "update"} cash flow.`);
      }

      toast.success(
        mode === "add"
          ? `${formData.type === "cash_out" ? "Cash Out" : "Cash In"} of ৳${Number(formData.amount).toLocaleString()} recorded successfully.`
          : "Record updated successfully."
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const isCashIn = formData.type === "cash_in";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`flex size-9 items-center justify-center rounded-lg ${
                isCashIn
                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
              }`}
            >
              {isCashIn ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}
            </div>
            <div>
              <DialogTitle>
                {mode === "add" ? (isCashIn ? "Record Cash In" : "Record Cash Out") : "Edit Cash Flow Entry"}
              </DialogTitle>
              <DialogDescription>
                {isCashIn
                  ? "Record cash injected into the business. Increases Total Capital."
                  : "Record cash withdrawn from the business. Decreases Total Capital."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Type Selector (Cash In vs Cash Out) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange("cash_in")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                isCashIn
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownRight className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cash In (Inflow)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("cash_out")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                !isCashIn
                  ? "bg-background text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="size-4 text-rose-600 dark:text-rose-400" />
              <span>Cash Out (Outflow)</span>
            </button>
          </div>

          {/* Amount Field */}
          <div
            className={`rounded-xl border p-4 ${
              isCashIn
                ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Label
                htmlFor="amount"
                className={`text-sm font-semibold ${
                  isCashIn ? "text-emerald-900 dark:text-emerald-300" : "text-rose-900 dark:text-rose-300"
                }`}
              >
                {isCashIn ? "Cash In Amount (৳)" : "Cash Out Amount (৳)"} <span className="text-destructive">*</span>
              </Label>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isCashIn
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                }`}
              >
                {isCashIn ? "Credit (+ Inflow)" : "Debit (− Outflow)"}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                ৳
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value === "" ? "" : Number(e.target.value) })}
                className="pl-8 text-lg font-bold bg-background text-foreground"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Person / Investor / Recipient */}
            <div className="space-y-1.5">
              <Label htmlFor="investor_name" className="text-xs font-medium">
                {isCashIn ? "Investor / Source Name" : "Recipient / Partner Name"}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="investor_name"
                  placeholder={isCashIn ? "e.g. Owner, Investor Name" : "e.g. Owner Drawing, Partner Name"}
                  value={formData.investor_name}
                  onChange={(e) => setFormData({ ...formData, investor_name: e.target.value })}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Purpose / Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium">
                {isCashIn ? "Purpose / Title" : "Withdrawal Reason / Title"}
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder={isCashIn ? "e.g. Working Capital Injection" : "e.g. Owner Drawing / Profit Share"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Payment Channel</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(val) => setFormData({ ...formData, payment_method: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm} value={pm} className="text-xs">
                      {pm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-medium">
                Transaction Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Reference / Trx ID */}
          <div className="space-y-1.5">
            <Label htmlFor="trx_id" className="text-xs font-medium">
              Reference / Trx ID <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="trx_id"
                placeholder={isCashIn ? "e.g. CIN-98124" : "e.g. COUT-98124"}
                value={formData.trx_id}
                onChange={(e) => setFormData({ ...formData, trx_id: e.target.value })}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Note / Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium">
              Remarks / Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder={isCashIn ? "Additional notes about this cash inflow..." : "Additional notes about this cash withdrawal..."}
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`text-white gap-1.5 ${
                isCashIn
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "add" ? (
                <>
                  <Plus className="size-4" />
                  {isCashIn ? "Confirm Cash In" : "Confirm Cash Out"}
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
