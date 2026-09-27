"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  Clock,
  Trash2,
  Send,
  Loader2,
  User,
  Calendar,
  CheckCircle2,
  Mail,
  Store,
  Sparkles,
  Phone,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronRight,
  Bookmark,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, getRelativeTime, formatOrderDateTime } from "@/lib/utils";
import {
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
  sendCustomerSms,
} from "@/hooks/useCustomers";

interface CustomerNotesSectionProps {
  customerId: number | string;
  customer?: any;
  notes: any[];
  onRefresh: () => void;
}

export function CustomerNotesSection({
  customerId,
  customer,
  notes = [],
  onRefresh,
}: CustomerNotesSectionProps) {
  // Logger form state
  const [noteText, setNoteText] = React.useState("");
  const [channel, setChannel] = React.useState("phone");
  const [priority, setPriority] = React.useState("medium");
  const [nextFollowUpDate, setNextFollowUpDate] = React.useState("");
  const [actionNote, setActionNote] = React.useState("");
  const [noteStatus, setNoteStatus] = React.useState("pending");
  const [submitting, setSubmitting] = React.useState(false);
  const [filterTab, setFilterTab] = React.useState<"all" | "pending" | "completed">("all");

  // Single SMS Modal state
  const [isSmsOpen, setIsSmsOpen] = React.useState(false);
  const [smsMessage, setSmsMessage] = React.useState("");
  const [isSendingSms, setIsSendingSms] = React.useState(false);

  // Status updating indicator
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const customerPhone = customer?.phone || "";
  const customerName = customer?.full_name || "Valued Customer";

  // SMS Templates
  const smsTemplates = [
    {
      label: "Follow-Up Check-in",
      text: `Hello ${customerName}, following up regarding our recent conversation. Please feel free to let us know if you need any assistance! - Zymerce`,
    },
    {
      label: "Special VIP Offer",
      text: `Hi ${customerName}! As our valued shopper, enjoy a special discount on your next order with voucher VIP10. Shop now: zymerce.com`,
    },
    {
      label: "Order Status / Feedback",
      text: `Dear ${customerName}, thank you for your order! We hope you loved your items. Please feel free to reply if you need any support.`,
    },
    {
      label: "Cart Recovery / Re-order",
      text: `Hello ${customerName}, your selected items are waiting for you at Zymerce! Complete your order today with fast nationwide delivery.`,
    },
  ];

  // Quick preset helper for next follow-up date
  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(11, 0, 0, 0); // Default to 11:00 AM
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    setNextFollowUpDate(`${year}-${month}-${day}T${hours}:${mins}`);
  };

  // Submit Note / Follow-Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Please enter follow-up details or notes.");
      return;
    }

    try {
      setSubmitting(true);
      await addCustomerNote(customerId, {
        note: noteText.trim(),
        channel,
        type: channel === "note" ? "note" : "followup",
        priority,
        action_note: actionNote.trim() || undefined,
        status: nextFollowUpDate ? noteStatus : "completed",
        next_follow_up_date: nextFollowUpDate ? nextFollowUpDate : undefined,
      });

      toast.success(
        nextFollowUpDate
          ? "Follow-up task scheduled with next action."
          : "CRM interaction logged successfully."
      );

      // Reset form
      setNoteText("");
      setActionNote("");
      setNextFollowUpDate("");
      setPriority("medium");
      setNoteStatus("pending");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to log follow-up note.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (note: any) => {
    const newStatus = note.status === "completed" ? "pending" : "completed";
    try {
      setUpdatingId(note.id);
      await updateCustomerNote(customerId, note.id, {
        status: newStatus,
      });
      toast.success(
        newStatus === "completed"
          ? "Follow-up marked as completed."
          : "Follow-up reopened as pending."
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete note
  const handleDelete = async (noteId: number) => {
    try {
      setDeletingId(noteId);
      await deleteCustomerNote(customerId, noteId);
      toast.success("Note removed.");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open SMS Dialog
  const handleOpenSms = () => {
    if (!customerPhone) {
      toast.error("Customer does not have a phone number on file.");
      return;
    }
    setSmsMessage(`Hello ${customerName}, thank you for shopping with Zymerce! `);
    setIsSmsOpen(true);
  };

  // Send SMS
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone) {
      toast.error("No phone number found for this customer.");
      return;
    }
    if (!smsMessage.trim()) {
      toast.error("Please enter SMS content.");
      return;
    }

    try {
      setIsSendingSms(true);
      await sendCustomerSms({
        customer_id: customerId,
        phone: customerPhone,
        message: smsMessage.trim(),
      });
      toast.success(`SMS dispatched successfully to ${customerName} (${customerPhone})`);
      setIsSmsOpen(false);
      setSmsMessage("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to send SMS.");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Channel badge helper
  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case "phone":
      case "call":
        return (
          <Badge variant="outline" className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-medium">
            <PhoneCall className="w-3.5 h-3.5" /> Phone Call
          </Badge>
        );
      case "whatsapp":
        return (
          <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-medium">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </Badge>
        );
      case "sms":
        return (
          <Badge variant="outline" className="gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs font-medium">
            <Send className="w-3.5 h-3.5" /> SMS Text
          </Badge>
        );
      case "email":
        return (
          <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-medium">
            <Mail className="w-3.5 h-3.5" /> Email
          </Badge>
        );
      case "in_person":
        return (
          <Badge variant="outline" className="gap-1.5 bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs font-medium">
            <Store className="w-3.5 h-3.5" /> Store Visit
          </Badge>
        );
      case "complaint":
        return (
          <Badge variant="destructive" className="gap-1.5 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Issue / Complaint
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1.5 text-xs font-medium">
            <FileText className="w-3.5 h-3.5" /> Internal Note
          </Badge>
        );
    }
  };

  // Priority badge helper
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "urgent":
        return <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider">Urgent</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-500/15 text-orange-600 border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-[10px]">Low</Badge>;
      default:
        return null;
    }
  };

  // Follow-up date timing status helper
  const getDateTimingStatus = (dateStr: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      const days = Math.abs(Math.floor(diffHours / 24));
      return {
        label: days === 0 ? "Overdue Today" : `Overdue by ${days}d`,
        className: "bg-rose-500/15 text-rose-600 border-rose-500/30 font-semibold",
      };
    } else if (diffHours <= 24) {
      return {
        label: "Due Today",
        className: "bg-amber-500/15 text-amber-600 border-amber-500/30 font-semibold",
      };
    } else {
      const days = Math.ceil(diffHours / 24);
      return {
        label: `In ${days} days`,
        className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-medium",
      };
    }
  };

  // Filter notes
  const pendingNotes = notes.filter((n: any) => n.status === "pending" || (!n.status && n.next_follow_up_date));
  const completedNotes = notes.filter((n: any) => n.status === "completed" || (!n.status && !n.next_follow_up_date));

  const filteredNotes = React.useMemo(() => {
    if (filterTab === "pending") return pendingNotes;
    if (filterTab === "completed") return completedNotes;
    return notes;
  }, [filterTab, notes, pendingNotes, completedNotes]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Card Header with Actions */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Follow-Up Management & CRM Notes
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Schedule next follow-up dates, assign specific next actions, record call notes, and send instant SMS.
              </CardDescription>
            </div>

            {/* Quick SMS Send Button */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700 font-medium shadow-2xs"
                onClick={handleOpenSms}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS to Customer</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Schedule / Log Follow-Up Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border bg-muted/20 p-4 sm:p-5 space-y-4 shadow-2xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-primary" /> Log Interaction & Schedule Next Follow-Up
              </span>
              <span className="text-[11px] text-muted-foreground">
                Automatic audit of Admin ID & Name
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Channel Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Outreach Channel</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="h-9 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">📞 Phone Call</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp Message</SelectItem>
                    <SelectItem value="sms">✉️ SMS Text</SelectItem>
                    <SelectItem value="email">📧 Email Message</SelectItem>
                    <SelectItem value="in_person">🏪 Store Visit / In-Person</SelectItem>
                    <SelectItem value="note">📝 Internal Note</SelectItem>
                    <SelectItem value="complaint">⚠️ Customer Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Priority Level</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Initial Status</Label>
                <Select value={noteStatus} onValueChange={setNoteStatus}>
                  <SelectTrigger className="h-9 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Pending Action</SelectItem>
                    <SelectItem value="completed">✅ Completed / Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Next Follow-Up Date & Time */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Next Follow-Up Date & Time</span>
                  </Label>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="hover:text-primary transition-colors underline"
                    >
                      Tomorrow
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="hover:text-primary transition-colors underline"
                    >
                      +3d
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="hover:text-primary transition-colors underline"
                    >
                      +1w
                    </button>
                    {nextFollowUpDate && (
                      <>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setNextFollowUpDate("")}
                          className="text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <Input
                  type="datetime-local"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="h-9 bg-background text-xs"
                />
              </div>

              {/* Next Action Note */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Next Action Note</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Call regarding delivery update / Send 10% coupon"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="h-9 bg-background text-xs"
                />
              </div>
            </div>

            {/* Note details textarea */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Follow-Up Reason & Notes</span>
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type conversation details, customer preferences, order inquiries, or context..."
                rows={3}
                className="bg-background resize-none text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {customerPhone && (
                  <Badge variant="outline" className="text-[11px] gap-1 bg-background font-mono">
                    <Phone className="w-3 h-3 text-muted-foreground" /> {customerPhone}
                  </Badge>
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={submitting || !noteText.trim()}
                className="gap-1.5 bg-primary text-primary-foreground font-medium shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save & Schedule Follow-Up
              </Button>
            </div>
          </form>

          {/* Follow-Up Activity List & Tab Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Follow-Up Timeline ({notes.length})
                </h4>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all font-medium",
                    filterTab === "all"
                      ? "bg-background shadow-2xs text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({notes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("pending")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                    filterTab === "pending"
                      ? "bg-background shadow-2xs text-amber-600 dark:text-amber-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>Pending</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {pendingNotes.length}
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("completed")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                    filterTab === "completed"
                      ? "bg-background shadow-2xs text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>Completed</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {completedNotes.length}
                  </Badge>
                </button>
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground bg-muted/10">
                <Clock className="w-10 h-10 stroke-1 mb-2 opacity-40 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  {filterTab === "pending"
                    ? "No pending follow-ups"
                    : filterTab === "completed"
                    ? "No completed tasks yet"
                    : "No interaction notes logged yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Log phone calls, WhatsApp chats, schedule future contact dates, and note action items above.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-xl border bg-card overflow-hidden shadow-2xs">
                {filteredNotes.map((note: any) => {
                  const formatted = formatOrderDateTime(note.created_at);
                  const relTime = getRelativeTime(note.created_at);
                  const isCompleted = note.status === "completed";
                  const nextDateVal = note.next_follow_up_date || note.due_date;
                  const dateTiming = nextDateVal ? getDateTimingStatus(nextDateVal) : null;

                  return (
                    <div
                      key={note.id}
                      className={cn(
                        "p-4 sm:p-5 transition-colors flex flex-col gap-3",
                        isCompleted ? "bg-muted/10 opacity-85" : "hover:bg-muted/20"
                      )}
                    >
                      {/* Top Row: Channel, Priority, Created By, Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {getChannelBadge(note.channel || note.type)}
                          {getPriorityBadge(note.priority)}

                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold gap-1",
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" /> Pending Action
                              </>
                            )}
                          </Badge>

                          {/* Created By Admin Pill */}
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 ml-1">
                            <User className="w-3 h-3" />
                            <strong className="text-foreground">{note.admin_name || "Admin"}</strong>
                            {note.admin_id && (
                              <span className="text-[10px] opacity-75">
                                (#{note.admin_id})
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Timestamp & Actions */}
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] text-muted-foreground hidden sm:inline"
                            title={formatted.date + " " + formatted.time}
                          >
                            {relTime || formatted.date}
                          </span>

                          {/* Quick SMS Button from this card */}
                          {customerPhone && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-500/10 px-2"
                              onClick={handleOpenSms}
                              title="Send SMS to customer"
                            >
                              <Send className="w-3 h-3" />
                              <span className="hidden md:inline">SMS</span>
                            </Button>
                          )}

                          {/* Toggle Status Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 px-2.5"
                            onClick={() => handleToggleStatus(note)}
                            disabled={updatingId === note.id}
                          >
                            {updatingId === note.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isCompleted ? (
                              <>
                                <RefreshCw className="w-3 h-3" />
                                <span>Reopen</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Done</span>
                              </>
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(note.id)}
                            disabled={deletingId === note.id}
                          >
                            {deletingId === note.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Main Note Body */}
                      <p className="text-xs sm:text-sm text-foreground/95 whitespace-pre-wrap leading-relaxed">
                        {note.note}
                      </p>

                      {/* Next Action & Date Highlight Banner (Prominent Callout) */}
                      {(nextDateVal || note.action_note) && (
                        <div className="mt-1 p-3 rounded-lg border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground">
                                  Next Contact:
                                </span>
                                <span className="text-xs font-semibold text-primary">
                                  {nextDateVal
                                    ? new Date(nextDateVal).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Not scheduled"}
                                </span>
                                {dateTiming && (
                                  <Badge
                                    variant="outline"
                                    className={cn("text-[10px] px-1.5 py-0 h-4 border", dateTiming.className)}
                                  >
                                    {dateTiming.label}
                                  </Badge>
                                )}
                              </div>

                              {note.action_note && (
                                <p className="text-xs text-foreground/90 font-medium mt-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                  <strong className="text-muted-foreground font-semibold">Action:</strong>{" "}
                                  <span>{note.action_note}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer SMS Modal (FastSMS BD Integration) */}
      <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-600" /> Send Instant SMS
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch direct SMS via FastSMS BD gateway. SMS delivery is logged to customer audit history.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendSms} className="space-y-4 pt-1">
            {/* Recipient info */}
            <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Recipient Customer:</span>
                <span className="font-bold text-foreground">{customerName}</span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs gap-1">
                <Phone className="w-3 h-3" /> {customerPhone || "No Phone"}
              </Badge>
            </div>

            {/* Quick Template Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Message Presets</span>
                <span className="text-[11px] text-purple-600 font-normal">Click to apply</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {smsTemplates.map((t, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSmsMessage(t.text)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">SMS Message Body</Label>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    smsMessage.length > 160 ? "text-amber-600 font-bold" : "text-muted-foreground"
                  )}
                >
                  {smsMessage.length} chars ({Math.ceil(smsMessage.length / 160) || 1} SMS)
                </span>
              </div>
              <Textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type SMS text to customer..."
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSmsOpen(false)}
                disabled={isSendingSms}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSendingSms || !smsMessage.trim() || !customerPhone}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
              >
                {isSendingSms ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isSendingSms ? "Sending SMS..." : "Send SMS Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
