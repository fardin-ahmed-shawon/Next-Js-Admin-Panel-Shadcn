"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Trash2,
  User,
  MoreVertical,
  Check,
  Send,
  CalendarClock,
  Mail,
  Store,
  MessageCircle,
  Sparkles,
  ArrowRight,
  X,
  Users,
  CheckSquare,
  Square,
  ChevronRight,
  Flame,
  Zap,
  Tag,
  Target,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useFollowUps,
  useCustomers,
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
  sendCustomerSms,
  sendBulkSms,
} from "@/hooks/useCustomers";
import { TablePagination } from "@/app/(main)/dashboard/customers/[id]/_components/table-pagination";
import { formatDate, getInitials, cn } from "@/lib/utils";

// Preset SMS templates for fast follow-ups
const SMS_TEMPLATES = [
  {
    title: "Order Delivery Check-in",
    message: "Hello {name}, thank you for your order with Zymerce! We are checking in to confirm if your parcel arrived in perfect condition. Need assistance? Call 8809640911546.",
  },
  {
    title: "VIP Special Discount",
    message: "Dear {name}, as our valued VIP customer, enjoy 10% off your next purchase with code VIP10! Shop now at Zymerce.",
  },
  {
    title: "Re-order Follow-up",
    message: "Hi {name}, hope you are enjoying your recent purchase! Check out our new arrivals and restocks today at Zymerce.",
  },
  {
    title: "Payment / Address Confirmation",
    message: "Dear {name}, we are processing your order at Zymerce. Please confirm your delivery address or contact us at 8809640911546.",
  },
];

