"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Check, CheckCheck, ChevronLeft, ChevronRight, ClipboardList, Download, Eye, Loader2, Pencil, Plus, RefreshCw, Search, ShieldCheck, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/hooks/useRoles";
import { changeDeliveryIssue, exportDeliveryIssues, useDeliverySupport, type DeliveryIssue, type IssueAction } from "@/hooks/useDeliverySupport";
import { CreateIssueSheet } from "./_components/create-issue-sheet";
import { DeliveryLeaderboard } from "./_components/delivery-leaderboard";
import { IssueActionDialog, IssueDetails, dateTime, issueError } from "./_components/issue-dialogs";

export default function DeliverySupportPage() {
  const { user } = useAuth();
  const enabled = hasModuleAccess(user, "delivery_support");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [approval, setApproval] = useState("all");
  const [sort, setSort] = useState("id");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("25");
  const [createOpen, setCreateOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [action, setAction] = useState<{ issue: DeliveryIssue; action: IssueAction } | null>(null);
  useEffect(() => { const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  const query = new URLSearchParams({ search: debouncedSearch, status, approval, sort, direction, page: String(page), per_page: perPage }).toString();
  const { list, overview, refresh } = useDeliverySupport(query, enabled);
  const permissions = overview.data?.permissions;
  const stats = overview.data?.stats;
  const refreshAll = () => { void refresh().catch(() => toast.error("Could not refresh issues. Please retry.")); };
  const clearFilters = () => { setSearch(""); setDebouncedSearch(""); setStatus("all"); setApproval("all"); setPage(1); };
  const sortBy = (key: string) => { setSort(key); setDirection(sort === key && direction === "asc" ? "desc" : "asc"); setPage(1); };
  const scope = permissions?.all ? "All issues" : permissions?.reporting_team ? "Your issues & reporting team" : permissions?.handle ? "Your raised & assigned issues" : "Your raised issues";
  if (!enabled) return null;

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 xl:flex-row xl:items-center">
      <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Truck className="size-5" /></span>
        <div><h1 className="text-xl font-semibold tracking-tight">Delivery Operations &amp; Support</h1><p className="mt-1 text-xs text-muted-foreground">Issue resolution &amp; approval tracker · {scope}</p></div></div>
      <div className="flex flex-wrap items-center gap-2 xl:min-w-[470px]">
        <div className="relative min-w-48 flex-1"><Search className="absolute top-3 left-3 size-4 text-muted-foreground" /><Input className="h-10 pl-9" aria-label="Search delivery issues" placeholder="Search order, employee, issue…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Button variant="outline" size="icon" aria-label="Refresh delivery issues" onClick={refreshAll} disabled={list.isValidating || overview.isValidating}><RefreshCw className={`size-4 ${list.isValidating ? "animate-spin" : ""}`} /></Button>
        {permissions?.create && <Button onClick={() => setCreateOpen(!createOpen)}><Plus className="size-4" />New issue</Button>}
      </div>
    </header>

    {overview.error && <div role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{issueError(overview.error)} <button className="underline" onClick={() => overview.mutate()}>Retry</button></div>}
    <div className="grid gap-3 sm:grid-cols-3">{[
      { label: "Total issues", value: stats?.total, icon: ClipboardList, sub: "Within your permitted scope", style: "bg-muted text-foreground" },
      { label: "Resolved", value: stats?.resolved, icon: CheckCheck, sub: `${stats?.total ? Math.round(stats.resolved / stats.total * 100) : 0}% completion`, style: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" },
      { label: "Pending approval", value: stats?.pending_approval, icon: ShieldCheck, sub: "Resolved · awaiting review", style: "bg-amber-50 text-amber-700 dark:bg-amber-950/30" },
    ].map((card, index) => <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><span className={`grid size-8 place-items-center rounded-lg ${card.style}`}><card.icon className="size-4" /></span><span className="font-mono text-xs text-muted-foreground">#0{index + 1}</span></div><p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{card.label}</p><p className="mt-1 text-3xl font-semibold tracking-tight">{overview.error ? "—" : card.value ?? "…"}</p><p className="mt-1 text-xs text-muted-foreground">{card.sub}</p></div>)}</div>

    {overview.data && !overview.error && <DeliveryLeaderboard ranking={overview.data.ranking} approved={overview.data.stats.approved} total={overview.data.stats.total} />}

    {createOpen && permissions?.create && <CreateIssueSheet canAssign={permissions.assign} onClose={() => setCreateOpen(false)} onCreated={() => { clearFilters(); refreshAll(); }} />}

    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-2"><h2 className="text-sm font-semibold">Issues</h2><span className="rounded-full bg-muted px-2.5 py-1 text-xs">{list.data?.total ?? 0} rows</span></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border bg-muted/40 p-1" aria-label="Issue status">{["all", "resolved", "pending"].map(value => <button key={value} onClick={() => { setStatus(value); setPage(1); }} aria-pressed={status === value} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${status === value ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{value}</button>)}</div>
          <select aria-label="Filter admin approval" className="h-9 rounded-lg border bg-background px-3 text-xs" value={approval} onChange={e => { setApproval(e.target.value); setPage(1); }}><option value="all">Approval: All</option><option value="approved">Approved</option><option value="not_approved">Not approved</option><option value="pending_review">Pending review</option></select>
          {(search || status !== "all" || approval !== "all") && <Button size="sm" variant="ghost" onClick={clearFilters}>Clear filters</Button>}
          {permissions?.export && <Button variant="outline" size="sm" disabled={exporting} onClick={async () => { setExporting(true); try { await exportDeliveryIssues(query); } catch (error) { toast.error(issueError(error)); } finally { setExporting(false); } }}>{exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}Export Excel</Button>}
        </div>
      </div>
      {list.error ? <div role="alert" className="p-8 text-center text-sm text-destructive">{issueError(list.error)} <button onClick={() => list.mutate()} className="underline">Retry</button></div> : list.isLoading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading issues…</div> : <div className="overflow-x-auto">
        <table className="w-full text-left text-sm"><thead className="border-b bg-muted/40 text-[11px] text-muted-foreground"><tr>{[{ key: "order_no", label: "Order ID" }, { key: "handler", label: "Support handler" }, { key: "note", label: "Issue note" }, { key: "resolved", label: "Resolved" }, { key: "approved", label: "Admin approval" }].map(column => <th key={column.key} className="px-5 py-3.5" aria-sort={sort === column.key ? direction === "asc" ? "ascending" : "descending" : "none"}><button className="flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase tracking-wider" onClick={() => sortBy(column.key)}>{column.label}<ArrowUpDown className={`size-3 ${sort === column.key ? "text-foreground" : "opacity-40"}`} /></button></th>)}<th className="px-4">Details</th></tr></thead>
          <tbody className="divide-y">{list.data?.data.map(issue => <tr key={issue.id} className="hover:bg-muted/20">
            <td className="px-5 py-4"><button className="font-mono text-xs font-semibold hover:underline" onClick={() => setDetailId(issue.id)}>{issue.order_no}</button><p className="mt-1 whitespace-nowrap text-[11px] text-muted-foreground">Issue #{issue.id} · {dateTime(issue.created_at)}</p></td>
            <td className="px-5 py-4">{issue.can_assign ? <button className="inline-flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5 text-xs font-medium hover:bg-muted" aria-label={`Assign handler for issue ${issue.id}`} onClick={() => setAction({ issue, action: "assign" })}><span className="max-w-36 truncate">{issue.handler?.full_name || "Unassigned"}</span><Pencil className="size-3 shrink-0 text-muted-foreground" /></button> : <span className="text-xs">{issue.handler?.full_name || "Unassigned"}</span>}</td>
            <td className="min-w-48 max-w-80 px-5 py-4"><button className="line-clamp-2 break-words text-left text-xs leading-relaxed text-muted-foreground hover:text-foreground" title={issue.note} onClick={() => setDetailId(issue.id)}>{issue.note}</button></td>
            <td className="px-5 py-4"><button disabled={!issue.can_handle} onClick={() => setAction({ issue, action: issue.resolved ? "reopen" : "resolve" })} title={issue.can_handle ? "Change resolution status" : "Only the assigned support handler can change this status"} className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium disabled:cursor-default ${issue.resolved ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30"}`}><span className="size-1.5 rounded-full bg-current" />{issue.resolved ? "Resolved" : "Not resolved"}</button></td>
            <td className="px-5 py-4"><button role="switch" aria-checked={issue.approved} aria-label={`Approve issue ${issue.id}`} disabled={!issue.can_approve || !issue.resolved || updating !== null} title={!issue.resolved ? "Resolve the issue before approval" : !issue.can_approve ? "Approval permission required" : "Toggle admin approval"} onClick={async () => {
              setUpdating(issue.id); try { await changeDeliveryIssue(issue, issue.approved ? "unapprove" : "approve"); refreshAll(); toast.success(issue.approved ? "Approval removed" : "Issue approved"); } catch (error) { toast.error(issueError(error)); refreshAll(); } finally { setUpdating(null); }
            }} className={`relative inline-flex h-7 w-20 items-center rounded-full border p-0.5 transition-colors disabled:cursor-default ${issue.approved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><span className={`grid size-6 place-items-center rounded-full bg-background text-foreground shadow-sm transition-transform ${issue.approved ? "translate-x-12" : "translate-x-0"}`}>{updating === issue.id ? <Loader2 className="size-3 animate-spin" /> : issue.approved ? <Check className="size-3" /> : <X className="size-3" />}</span><span className={`absolute text-[11px] font-semibold ${issue.approved ? "left-4" : "right-4"}`}>{issue.approved ? "Y" : "N"}</span></button></td>
            <td className="px-4 py-4"><Button size="icon-sm" variant="ghost" aria-label={`View issue ${issue.id}`} onClick={() => setDetailId(issue.id)}><Eye className="size-4" /></Button></td>
          </tr>)}</tbody>
        </table>
        {!list.data?.data.length && <div className="p-12 text-center"><Search className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="text-sm font-medium">No matching issues</p><p className="mt-1 text-xs text-muted-foreground">Raise an issue or adjust your search and filters.</p></div>}
      </div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3 text-xs text-muted-foreground"><span>{list.data?.from || 0}–{list.data?.to || 0} of {list.data?.total || 0} issues · Updates every 30 seconds</span><div className="flex items-center gap-2"><label htmlFor="issue-rows">Rows</label><select id="issue-rows" className="h-8 rounded-md border bg-background px-2" value={perPage} onChange={e => { setPerPage(e.target.value); setPage(1); }}>{[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}</select><Button size="icon-sm" variant="outline" aria-label="Previous issue page" disabled={page <= 1 || list.isLoading} onClick={() => setPage(page - 1)}><ChevronLeft className="size-4" /></Button><span>{page} / {list.data?.last_page || 1}</span><Button size="icon-sm" variant="outline" aria-label="Next issue page" disabled={page >= (list.data?.last_page || 1) || list.isLoading} onClick={() => setPage(page + 1)}><ChevronRight className="size-4" /></Button></div></div>
    </section>
    {action && <IssueActionDialog key={`${action.issue.id}-${action.action}`} {...action} onClose={() => setAction(null)} onSaved={refreshAll} />}
    {detailId !== null && <IssueDetails key={detailId} id={detailId} onClose={() => setDetailId(null)} onSaved={refreshAll} />}
  </div>;
}
