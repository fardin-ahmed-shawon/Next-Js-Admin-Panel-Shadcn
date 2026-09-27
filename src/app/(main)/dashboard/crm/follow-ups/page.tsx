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
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { useFollowUps, useCustomers, addCustomerNote, updateCustomerNote, deleteCustomerNote } from "@/hooks/useCustomers";
import { TablePagination } from "@/app/(main)/dashboard/customers/[id]/_components/table-pagination";
import { formatDate, getInitials } from "@/lib/utils";

export default function FollowUpsPage() {
  const [selectedTab, setSelectedTab] = React.useState<string>("all");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // New follow-up dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("");
  const [followUpNote, setFollowUpNote] = React.useState<string>("");
  const [followUpType, setFollowUpType] = React.useState<string>("followup");
  const [followUpPriority, setFollowUpPriority] = React.useState<string>("medium");
  const [followUpDueDate, setFollowUpDueDate] = React.useState<string>("");

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
    isLoading,
    mutate,
  } = useFollowUps({
    status: selectedTab,
    type: selectedType,
    search: debouncedSearch,
    page,
    per_page: pageSize,
  });

  const { data: customersResponse } = useCustomers();
  const customerList: any[] = customersResponse?.data || [];

  // Summary counts
  const counts = React.useMemo(() => {
    let pending = 0;
    let overdue = 0;
    let completed = 0;
    const now = new Date();

    followUps.forEach((item: any) => {
      const isPastDue = item.due_date && new Date(item.due_date) < now;
      if (item.status === "completed") {
        completed++;
      } else if (item.status === "pending") {
        pending++;
        if (isPastDue) overdue++;
      }
    });

    return { total, pending, overdue, completed };
  }, [followUps, total]);

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!followUpNote.trim()) {
      toast.error("Please enter a note or follow-up reason");
      return;
    }

    try {
      setIsSubmitting(true);
      await addCustomerNote(selectedCustomerId, {
        note: followUpNote.trim(),
        type: followUpType,
        priority: followUpPriority,
        status: "pending",
        due_date: followUpDueDate ? new Date(followUpDueDate).toISOString() : undefined,
      });

      toast.success("Follow-up scheduled successfully");
      setIsDialogOpen(false);
      setSelectedCustomerId("");
      setFollowUpNote("");
      setFollowUpDueDate("");
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "call":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><PhoneCall className="w-3 h-3 mr-1" /> Call</Badge>;
      case "whatsapp":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><MessageSquare className="w-3 h-3 mr-1" /> WhatsApp</Badge>;
      case "complaint":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Complaint</Badge>;
      case "followup":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20"><CalendarClock className="w-3 h-3 mr-1" /> Follow-Up</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{type || "Note"}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-[11px] font-semibold">Urgent</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-[11px] font-semibold">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[11px]">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-[11px]">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{priority || "Normal"}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Customer Follow-Ups
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs">
              CRM Queue
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Organize customer callbacks, pending inquiries, complaints, and engagement schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
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
              <Button size="sm" className="gap-1.5 bg-primary font-medium shadow-sm">
                <Plus className="w-4 h-4" />
                Schedule Follow-Up
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px]">
              <form onSubmit={handleCreateFollowUp}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <CalendarClock className="w-5 h-5 text-primary" />
                    New Customer Follow-Up
                  </DialogTitle>
                  <DialogDescription>
                    Assign a scheduled follow-up call, message, or resolution task for a customer.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="customer-select" className="text-xs font-semibold">
                      Select Customer <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedCustomerId}
                      onValueChange={setSelectedCustomerId}
                    >
                      <SelectTrigger id="customer-select">
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {customerList.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.full_name || "Unnamed"} - {c.phone} (#{c.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="followup-type" className="text-xs font-semibold">
                        Interaction Type
                      </Label>
                      <Select value={followUpType} onValueChange={setFollowUpType}>
                        <SelectTrigger id="followup-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="followup">Scheduled Follow-Up</SelectItem>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp Outreach</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="complaint">Complaint Resolution</SelectItem>
                          <SelectItem value="note">Internal CRM Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="followup-priority" className="text-xs font-semibold">
                        Priority Level
                      </Label>
                      <Select value={followUpPriority} onValueChange={setFollowUpPriority}>
                        <SelectTrigger id="followup-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="due-date" className="text-xs font-semibold">
                      Due Date & Time
                    </Label>
                    <Input
                      id="due-date"
                      type="datetime-local"
                      value={followUpDueDate}
                      onChange={(e) => setFollowUpDueDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="followup-note" className="text-xs font-semibold">
                      Interaction Details / Task <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="followup-note"
                      placeholder="e.g. Call regarding delivery update or check product feedback..."
                      rows={3}
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                    {isSubmitting ? "Saving..." : "Schedule Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Interactions</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{counts.total}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Follow-Ups</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {counts.pending}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:border-rose-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Overdue Tasks</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                {counts.overdue}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {counts.completed}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5 border-b space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <Tabs
              value={selectedTab}
              onValueChange={(val) => {
                setSelectedTab(val);
                setPage(1);
              }}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 sm:flex h-9 bg-muted/60 p-1">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="overdue" className="text-xs">Overdue</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filter and Search controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer, phone, note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <Select
                value={selectedType}
                onValueChange={(val) => {
                  setSelectedType(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="followup">Follow-Up</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="note">CRM Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Status & Priority</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Interaction Type</th>
                <th className="py-3 px-4 min-w-[280px]">Note / Subject</th>
                <th className="py-3 px-4">Due Schedule</th>
                <th className="py-3 px-4">Staff / Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-8 w-36" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-56" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-28" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-muted-foreground/40" />
                      <p className="font-medium text-sm">No follow-ups found for the selected filter.</p>
                      <p className="text-xs text-muted-foreground">
                        Schedule a new task or adjust your status and search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                followUps.map((item: any) => {
                  const customer = item.customer || {};
                  const isPastDue = item.due_date && new Date(item.due_date) < new Date() && item.status === "pending";
                  const phoneClean = customer.phone ? customer.phone.replace(/[^0-9]/g, "") : "";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Status & Priority */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1.5 items-start">
                          {item.status === "completed" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </Badge>
                          ) : isPastDue ? (
                            <Badge variant="destructive" className="text-xs gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                          <div>{getPriorityBadge(item.priority)}</div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                              {getInitials(customer.full_name || "Customer")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/customers/${item.customer_id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 group-hover:underline text-xs"
                            >
                              <span>{customer.full_name || "Unknown Customer"}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </Link>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>ID: #{item.customer_id}</span>
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

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 align-top">
                        {getTypeBadge(item.type)}
                      </td>

                      {/* Note Content */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-normal">
                          {item.note}
                        </p>
                      </td>

                      {/* Due Schedule */}
                      <td className="py-3.5 px-4 align-top">
                        {item.due_date ? (
                          <div className={`text-xs ${isPastDue ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(item.due_date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[11px] opacity-80 mt-0.5">
                              {new Date(item.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No due date</span>
                        )}
                      </td>

                      {/* Created By & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs">
                          <span className="font-medium text-foreground">{item.admin_name || "Admin"}</span>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                              <Send className="w-4 h-4" />
                            </a>
                          )}

                          {/* Quick complete / toggle */}
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
                            <DropdownMenuContent align="end" className="w-44 text-xs">
                              <DropdownMenuLabel>Follow-Up Options</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/customers/${item.customer_id}`} className="cursor-pointer">
                                  <User className="w-3.5 h-3.5 mr-2" /> View Profile
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
    </div>
  );
}