export default function FollowUpsPage() {
  const [selectedTab, setSelectedTab] = React.useState<string>("all");
  const [selectedChannel, setSelectedChannel] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // Row selection for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<(number | string)[]>([]);

  // New follow-up dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("");
  const [followUpChannel, setFollowUpChannel] = React.useState<string>("phone");
  const [followUpPriority, setFollowUpPriority] = React.useState<string>("medium");
  const [nextFollowUpDate, setNextFollowUpDate] = React.useState<string>("");
  const [actionNote, setActionNote] = React.useState<string>("");
  const [followUpNote, setFollowUpNote] = React.useState<string>("");

  // Single SMS Modal state
  const [isSmsDialogOpen, setIsSmsDialogOpen] = React.useState(false);
  const [smsTargetCustomer, setSmsTargetCustomer] = React.useState<any>(null);
  const [smsMessage, setSmsMessage] = React.useState<string>("");
  const [isSendingSms, setIsSendingSms] = React.useState(false);

  // Bulk SMS Modal state
  const [isBulkSmsOpen, setIsBulkSmsOpen] = React.useState(false);
  const [bulkSmsMessage, setBulkSmsMessage] = React.useState<string>("");
  const [isSendingBulkSms, setIsSendingBulkSms] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: followUps,
    total,
    counts,
    isLoading,
    mutate,
  } = useFollowUps({
    status: selectedTab,
    channel: selectedChannel,
    search: debouncedSearch,
    page,
    per_page: pageSize,
  });

  const { data: customersResponse } = useCustomers();
  const customerList: any[] = customersResponse?.data || [];

  // Reset selection on page or tab change
  React.useEffect(() => {
    setSelectedIds([]);
  }, [selectedTab, page, selectedChannel]);

  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = followUps.map((item: any) => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number | string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Schedule new follow-up
  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!followUpNote.trim()) {
      toast.error("Please enter follow-up details");
      return;
    }

    try {
      setIsSubmitting(true);
      await addCustomerNote(selectedCustomerId, {
        note: followUpNote.trim(),
        action_note: actionNote.trim() || undefined,
        channel: followUpChannel,
        type: "followup",
        priority: followUpPriority,
        status: "pending",
        next_follow_up_date: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
      });

      toast.success("Follow-up task scheduled successfully");
      setIsDialogOpen(false);
      setSelectedCustomerId("");
      setFollowUpNote("");
      setActionNote("");
      setNextFollowUpDate("");
      setFollowUpPriority("medium");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (item: any, newStatus: string) => {
    try {
      await updateCustomerNote(item.customer_id, item.id, {
        status: newStatus,
      });
      toast.success(`Follow-up marked as ${newStatus}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this interaction log?")) return;
    try {
      await deleteCustomerNote(item.customer_id, item.id);
      toast.success("Log deleted successfully");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete log");
    }
  };

  // Single SMS Modal Handler
  const openSingleSmsModal = (customer: any) => {
    if (!customer?.phone) {
      toast.error("Customer does not have a phone number on file");
      return;
    }
    setSmsTargetCustomer(customer);
    setSmsMessage(`Hello ${customer.full_name || "Customer"}, thank you for shopping with Zymerce! `);
    setIsSmsDialogOpen(true);
  };

  const handleSendSingleSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsTargetCustomer?.phone) {
      toast.error("Invalid phone number");
      return;
    }
    if (!smsMessage.trim()) {
      toast.error("Please enter SMS content");
      return;
    }

    try {
      setIsSendingSms(true);
      await sendCustomerSms({
        customer_id: smsTargetCustomer.id,
        phone: smsTargetCustomer.phone,
        message: smsMessage.trim(),
      });
      toast.success(`SMS sent to ${smsTargetCustomer.full_name || smsTargetCustomer.phone}`);
      setIsSmsDialogOpen(false);
      setSmsMessage("");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to send SMS");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Bulk SMS Modal Handler
  const selectedCustomers = React.useMemo(() => {
    return followUps
      .filter((item: any) => selectedIds.includes(item.id) && item.customer)
      .map((item: any) => item.customer);
  }, [followUps, selectedIds]);

  const handleSendBulkSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomers.length === 0) {
      toast.error("No customers selected");
      return;
    }
    if (!bulkSmsMessage.trim()) {
      toast.error("Please enter SMS message");
      return;
    }

    const customerIds = selectedCustomers.map((c: any) => c.id);

    try {
      setIsSendingBulkSms(true);
      const res = await sendBulkSms({
        customer_ids: customerIds,
        message: bulkSmsMessage.trim(),
      });
      toast.success(res.message || `Dispatched SMS to ${selectedCustomers.length} customers`);
      setIsBulkSmsOpen(false);
      setBulkSmsMessage("");
      setSelectedIds([]);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch bulk SMS");
    } finally {
      setIsSendingBulkSms(false);
    }
  };

  // Channel Icon & Badge Helper
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "phone":
      case "call":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs gap-1.5 font-medium">
            <PhoneCall className="w-3.5 h-3.5" /> Phone Call
          </Badge>
        );
      case "whatsapp":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1.5 font-medium">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </Badge>
        );
      case "sms":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs gap-1.5 font-medium">
            <Send className="w-3.5 h-3.5" /> SMS Text
          </Badge>
        );
      case "email":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-1.5 font-medium">
            <Mail className="w-3.5 h-3.5" /> Email
          </Badge>
        );
      case "in_person":
        return (
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs gap-1.5 font-medium">
            <Store className="w-3.5 h-3.5" /> Store Visit
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="capitalize text-xs">
            {channel || "Phone"}
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider">Urgent</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-500/15 text-orange-600 border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-[10px]">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{priority || "Normal"}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Customer Follow-Up Management
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs bg-primary/10 text-primary border-primary/20">
              Active CRM Queue
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Organize scheduled customer follow-up dates, next actions, multi-channel outreach, and instant single/bulk SMS notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            className="gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Schedule Follow-up Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-primary font-semibold shadow-xs">
                <Plus className="w-4 h-4" />
                Schedule Follow-Up
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[580px] p-6">
              <form onSubmit={handleCreateFollowUp} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <CalendarClock className="w-5 h-5 text-primary" />
                    Schedule Customer Follow-Up
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Assign a next contact date, specify communication channel, and declare exact next action notes.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3.5 pt-2">
                  {/* Select Customer */}
                  <div className="space-y-1.5">
                    <Label htmlFor="customer-select" className="text-xs font-semibold">
                      Select Customer <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedCustomerId}
                      onValueChange={setSelectedCustomerId}
                    >
                      <SelectTrigger id="customer-select" className="text-xs h-9">
                        <SelectValue placeholder="Search or select a customer..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 text-xs">
                        {customerList.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.full_name || "Customer"} • {c.phone} (#{c.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Channel & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="channel-select" className="text-xs font-semibold">
                        Outreach Channel <span className="text-destructive">*</span>
                      </Label>
                      <Select value={followUpChannel} onValueChange={setFollowUpChannel}>
                        <SelectTrigger id="channel-select" className="text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="phone">📞 Phone Call</SelectItem>
                          <SelectItem value="whatsapp">💬 WhatsApp Message</SelectItem>
                          <SelectItem value="sms">📱 SMS Text</SelectItem>
                          <SelectItem value="email">✉️ Email Outreach</SelectItem>
                          <SelectItem value="in_person">🏬 In-Person / Store</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="priority-select" className="text-xs font-semibold">
                        Priority Level
                      </Label>
                      <Select value={followUpPriority} onValueChange={setFollowUpPriority}>
                        <SelectTrigger id="priority-select" className="text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">🚨 Urgent (Immediate)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Next Follow Up Date & Time */}
                  <div className="space-y-1.5">
                    <Label htmlFor="next-date" className="text-xs font-semibold flex items-center justify-between">
                      <span>Next Follow-Up Date & Time</span>
                      <span className="text-muted-foreground font-normal text-[11px]">When to contact</span>
                    </Label>
                    <Input
                      id="next-date"
                      type="datetime-local"
                      className="text-xs h-9"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                    />
                  </div>

                  {/* Next Action Note */}
                  <div className="space-y-1.5">
                    <Label htmlFor="action-note" className="text-xs font-semibold flex items-center justify-between">
                      <span>Next Action Note</span>
                      <span className="text-muted-foreground font-normal text-[11px]">Specific next step</span>
                    </Label>
                    <Input
                      id="action-note"
                      placeholder="e.g. Call to confirm delivery address, Send discount coupon, Follow-up on complaint..."
                      className="text-xs h-9"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                    />
                  </div>

                  {/* Follow-up Note Details */}
                  <div className="space-y-1.5">
                    <Label htmlFor="followup-note" className="text-xs font-semibold">
                      Follow-Up Reason / History Note <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="followup-note"
                      placeholder="Detailed context of customer conversation, pending issue, or re-engagement plan..."
                      rows={3}
                      className="text-xs"
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-primary">
                    {isSubmitting ? "Saving Task..." : "Schedule Follow-Up"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top 4 Core Follow-Up Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Interactions */}
        <Card className="border bg-card/70 backdrop-blur-xs p-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Queue</p>
              <div className="text-2xl font-black text-foreground mt-0.5">{counts.all}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">All customer records</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Due Today */}
        <Card className="border bg-card/70 backdrop-blur-xs p-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Action</p>
              <div className="text-2xl font-black text-amber-600 mt-0.5">{counts.today}</div>
              <p className="text-[10px] text-amber-600/80 font-medium mt-0.5">Scheduled for today</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Overdue Tasks */}
        <Card className="border bg-card/70 backdrop-blur-xs p-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Overdue Tasks</p>
              <div className="text-2xl font-black text-rose-600 mt-0.5">{counts.overdue}</div>
              <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">Requires immediate attention</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Completed */}
        <Card className="border bg-card/70 backdrop-blur-xs p-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Completed Tasks</p>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">{counts.completed}</div>
              <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">Resolved interactions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 px-4 rounded-xl border bg-primary text-primary-foreground flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold">
              {selectedIds.length} {selectedIds.length === 1 ? "customer" : "customers"} selected
            </span>
            <span className="text-xs opacity-80 hidden sm:inline">
              Choose an action to perform on all selected contacts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-bold gap-1.5 shadow-xs"
              onClick={() => {
                setBulkSmsMessage("");
                setIsBulkSmsOpen(true);
              }}
            >
              <Send className="w-3.5 h-3.5 text-primary" />
              Send Bulk SMS ({selectedIds.length})
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setSelectedIds([])}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Card with Sleek Tab Navigation */}
      <Card className="border shadow-xs overflow-hidden">
        {/* Dedicated Modern Tab Strip */}
        <div className="border-b bg-card/60 backdrop-blur-xs px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 shrink-0">
            {/* Tab: All */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab("all");
                setPage(1);
              }}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                selectedTab === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>All Follow-Ups</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  selectedTab === "all"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts.all}
              </span>
            </button>

            {/* Tab: Today's Action */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab("today");
                setPage(1);
              }}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                selectedTab === "today"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500 group-data-[state=active]:text-white" />
              <span>Today's Action</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  selectedTab === "today"
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/10 text-amber-600"
                )}
              >
                {counts.today}
              </span>
            </button>

            {/* Tab: Upcoming */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab("upcoming");
                setPage(1);
              }}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                selectedTab === "upcoming"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
              <span>Upcoming</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  selectedTab === "upcoming"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts.upcoming}
              </span>
            </button>

            {/* Tab: Overdue */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab("overdue");
                setPage(1);
              }}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                selectedTab === "overdue"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Overdue</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  selectedTab === "overdue"
                    ? "bg-white/20 text-white"
                    : "bg-rose-500/10 text-rose-600"
                )}
              >
                {counts.overdue}
              </span>
            </button>

            {/* Tab: Completed */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab("completed");
                setPage(1);
              }}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                selectedTab === "completed"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  selectedTab === "completed"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-500/10 text-emerald-600"
                )}
              >
                {counts.completed}
              </span>
            </button>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 border-b bg-card/40">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Channel Filter:</span>
            <Select
              value={selectedChannel}
              onValueChange={(val) => {
                setSelectedChannel(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs w-[160px] bg-background">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="phone">📞 Phone Call</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                <SelectItem value="sms">📱 SMS Text</SelectItem>
                <SelectItem value="email">✉️ Email</SelectItem>
                <SelectItem value="in_person">🏬 Store Visit</SelectItem>
              </SelectContent>
            </Select>

            {selectedChannel !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2 gap-1 text-muted-foreground"
                onClick={() => setSelectedChannel("all")}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer, phone, note, action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 h-9 text-xs bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <Checkbox
                    checked={
                      followUps.length > 0 &&
                      followUps.every((item: any) => selectedIds.includes(item.id))
                    }
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    aria-label="Select all"
                  />
                </th>
                <th className="py-3 px-4 min-w-[130px]">Status & Priority</th>
                <th className="py-3 px-4 min-w-[210px]">Customer Profile</th>
                <th className="py-3 px-4 min-w-[140px]">Channel</th>
                <th className="py-3 px-4 min-w-[240px]">Follow-Up Details</th>
                <th className="py-3 px-4 min-w-[260px]">Next Action & Schedule</th>
                <th className="py-3 px-4 min-w-[150px]">Created By</th>
                <th className="py-3 px-4 text-right min-w-[160px]">Outreach Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-3.5 text-center"><Skeleton className="h-4 w-4 mx-auto" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-8 w-36" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-10 w-52" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-muted-foreground/60" />
                      </div>
                      <p className="font-semibold text-base text-foreground">No follow-ups found</p>
                      <p className="text-xs text-muted-foreground text-center">
                        No customer tasks match the selected status or channel filter. Click below to schedule a new one.
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 text-xs gap-1.5 bg-primary"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Schedule New Follow-Up
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                followUps.map((item: any) => {
                  const customer = item.customer || {};
                  const targetDate = item.next_follow_up_date || item.due_date;
                  const isPastDue = targetDate && new Date(targetDate) < new Date() && item.status === "pending";
                  const isDueToday = targetDate && new Date(targetDate).toDateString() === new Date().toDateString();
                  const isSelected = selectedIds.includes(item.id);
                  const phoneClean = customer.phone ? customer.phone.replace(/[^0-9]/g, "") : "";

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors group",
                        isSelected && "bg-primary/[0.03] dark:bg-primary/[0.06]"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3.5 text-center align-top pt-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(item.id)}
                          aria-label={`Select ${customer.full_name || "customer"}`}
                        />
                      </td>

                      {/* Status & Priority */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1.5 items-start">
                          {item.status === "completed" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </Badge>
                          ) : isPastDue ? (
                            <Badge variant="destructive" className="text-xs gap-1 font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </Badge>
                          ) : isDueToday ? (
                            <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs gap-1 font-bold">
                              <Clock className="w-3 h-3" /> Due Today
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                          <div>{getPriorityBadge(item.priority)}</div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border shadow-2xs">
                            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                              {getInitials(customer.full_name || "Customer")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/customers/${item.customer_id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 group-hover:underline text-xs whitespace-nowrap"
                            >
                              <span>{customer.full_name || "Customer"}</span>
                              <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                            </Link>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                              <span className="font-mono text-primary font-bold">#{item.customer_id}</span>
                              {customer.phone && (
                                <>
                                  <span>•</span>
                                  <span>{customer.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3.5 px-4 align-top">
                        {getChannelBadge(item.channel || item.type)}
                      </td>

                      {/* Follow-up Note */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-normal">
                          {item.note}
                        </p>
                      </td>

                      {/* Next Action & Due Schedule */}
                      <td className="py-3.5 px-4 align-top space-y-1.5">
                        {/* Next Action Pill */}
                        {item.action_note ? (
                          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs flex items-start gap-1.5">
                            <Target className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-bold text-primary block text-[10px] uppercase tracking-wider">Next Action</span>
                              <span className="text-foreground font-medium text-xs">{item.action_note}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic block">No specific next action set</span>
                        )}

                        {/* Scheduled Date */}
                        {targetDate ? (
                          <div className={cn("text-xs flex items-center gap-1 font-medium", isPastDue ? "text-rose-600" : isDueToday ? "text-amber-600" : "text-muted-foreground")}>
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{new Date(targetDate).toLocaleDateString()}</span>
                            <span className="text-[11px] opacity-75">
                              ({new Date(targetDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          </div>
                        ) : null}
                      </td>

                      {/* Created By Staff */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {item.admin_name || "Admin"}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 360 View Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-xs font-semibold gap-1 px-2.5 hover:border-primary/50 text-foreground"
                            title="Open Customer 360 View"
                          >
                            <Link href={`/dashboard/customers/${item.customer_id}`}>
                              <Eye className="w-3 h-3 text-muted-foreground" />
                              360 View
                            </Link>
                          </Button>

                          {/* Send SMS Action Button */}
                          {customer.phone && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openSingleSmsModal(customer)}
                              className="h-8 text-xs font-semibold gap-1 px-2.5 bg-primary/5 hover:bg-primary hover:text-primary-foreground border-primary/30"
                              title="Send SMS to customer"
                            >
                              <Send className="w-3 h-3 text-primary group-hover:text-primary-foreground" />
                              Send SMS
                            </Button>
                          )}

                          {/* Quick call link */}
                          {customer.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Call customer"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                          )}

                          {/* Quick WhatsApp link */}
                          {customer.phone && (
                            <a
                              href={`https://wa.me/${phoneClean.startsWith("0") ? "88" + phoneClean : phoneClean}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}

                          {/* Mark Done / Pending toggle */}
                          {item.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 font-medium"
                              onClick={() => handleStatusChange(item, "completed")}
                              title="Mark as completed"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Done
                            </Button>
                          )}

                          {/* Dropdown Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                              <DropdownMenuLabel>Follow-Up Options</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/customers/${item.customer_id}`} className="cursor-pointer">
                                  <Eye className="w-3.5 h-3.5 mr-2" /> 360 View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {item.status !== "completed" ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(item, "completed")}>
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Mark Completed
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(item, "pending")}>
                                  <Clock className="w-3.5 h-3.5 mr-2 text-amber-600" /> Re-open Pending
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleStatusChange(item, "cancelled")}>
                                <AlertCircle className="w-3.5 h-3.5 mr-2 text-slate-500" /> Cancel Task
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(item)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Log
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </Card>

      {/* Single Customer SMS Modal */}
      <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <form onSubmit={handleSendSingleSms} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Send className="w-5 h-5 text-primary" />
                Send SMS to Customer
              </DialogTitle>
              <DialogDescription className="text-xs">
                Dispatches an instant SMS notification via FastSMS BD to the customer's verified number.
              </DialogDescription>
            </DialogHeader>

            {smsTargetCustomer && (
              <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground">{smsTargetCustomer.full_name || "Customer"}</span>
                  <p className="text-muted-foreground font-mono text-[11px] mt-0.5">{smsTargetCustomer.phone}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  ID #{smsTargetCustomer.id}
                </Badge>
              </div>
            )}

            {/* Template Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Select Message Template (Optional)</span>
                <span className="text-[11px] text-primary font-normal">Fast presets</span>
              </Label>
              <Select
                onValueChange={(val) => {
                  const tpl = SMS_TEMPLATES.find((t) => t.title === val);
                  if (tpl && smsTargetCustomer) {
                    setSmsMessage(tpl.message.replace("{name}", smsTargetCustomer.full_name || "Customer"));
                  }
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Choose a preset template..." />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {SMS_TEMPLATES.map((t) => (
                    <SelectItem key={t.title} value={t.title}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SMS Message Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="single-sms-msg" className="text-xs font-semibold flex items-center justify-between">
                <span>SMS Content <span className="text-destructive">*</span></span>
                <span className={cn("text-[11px] font-mono", smsMessage.length > 160 ? "text-amber-600 font-bold" : "text-muted-foreground")}>
                  {smsMessage.length} / 160 chars ({Math.ceil(smsMessage.length / 160) || 1} SMS)
                </span>
              </Label>
              <Textarea
                id="single-sms-msg"
                rows={4}
                className="text-xs leading-relaxed"
                placeholder="Type SMS message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Sender ID: <strong className="text-foreground">8809640911546</strong> (Approved fast SMS route)
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSmsDialogOpen(false)}
                disabled={isSendingSms}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSendingSms} className="gap-1.5 bg-primary">
                <Send className="w-3.5 h-3.5" />
                {isSendingSms ? "Sending SMS..." : "Send SMS Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk SMS Modal */}
      <Dialog open={isBulkSmsOpen} onOpenChange={setIsBulkSmsOpen}>
        <DialogContent className="sm:max-w-[560px] p-6">
          <form onSubmit={handleSendBulkSms} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Send className="w-5 h-5 text-primary" />
                Send Bulk SMS Campaign
              </DialogTitle>
              <DialogDescription className="text-xs">
                Broadcast an SMS to all {selectedCustomers.length} selected customers with dynamic personalization tags.
              </DialogDescription>
            </DialogHeader>

            {/* Recipient Chips Preview */}
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Selected Recipients ({selectedCustomers.length})</span>
                <span className="text-[11px] text-muted-foreground">FastSMS BD Route</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                {selectedCustomers.map((c: any) => (
                  <Badge key={c.id} variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
                    <span>{c.full_name || "Customer"}</span>
                    <span className="opacity-75 font-mono">({c.phone})</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Template Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Select Message Template</span>
                <span className="text-[11px] text-primary font-normal">Presets</span>
              </Label>
              <Select
                onValueChange={(val) => {
                  const tpl = SMS_TEMPLATES.find((t) => t.title === val);
                  if (tpl) {
                    setBulkSmsMessage(tpl.message);
                  }
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Choose a campaign template..." />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {SMS_TEMPLATES.map((t) => (
                    <SelectItem key={t.title} value={t.title}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message with placeholder tags */}
            <div className="space-y-1.5">
              <Label htmlFor="bulk-sms-msg" className="text-xs font-semibold flex items-center justify-between">
                <span>Campaign Message <span className="text-destructive">*</span></span>
                <span className={cn("text-[11px] font-mono", bulkSmsMessage.length > 160 ? "text-amber-600 font-bold" : "text-muted-foreground")}>
                  {bulkSmsMessage.length} / 160 chars ({Math.ceil(bulkSmsMessage.length / 160) || 1} SMS/recipient)
                </span>
              </Label>
              <Textarea
                id="bulk-sms-msg"
                rows={4}
                className="text-xs leading-relaxed"
                placeholder="Type message with {name} tag for personalization..."
                value={bulkSmsMessage}
                onChange={(e) => setBulkSmsMessage(e.target.value)}
                required
              />
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <span>Available placeholder:</span>
                <button
                  type="button"
                  onClick={() => setBulkSmsMessage((prev) => prev + " {name}")}
                  className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-primary font-mono font-bold text-[10px]"
                >
                  {"{name}"}
                </button>
                <span>(Replaced with each customer's real name)</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBulkSmsOpen(false)}
                disabled={isSendingBulkSms}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSendingBulkSms} className="gap-1.5 bg-primary">
                <Send className="w-3.5 h-3.5" />
                {isSendingBulkSms ? "Broadcasting SMS..." : `Send SMS to ${selectedCustomers.length} Customers`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
