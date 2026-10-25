"use client";

import { useEffect, useId, useState } from "react";
import { Check, Loader2, Search, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmployeeAssignmentPicker } from "../../orders/_components/employee-assignment-picker";
import { issueCategories, createDeliveryIssue, useDeliveryOrders, useDeliveryRecipients, type DeliveryOrderOption } from "@/hooks/useDeliverySupport";
import { issueError } from "./issue-dialogs";

export function CreateIssueSheet({ canAssign, onClose, onCreated }: {
  canAssign: boolean; onClose: () => void; onCreated: () => void;
}) {
  const listId = useId();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrderOption | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [handler, setHandler] = useState("unassigned");
  const [category, setCategory] = useState<string>(issueCategories[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const orders = useDeliveryOrders(debouncedSearch);
  const recipients = useDeliveryRecipients(canAssign);
  const searching = search.trim() !== debouncedSearch || orders.isLoading;
  const matches = !searching && !orders.error ? orders.data?.data || [] : [];
  const showSuggestions = suggestionsOpen && search.trim().length >= 2;
  const selectOrder = (order: DeliveryOrderOption) => {
    setSelectedOrder(order); setSearch(order.order_no); setSuggestionsOpen(false); setActiveIndex(-1);
  };
  const selectedEmployeeAvailable = handler === "unassigned" || recipients.data?.data.some(employee => String(employee.id) === handler);

  return <Sheet open onOpenChange={open => { if (!open && !saving) onClose(); }}>
    <SheetContent side="right" className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl" showCloseButton={!saving}>
      <SheetHeader className="border-b p-6 pr-12">
        <SheetTitle className="flex items-center gap-2 text-lg"><Truck className="size-5" />New delivery issue</SheetTitle>
        <SheetDescription>Select an order and describe the issue. You are the default support handler.</SheetDescription>
      </SheetHeader>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={async event => {
        event.preventDefault();
        if (!selectedOrder || saving) return;
        setSaving(true); setError("");
        try {
          await createDeliveryIssue({ order_no: selectedOrder.order_no, category, note: note.trim(),
            ...(canAssign && handler !== "unassigned" ? { assigned_to: Number(handler) } : {}) });
          toast.success("Delivery issue raised"); onCreated(); onClose();
        } catch (err) { setError(issueError(err)); } finally { setSaving(false); }
      }}>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="new-issue-order">Order number *</Label>
            <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSuggestionsOpen(false); }}>
              <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
              <Input id="new-issue-order" autoFocus role="combobox" aria-autocomplete="list" aria-expanded={showSuggestions}
                aria-controls={showSuggestions ? listId : undefined} aria-activedescendant={showSuggestions && activeIndex >= 0 && matches[activeIndex] ? `${listId}-${matches[activeIndex].id}` : undefined}
                autoComplete="off" className="h-10 pl-9 pr-9" placeholder="Search an order number…" maxLength={150} value={search} disabled={saving}
                onFocus={() => setSuggestionsOpen(true)}
                onChange={event => { setSearch(event.target.value); setSelectedOrder(null); setSuggestionsOpen(true); setActiveIndex(-1); }}
                onKeyDown={event => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault(); setSuggestionsOpen(true);
                    if (matches.length) setActiveIndex(index => event.key === "ArrowDown" ? (index + 1) % matches.length : (index <= 0 ? matches.length - 1 : index - 1));
                  } else if (event.key === "Enter" && showSuggestions) {
                    event.preventDefault();
                    if (activeIndex >= 0 && matches[activeIndex]) selectOrder(matches[activeIndex]);
                    else if (matches.length === 1) selectOrder(matches[0]);
                  } else if (event.key === "Escape" && showSuggestions) {
                    event.preventDefault(); event.stopPropagation(); setSuggestionsOpen(false);
                  }
                }} />
              {search && <button type="button" aria-label="Clear selected order" disabled={saving} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => { setSearch(""); setSelectedOrder(null); setSuggestionsOpen(false); }}><X className="size-4" /></button>}
              {showSuggestions && <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
                {searching ? <p role="status" className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Searching orders…</p>
                  : orders.error ? <p role="alert" className="p-4 text-sm text-destructive">{issueError(orders.error)} <button type="button" className="underline" onClick={() => orders.mutate()}>Retry</button></p>
                    : matches.length === 0 ? <p role="status" className="p-4 text-sm text-muted-foreground">No matching orders within your access.</p> : null}
                <div id={listId} role="listbox" aria-label="Order suggestions" className="max-h-56 overflow-y-auto">{matches.map((order, index) => <button key={order.id} type="button" role="option" id={`${listId}-${order.id}`} aria-selected={selectedOrder?.id === order.id}
                  className={`flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-muted focus:bg-muted focus:outline-none ${activeIndex === index ? "bg-muted" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)} onClick={() => selectOrder(order)}>
                  <span className="truncate font-mono text-sm font-medium">{order.order_no}</span><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">{order.order_status || "No status"}</span>
                </button>)}</div>
                {!searching && matches.length === 20 && <p className="border-t px-4 py-2 text-xs text-muted-foreground">Showing 20 matches. Type more to narrow the results.</p>}
              </div>}
            </div>
            {selectedOrder ? <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400"><Check className="size-3.5" />Selected {selectedOrder.order_no}</p>
              : <p className="text-xs text-muted-foreground">Type at least 2 characters and select an order from the suggestions.</p>}
          </div>

          <div className="space-y-2"><Label htmlFor="issue-category">Issue category *</Label><select id="issue-category" required disabled={saving} value={category} onChange={e => setCategory(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3">{issueCategories.map(value => <option key={value}>{value}</option>)}</select><p className="text-xs text-muted-foreground">You are automatically recorded as the Issue Raiser.</p></div>
          {canAssign ? <section className="space-y-3 rounded-xl border bg-muted/15 p-4">
            <div><h2 className="text-sm font-semibold">Support handler</h2><p className="mt-1 text-xs text-muted-foreground">Search eligible employees and filter or sort by department and designation.</p></div>
            {recipients.error && <p role="alert" className="text-sm text-destructive">{issueError(recipients.error)} <button type="button" className="underline" onClick={() => recipients.mutate()}>Retry</button></p>}
            <EmployeeAssignmentPicker employees={recipients.data?.data || []} value={handler} onChange={value => setHandler(value || "unassigned")} loading={recipients.isLoading} loadFailed={!!recipients.error}
              disabled={saving || !!recipients.error} allowUnassigned unassignedLabel="Assign to me (default)" />
            <p className="text-xs text-muted-foreground">You will handle this issue unless you choose another eligible employee.</p>
          </section> : <p className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">You will automatically be assigned as the Support Handler for this issue.</p>}

          <div className="space-y-2"><Label htmlFor="new-issue-note">Issue note *</Label><Textarea id="new-issue-note" required maxLength={5000} rows={5} placeholder="Describe the delivery problem and what needs to be checked…" value={note} onChange={event => setNote(event.target.value)} disabled={saving} />
            <p className="text-xs text-muted-foreground">The issue will appear in the Support Handler’s performance report.</p></div>
          {error && <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        </div>
        <SheetFooter className="flex-row justify-end border-t bg-background p-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving || !selectedOrder || !note.trim() || (canAssign && !selectedEmployeeAvailable)}>{saving && <Loader2 className="size-4 animate-spin" />}Create issue</Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>;
}
