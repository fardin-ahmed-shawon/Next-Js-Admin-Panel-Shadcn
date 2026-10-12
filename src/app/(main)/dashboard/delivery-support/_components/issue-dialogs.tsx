"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EmployeeAssignmentPicker } from "../../orders/_components/employee-assignment-picker";
import { changeDeliveryIssue, useDeliveryIssue, useDeliveryRecipients, type DeliveryIssue, type IssueAction } from "@/hooks/useDeliverySupport";

export const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }) : "—";
export const issueError = (error: unknown) => error instanceof Error ? error.message : "Unable to save this issue. Please try again.";

export function IssueActionDialog({ issue, action, onClose, onSaved }: {
  issue: DeliveryIssue; action: IssueAction; onClose: () => void; onSaved: () => void;
}) {
  const [note, setNote] = useState("");
  const [employee, setEmployee] = useState(issue.assigned_to ? String(issue.assigned_to) : "unassigned");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const recipients = useDeliveryRecipients(action === "assign");
  const title = action === "assign" ? "Assign support handler" : action === "resolve" ? "Resolve delivery issue" : "Reopen delivery issue";
  return <Dialog open onOpenChange={open => { if (!open && !saving) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{issue.order_no} · Issue #{issue.id}</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault(); setSaving(true); setError("");
      try {
        await changeDeliveryIssue(issue, action, note.trim() || undefined, employee === "unassigned" ? null : Number(employee));
        toast.success(action === "assign" ? "Support handler updated" : action === "resolve" ? "Issue resolved" : "Issue reopened"); onSaved(); onClose();
      } catch (err) { setError(issueError(err)); } finally { setSaving(false); }
    }}>
      {action === "assign" ? <>
        <p className="text-sm text-muted-foreground">Only active employees with Handle Assigned Issues access can be selected. Changing the handler resets resolution and approval.</p>
        {recipients.error && <p role="alert" className="text-sm text-destructive">{issueError(recipients.error)} <button type="button" className="underline" onClick={() => recipients.mutate()}>Retry</button></p>}
        <EmployeeAssignmentPicker employees={recipients.data?.data || []} value={employee} onChange={setEmployee} loading={recipients.isLoading} loadFailed={!!recipients.error} disabled={saving} allowUnassigned />
      </> : <div className="space-y-2"><Label htmlFor="resolution-note">{action === "resolve" ? "Resolution note" : "Reason for reopening"} *</Label>
        <Textarea id="resolution-note" required maxLength={5000} value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder={action === "resolve" ? "Explain how the issue was resolved…" : "Explain why more work is needed…"} />
        {action === "reopen" && <p className="text-xs text-muted-foreground">Reopening removes the previous approval and returns the issue to Pending.</p>}
      </div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button disabled={saving || (action === "assign" ? !employee || !!recipients.error || recipients.isLoading : !note.trim())}>{saving && <Loader2 className="size-4 animate-spin" />}Save changes</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

export function IssueDetails({ id, onClose, onSaved }: { id: number; onClose: () => void; onSaved: () => void }) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useDeliveryIssue(id, page);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const issue = data?.data;
  return <Sheet open onOpenChange={open => { if (!open && !saving) onClose(); }}><SheetContent className="w-full overflow-y-auto sm:max-w-xl">
    <SheetHeader><SheetTitle>Issue #{id}</SheetTitle><SheetDescription>{issue?.order_no || "Delivery issue details"}</SheetDescription></SheetHeader>
    <div className="space-y-5 px-5 pb-6">
      {isLoading && <p className="text-sm text-muted-foreground">Loading issue…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{issueError(error)} <button onClick={() => mutate()} className="underline">Retry</button></p>}
      {issue && !error && <>
        <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-sm">
          <div><p className="text-xs text-muted-foreground">Raised by</p><p className="mt-1 font-medium">{issue.raiser?.full_name || "Former employee"}</p></div>
          <div><p className="text-xs text-muted-foreground">Support handler</p><p className="mt-1 font-medium">{issue.handler?.full_name || "Unassigned"}</p></div>
          <div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1 font-medium">{issue.resolved ? "Resolved" : "Pending"}</p></div>
          <div><p className="text-xs text-muted-foreground">Admin approval</p><p className="mt-1 font-medium">{issue.approved ? `Approved by ${issue.approver?.full_name || "Former employee"}` : "Not approved"}</p></div>
        </div>
        <div><h3 className="mb-2 text-sm font-semibold">Issue note</h3><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{issue.note}</p><p className="mt-2 text-xs text-muted-foreground">Raised {dateTime(issue.created_at)}</p></div>
        {issue.resolution_note && <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:bg-emerald-950/20"><h3 className="mb-2 text-sm font-semibold">Resolution</h3><p className="whitespace-pre-wrap break-words text-sm">{issue.resolution_note}</p><p className="mt-2 text-xs text-muted-foreground">{dateTime(issue.resolved_at)}</p></div>}
        <form className="space-y-2 border-t pt-4" onSubmit={async event => {
          event.preventDefault(); setSaving(true); setSaveError("");
          try { await changeDeliveryIssue(issue, "comment", note.trim()); setNote(""); setPage(1); await mutate(); onSaved(); }
          catch (err) { setSaveError(issueError(err)); } finally { setSaving(false); }
        }}>
          <Label htmlFor="issue-comment">Add an update</Label><Textarea id="issue-comment" required value={note} maxLength={5000} onChange={e => setNote(e.target.value)} placeholder="Share an update with the support team…" />
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
          <Button disabled={saving || !note.trim()}>{saving && <Loader2 className="size-4 animate-spin" />}Add update</Button>
        </form>
        <div><h3 className="mb-4 text-sm font-semibold">Activity history</h3><ol className="space-y-4 border-l pl-4">{data.events.data.map(event => <li key={event.id} className="space-y-1">
          <p className="text-sm"><span className="font-medium">{event.actor?.full_name || "Former employee"}</span> · {({ created: "Raised issue", assign: "Changed handler", resolve: "Resolved", reopen: "Reopened", approve: "Approved", unapprove: "Removed approval", comment: "Added update" } as Record<string, string>)[event.action] || event.action}</p>
          {event.note && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{event.note}</p>}<p className="text-xs text-muted-foreground">{dateTime(event.created_at)}</p>
        </li>)}</ol>
          {data.events.last_page > 1 && <div className="mt-4 flex items-center justify-between"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Newer</Button><span className="text-xs">Page {page} of {data.events.last_page}</span><Button variant="outline" size="sm" disabled={page === data.events.last_page} onClick={() => setPage(page + 1)}>Older</Button></div>}
        </div>
      </>}
    </div>
  </SheetContent></Sheet>;
}
