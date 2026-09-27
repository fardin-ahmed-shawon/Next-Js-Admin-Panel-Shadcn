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
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addCustomerNote, deleteCustomerNote } from "@/hooks/useCustomers";
import { getRelativeTime, formatOrderDateTime } from "@/lib/utils";

interface CustomerNotesSectionProps {
  customerId: number | string;
  notes: any[];
  onRefresh: () => void;
}

export function CustomerNotesSection({
  customerId,
  notes = [],
  onRefresh,
}: CustomerNotesSectionProps) {
  const [noteText, setNoteText] = React.useState("");
  const [noteType, setNoteType] = React.useState("call");
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Please enter note details.");
      return;
    }

    try {
      setSubmitting(true);
      await addCustomerNote(customerId, {
        note: noteText.trim(),
        type: noteType,
      });
      toast.success("CRM note logged successfully.");
      setNoteText("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to log note.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const getNoteBadge = (type: string) => {
    switch (type) {
      case "call":
        return (
          <Badge variant="secondary" className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
            <PhoneCall className="size-3" /> Phone Call
          </Badge>
        );
      case "whatsapp":
        return (
          <Badge variant="secondary" className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <MessageSquare className="size-3" /> WhatsApp
          </Badge>
        );
      case "complaint":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <AlertTriangle className="size-3" /> Complaint / Issue
          </Badge>
        );
      case "followup":
        return (
          <Badge variant="secondary" className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="size-3" /> Follow-up Needed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <FileText className="size-3" /> Note
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="size-4 text-primary" /> Customer Interactions & CRM Notes
        </CardTitle>
        <CardDescription>
          Record interactions, phone conversation takeaways, preferences, and special agreements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Note Input Box */}
        <form onSubmit={handleSubmit} className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Interaction Channel:</span>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger className="h-8 w-36 bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="note">Internal Note</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-[11px] text-muted-foreground">Saved to customer timeline</span>
          </div>

          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type interaction summary, customer feedback, delivery instructions, or notes here..."
            rows={3}
            className="bg-background resize-none text-sm"
          />

          <div className="flex justify-end items-center gap-2 pt-1">
            <Button type="submit" size="sm" disabled={submitting || !noteText.trim()} className="gap-1.5">
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              Save Note
            </Button>
          </div>
        </form>

        {/* Notes Timeline List */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activity Log ({notes.length})
          </h4>

          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <FileText className="size-8 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium">No notes recorded yet</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Log calls, customer inquiries, or special delivery notes above.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {notes.map((note: any) => {
                const formatted = formatOrderDateTime(note.created_at);
                const relTime = getRelativeTime(note.created_at);

                return (
                  <div key={note.id} className="p-4 hover:bg-muted/20 transition-colors flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getNoteBadge(note.type)}
                        <span className="text-xs font-medium text-foreground flex items-center gap-1">
                          <User className="size-3 text-muted-foreground" />
                          {note.admin_name || "Admin"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground" title={formatted.date + " " + formatted.time}>
                          {relTime || formatted.date}
                        </span>
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

                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pl-0.5">
                      {note.note}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
